const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const call = name => (...args) => require('../../scripts/render-samples')[name](...args);
const loadSamples = call('loadSamples'), validateSamples = call('validateSamples');
const publishedSamples = call('publishedSamples'), sampleLocals = call('sampleLocals'), buildSamplePages = call('buildSamplePages');
const { renderHtml, writeSitemap, loadCopy, canonicalUrlFor, sourceFileFor } = require('../../build');
const scratch = process.env.SAMPLES_TEST_TMP_DIR || require('os').tmpdir();
let dir, assetsRoot, distDir;
const fixture = () => ({ slug: 'sample-analysis', title: 'Sample analysis', discipline: 'Marine installation screening', summary: 'Installation analysis.', revision: 'r1', page: 'samples/sample-analysis.html', pdf: 'assets/samples/sample-analysis-r1.pdf', status: 'draft' });
const registry = entry => ({ samples: [entry] });
const read = file => fs.readFileSync(path.join(distDir, file), 'utf8');
const doc = html => new JSDOM(html).window.document;
const schemas = html => [...doc(html).querySelectorAll('script[type="application/ld+json"]')].flatMap(node => { const value = JSON.parse(node.textContent); return value['@graph'] || (Array.isArray(value) ? value : [value]); });
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(scratch, 'samples-'));
  assetsRoot = path.join(dir, 'assets'); distDir = path.join(dir, 'dist');
  fs.mkdirSync(path.join(assetsRoot, 'samples'), { recursive: true });
  fs.mkdirSync(distDir);
});
function pdf(entry, size = 1536) { fs.writeFileSync(path.join(dir, entry.pdf), Buffer.alloc(size)); }
function chrome(reg, rootPath = '') {
  return renderHtml('<include src="partials/nav.html"></include>', { rootPath, ...sampleLocals(reg) });
}
async function home(reg) {
  return renderHtml(fs.readFileSync('content/index.html', 'utf8'), { rootPath: '', copy: loadCopy(), capabilitiesCards: '', canonicalUrl: canonicalUrlFor('index.html'), metadataExcluded: false, ...sampleLocals(reg) });
}
test('committed registry has five ordered draft reports and validates', () => {
  const reg = loadSamples('config/samples.yaml');
  expect(() => validateSamples(reg, { assetsRoot })).not.toThrow();
  expect(reg.samples.map(entry => entry.title)).toEqual(['Mudmat installation analysis', 'Barge motion response analysis', 'Cathodic protection analysis of a jacket', 'Drilling riser screening analysis', 'Semi-submersible diffraction screening analysis']);
  expect(reg.samples).toHaveLength(5);
  expect(reg.samples.every(entry => entry.status === 'draft' && entry.revision === 'r1')).toBe(true);
  expect(publishedSamples(reg)).toEqual([]);
});
const fields = ['slug', 'title', 'discipline', 'summary', 'revision', 'page', 'pdf', 'status'];
test.each(fields)('missing %s names the entry and field', field => {
  const entry = fixture(); delete entry[field];
  expect(() => validateSamples(registry(entry), { assetsRoot })).toThrow(new RegExp(field));
});
test.each([
  ['status', 'ready'], ['slug', '../escape'], ['revision', 'R-1'],
  ['page', 'samples/other.html'], ['pdf', 'assets/samples/sample-analysis.pdf'],
  ['discipline', 'Other'], ['summary', 'No ending'], ['summary', 'One sentence. Two sentences.'],
])('rejects invalid %s', (field, value) => {
  expect(() => validateSamples(registry({ ...fixture(), [field]: value }), { assetsRoot })).toThrow(new RegExp(field));
});
test('rejects duplicate slugs and malformed registries', () => {
  expect(() => validateSamples({ samples: [fixture(), fixture()] }, { assetsRoot })).toThrow(/slug/);
  expect(() => validateSamples({}, { assetsRoot })).toThrow(/samples/);
});
test('valid draft needs no PDF; published PDF is required and removal rejects it', () => {
  const entry = fixture(); expect(() => validateSamples(registry(entry), { assetsRoot })).not.toThrow();
  entry.status = 'published'; expect(() => validateSamples(registry(entry), { assetsRoot })).toThrow(/pdf/);
  pdf(entry); expect(() => validateSamples(registry(entry), { assetsRoot })).not.toThrow();
  fs.unlinkSync(path.join(dir, entry.pdf));
  expect(() => validateSamples(registry(entry), { assetsRoot })).toThrow(/pdf/);
});
test('draft-only render writes no samples pages, navigation, home links or sitemap URLs', async () => {
  const reg = registry(fixture());
  await buildSamplePages(reg, { distDir, assetsRoot, renderHtml });
  expect(fs.existsSync(path.join(distDir, 'samples'))).toBe(false);
  const nav = await chrome(reg); const html = await home(reg);
  expect(doc(nav).querySelector('a[href="samples/"]')).toBeNull();
  expect(nav).not.toContain('>Samples<');
  expect(html).not.toContain('Selected work');
  expect(doc(html).querySelector('a[href^="samples/"]')).toBeNull();
  fs.writeFileSync(path.join(distDir, 'index.html'), html); writeSitemap(distDir);
  expect(read('sitemap.xml')).not.toContain('/samples/');
});
test('published reports render revised PDF links, schemas, chrome, rows and sitemap', async () => {
  const entry = { ...fixture(), status: 'published' }; pdf(entry);
  const draft = { ...fixture(), slug: 'draft-analysis', title: 'Draft analysis', page: 'samples/draft-analysis.html', pdf: 'assets/samples/draft-analysis-r1.pdf' };
  const reg = { samples: [entry, draft] };
  await buildSamplePages(reg, { distDir, assetsRoot, renderHtml });
  expect(fs.existsSync(path.join(distDir, draft.page))).toBe(false);
  const index = read('samples/index.html'); const page = read(entry.page);
  expect(index).toContain(entry.title); expect(index).not.toContain(draft.title);
  expect(doc(page).querySelector('main a').getAttribute('href')).toBe('../' + entry.pdf);
  expect(doc(page).querySelector('main a').textContent).toBe('Open the report (PDF, 2 KB)');
  expect(schemas(index).map(node => node['@type'])).toEqual(expect.arrayContaining(['Organization', 'CollectionPage', 'BreadcrumbList']));
  expect(schemas(page).map(node => node['@type'])).toEqual(expect.arrayContaining(['Organization', 'Report', 'BreadcrumbList']));
  expect(doc(page).querySelector('main [style]')).toBeNull();
  expect(schemas(page).find(node => node['@type'] === 'Report').encoding.contentUrl).toBe('https://www.aceengineer.com/' + entry.pdf);
  expect(doc(await chrome(reg)).querySelector('a[href="samples/"]').textContent).toBe('Samples');
  expect(sampleLocals(reg).sampleHomeRows).toContain(entry.title);
  expect(sampleLocals(reg).sampleHomeRows).not.toContain(draft.title);
  writeSitemap(distDir);
  expect(read('sitemap.xml')).toContain('https://www.aceengineer.com/samples/');
  expect(read('sitemap.xml')).toContain('https://www.aceengineer.com/' + entry.page);
  expect(read('sitemap.xml')).not.toContain(draft.slug);
  expect(sourceFileFor(entry.page)).toBe('./config/samples.yaml');
  const revised = { ...entry, revision: 'r2', pdf: 'assets/samples/sample-analysis-r2.pdf' }; pdf(revised, 4096);
  await buildSamplePages(registry(revised), { distDir, assetsRoot, renderHtml });
  expect(read(revised.page)).toContain('../' + revised.pdf);
  expect(read(revised.page)).not.toContain('../' + entry.pdf);
});
test('home rows preserve registry order, limit to four and escape registry strings', () => {
  const entries = Array.from({ length: 5 }, (_, i) => ({ ...fixture(), slug: `sample-${i}`, page: `samples/sample-${i}.html`, title: `Sample <${i}>`, status: 'published' }));
  const rows = sampleLocals({ samples: entries }).sampleHomeRows;
  expect((rows.match(/<tr>/g) || [])).toHaveLength(4);
  expect(rows).toContain('Sample &lt;0&gt;'); expect(rows).not.toContain('Sample &lt;4&gt;');
});

test('unpublished samples omit fact wording throughout the built and rendered home', async () => {
  const reg = loadSamples('config/samples.yaml');
  expect(publishedSamples(reg)).toHaveLength(0);
  const rendered = await home(reg);
  const built = fs.readFileSync('dist/index.html', 'utf8');
  for (const html of [built, rendered]) {
    expect([...doc(html).querySelectorAll('.home-facts-grid > p > strong')].map(node => node.textContent))
      .toEqual(['Founded 2010', '25+ years of experience', 'Public, checked code']);
    expect(html).not.toContain('Public samples');
    expect(html).not.toContain('Public data and synthetic inputs');
    expect(doc(html).querySelector('#work')).toBeNull();
  }
  await buildSamplePages(reg, { distDir, assetsRoot, renderHtml });
  expect(fs.existsSync(path.join(distDir, 'samples'))).toBe(false);
});
test('published samples enable the conditional fact, table and sample pages together', async () => {
  expect(loadCopy().home.work.fact).toEqual({
    heading: 'Public samples', detail: 'Public data and synthetic inputs',
  });
  const entry = { ...fixture(), status: 'published' }; pdf(entry);
  const reg = registry(entry);
  await buildSamplePages(reg, { distDir, assetsRoot, renderHtml });
  const rendered = await home(reg);
  fs.writeFileSync(path.join(distDir, 'index.html'), rendered);
  const page = doc(read('index.html'));
  expect([...page.querySelectorAll('.home-facts-grid > p > strong')].map(node => node.textContent))
    .toEqual(['Founded 2010', '25+ years of experience', 'Public, checked code', 'Public samples']);
  expect(page.querySelector('.home-facts').textContent).toContain(loadCopy().home.work.fact.detail);
  expect(page.querySelector('#work table tbody').textContent).toContain(entry.title);
  expect(page.querySelector('nav a[href="samples/"]')).not.toBeNull();
  expect(fs.existsSync(path.join(distDir, 'samples/index.html'))).toBe(true);
  expect(fs.existsSync(path.join(distDir, entry.page))).toBe(true);
});

test('a published sample appears only beside its own home service', async () => {
  const entry = { ...fixture(), status: 'published' };
  pdf(entry);
  const reg = registry(entry);
  await buildSamplePages(reg, { distDir, assetsRoot, renderHtml });
  const rendered = doc(await home(reg));
  const cards = [...rendered.querySelectorAll('#services article[data-engineering-service]')];
  const matching = cards.find(card => card.querySelector('h3').textContent === entry.discipline);
  expect(matching.querySelector('.service-samples a').getAttribute('href')).toBe(entry.page);
  expect(fs.existsSync(path.join(distDir, entry.page))).toBe(true);
  expect(cards.filter(card => card !== matching).every(card => card.querySelector('.service-samples').textContent.trim() === 'sample report in preparation')).toBe(true);
});

test('service sample labels remain text when a registry title contains markup', async () => {
  const entry = { ...fixture(), title: 'Report <strong>label</strong>', status: 'published' };
  const rendered = doc(await home(registry(entry)));
  const link = rendered.querySelector('#services .service-samples a');
  expect(link.textContent).toBe(entry.title);
  expect(link.querySelector('strong')).toBeNull();
});

test('each registry discipline maps to exactly one home service', () => {
  const copy = loadCopy();
  for (const entry of loadSamples('config/samples.yaml').samples) {
    const matches = copy.home.services.filter((service, index) => copy.service_details[index].sampleDiscipline === entry.discipline);
    expect({ discipline: entry.discipline, destinations: matches.map(service => service.page) })
      .toEqual({ discipline: entry.discipline, destinations: [expect.any(String)] });
    const published = { ...entry, status: 'published' };
    const locals = sampleLocals(registry(published));
    expect(Object.entries(locals.serviceSamples).filter(([, samples]) => samples.length).map(([page]) => page))
      .toEqual(matches.map(service => service.page));
  }
});

test('default service sample mapping resolves copy independently of working directory', () => {
  const { execFileSync } = require('child_process');
  const modulePath = require.resolve('../../scripts/render-samples');
  const entry = { ...fixture(), status: 'published' };
  const script = 'const renderer = require(process.argv[1]); process.stdout.write(JSON.stringify(renderer.sampleLocals(JSON.parse(process.argv[2])).serviceSamples));';
  const output = execFileSync(process.execPath, ['-e', script, modulePath, JSON.stringify(registry(entry))], {
    cwd: dir, encoding: 'utf8',
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR'].includes(key))),
  });
  expect(JSON.parse(output)['services/marine-installation.html']).toEqual([entry]);
});
