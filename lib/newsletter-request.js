// Shared by the two Vercel handlers; no credentials or contact data are persisted.
function parseBody(req) {
  try {
    let body = req.body;
    if (Buffer.isBuffer(body)) body = body.toString('utf8');
    if (typeof body === 'string') {
      const type = String(req.headers?.['content-type'] || '').split(';')[0].trim();
      if (type === 'application/json') body = JSON.parse(body);
      else {
        const fields = new URLSearchParams(body);
        if ([...fields.keys()].some(key => fields.getAll(key).length > 1)) return {};
        body = Object.fromEntries(fields);
      }
    }
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email);
}

function createLimiter() {
  const windows = new Map();
  return req => {
    const now = Date.now();
    for (const [ip, window] of windows) if (now >= window.expires) windows.delete(ip);
    // Vercel supplies x-forwarded-for; socket fallback also supports local serving.
    const forwarded = req.headers?.['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown';
    const window = windows.get(ip) || { count: 0, expires: now + 60000 };
    windows.set(ip, window);
    window.count += 1;
    return window.count <= 5;
  };
}

function redirect(res, destination) {
  res.setHeader('Location', destination);
  res.setHeader('Cache-Control', 'no-store');
  res.status(303).end();
}

function acceptPost(req, res) {
  if (req.method === 'POST') return true;
  res.setHeader('Allow', 'POST');
  res.status(405).end();
  return false;
}

async function send(method, suffix, body) {
  const response = await fetch(`https://api.brevo.com/v3/contacts${suffix}`, {
    method,
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  console.log(response.status);
  return response.status;
}

module.exports = { parseBody, validEmail, createLimiter, redirect, acceptPost, send };
