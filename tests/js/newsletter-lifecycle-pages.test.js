const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const text = node => node.textContent.replace(/\s+/g, ' ').trim();
const doc = file => new JSDOM(read(file)).window.document;

const pages = [
  ['newsletter/subscribe', 'Subscribe to the AceEngineer newsletter', [
    'The AceEngineer newsletter comes about every two weeks. Each issue has short pieces on offshore and energy engineering and on engineering with AI assistants. Each piece gives its result, its public data and a reusable prompt. Past issues are on the newsletter page.',
    'We send one e-mail to confirm your address. Your details are kept by our mailing service, Brevo, and used only for this newsletter.'
  ]],
  ['newsletter/check-your-email', 'Check your inbox', [
    'We have sent a message to the address you gave. Click "Confirm my subscription" in it to start. If it has not arrived in 10 minutes, look in your junk folder, or write to support@aceengineer.com.'
  ]],
  ['newsletter/confirmed', 'Your subscription is confirmed', [
    'The next issue comes to this address. Until then, past issues are listed below. To change your details or stop, use the links at the foot of every issue.'
  ]],
  ['newsletter/preferences', 'Update your details', [
    'Change your name or company, or tell us which topics interest you. Every issue carries both topics today; your choice guides what we write next.',
    'Use the "Update your details" link at the foot of any issue. It opens a form from our mailing service that already knows your address.'
  ]],
  ['newsletter/unsubscribe', 'Stop the AceEngineer newsletter', [
    'Enter the address the newsletter reaches. This stops every newsletter e-mail to it, from our mailing service and from Vamsee Achanta\'s own mailbox. You can also reply "no thanks" to any issue.'
  ]],
  ['newsletter/unsubscribed', 'You are unsubscribed', [
    'No more newsletter e-mail goes to this address, from our mailing service or from Vamsee Achanta\'s mailbox. Past issues stay on the newsletter page. If this was a mistake, you can subscribe again; we will ask you to confirm by e-mail.'
  ]],
  ['privacy', 'Privacy notice: AceEngineer newsletter', [
    'Who: AceEngineer, 11511 Piping Rock Dr., Houston, TX 77077; support@aceengineer.com.',
    'What we hold: your e-mail address, and your first name and company if you give them; where you subscribed; when you confirmed and the wording you agreed to; whether each issue was delivered, opened or clicked, as our mailing service reports it.',
    'Why: to send the newsletter. The basis is your consent, given on our subscribe page or in reply to our e-mail asking for it. You can withdraw it at any time.',
    'Where: our mailing service, Brevo, and our private records.',
    'How long: while you are subscribed. After you unsubscribe we keep only your address on a do-not-send list, so that you are never mailed again.',
    'Your rights: to see, correct or erase your details, and to object, by writing to support@aceengineer.com. You may also complain to your data protection authority.'
  ]]
];

test.each(pages)('1: exact built page copy and shared chrome: %s', (route, title, paragraphs) => {
  const document = doc(`dist/${route}/index.html`);
  expect(text(document.querySelector('h1'))).toBe(title);
  const actual = [...document.querySelectorAll('main p')].map(text);
  for (const paragraph of paragraphs) expect(actual).toContain(paragraph);
  expect(document.querySelector('nav')).not.toBeNull();
  expect(document.querySelector('footer.footer-section')).not.toBeNull();
  expect(document.querySelector('link[rel="canonical"]').href).toBe(`https://www.aceengineer.com/${route}/`);
  expect(read(`dist/${route}/index.html`)).not.toMatch(/<include\b|\{\{/);
});

test('1: confirmed and archive reuse the same issue list and working links', () => {
  const list = route => [...doc(`dist/newsletter/${route}index.html`).querySelectorAll('.newsletter-issues article')]
    .map(article => [text(article), article.querySelector('a').getAttribute('href')]);
  expect(list('confirmed/')).toEqual(list(''));
  expect(list('')).toHaveLength(6);
  for (const [, href] of list('')) {
    expect(href).toMatch(/^\/newsletter\/issue-/);
    expect(fs.existsSync(path.join(root, 'dist', href, 'index.html'))).toBe(true);
  }
});

test('2: subscribe form requirements and unchecked consent', () => {
  const document = doc('dist/newsletter/subscribe/index.html');
  const form = document.querySelector('form');
  expect(form.method).toBe('post');
  expect(form.getAttribute('action')).toBe('/api/subscribe');
  const fields = form.elements;
  expect(fields.email.type).toBe('email');
  expect(fields.email.required).toBe(true);
  expect(fields.first_name.required).toBe(false);
  expect(fields.company.required).toBe(false);
  expect(document.getElementById(fields.first_name.getAttribute('aria-describedby')).textContent).toBe('used in the greeting');
  expect(fields.consent.type).toBe('checkbox');
  expect(fields.consent.required).toBe(true);
  expect(fields.consent.checked).toBe(false);
  expect(text(fields.consent.labels[0])).toBe('Send me the AceEngineer newsletter by e-mail. I can unsubscribe at any time with the link in each issue.');
  for (const name of ['source', 'campaign', 'consent_text_v']) expect(fields[name].type).toBe('hidden');
  expect(fields.consent_text_v.value).toBe('subscribe-v1');
  expect(fields.website.closest('[hidden][aria-hidden="true"]')).not.toBeNull();
  expect(fields.website.tabIndex).toBe(-1);
  expect(text(form.querySelector('button'))).toBe('Subscribe');
  expect(document.querySelector('a[href="/privacy/"]').textContent).toBe('Privacy notice');
});

function scriptDocument(query) {
  const dom = new JSDOM(read('dist/newsletter/subscribe/index.html'), {
    url: `https://www.aceengineer.com/newsletter/subscribe/${query}`, runScripts: 'outside-only'
  });
  vm.runInContext(read('assets/js/newsletter-subscribe.js'), dom.getInternalVMContext());
  return dom.window.document;
}

test.each([
  ['?utm_source=linkedin&utm_campaign=issue-003', 'linkedin', 'issue-003'],
  ['?utm_source=LiN_ke%3Cd%3Ein!&utm_campaign=issue-003%2F%22%3E', 'ikedin', 'issue-003'],
  ['', 'website', ''],
  [`?utm_source=${'a'.repeat(50)}&utm_campaign=${'b'.repeat(50)}`, 'a'.repeat(40), 'b'.repeat(40)]
])('3: attribution sanitization %s', (query, source, campaign) => {
  const form = scriptDocument(query).querySelector('form');
  expect(form.elements.source.value).toBe(source);
  expect(form.elements.campaign.value).toBe(campaign);
});

test('3: validation error is shown only for error=1', () => {
  expect(scriptDocument('').getElementById('subscribe-error').hidden).toBe(true);
  const error = scriptDocument('?error=1').getElementById('subscribe-error');
  expect(error.hidden).toBe(false);
  expect(text(error)).toBe('Please enter a valid e-mail address and tick the box.');
});

test('unsubscribe form requires email and hides honeypot', () => {
  const form = doc('dist/newsletter/unsubscribe/index.html').querySelector('form');
  expect(form.method).toBe('post');
  expect(form.getAttribute('action')).toBe('/api/unsubscribe');
  expect(form.elements.email.type).toBe('email');
  expect(form.elements.email.required).toBe(true);
  expect(form.elements.website.closest('[hidden][aria-hidden="true"]')).not.toBeNull();
  expect(text(form.querySelector('button'))).toBe('Unsubscribe');
});

test('6: tracked and unignored repository files contain no Brevo secrets', () => {
  const env = { ...process.env };
  for (const name of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR']) delete env[name];
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, env, windowsHide: true }).toString().split('\0').filter(Boolean);
  const keyPrefix = ['xkey', 'sib-'].join('');
  const keyHex = /api-key[^\r\n]{0,30}\b[a-f0-9]{64}\b/i;
  const failures = [...new Set(files)].filter(file => {
    const content = fs.readFileSync(path.join(root, file)).toString();
    return content.includes(keyPrefix) || keyHex.test(content);
  });
  expect(failures).toEqual([]);
});

test('7: all issue pages include the box with their own slug', () => {
  const issues = fs.readdirSync(path.join(root, 'content/newsletter')).filter(name => name.startsWith('issue-'));
  expect(issues).toHaveLength(7);
  for (const slug of [...issues, '', '../blog']) {
    const route = slug === '../blog' ? 'blog' : `newsletter/${slug}`;
    expect(read(`content/${route}/index.html`)).toContain('partials/newsletter-subscribe.html');
    const document = doc(`dist/${route}/index.html`);
    const box = document.querySelector('.newsletter-subscribe');
    expect(text(box.querySelector('p'))).toBe('The AceEngineer newsletter comes about every two weeks. Subscribe to get each issue by e-mail.');
    expect(box.querySelector('a').getAttribute('href')).toBe(`/newsletter/subscribe/?utm_source=website&utm_medium=web&utm_campaign=${slug === '../blog' ? 'blog' : slug || 'newsletter'}`);
    expect(document.querySelector('a[href^="mailto:support@aceengineer.com?subject=Subscribe"]')).toBeNull();
  }
});

test('7: archive stop link and shared footer subscribe link', () => {
  const document = doc('dist/newsletter/index.html');
  expect(text(document.querySelector('a[href="/newsletter/unsubscribe/"]').parentNode)).toBe('To stop: aceengineer.com/unsubscribe');
  expect(text(document.querySelector('footer a[href="/newsletter/subscribe/"]'))).toBe('Newsletter: subscribe');
  expect(read('dist/blog/index.html')).not.toContain('reply to any issue to subscribe or stop');
});

test('7: issue sources preserve every base byte except the authorized subscription changes', () => {
  // Pinned to origin/main d00f474; reversing only the allowed additions/links
  // must recover each original page, including every article word and other URL.
  const hashes = {
    'issue-001': '7d65b3c968bdc91d10ebc4708999a9f7267d1bcd3621927aa5f83b33fc21d42d',
    'issue-001-energy-street': '71395ad4ce2d3428e49b7d6ecea0e861b1887d2875555204199d561ee2a0f59c',
    'issue-001-tank-sloshing': '4841e1b86b0363175788f3f3c52e4926c6769af7e04f158424efa7b9b2aca806',
    'issue-002-energy-street': '6dc8e18d46a1cbc11eafada3385bd5bed8658d852637c39a4b5d2052d858ed99',
    'issue-002-jackup-method': '91a75b9d73a8700b8b9c8d1c800f8f45868c84b1cec5d39c930c0425121313a4',
    'issue-002-main-street': 'a1767d4ec43244693b1d2ebc7258f953f2be1c6bbdaf7ffe1d9687664ba44dfd',
    'issue-002-public-data': 'bb524c981c723df85604b6ba313555eecb456147748eace7872a659f2bafe558'
  };
  for (const [slug, expected] of Object.entries(hashes)) {
    const original = read(`content/newsletter/${slug}/index.html`).replace(/\r\n/g, '\n')
      .replace(/^newsletterSlug: .*\n/m, '')
      .replace('<include src="partials/newsletter-subscribe.html"></include>\n', '')
      .replaceAll('href="/newsletter/subscribe/"', 'href="mailto:support@aceengineer.com?subject=Subscribe%20Energy%20Street"');
    expect(crypto.createHash('sha256').update(original).digest('hex')).toBe(expected);
  }
});

test('8: temporary aliases leave incoming query parameters unconsumed', () => {
  const { redirects } = JSON.parse(read('vercel.json'));
  for (const name of ['subscribe', 'unsubscribe']) {
    expect(redirects.find(rule => rule.source === `/${name}`)).toEqual({
      source: `/${name}`, destination: `/newsletter/${name}/`, permanent: false
    });
  }
  // Real platform query forwarding still requires the prohibited Vercel preview.
});
