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
const exemptions = {
  'index.html': {
    organization: 'Protected source retains the former Organization definition.',
  },
};

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
    if (exemptions[page]?.organization) continue;
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
