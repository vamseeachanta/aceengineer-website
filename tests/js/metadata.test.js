const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { builtPages, SITEMAP_EXCLUDE } = require('../../build');
const { buildDrilldown, buildHub } = require('../../scripts/build-drilldown');

const distDir = path.join(__dirname, '..', '..', 'dist');
if (!fs.existsSync(distDir)) throw new Error('dist/ is absent; run npm run build first');
const pages = builtPages(distDir);
const documents = new Map(pages.map(page => [page,
  new JSDOM(fs.readFileSync(path.join(distDir, page), 'utf8')).window.document]));
const destinations = pages.filter(page => !(page in SITEMAP_EXCLUDE));
const exemptions = {};

function addressPropertyHits(html) {
  const doc = new JSDOM(html).window.document;
  const hits = [];
  const prohibited = ['streetAddress', 'postalCode'];
  function visit(value) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        if (prohibited.includes(key)) hits.push(key);
        visit(value[key]);
      }
    }
  }
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    visit(JSON.parse(script.textContent));
  }
  for (const node of doc.querySelectorAll('[itemprop]')) {
    for (const key of node.getAttribute('itemprop').split(/\s+/)) {
      if (prohibited.includes(key)) hits.push(key);
    }
  }
  return hits;
}

test('every built page omits the two address properties', () => {
  for (const page of pages) {
    const hits = addressPropertyHits(fs.readFileSync(path.join(distDir, page), 'utf8'));
    expect({ page, hits }).toEqual({ page, hits: [] });
  }
});

test('address property scan rejects nested JSON-LD and microdata fixtures', () => {
  const folder = fs.mkdtempSync(path.join(process.env.TEST_TEMP_DIR || require('os').tmpdir(), 'address-properties-'));
  try {
    const file = path.join(folder, 'fixture.html');
    fs.writeFileSync(file, '<html><head><script type="application/ld+json">{"@graph":[{"address":{"streetAddress":"synthetic","postalCode":"synthetic"}}]}</script></head><body><span itemprop="streetAddress postalCode">synthetic</span></body></html>');
    expect(addressPropertyHits(fs.readFileSync(file, 'utf8'))).toEqual([
      'streetAddress', 'postalCode', 'streetAddress', 'postalCode',
    ]);
  } finally {
    fs.rmSync(folder, { recursive: true });
  }
});

function nodesFor(page) {
  const nodes = [];
  function visit(value) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      nodes.push(value);
      Object.values(value).forEach(visit);
    }
  }
  for (const script of documents.get(page).querySelectorAll('script[type="application/ld+json"]')) {
    visit(JSON.parse(script.textContent));
  }
  return nodes;
}

test('every built JSON-LD block parses', () => {
  expect(pages.length).toBeGreaterThan(0);
  for (const page of pages) expect(() => nodesFor(page)).not.toThrow();
});

test('destinations have one shared Organization with the required legal identity', () => {
  for (const page of destinations) {
    const full = nodesFor(page).filter(node => node['@type'] === 'Organization' && node.name);
    expect({ page, count: full.length }).toEqual({ page, count: 1 });
    expect(full[0]).toMatchObject({
      '@id': 'https://www.aceengineer.com/#organization',
      name: 'AceEngineer', legalName: 'AceEngineer Inc.',
      alternateName: 'Analytical & Computational Engineering',
    });
    for (const node of nodesFor(page).filter(node => node.legalName)) {
      expect(node.legalName).toBe('AceEngineer Inc.');
    }
  }
});

test('home metadata has no exemptions and references the shared Organization', () => {
  expect(exemptions).not.toHaveProperty('index.html');
  const page = nodesFor('index.html').find(node => node['@type'] === 'WebPage');
  expect(page.about).toEqual({ '@id': 'https://www.aceengineer.com/#organization' });
});

test('both interactive templates expand the shared Organization token', () => {
  for (const page of ['capabilities/dc-drilldown.html', 'capabilities/dc-qaqc-hub.html']) {
    const html = fs.readFileSync(path.join(distDir, page), 'utf8');
    expect(html).not.toContain('<!--ORGANIZATION_JSONLD-->');
    expect(nodesFor(page).some(node => node['@type'] === 'Organization' && node.legalName === 'AceEngineer Inc.')).toBe(true);
  }
});

test('interactive generators reject a missing Organization partial', () => {
  const originalRead = fs.readFileSync;
  const read = jest.spyOn(fs, 'readFileSync').mockImplementation((file, ...args) => {
    if (String(file).endsWith('partials/organization-jsonld.html')) {
      const error = new Error('Organization partial missing');
      error.code = 'ENOENT';
      error.path = String(file);
      throw error;
    }
    return originalRead(file, ...args);
  });
  try {
    expect(() => buildDrilldown(distDir)).toThrow('Organization partial missing');
    expect(() => buildHub(distDir)).toThrow('Organization partial missing');
  } finally {
    read.mockRestore();
  }
});

const requiredTypes = {
  CollectionPage: [
    'capabilities/index.html', 'outreach/index.html', 'solutions/index.html',
    'standards/index.html', 'reports/diffraction/index.html',
    'reports/sloshing/index.html', 'reports/sloshing/browse.html',
  ],
  Report: [
    'reports/sloshing-cfd-analysis.html', 'reports/sloshing-cfd-case.html',
    'reports/sloshing-tank-summary.html', 'reports/sloshing/analysis.html',
    'reports/sloshing/comparison.html', 'reports/sloshing/damping-and-sizing.html',
    'reports/sloshing/dual-connected-tanks.html', 'reports/sloshing/study.html',
    'reports/sloshing/validation.html', 'reports/diffraction/analysis.html',
    'reports/diffraction/comparison.html',
  ],
  WebPage: [
    'api-catalog.html', 'deckhand.html', 'deckhand-api.html', 'platform.html',
    'proof.html', 'vision.html', 'demos/dynacard.html', 'demos/freespan.html',
    'demos/jumper-installation.html', 'demos/mooring.html', 'demos/mudmat.html',
    'demos/pipelay.html', 'demos/wall-thickness.html',
    'methodology/compliance-dashboard/index.html',
    'methodology/compound-engineering/index.html', 'methodology/cross-review/index.html',
    'methodology/enforcement/index.html', 'methodology/multi-agent-parity/index.html',
    'methodology/orchestrator-worker/index.html', 'outreach/fowt-mooring-screening.html',
    'outreach/small-operator-brief.html', 'outreach/vessel-contractor-brochure.html',
    'solutions/field-development-screening.html',
  ],
};
const { loadCapabilities } = require('../../build');
const { isReleaseBacked } = require('../../scripts/render-capabilities');
for (const cap of loadCapabilities().capabilities.filter(cap => cap.status !== 'withheld' && !isReleaseBacked(cap))) {
  exemptions[`capabilities/${cap.id}.html`] = {
    breadcrumb: 'Generated Dataset markup is outside the permitted JSON-LD changes.',
  };
}

function schemasFor(page) {
  return [...documents.get(page).querySelectorAll('script[type="application/ld+json"]')]
    .flatMap(script => {
      const value = JSON.parse(script.textContent);
      return value['@graph'] || (Array.isArray(value) ? value : [value]);
    });
}

test('destinations have page schema and canonical final breadcrumbs', () => {
  for (const page of destinations) {
    const schemas = schemasFor(page);
    if (!exemptions[page]?.page) {
      expect({ page, hasPage: schemas.some(node => node['@type'] && !['Organization', 'BreadcrumbList'].includes(node['@type'])) })
        .toEqual({ page, hasPage: true });
    }
    if (!exemptions[page]?.breadcrumb) {
      const breadcrumb = schemas.find(node => node['@type'] === 'BreadcrumbList');
      expect({ page, hasBreadcrumb: !!breadcrumb }).toEqual({ page, hasBreadcrumb: true });
      expect(breadcrumb.itemListElement.at(-1).item).toBe(documents.get(page).querySelector('link[rel="canonical"]').href);
    }
  }
});

test('specified pages have their required schema type and copied metadata', () => {
  for (const [type, list] of Object.entries(requiredTypes)) {
    for (const page of list) {
      const doc = documents.get(page);
      const schemas = schemasFor(page).filter(node => node['@type'] === type);
      expect({ page, count: schemas.length }).toEqual({ page, count: 1 });
      expect(schemas[0]).toMatchObject({
        name: doc.title, description: doc.querySelector('meta[name="description"]').content,
        url: doc.querySelector('link[rel="canonical"]').href,
        inLanguage: 'en', publisher: { '@id': 'https://www.aceengineer.com/#organization' },
      });
      if (type === 'Report') expect(schemas[0].headline).toBe(doc.title);
    }
  }
});

test('destinations have canonical Open Graph metadata and the existing logo', () => {
  expect(fs.existsSync(path.join(distDir, 'assets/img/logo.png'))).toBe(true);
  for (const page of destinations) {
    const doc = documents.get(page);
    for (const field of ['title', 'description', 'type', 'url', 'image']) {
      expect({ page, field, present: !!doc.querySelector(`meta[property="og:${field}"]`)?.content })
        .toEqual({ page, field, present: true });
    }
    expect(doc.querySelector('meta[property="og:url"]').content).toBe(doc.querySelector('link[rel="canonical"]').href);
    expect(doc.querySelector('meta[property="og:image"]').content).toBe('https://www.aceengineer.com/assets/img/logo.png');
  }
});

test('noindex exclusions carry no JSON-LD or Open Graph', () => {
  for (const page of Object.keys(SITEMAP_EXCLUDE)) {
    const doc = documents.get(page);
    expect({ page, schemas: doc.querySelectorAll('script[type="application/ld+json"]').length }).toEqual({ page, schemas: 0 });
    expect(doc.querySelector('meta[property^="og:"]')).toBeNull();
  }
});

test('source metadata meets the required coverage floors', () => {
  const { getHtmlFiles } = require('../../build');
  const sources = getHtmlFiles(path.join(__dirname, '../../content'))
    .map(file => new JSDOM(fs.readFileSync(file, 'utf8')).window.document);
  expect(sources).toHaveLength(114);
  for (const [selector, floor] of [
    ['script[type="application/ld+json"]', 110],
    ['meta[property="og:title"]', 110], ['meta[property="og:image"]', 109],
  ]) expect(sources.filter(doc => doc.querySelector(selector)).length).toBeGreaterThanOrEqual(floor);
});

test('every built page has a nonempty meta description', () => {
  const missing = pages.filter(page => !documents.get(page).querySelector('meta[name="description"]')?.content.trim());
  expect(missing).toEqual([]);
});

test('titles are unique across source and generated pages', () => {
  const titles = new Map();
  for (const page of pages) {
    const title = documents.get(page).title;
    expect(title.trim().length).toBeGreaterThan(0);
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(page);
  }
  const duplicates = [...titles.entries()].filter(([, list]) => list.length > 1);
  expect(duplicates).toEqual([]);
});

test('llms.txt covers every sitemap URL and excludes noindex pages', () => {
  const file = path.join(distDir, 'llms.txt');
  expect(fs.existsSync(file)).toBe(true);
  const text = fs.readFileSync(file, 'utf8');
  const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
  const expected = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  const listed = [...text.matchAll(/^-[^\n]*\]\((https:\/\/[^)]+)\):/gm)].map(match => match[1]);
  expect([...new Set(listed)].sort()).toEqual(expected.sort());
  for (const page of Object.keys(SITEMAP_EXCLUDE)) expect(text).not.toContain(page);
});
