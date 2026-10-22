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
const { JSDOM } = require('jsdom');
const { COPIED_PAGES } = require('../../scripts/copy-digitalmodel-pages');

const DIST = path.join(__dirname, '..', '..', 'dist');

const CHROME_EXEMPT = {};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// One parse per page, reused by every assertion below. Real DOM, not regexes: the
// script that repaired the heading outlines used regex detection, so a regex-based gate
// would share its blind spots (raised in the codex review of #80).
const domCache = new Map();
function docFor(p) {
  if (!domCache.has(p)) {
    domCache.set(p, new JSDOM(fs.readFileSync(p, 'utf8')).window.document);
  }
  return domCache.get(p);
}

function headingLevels(p) {
  return [...docFor(p).querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName[1]));
}

const pages = fs.existsSync(DIST) ? walk(DIST) : [];
const rel = p => path.relative(DIST, p).split(path.sep).join('/');
const read = p => fs.readFileSync(p, 'utf8');

// The three standalone copies retain their published document structure.
// Existing pages continue to require the shared site landmarks and skip link.
const chromePages = pages.filter(p => !(rel(p) in CHROME_EXEMPT) && !COPIED_PAGES.includes(rel(p)));

function addressProperties(value, found = []) {
  if (value === null || typeof value !== 'object') return found;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'streetAddress' || key === 'postalCode') found.push(key);
    addressProperties(child, found);
  }
  return found;
}

describe('a11y baseline (dist/)', () => {
  test('the build output exists — run `npm run build` first', () => {
    expect(pages.length).toBeGreaterThan(50);
  });

  test('every page excludes streetAddress and postalCode from structured data', () => {
    const bad = [];
    for (const p of pages) {
      for (const block of docFor(p).querySelectorAll('script[type="application/ld+json"]')) {
        const data = JSON.parse(block.textContent);
        for (const property of addressProperties(data)) bad.push([rel(p), property]);
      }
    }
    expect(bad).toEqual([]);
  });

  test('the structured-data walker detects nested address properties', () => {
    const fixture = {
      '@graph': [{ address: { streetAddress: 'SYNTHETIC', postalCode: 'SYNTHETIC' } }],
    };
    expect(addressProperties(fixture)).toEqual(['streetAddress', 'postalCode']);
  });

  test('every page declares a viewport', () => {
    const missing = pages.filter(p => !/name="viewport"/.test(read(p))).map(rel);
    expect(missing).toEqual([]);
  });

  test('every page has a meta description', () => {
    const missing = chromePages
      .filter(p => !/name="description"/.test(read(p)))
      .map(rel);
    expect(missing).toEqual([]);
  });

  test('every page has exactly one <h1>', () => {
    const bad = chromePages
      .map(p => [rel(p), headingLevels(p).filter(l => l === 1).length])
      .filter(([, n]) => n !== 1);
    expect(bad).toEqual([]);
  });

  test('no page skips a heading level', () => {
    const bad = [];
    for (const p of chromePages) {
      const levels = headingLevels(p);
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
    const missing = chromePages.filter(p => !docFor(p).querySelector('main#main')).map(rel);
    expect(missing).toEqual([]);
  });

  test('every page has a skip link targeting #main', () => {
    const missing = chromePages
      .filter(p => !docFor(p).querySelector('a.skip-link[href="#main"]'))
      .map(rel);
    expect(missing).toEqual([]);
  });

  test('the skip link is the first focusable element, and targets a real element', () => {
    const bad = [];
    for (const p of chromePages) {
      const doc = docFor(p);
      const focusable = doc.querySelector('a[href], button, input:not([type="hidden"]), select, textarea');
      if (focusable && !focusable.classList.contains('skip-link')) bad.push([rel(p), 'not first']);
      // A skip link that points at nothing is worse than none — it silently does nothing.
      if (!doc.getElementById('main')) bad.push([rel(p), '#main target missing']);
    }
    expect(bad).toEqual([]);
  });

  test('every form control has an accessible name', () => {
    const bad = [];
    for (const p of pages) {
      const doc = docFor(p);
      for (const el of doc.querySelectorAll('input:not([type="hidden"]), select, textarea')) {
        if (el.type === 'checkbox' && el.getAttribute('aria-hidden') === 'true') continue;  // honeypot
        const labelled = (el.id && doc.querySelector(`label[for="${el.id}"]`))
          || el.closest('label')
          || el.getAttribute('aria-label')
          || el.getAttribute('aria-labelledby')
          || el.getAttribute('title');
        if (!labelled) bad.push([rel(p), el.tagName.toLowerCase(), el.name || el.type]);
      }
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

  test('only the specified copied-page canonicals use the apex host', () => {
    const bad = pages
      .filter(p => {
        const html = COPIED_PAGES.includes(rel(p))
          ? read(p).replace(`<link rel="canonical" href="https://aceengineer.com/${rel(p)}">`, '')
          : read(p);
        return /https:\/\/aceengineer\.com(?!\w)/.test(html);
      })
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

  test('there is exactly one <main> per page', () => {
    const bad = chromePages
      .map(p => [rel(p), docFor(p).querySelectorAll('main').length])
      .filter(([, n]) => n !== 1);
    expect(bad).toEqual([]);
  });
});
