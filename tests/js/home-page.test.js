const fs = require('fs');
const { JSDOM } = require('jsdom');
const { loadCopy, renderHtml, canonicalUrlFor } = require('../../build');
const { sampleLocals } = require('../../scripts/render-samples');
const html = fs.readFileSync('dist/index.html', 'utf8');
const doc = new JSDOM(html).window.document;
const copy = loadCopy();
const norm = value => String(value).replace(/\s+/g, ' ').trim().toLowerCase();
function strings(value) { return typeof value === 'string' ? [value] : Object.values(value).flatMap(strings); }
test('canonical home copy renders with work copy conditional on publication', () => {
  expect(copy.home).toBeDefined();
  for (const [key, value] of Object.entries(copy.home)) {
    if (key !== 'work') for (const text of strings(value)) expect(norm(doc.documentElement.textContent + html)).toContain(norm(text));
  }
  expect(doc.querySelector('#work')).toBeNull();
  expect(doc.querySelector('a[href="#work"]')).toBeNull();
});
test('home navigation has the four specified links in order and no CTA', () => {
  expect([...doc.querySelectorAll('nav ul a')].map(a => [a.textContent, a.getAttribute('href')])).toEqual([
    ['Home', 'index.html'], ['Services', 'capabilities/'], ['About', 'about.html'], ['Contact', 'contact.html'],
  ]);
  expect(doc.querySelector('.navbar-right')).toBeNull();
});
test.each(['Fitness-for-service decision walk-through', '[LINK', 'All nine samples', 'capabilitiesCards', 'Explore capabilities', 'consultancy', 'ISO 9001', 'quality management', 'P.E.', 'Telephone', 'tel:', '25 years', 'President'])('home omits forbidden or unsupported copy: %s', text => {
  expect(html).not.toContain(text);
});
test('six service cards each have exactly one client-receives line', () => {
  const cards = [...doc.querySelectorAll('#services article')];
  expect(cards).toHaveLength(6);
  for (const card of cards) expect([...card.querySelectorAll('p')].filter(p => p.textContent.startsWith('Client receives:'))).toHaveLength(1);
});
test('footer uses the specified display name and copyright', () => {
  expect(doc.querySelector('footer').textContent).toContain('AceEngineer');
  expect(doc.querySelector('footer').textContent).toContain('© 2026 AceEngineer');
  expect([...doc.querySelectorAll('footer .text-center p')].map(p => p.textContent)).toEqual(['AceEngineer | www.aceengineer.com | Houston, Texas', '© 2026 AceEngineer']);
});
test('home has one shared Organization and a WebPage referencing it', () => {
  const nodes = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => { const v = JSON.parse(s.textContent); return Array.isArray(v) ? v : [v]; });
  const org = nodes.filter(v => v['@type'] === 'Organization' && v.name);
  expect(org).toHaveLength(1);
  expect(org[0]).toMatchObject({ '@id': 'https://www.aceengineer.com/#organization', name: 'AceEngineer' });
  const page = nodes.filter(v => v['@type'] === 'WebPage'); expect(page).toHaveLength(1);
  expect(page[0].about).toEqual({ '@id': org[0]['@id'] });
  expect(page[0].name).toBe(doc.title);
  expect(page[0].description).toBe(doc.querySelector('meta[name="description"]').content);
});
test('home has specified Open Graph and Twitter metadata', () => {
  expect(doc.title).toBe('AceEngineer | Offshore and marine engineering firm');
  expect(doc.querySelector('meta[property="og:title"]').content).toBe(doc.title);
  expect(doc.querySelector('meta[property="og:image"]').content).toBe('https://www.aceengineer.com/assets/img/logo.png');
  expect(doc.querySelector('meta[property="og:site_name"]').content).toBe('AceEngineer');
  expect(doc.querySelector('meta[name="twitter:title"]').content).toBe(doc.title);
  expect(doc.querySelector('meta[name="twitter:description"]').content).toBe(doc.querySelector('meta[name="description"]').content);
});
test('home main has no inline styles and appended styles use existing tokens', () => {
  expect(doc.querySelector('main[style], main [style]')).toBeNull();
  const css = fs.readFileSync('assets/css/theme.css', 'utf8');
  const block = css.match(/\/\* Home page and samples section \*\/([\s\S]*?)\/\* End home page and samples section \*\//);
  expect(block).not.toBeNull();
  expect(block[1]).not.toMatch(/#[0-9a-fA-F]{3,8}|rgb\(|hsl\(/);
  for (const declaration of block[1].matchAll(/(?:color|background(?:-color)?|font-family):\s*([^;]+);/g)) expect(declaration[1]).toMatch(/^var\(--[a-z0-9-]+\)$/);
});
test('published fixture renders all conditional home copy and only published rows', async () => {
  const entry = { slug: 'published-analysis', title: 'Published analysis', summary: 'Installation analysis.', page: 'samples/published-analysis.html', status: 'published' };
  const reg = { samples: [entry, { ...entry, title: 'Draft analysis', status: 'draft' }] };
  const rendered = await renderHtml(fs.readFileSync('content/index.html', 'utf8'), { rootPath: '', metadataExcluded: false, canonicalUrl: canonicalUrlFor('index.html'), copy, ...sampleLocals(reg) });
  const published = new JSDOM(rendered).window.document;
  for (const text of strings(copy.home.work)) expect(norm(published.textContent + rendered)).toContain(norm(text));
  expect(published.querySelector('#work tbody').textContent).toContain(entry.title);
  expect(published.querySelector('#work tbody').textContent).not.toContain('Draft analysis');
  expect(published.querySelector('#work tbody a').textContent).toBe(copy.home.work.open);
});
test('brand document states the display name, logo palette and existing tokens', () => {
  const brand = fs.readFileSync('brand/BRAND.md', 'utf8');
  expect(brand).toContain('Consumer-facing/site/social/marketing brand: **AceEngineer**.');
  expect(brand).toContain('#0B3D91'); expect(brand).toContain('#2BB2A6');
  expect(brand).not.toMatch(/plum|copper/);
  for (const token of ['--navy', '--navy-2', '--teal', '--teal-lift', '--teal-deep', '--blue', '--ink', '--muted', '--tint', '--hairline', '--underline', '--bg', '--font-body', '--font-ui', '--font-mono']) expect(brand).toContain(token);
});
