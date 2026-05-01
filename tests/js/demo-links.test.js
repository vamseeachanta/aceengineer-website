/**
 * Demo gallery link-check tests.
 *
 * Verifies the 6 demo detail pages (freespan, wall-thickness, mudmat, pipelay,
 * jumper-installation) are wired into the gallery at /demos/index.html, are
 * listed in sitemap.xml, do not reference the external Plotly CDN, include
 * the Google Analytics marker from head-common.html, and — for the four chart
 * pages — reference the vendored Plotly asset. Jumper (per Commit 1 / v4-lite
 * Defect E) is intentionally Plotly-free.
 *
 * Uses regex-based HTML parsing (cheerio is not a devDependency).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DIST_DEMOS = path.join(REPO_ROOT, 'dist', 'demos');
const SITEMAP = path.join(REPO_ROOT, 'sitemap.xml');

const DETAIL_SLUGS = ['freespan', 'wall-thickness', 'mudmat', 'pipelay', 'jumper-installation', 'mooring'];
const CHART_SLUGS = ['freespan', 'wall-thickness', 'mudmat', 'pipelay'];

function readSitemap() {
  return fs.readFileSync(SITEMAP, 'utf8');
}

function readDist(file) {
  return fs.readFileSync(path.join(DIST_DEMOS, file), 'utf8');
}

function collectAnchors(html) {
  // Match <a ... href="..." ...>inner</a> across newlines
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const anchors = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const inner = m[2];
    const hrefMatch = attrs.match(/\bhref\s*=\s*"([^"]*)"/i);
    anchors.push({
      href: hrefMatch ? hrefMatch[1] : '',
      text: inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    });
  }
  return anchors;
}

function collectSitemapLocs(xml) {
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  const locs = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim());
  }
  return locs;
}

function collectUrlBlocks(xml) {
  return xml.match(/<url>\s*[\s\S]*?\s*<\/url>/gi) || [];
}

beforeAll(() => {
  // Build dist/ if missing. If a prior build already produced dist/demos/index.html
  // we skip to keep the test fast.
  const built = fs.existsSync(path.join(DIST_DEMOS, 'index.html'));
  if (!built) {
    execSync('npm run build', { cwd: REPO_ROOT, stdio: 'inherit' });
  }
}, 120000);

describe('demo gallery CTAs', () => {
  test('gallery has exactly 6 "View detailed report" anchors linking to /demos/*.html', () => {
    const html = readDist('index.html');
    const anchors = collectAnchors(html);
    const reportAnchors = anchors.filter(
      (a) => /view detailed report/i.test(a.text) && /\/?demos\/[a-z-]+\.html$/i.test(a.href),
    );
    expect(reportAnchors.length).toBe(6);

    // Each slug appears at least once in a "View detailed report" anchor href
    for (const slug of DETAIL_SLUGS) {
      const re = new RegExp(`/?demos/${slug}\\.html$`, 'i');
      expect(reportAnchors.some((a) => re.test(a.href))).toBe(true);
    }
  });

  test('Demo 2 card contains BOTH the calculator link AND the detail-report link', () => {
    const html = readDist('index.html');
    expect(/href="[^"]*\/calculators\/wall-thickness\.html"/i.test(html)).toBe(true);
    expect(/href="[^"]*\/demos\/wall-thickness\.html"/i.test(html)).toBe(true);
  });
});

describe('sitemap.xml', () => {
  test('has all <loc> entries for /demos/*.html at www host', () => {
    const xml = readSitemap();
    const re = /<loc>\s*https:\/\/www\.aceengineer\.com\/demos\/([a-z-]+)\.html\s*<\/loc>/gi;
    const found = [];
    let m;
    while ((m = re.exec(xml)) !== null) {
      found.push(m[1]);
    }
    expect(found.sort()).toEqual([...DETAIL_SLUGS].sort());
  });

  test('all <loc> entries are non-empty https://www.aceengineer.com URLs', () => {
    const locs = collectSitemapLocs(readSitemap());
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc).toMatch(/^https:\/\/www\.aceengineer\.com(\/|$)/);
    }
  });

  test('each <url> block has exactly one <loc>', () => {
    const blocks = collectUrlBlocks(readSitemap());
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(collectSitemapLocs(block)).toHaveLength(1);
    }
    expect(collectSitemapLocs(readSitemap())).toHaveLength(blocks.length);
  });

  test('full <loc> values are unique after trimming whitespace', () => {
    const locs = collectSitemapLocs(readSitemap());
    expect(new Set(locs).size).toBe(locs.length);
  });
});

describe('no external Plotly CDN', () => {
  for (const slug of [...DETAIL_SLUGS, 'index']) {
    test(`dist/demos/${slug}.html has zero cdn.plot.ly references`, () => {
      const html = readDist(`${slug}.html`);
      expect(html).not.toMatch(/cdn\.plot\.ly/);
    });
  }
});

describe('Google Analytics marker (head-common included)', () => {
  for (const slug of DETAIL_SLUGS) {
    test(`dist/demos/${slug}.html contains G-K31E51DQ47`, () => {
      const html = readDist(`${slug}.html`);
      expect(html).toMatch(/G-K31E51DQ47/);
    });
  }
});

describe('vendored Plotly reference', () => {
  for (const slug of CHART_SLUGS) {
    test(`dist/demos/${slug}.html references /assets/js/plotly-2.32.0.min.js`, () => {
      const html = readDist(`${slug}.html`);
      expect(html).toMatch(/\/assets\/js\/plotly-2\.32\.0\.min\.js/);
    });
  }

  test('dist/demos/jumper-installation.html does NOT reference Plotly', () => {
    const html = readDist('jumper-installation.html');
    expect(html).not.toMatch(/plotly/i);
  });
});
