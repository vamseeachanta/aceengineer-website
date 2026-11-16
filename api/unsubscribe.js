const { parseBody, validEmail, createLimiter, redirect, acceptPost, send } = require('../lib/newsletter-request');
const allowed = createLimiter();
const nextPage = '/newsletter/unsubscribed/';

module.exports = async function unsubscribe(req, res) {
  if (!acceptPost(req, res)) return;
  const body = parseBody(req);
  if (!allowed(req) || body.website || !validEmail(body.email)) return redirect(res, nextPage);
  if (!process.env.BREVO_API_KEY?.trim()) {
    console.log('config missing');
    return redirect(res, nextPage);
  }
  try {
    const status = await send('PUT', `/${encodeURIComponent(body.email)}`, { emailBlacklisted: true });
    if (status === 404) {
      await send('POST', '', { email: body.email, emailBlacklisted: true,
        attributes: { SOURCE: 'unsubscribe-form' } });
    }
  } catch {
    // All results use the same redirect, without logging contact data.
  }
  return redirect(res, nextPage);
};
