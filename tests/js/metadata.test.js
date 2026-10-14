const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const yaml = require('js-yaml');
const { builtPages, SITEMAP_EXCLUDE, PAGE_DESCRIPTION_PATTERNS } = require('../../build');
const { buildDrilldown, buildHub } = require('../../scripts/build-drilldown');

const distDir = path.join(__dirname, '..', '..', 'dist');
if (!fs.existsSync(distDir)) throw new Error('dist/ is absent; run npm run build first');
const pages = builtPages(distDir);
const documents = new Map(pages.map(page => [page,
  new JSDOM(fs.readFileSync(path.join(distDir, page), 'utf8')).window.document]));
const destinations = pages.filter(page => !(page in SITEMAP_EXCLUDE));
const exemptions = {};
const brandContract = fs.readFileSync(path.join(__dirname, '../../brand/BRAND.md'), 'utf8');
const legalName = brandContract.match(/Legal\/contractual entity[^:\n]*:\s*\*\*([^*\n]+)\*\*/)[1];

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

test('destinations have one shared Organization with the required display name', () => {
  for (const page of destinations) {
    const full = nodesFor(page).filter(node => node['@type'] === 'Organization' && node.name);
    expect({ page, count: full.length }).toEqual({ page, count: 1 });
    expect(full[0]).toMatchObject({
      '@id': 'https://www.aceengineer.com/#organization',
      name: 'AceEngineer',
      alternateName: 'Analytical & Computational Engineering',
      legalName,
    });
  }
});

test('home metadata has no exemptions and references the shared Organization', () => {
  expect(exemptions).not.toHaveProperty('index.html');
  const page = nodesFor('index.html').find(node => node['@type'] === 'WebPage');
  expect(page.about).toEqual({ '@id': 'https://www.aceengineer.com/#organization' });
});

test('shared serviceType and knowsAbout entries occur verbatim in visible text', () => {
  const visible = pages.map(page => {
    const body = documents.get(page).body.cloneNode(true);
    body.querySelectorAll('script, style').forEach(node => node.remove());
    return body.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
  });
  for (const page of destinations) {
    const organization = nodesFor(page).find(node => node['@type'] === 'Organization' && node.name);
    for (const key of ['serviceType', 'knowsAbout']) {
      if (!(key in organization)) continue;
      expect(organization[key].length).toBeGreaterThan(0);
      for (const entry of organization[key]) {
        expect({ page, key, entry, visible: visible.some(text => text.includes(entry.toLowerCase())) })
          .toEqual({ page, key, entry, visible: true });
      }
    }
  }
});

test('both interactive templates expand the shared Organization token', () => {
  for (const page of ['capabilities/dc-drilldown.html', 'capabilities/dc-qaqc-hub.html']) {
    const html = fs.readFileSync(path.join(distDir, page), 'utf8');
    expect(html).not.toContain('<!--ORGANIZATION_JSONLD-->');
    expect(nodesFor(page).some(node => node['@type'] === 'Organization' && node['@id'] === 'https://www.aceengineer.com/#organization' && node.name === 'AceEngineer')).toBe(true);
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

const siteSuffix = /\s[-–—|]\s*(?:AceEngineer(?: Engineering)?|Analytical & Computational Engineering)\s*$/i;

test('all breadcrumb levels omit the site title suffix', () => {
  for (const page of pages) {
    for (const node of nodesFor(page).filter(node => node['@type'] === 'BreadcrumbList')) {
      for (const item of node.itemListElement) {
        expect({ page, name: item.name, hasSuffix: siteSuffix.test(item.name) })
          .toEqual({ page, name: item.name, hasSuffix: false });
      }
    }
  }
});

test('all home breadcrumb targets use the canonical trailing slash', () => {
  for (const page of pages) {
    for (const node of nodesFor(page).filter(node => node['@type'] === 'BreadcrumbList')) {
      for (const item of node.itemListElement) {
        if (/^https:\/\/www\.aceengineer\.com\/?$/.test(item.item)) {
          expect({ page, item: item.item }).toEqual({ page, item: 'https://www.aceengineer.com/' });
        }
      }
    }
  }
});

test('contact metadata uses ContactPage with its copied page metadata', () => {
  const doc = documents.get('contact.html');
  const schemas = schemasFor('contact.html').filter(node => node['@type'] === 'ContactPage');
  expect(schemas).toHaveLength(1);
  expect(schemas[0]).toMatchObject({
    name: doc.title, description: doc.querySelector('meta[name="description"]').content,
    url: doc.querySelector('link[rel="canonical"]').href,
  });
  expect(schemasFor('contact.html').some(node => node['@type'] === 'WebPage')).toBe(false);
});

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
  expect(sources).toHaveLength(120);
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
  const listed = [...text.matchAll(/^-[^\n]*\]\((https:\/\/[^)]+)\)(?::[^\n]*)?$/gm)].map(match => match[1]);
  expect([...new Set(listed)].sort()).toEqual(expected.sort());
  for (const page of Object.keys(SITEMAP_EXCLUDE)) expect(text).not.toContain(page);
});

test('llms.txt page descriptions omit percentage and currency figures', () => {
  const text = fs.readFileSync(path.join(distDir, 'llms.txt'), 'utf8');
  const registryStart = text.indexOf('## Capabilities\n') + '## Capabilities\n'.length;
  const pageSections = text.slice(text.indexOf('\n## ', registryStart));
  expect(pageSections.split('\n').filter(line => line.startsWith('- '))).toHaveLength(destinations.length);
  for (const line of pageSections.split('\n').filter(line => line.startsWith('- '))) {
    const description = line.match(/\]\([^)]*\): (.*)$/)?.[1];
    if (description) {
      const hasFigure = PAGE_DESCRIPTION_PATTERNS.some(pattern => pattern.test(description));
      expect({ line, hasFigure }).toEqual({ line, hasFigure: false });
    }
  }
  const page = 'blog/energy-data-automation-pipelines.html';
  const title = documents.get(page).title;
  expect(text.split('\n')).toContain(`- [${title}](https://www.aceengineer.com/${page})`);
});

// The home copy is bounded by main.home-page; shared navigation and footer
// cannot supply evidence for a service claim.
function visibleCopy(root) {
  const body = root.cloneNode(true);
  const originals = [...root.querySelectorAll('*')];
  const copies = [...body.querySelectorAll('*')];
  originals.forEach((node, index) => {
    const style = root.ownerDocument.defaultView.getComputedStyle(node);
    if (style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility)) copies[index].remove();
  });
  body.querySelectorAll('script, style, template, nav, footer, [hidden], [aria-hidden="true"], input[type="hidden"], .hidden, .sr-only, .visually-hidden')
    .forEach(node => node.remove());
  body.querySelectorAll('[style]').forEach(node => {
    if (node.style.display === 'none' || ['hidden', 'collapse'].includes(node.style.visibility)) node.remove();
  });
  return body.textContent.replace(/\s+/g, ' ').trim();
}

// Program names come from the published integration list, solver links and capability summaries.
const softwareQuestion = [...documents.get('faq.html').querySelectorAll('p > b')]
  .find(node => /software tools/i.test(node.textContent));
const integrations = [...softwareQuestion.parentElement.nextElementSibling.nextElementSibling.querySelectorAll('li > strong')]
  .flatMap(node => node.textContent.replace(/:$/, '').split('/'));
const diffractionSolvers = [...documents.get('reports/diffraction/index.html').querySelectorAll('a[href]')]
  .flatMap(node => [...new URL(node.getAttribute('href'), 'https://www.aceengineer.com').searchParams]
    .filter(([key]) => /^solver(?:A|B)?$/.test(key)).map(([, value]) => value));
const platformName = documents.get('platform.html').querySelector('.hero-subtitle > strong').textContent.trim();
const capabilityRegistry = yaml.load(fs.readFileSync(path.join(__dirname, '../../config/capabilities.yaml'), 'utf8'));
const capabilitySolvers = capabilityRegistry.capabilities.flatMap(entry =>
  [...entry.summary.matchAll(/\b([A-Za-z][A-Za-z0-9]+) VOF\b/g)].map(match => match[1]));
const softwareNames = [...new Set([...integrations, ...diffractionSolvers, platformName, ...capabilitySolvers])];
const standardDesignation = /\b[A-Z]{2,}(?:[ -][A-Z]{2,})*[ -](?=[A-Z0-9.-]*\d)[A-Z0-9]+(?:[.-][A-Z0-9]+)*\b/g;
function wholeToken(text, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'i').test(text);
}
function unsupportedHomeItems(text, otherPages, products = softwareNames) {
  const found = [...new Set([
    ...Array.from(text.matchAll(standardDesignation), match => match[0]),
    ...products.filter(name => wholeToken(text, name)),
  ])];
  return { found, missing: found.filter(item => !otherPages.some(page => wholeToken(page, item))) };
}
const homeCopyText = visibleCopy(documents.get('index.html').querySelector('main.home-page'));
const otherCopyTexts = pages.filter(page => page !== 'index.html')
  .map(page => visibleCopy(documents.get(page).body));

test('home standards and software have whole-token support on another built page', () => {
  const result = unsupportedHomeItems(homeCopyText, otherCopyTexts);
  console.info(`Home support: ${result.found.length} collected; ${result.missing.length} unsupported`);
  if (result.missing.length) throw new Error(`Unsupported home items: ${result.missing.join(', ')}`);
  expect(result.missing).toEqual([]);
});

test('home support lists both injected designation and product without hidden or shared evidence', () => {
  const designation = 'ZXQ-RP-X987654';
  const product = 'SyntheticSolver';
  const injected = `${homeCopyText} ${designation} ${product}`;
  const fixture = new JSDOM(`<head><style>.concealed { display: none; }</style></head><body><nav>${designation}</nav><footer>${product}</footer><p hidden>${designation}</p><p style="display:none">${product}</p><p class="concealed">${designation} ${product}</p><script>${product}</script><style>${designation}</style></body>`);
  const evidence = [...otherCopyTexts, visibleCopy(fixture.window.document.body)];
  const result = unsupportedHomeItems(injected, evidence, [...softwareNames, product]);
  expect(result.missing).toEqual(expect.arrayContaining([designation, product]));
  expect(unsupportedHomeItems('', evidence).found).toEqual([]);
  expect(wholeToken(`Prefix${product}Suffix`, product)).toBe(false);
  expect(wholeToken(`prefix-${designation}-suffix`, designation)).toBe(false);
  expect(wholeToken(product.toLowerCase(), product)).toBe(true);
});

test('home lead sentence and the three description texts agree', () => {
  const home = documents.get('index.html');
  const sentence = home.querySelector('.home-lead').textContent.trim().split(/\.\s+/).slice(0, 1).join('. ') + '.';
  const meta = home.querySelector('meta[name="description"]').content;
  const schema = nodesFor('index.html').find(node => node['@type'] === 'WebPage').description;
  const header = fs.readFileSync(path.join(distDir, 'llms.txt'), 'utf8').match(/^> (.*)$/m)[1];
  expect([meta, schema, header]).toEqual([sentence, sentence, sentence]);
});

const homeCopy = yaml.load(fs.readFileSync(path.join(__dirname, '../../brand/copy.yaml'), 'utf8'));
const supportedHomeCopy = [
  ['home.lead'],
  ['home.services.3.heading', 'service_details.3.description', 'home.services.3.receives'],
  ['service_details.0.description', 'home.services.0.receives'],
  ['home.services.1.heading', 'service_details.1.description', 'home.services.1.receives'],
  ['service_details.2.description'],
  ['home.services.5.receives'],
  ['service_details.4.description', 'home.services.4.receives'],
  ['home.description'],
].map(keys => [keys.join(', '), keys]);
test.each(supportedHomeCopy)('home wording follows existing page support: %s', (key, paths) => {
  for (const keyPath of paths) {
    const sentence = keyPath.split('.').reduce((value, part) => value[part], homeCopy);
    const detail = keyPath.match(/^service_details\.(\d)\.description$/);
    const visible = detail ? visibleCopy(documents.get(homeCopy.home.services[Number(detail[1])].page).querySelector('main')) : homeCopyText;
    expect(visible).toContain(sentence);
  }
});

test('outreach contact line uses the display name without a legal form', () => {
  const contact = documents.get('outreach/small-operator-brief.html').querySelector('.cta-block .secondary');
  expect(contact.textContent.split('·')[0].trim()).toBe('AceEngineer');
});

test('legal name appears only once in the shared footer and once in Organization metadata per page', () => {
  let footerPages = 0;
  let organizationPages = 0;
  for (const page of pages) {
    const doc = documents.get(page).cloneNode(true);
    const footers = doc.querySelectorAll('footer.footer-section');
    expect(footers.length).toBeLessThanOrEqual(1);
    for (const footer of footers) {
      const lines = footer.querySelectorAll('.footer-legal');
      expect({ page, count: lines.length }).toEqual({ page, count: 1 });
      expect(lines[0].textContent.trim()).toBe(legalName + ', doing business as AceEngineer');
      expect(footer.textContent.split(legalName)).toHaveLength(2);
      lines[0].remove();
      footerPages++;
    }
    let organizations = 0;
    for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
      const value = JSON.parse(script.textContent);
      function visit(node) {
        if (Array.isArray(node)) node.forEach(visit);
        else if (node && typeof node === 'object') {
          if ('legalName' in node) {
            expect(node['@type']).toBe('Organization');
            expect(node['@id']).toBe('https://www.aceengineer.com/#organization');
            expect(node.name).toBe('AceEngineer');
            expect(node.legalName).toBe(legalName);
            delete node.legalName;
            organizations++;
          }
          Object.values(node).forEach(visit);
        }
      }
      visit(value);
      script.textContent = JSON.stringify(value);
    }
    const expectedOrganizations = nodesFor(page).filter(node =>
      node['@type'] === 'Organization' && node['@id'] === 'https://www.aceengineer.com/#organization' && node.name
    ).length;
    expect({ page, organizations }).toEqual({ page, organizations: expectedOrganizations });
    expect(organizations).toBeLessThanOrEqual(1);
    organizationPages += organizations;
    expect({ page, misplaced: doc.documentElement.outerHTML.includes(legalName) })
      .toEqual({ page, misplaced: false });
    for (const footer of doc.querySelectorAll('footer')) {
      expect(footer.textContent).not.toMatch(/AceEngineer\s+(?:Inc\.?|Incorporated|LLC)\b/i);
    }
    expect(doc.title).not.toMatch(/AceEngineer\s+(?:Inc\.?|Incorporated|LLC)\b/i);
  }
  expect(footerPages).toBeGreaterThan(0);
  expect(organizationPages).toBeGreaterThan(0);
});

test('legal footer inherits copyright type and colour at a smaller size', () => {
  const css = fs.readFileSync(path.join(__dirname, '../../assets/css/theme.css'), 'utf8');
  const rule = css.match(/\.footer-section \.footer-legal\s*\{([^}]+)\}/);
  expect(rule).not.toBeNull();
  expect(rule[1]).not.toMatch(/(?:font-family|color|font):/);
  expect(rule[1]).toMatch(/font-size:\s*\.9em/);
  expect(rule[1]).toMatch(/font-style:\s*normal/);
});

test('every built page uses the specified figure for years of experience', () => {
  const otherYearCounts = [
    { page: 'engineering.html', text: '5+ years', reason: 'extended platform life' },
    { page: 'blog/gulf-of-mexico-production-data-access.html', text: '50+ years', reason: 'public dataset span' },
  ];
  for (const page of pages) {
    const doc = documents.get(page);
    const text = [visibleCopy(doc.body), ...[...doc.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]')].map(node => node.content)].join(' ');
    const figures = [...text.matchAll(/\b\d+\+\s*years\b|\b\d+\s*years(?:\s+of)?\s+experience\b/gi)].map(match => match[0]);
    const unrelated = otherYearCounts.filter(entry => entry.page === page);
    for (const entry of unrelated) expect(text).toContain(entry.text);
    expect({ page, otherExperienceFigures: figures.filter(figure => !/^25\+\s*years$/i.test(figure) && !unrelated.some(entry => entry.text === figure)) })
      .toEqual({ page, otherExperienceFigures: [] });
  }
});
test('shared contactPoint and all visible telephone numbers agree', () => {
  const expected = '+1 713-306-9029';
  for (const page of destinations) {
    const org = nodesFor(page).find(node => node['@type'] === 'Organization' && node.name);
    expect(org.contactPoint.telephone).toBe(expected);
  }
  for (const page of pages) {
    const doc = documents.get(page);
    for (const link of doc.querySelectorAll('a[href^="tel:"]')) {
      expect(link.getAttribute('href')).toBe('tel:+17133069029');
      expect(link.textContent).toBe(expected);
    }
    for (const number of visibleCopy(doc.body).matchAll(/\+\d{1,3}\s[\d ()-]{8,}\d/g)) expect(number[0]).toBe(expected);
    for (const node of nodesFor(page).filter(node => Object.hasOwn(node, 'telephone'))) expect(node.telephone).toBe(expected);
  }
});
test('every built page omits the misleading standards facts tile', () => {
  for (const page of pages) {
    const doc = documents.get(page);
    for (const node of doc.querySelectorAll('h1,h2,h3,h4,h5,h6,.badge-item,.number-box,.home-facts-grid > p')) {
      expect({ page, text: /Published standards/i.test(visibleCopy(node)) }).toEqual({ page, text: false });
    }
  }
});

test('drilling contractors have visible home and About support', () => {
  const about = documents.get('about.html');
  const section = [...about.querySelectorAll('h2')].find(node => node.textContent.trim() === 'Who We Serve').closest('section');
  expect([wholeToken(homeCopyText, 'drilling contractors'), wholeToken(visibleCopy(section), 'drilling contractors')]).toEqual([true, true]);
});
test('fitness-for-service outcomes have visible home and integrity support', () => {
  const home = documents.get('index.html').querySelector('#services article');
  const integrity = documents.get('solutions/subsea-pipelines-integrity.html').querySelector('main');
  for (const outcome of ['accept', 're-rate', 'take more measurements', 'escalate']) {
    expect({ outcome, home: wholeToken(visibleCopy(home), outcome), support: wholeToken(visibleCopy(integrity), outcome) })
      .toEqual({ outcome, home: true, support: true });
  }
});

test('every shared footer uses the specified standards line', () => {
  let checked = 0;
  for (const [page, doc] of documents) {
    const footer = doc.querySelector('footer.footer-section');
    if (!footer) continue;
    const line = footer.querySelector('.col-md-4 > p:last-child');
    expect({ page, text: line.textContent }).toEqual({
      page, text: 'Work to DNV, API, ABS, BS and NORSOK standards',
    });
    checked += 1;
  }
  expect(checked).toBeGreaterThan(0);
});

test('built contact text, mail links and structured data use one support address', () => {
  const support = 'support@aceengineer.com';
  const addresses = value => String(value).match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  const failures = [];
  let checked = 0;
  for (const [page, doc] of documents) {
    function check(value, kind) {
      const found = addresses(value);
      checked += found.length;
      const count = found.filter(address => address !== support).length;
      if (count) failures.push({ page, kind, count });
    }
    for (const link of doc.querySelectorAll('a[href^="mailto:"]')) {
      check(decodeURIComponent(link.getAttribute('href').slice(7).split('?')[0]), 'link target');
    }
    function visit(value) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
          if (key === 'email') check(child, 'structured-data property');
          visit(child);
        }
      }
    }
    for (const node of doc.querySelectorAll('script[type="application/ld+json"]')) visit(JSON.parse(node.textContent));
    const body = doc.body.cloneNode(true);
    body.querySelectorAll('script, style, template, [hidden], [aria-hidden="true"]').forEach(node => node.remove());
    body.querySelectorAll('br').forEach(node => node.replaceWith(' '));
    check(body.textContent, 'visible text');
  }
  expect(failures).toEqual([]);
  expect(checked).toBeGreaterThan(0);
});
