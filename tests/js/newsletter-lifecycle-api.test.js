const base = 'https://api.brevo.com/v3/contacts';
const nextSubscribe = '/newsletter/check-your-email/';
const nextUnsubscribe = '/newsletter/unsubscribed/';
const originalFetch = global.fetch;
const envNames = ['BREVO_API_KEY', 'BREVO_LIST_ID', 'BREVO_DOI_TEMPLATE_ID'];
const originalEnv = Object.fromEntries(envNames.map(name => [name, process.env[name]]));
let subscribe, unsubscribe, log;

beforeEach(() => {
  jest.resetModules();
  // Deliberately not a credential; fetch is always mocked.
  process.env.BREVO_API_KEY = 'mock-only';
  process.env.BREVO_LIST_ID = '7';
  process.env.BREVO_DOI_TEMPLATE_ID = '9';
  global.fetch = jest.fn().mockResolvedValue({ status: 204 });
  log = jest.spyOn(console, 'log').mockImplementation(() => {});
  subscribe = require('../../api/subscribe');
  unsubscribe = require('../../api/unsubscribe');
});

afterEach(() => {
  jest.restoreAllMocks();
  global.fetch = originalFetch;
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
});

function request(body, extra = {}) {
  return { method: 'POST', body, headers: {}, socket: { remoteAddress: '192.0.2.1' }, ...extra };
}

function response() {
  return { status: jest.fn().mockReturnThis(), setHeader: jest.fn(), end: jest.fn() };
}

async function invoke(handler, body, target, extra) {
  const res = response();
  await handler(request(body, extra), res);
  expect(res.status).toHaveBeenCalledWith(303);
  expect(res.setHeader).toHaveBeenCalledWith('Location', target);
  expect(res.end).toHaveBeenCalledTimes(1);
  return res;
}

const valid = () => ({ email: 'reader@example.com', consent: 'on' });

test.each(['object', 'form', 'json'])('4: subscribe request contract (%s)', async encoding => {
  const data = { ...valid(), first_name: 'Example', company: 'Example', source: 'linkedin',
    campaign: 'issue-003', consent_text_v: 'subscribe-v1' };
  const body = encoding === 'form' ? new URLSearchParams(data).toString()
    : encoding === 'json' ? JSON.stringify(data) : data;
  const headers = { 'content-type': encoding === 'json' ? 'application/json' : 'application/x-www-form-urlencoded' };
  await invoke(subscribe, body, nextSubscribe, { headers });
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe(`${base}/doubleOptinConfirmation`);
  expect(options.method).toBe('POST');
  expect(options.headers).toEqual({ 'api-key': 'mock-only', 'Content-Type': 'application/json' });
  expect(JSON.parse(options.body)).toEqual({ email: data.email, includeListIds: [7], templateId: 9,
    redirectionUrl: 'https://www.aceengineer.com/newsletter/confirmed/',
    attributes: { FIRSTNAME: 'Example', COMPANY: 'Example', SOURCE: 'linkedin',
      SIGNUP_CAMPAIGN: 'issue-003', CONSENT_TEXT_V: 'subscribe-v1' } });
});

test.each([201, 204, 400, 500, 'network error'])('4: subscribe hides result %s', async status => {
  if (typeof status === 'number') global.fetch.mockResolvedValue({ status });
  else global.fetch.mockRejectedValue(new Error('reader@example.com'));
  await invoke(subscribe, valid(), nextSubscribe);
  expect(log.mock.calls.flat().every(value => typeof value === 'number')).toBe(true);
  expect(JSON.stringify(log.mock.calls)).not.toContain('reader@example.com');
});

test('4: empty subscribe attributes are omitted', async () => {
  await invoke(subscribe, valid(), nextSubscribe);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).attributes).toEqual({});
});

test.each(['not-an-address', 'a@@example.com', 'a@example', 'a b@example.com',
  `${'a'.repeat(243)}@example.com`, ['a@example.com'], null])('4: invalid email %j', async email => {
  await invoke(subscribe, { email, consent: 'on' }, '/newsletter/subscribe/?error=1');
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each([undefined, '', 'yes', true, ['on']])('4: consent must equal on (%j)', async consent => {
  await invoke(subscribe, { ...valid(), consent }, '/newsletter/subscribe/?error=1');
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each(['subscribe', 'unsubscribe'])('honeypot %s never calls fetch', async kind => {
  await invoke(kind === 'subscribe' ? subscribe : unsubscribe,
    { ...valid(), website: 'spam' }, kind === 'subscribe' ? nextSubscribe : nextUnsubscribe);
  expect(global.fetch).not.toHaveBeenCalled();
});

test('5: unsubscribe PUT and 404 fallback contract', async () => {
  global.fetch.mockResolvedValueOnce({ status: 404 }).mockResolvedValueOnce({ status: 201 });
  await invoke(unsubscribe, { email: 'reader+tag@example.com' }, nextUnsubscribe);
  expect(global.fetch).toHaveBeenCalledTimes(2);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe(`${base}/reader%2Btag%40example.com`);
  expect(options.method).toBe('PUT');
  expect(options.headers['api-key']).toBe('mock-only');
  expect(JSON.parse(options.body)).toEqual({ emailBlacklisted: true });
  const [createUrl, createOptions] = global.fetch.mock.calls[1];
  expect(createUrl).toBe(base);
  expect(createOptions.method).toBe('POST');
  expect(JSON.parse(createOptions.body)).toEqual({ email: 'reader+tag@example.com',
    emailBlacklisted: true, attributes: { SOURCE: 'unsubscribe-form' } });
});

test.each([201, 204, 400, 500, 'network error'])('5: unsubscribe hides result %s', async status => {
  if (typeof status === 'number') global.fetch.mockResolvedValue({ status });
  else global.fetch.mockRejectedValue(new Error('reader@example.com'));
  await invoke(unsubscribe, 'email=reader%40example.com', nextUnsubscribe);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(log.mock.calls)).not.toContain('reader@example.com');
});

test('5: unsubscribe hides failure of fallback create', async () => {
  global.fetch.mockResolvedValueOnce({ status: 404 }).mockRejectedValueOnce(new Error('reader@example.com'));
  await invoke(unsubscribe, valid(), nextUnsubscribe);
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(log.mock.calls).toEqual([[404]]);
});

test.each([null, [], 42, '{broken', '{"email":null}', { email: {} }])('invalid body %j is handled without data in logs', async body => {
  const headers = { 'content-type': 'application/json' };
  await invoke(subscribe, body, '/newsletter/subscribe/?error=1', { headers });
  await invoke(unsubscribe, body, nextUnsubscribe, { headers });
  expect(global.fetch).not.toHaveBeenCalled();
});

test.each(envNames)('subscribe config missing: %s', async name => {
  delete process.env[name];
  await invoke(subscribe, valid(), nextSubscribe);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(log.mock.calls).toEqual([['config missing']]);
});

test('unsubscribe needs only its API key', async () => {
  delete process.env.BREVO_LIST_ID;
  delete process.env.BREVO_DOI_TEMPLATE_ID;
  await invoke(unsubscribe, valid(), nextUnsubscribe);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  delete process.env.BREVO_API_KEY;
  global.fetch.mockClear();
  await invoke(unsubscribe, valid(), nextUnsubscribe);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(log).toHaveBeenCalledWith('config missing');
});

test.each(['0', '-1', 'abc', '1.5'])('invalid numeric configuration %s is not sent', async value => {
  process.env.BREVO_LIST_ID = value;
  await invoke(subscribe, valid(), nextSubscribe);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(log).toHaveBeenCalledWith('config missing');
});

test.each(['subscribe', 'unsubscribe'])('%s rate limit allows five requests, isolates IPs and resets', async kind => {
  const handler = kind === 'subscribe' ? subscribe : unsubscribe;
  const target = kind === 'subscribe' ? nextSubscribe : nextUnsubscribe;
  const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
  for (let i = 0; i < 6; i++) await invoke(handler, valid(), target);
  expect(global.fetch).toHaveBeenCalledTimes(5);
  await invoke(handler, valid(), target, { socket: { remoteAddress: '192.0.2.2' } });
  expect(global.fetch).toHaveBeenCalledTimes(6);
  now.mockReturnValue(61000);
  await invoke(handler, valid(), target);
  expect(global.fetch).toHaveBeenCalledTimes(7);
});

test.each(['subscribe', 'unsubscribe'])('%s rejects non-POST without side effects', async kind => {
  const res = response();
  await (kind === 'subscribe' ? subscribe : unsubscribe)(request(valid(), { method: 'GET' }), res);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
  expect(global.fetch).not.toHaveBeenCalled();
});
