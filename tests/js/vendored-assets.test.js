/**
 * vendored-assets.test.js — one Plotly, served by us, and it must be the file we vetted (#86).
 *
 * Before this, three Plotly versions shipped: 2.32.0 vendored (10 pages), 2.27.0 from
 * cdn.plot.ly (6 calculator pages) and 2.35.2 from cdn.plot.ly (2 diffraction reports).
 * Visitors paid for a 3.6MB local copy AND a third-party round trip, the CSP had to keep
 * `https://cdn.plot.ly` in `script-src`, and nothing stopped a fourth version appearing.
 *
 * These are the assertions that make the consolidation hold. Each one corresponds to a
 * way it can silently come undone.
 *
 * Runs against dist/, so `npm run build` must have run first.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');

// The single version the whole site is allowed to load.
const PLOTLY = 'plotly-2.32.0.min.js';

function walk(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (e.name.endsWith(ext)) out.push(p);
  }
  return out;
}

const pages = walk(DIST, '.html');
const rel = p => path.relative(DIST, p).split(path.sep).join('/');
const read = p => fs.readFileSync(p, 'utf8');

// `<script src="...">` only. Blog posts legitimately discuss plotly in prose and in
// Python code samples (`import plotly.express as px`), and those must not trip this.
const SCRIPT_SRC = /<script[^>]+src="([^"]+)"/g;
function scriptSrcs(p) {
  return [...read(p).matchAll(SCRIPT_SRC)].map(m => m[1]);
}

describe('vendored assets (dist/)', () => {
  test('the build output exists — run `npm run build` first', () => {
    expect(pages.length).toBeGreaterThan(50);
  });

  test('no page loads a script from cdn.plot.ly', () => {
    const bad = pages
      .map(p => [rel(p), scriptSrcs(p).filter(s => /cdn\.plot\.ly/.test(s))])
      .filter(([, hits]) => hits.length);
    expect(bad).toEqual([]);
  });

  test('every Plotly script tag points at the one vendored version', () => {
    const bad = [];
    for (const p of pages) {
      for (const src of scriptSrcs(p)) {
        if (!/plotly/i.test(src)) continue;
        if (!src.endsWith(`assets/js/${PLOTLY}`)) bad.push([rel(p), src]);
      }
    }
    expect(bad).toEqual([]);
  });

  test('exactly one Plotly build ships in dist/assets/js', () => {
    const shipped = walk(path.join(DIST, 'assets', 'js'), '.js')
      .map(p => path.basename(p))
      .filter(n => /^plotly.*\.js$/.test(n));
    expect(shipped).toEqual([PLOTLY]);
  });

  test('the vendored Plotly is actually referenced by at least one page', () => {
    // A 3.6MB blob nobody loads is dead weight; this fails if the last reference goes.
    const users = pages.filter(p => scriptSrcs(p).some(s => s.endsWith(`assets/js/${PLOTLY}`)));
    expect(users.length).toBeGreaterThan(0);
  });

  test('the CSP no longer allows cdn.plot.ly', () => {
    // The whole point of vendoring: script-src gets narrower. If a future change puts the
    // CDN back without reverting the pages, this catches the widened policy.
    const vercel = JSON.parse(read(path.join(ROOT, 'vercel.json')));
    const csp = JSON.stringify(vercel).match(/script-src[^;"]*/);
    expect(csp).not.toBeNull();
    expect(csp[0]).not.toMatch(/cdn\.plot\.ly/);
  });

  test('every vendored blob matches its .sha256 sidecar', () => {
    // The sidecar shipped for months with nothing reading it. build.js verifies it now;
    // this asserts the sidecars still exist and still match, so the guard cannot rot
    // back into decoration.
    const sidecars = walk(path.join(ROOT, 'assets'), '.sha256');
    expect(sidecars.length).toBeGreaterThan(0);

    for (const sc of sidecars) {
      const target = sc.slice(0, -'.sha256'.length);
      expect(fs.existsSync(target)).toBe(true);
      const expected = read(sc).trim().split(/\s+/)[0].toLowerCase();
      expect(expected).toMatch(/^[0-9a-f]{64}$/);
      const actual = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
      expect(`${path.basename(target)}: ${actual}`).toBe(`${path.basename(target)}: ${expected}`);
    }
  });

  test('verifyVendoredAssets throws on a corrupted blob', () => {
    // Proving the build gate fires, rather than trusting that it would.
    const { verifyVendoredAssets } = require('../../build.js');
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vendored-'));
    try {
      fs.writeFileSync(path.join(tmp, 'lib.js'), 'trustworthy');
      fs.writeFileSync(path.join(tmp, 'lib.js.sha256'), `${'0'.repeat(64)}  lib.js\n`);
      expect(() => verifyVendoredAssets(tmp)).toThrow(/does not match its \.sha256/);

      const good = crypto.createHash('sha256').update('trustworthy').digest('hex');
      fs.writeFileSync(path.join(tmp, 'lib.js.sha256'), `${good}  lib.js\n`);
      expect(verifyVendoredAssets(tmp)).toEqual(['lib.js']);

      fs.rmSync(path.join(tmp, 'lib.js'));
      expect(() => verifyVendoredAssets(tmp)).toThrow(/exists but/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
