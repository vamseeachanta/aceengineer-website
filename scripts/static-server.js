#!/usr/bin/env node
// ABOUTME: Minimal zero-dependency static server for dist/, used by the Playwright
// ABOUTME: visual-regression suite (issue #101). Deliberately not `npx serve` — the
// ABOUTME: visual suite must not depend on a network fetch at test time.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.VISUAL_SERVER_PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

// Resolve a URL path to a file inside ROOT, or null if it escapes ROOT / is absent.
function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  let target = path.normalize(path.join(ROOT, decoded));
  if (!target.startsWith(ROOT)) return null; // path traversal
  try {
    if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  } catch {
    return null;
  }
  return fs.existsSync(target) ? target : null;
}

const server = http.createServer((req, res) => {
  const file = resolve(req.url || '/');
  if (file) {
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      // Screenshots must reflect the built bytes, never a cached earlier build.
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
    return;
  }
  // Serve the real 404 page with a real 404 — the page is itself under test.
  const notFound = path.join(ROOT, '404.html');
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'content-type': TYPES['.html'], 'cache-control': 'no-store' });
    fs.createReadStream(notFound).pipe(res);
    return;
  }
  res.writeHead(404, { 'content-type': TYPES['.txt'] });
  res.end('404');
});

server.listen(PORT, () => {
  console.log(`static-server: serving ${ROOT} on http://127.0.0.1:${PORT}`);
});
