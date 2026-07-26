/**
 * a11y-baseline.test.js — per-page accessibility floor for the built site (#87).
 *
 * The audit behind #80 found these regressing silently: 105/115 pages had no
 * <main>, none had a skip link, 33 skipped heading levels, and pages shipped
 * without a viewport or meta description. Each of those is cheap to assert and
 * expensive to find by hand, so the build output is checked directly.
 *
 * Runs against dist/, so `npm run build` must have run first (CI does this before
 * `npm test`; the suite fails loudly rather than silently passing on an empty tree).
 */

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', '..', 'dist');

/**
 * Pages exempt from the page-chrome rules, with the reason. These are the
 * consolidated-report redirect stubs: `noindex`, no visible content beyond a
 * one-line fallback link, and a `location.replace` in the head. Giving them a
 * heading, a landmark and a skip link would be theatre. They ARE still required
 * to be noindex — see the dedicated test below, which is what makes the
 * exemption safe.
 */
const CHROME_EXEMPT = {
  'reports/diffraction/aqwa-analysis.html': 'noindex redirect stub -> analysis.html',
  'reports/diffraction/orcawave-analysis.html': 'noindex redirect stub -> analysis.html',
  'reports/diffraction/orcawave-aqwa-comparison.html': 'noindex redirect stub -> comparison.html',
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function stripNonContent(html) {
  const at = html.indexOf('<body');
  const body = at < 0 ? html : html.slice(at);
  return body
    .replace(/<script\b[\s\S]*?<\/script>/g, '')
    .replace(/<style\b[\s\S]*?<\/style>/g, '');
}

function headingLevels(html) {
  return [...stripNonContent(html).matchAll(/<h([1-6])[\s>]/g)].map(m => Number(m[1]));
}

const pages = fs.existsSync(DIST) ? walk(DIST) : [];
const rel = p => path.relative(DIST, p).split(path.sep).join('/');
const read = p => fs.readFileSync(p, 'utf8');

const chromePages = pages.filter(p => !(rel(p) in CHROME_EXEMPT));

describe('a11y baseline (dist/)', () => {
  test('the build output exists — run `npm run build` first', () => {
    expect(pages.length).toBeGreaterThan(50);
  });

  test('every page declares a viewport', () => {
    const missing = pages.filter(p => !/name="viewport"/.test(read(p))).map(rel);
    expect(missing).toEqual([]);
  });

  test('every page has a meta description', () => {
    const missing = pages
      .filter(p => !(rel(p) in CHROME_EXEMPT))
      .filter(p => !/name="description"/.test(read(p)))
      .map(rel);
    expect(missing).toEqual([]);
  });

  test('every page has exactly one <h1>', () => {
    const bad = chromePages
      .map(p => [rel(p), headingLevels(read(p)).filter(l => l === 1).length])
      .filter(([, n]) => n !== 1);
    expect(bad).toEqual([]);
  });

  test('no page skips a heading level', () => {
    const bad = [];
    for (const p of chromePages) {
      const levels = headingLevels(read(p));
      let prev = 0;
      const skips = [];
      for (const l of levels) {
        if (prev && l > prev + 1) skips.push(`h${prev}->h${l}`);
        prev = l;
      }
      if (skips.length) bad.push([rel(p), skips]);
    }
    expect(bad).toEqual([]);
  });

  test('every page has a <main id="main"> landmark', () => {
    const missing = chromePages.filter(p => !/<main\s+id="main"/.test(read(p))).map(rel);
    expect(missing).toEqual([]);
  });

  test('every page has a skip link targeting #main', () => {
    const missing = chromePages
      .filter(p => !/class="skip-link"[^>]*href="#main"|href="#main"[^>]*class="skip-link"/.test(read(p)))
      .map(rel);
    expect(missing).toEqual([]);
  });

  test('the skip link is the first focusable element in the body', () => {
    const bad = [];
    for (const p of chromePages) {
      const body = stripNonContent(read(p));
      const firstAnchor = body.search(/<a\b|<button\b|<input\b|<select\b|<textarea\b/);
      if (firstAnchor < 0) continue;
      if (!/^<a\b[^>]*class="skip-link"/.test(body.slice(firstAnchor))) bad.push(rel(p));
    }
    expect(bad).toEqual([]);
  });

  test('exempt pages really are noindex redirect stubs', () => {
    for (const [page, reason] of Object.entries(CHROME_EXEMPT)) {
      const p = path.join(DIST, page);
      expect(fs.existsSync(p)).toBe(true);
      const html = read(p);
      expect(`${page}: ${reason} — noindex`).toBe(`${page}: ${reason} — noindex`);
      expect(/<meta name="robots" content="[^"]*noindex/.test(html)).toBe(true);
      expect(/location\.replace/.test(html)).toBe(true);
    }
  });

  // --- canonical URLs (#85) -----------------------------------------------
  // 109/115 pages had no canonical, and several emitted og:url on the apex host,
  // which vercel.json 301s to www — so crawlers saw a redirect hop and no signal.

  test('every page emits exactly one canonical', () => {
    const bad = pages
      .map(p => [rel(p), (read(p).match(/rel="canonical"/g) || []).length])
      .filter(([, n]) => n !== 1);
    expect(bad).toEqual([]);
  });

  test('no self-referencing URL uses the apex host (it 301s to www)', () => {
    const bad = pages
      .filter(p => /https:\/\/aceengineer\.com(?!\w)/.test(read(p)))
      .map(rel);
    expect(bad).toEqual([]);
  });

  test('every live capability page carries Dataset JSON-LD', () => {
    const capPages = pages.filter(p => /^capabilities\/(?!index\.html|dc-)/.test(rel(p)));
    expect(capPages.length).toBeGreaterThan(0);
    for (const p of capPages) {
      const blocks = [...read(p).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      const parsed = blocks.map(b => JSON.parse(b[1]));
      const dataset = parsed.find(d => d['@type'] === 'Dataset');
      expect(`${rel(p)} has Dataset JSON-LD`).toBe(dataset ? `${rel(p)} has Dataset JSON-LD` : 'missing');
      expect(dataset.url.startsWith('https://www.aceengineer.com/')).toBe(true);
      expect(dataset.description.length).toBeGreaterThan(20);
      expect(dataset.distribution.contentUrl).toMatch(/^https:\/\/huggingface\.co\/datasets\//);
    }
  });

  test('<main> tags are balanced', () => {
    const bad = chromePages
      .map(p => {
        const html = read(p);
        return [rel(p), (html.match(/<main\b/g) || []).length, (html.match(/<\/main>/g) || []).length];
      })
      .filter(([, o, c]) => o !== 1 || c !== 1);
    expect(bad).toEqual([]);
  });
});
