const { parseBody, validEmail, createLimiter, redirect, acceptPost, send } = require('../lib/newsletter-request');
const allowed = createLimiter();
const nextPage = '/newsletter/check-your-email/';

function configurationReady() {
  return Boolean(process.env.BREVO_API_KEY?.trim()) &&
    ['BREVO_LIST_ID', 'BREVO_DOI_TEMPLATE_ID'].every(name => {
      const number = Number(process.env[name]);
      return Number.isSafeInteger(number) && number > 0;
    });
}

function attributesFor(body) {
  const attributes = {};
  const fields = { first_name: 'FIRSTNAME', company: 'COMPANY', source: 'SOURCE',
    campaign: 'SIGNUP_CAMPAIGN', consent_text_v: 'CONSENT_TEXT_V' };
  for (const [field, attribute] of Object.entries(fields)) {
    if (typeof body[field] !== 'string') continue;
    let value = body[field].trim();
    if (field === 'source' || field === 'campaign') value = value.replace(/[^a-z0-9-]/g, '').slice(0, 40);
    if (value) attributes[attribute] = value;
  }
  return attributes;
}

module.exports = async function subscribe(req, res) {
  if (!acceptPost(req, res)) return;
  const body = parseBody(req);
  if (!allowed(req) || body.website) return redirect(res, nextPage);
  if (!validEmail(body.email) || body.consent !== 'on') {
    return redirect(res, '/newsletter/subscribe/?error=1');
  }
  if (!configurationReady()) {
    console.log('config missing');
    return redirect(res, nextPage);
  }
  try {
    await send('POST', '/doubleOptinConfirmation', {
      email: body.email,
      includeListIds: [Number(process.env.BREVO_LIST_ID)],
      templateId: Number(process.env.BREVO_DOI_TEMPLATE_ID),
      redirectionUrl: 'https://www.aceengineer.com/newsletter/confirmed/',
      attributes: attributesFor(body)
    });
  } catch {
    // No provider error body or exception is logged: either could contain an address.
  }
  return redirect(res, nextPage);
};
