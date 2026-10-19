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
    if (!['work', 'services'].includes(key)) for (const text of strings(value)) expect(norm(doc.documentElement.textContent + html)).toContain(norm(text));
  }
  for (const service of copy.home.services) {
    expect(norm(doc.body.textContent)).toContain(norm(service.heading));
    expect(norm(doc.body.textContent)).toContain(norm(service.receives));
    expect(doc.querySelector('#services article[data-engineering-service] > p:not(.home-receives):not(.service-samples)')).toBeNull();
  }
  expect(doc.querySelector('#work')).toBeNull();
  expect(doc.querySelector('a[href="#work"]')).toBeNull();
});
test('home navigation has the six specified links in order and no CTA', () => {
  expect([...doc.querySelectorAll('nav ul a')].map(a => [a.textContent, a.getAttribute('href')])).toEqual([
    ['Home', 'index.html'], ['Services', 'capabilities/'], ['AI automation', 'ai-automation/'], ['Newsletter', 'newsletter/'], ['About', 'about.html'], ['Contact', 'contact.html'],
  ]);
  expect(doc.querySelector('.navbar-right')).toBeNull();
});
test.each(['Fitness-for-service decision walk-through', '[LINK', 'All nine samples', 'capabilitiesCards', 'Explore capabilities', 'consultancy', 'ISO 9001', 'quality management', 'Telephone', '25 years', 'President'])('home omits forbidden or unsupported copy: %s', text => {
  expect(html).not.toContain(text);
});
test('six engineering cards keep their received outputs alongside two automation cards', () => {
  const cards = [...doc.querySelectorAll('#services article')];
  expect(cards).toHaveLength(8);
  for (const card of cards.filter(card => card.hasAttribute('data-engineering-service'))) expect([...card.querySelectorAll('p')].filter(p => p.textContent.startsWith('Client receives:'))).toHaveLength(1);
});
test('footer uses the specified display name and copyright', () => {
  expect(doc.querySelector('footer').textContent).toContain('AceEngineer');
  expect(doc.querySelector('footer').textContent).toContain('© 2026 AceEngineer');
  expect([...doc.querySelectorAll('footer .text-center p:not(.footer-legal)')].map(p => p.textContent)).toEqual(['AceEngineer | www.aceengineer.com | Houston, Texas', '© 2026 AceEngineer']);
  expect(doc.querySelectorAll('footer .footer-legal')).toHaveLength(1);
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
  expect(doc.title).toBe('AceEngineer | Engineering analysis and AI automation');
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
  expect(published.querySelector('#work > .container > p').textContent).toBe(copy.home.work.description);
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

test('home and About show the specified years of experience', () => {
  expect(doc.querySelector('.home-facts').textContent).toContain('25+ years of experience');
  const about = new JSDOM(fs.readFileSync('dist/about.html', 'utf8')).window.document;
  expect(about.body.textContent).toContain('25+ years');
});
test('home contact and About show the principal suffix and title', () => {
  expect(copy.home.contact.principal).toBe('Vamsee Achanta, P.E., Principal Engineer');
  expect(doc.querySelector('#contact').textContent).toContain(copy.home.contact.principal);
  const about = new JSDOM(fs.readFileSync('dist/about.html', 'utf8')).window.document;
  expect([...about.querySelectorAll('strong')].map(node => node.textContent)).toContain(copy.home.contact.principal);
});
test('home and Contact show one direct telephone link', () => {
  const contact = new JSDOM(fs.readFileSync('dist/contact.html', 'utf8')).window.document;
  for (const block of [doc.querySelector('#contact'), contact.querySelector('.contact-info-card')]) {
    const links = [...block.querySelectorAll('a[href^="tel:"]')];
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('tel:+17133069029');
    expect(links[0].textContent).toBe('+1 713-306-9029');
  }
});
test('home facts contain two items without unpublished samples or the standards item', () => {
  expect([...doc.querySelectorAll('.home-facts-grid > p > strong')].map(node => node.textContent))
    .toEqual(['Founded 2010', '25+ years of experience', 'Public, checked code']);
  expect(doc.querySelector('.home-facts').textContent).not.toContain('Published standards');
});

test('home headline uses the specified engineering analysis wording', () => {
  const heading = 'Engineering analysis that is practical, dependable and repeatable.';
  expect(copy.home.heading).toBe(heading);
  expect(doc.querySelector('h1').textContent).toBe(heading);
});

test('tracked HTML omits the obsolete standards footer text', () => {
  const { execFileSync } = require('child_process');
  const files = execFileSync('git', ['ls-files', '-z', '--', '*.html'], { encoding: 'utf8' })
    .split('\0').filter(file => file && !file.startsWith('dist/'));
  expect(files.length).toBeGreaterThan(0);
  const obsolete = /Standards:\s*DNV\s*•\s*API\s*•\s*ABS\s*•\s*BS\s*•\s*Norsok/;
  expect(files.filter(file => obsolete.test(fs.readFileSync(file, 'utf8').replace(/&bull;|&#8226;/g, '•')))).toEqual([]);
});

test('About experience wording follows canonical copy without a redundant qualifier', () => {
  const about = new JSDOM(fs.readFileSync('dist/about.html', 'utf8')).window.document;
  const story = about.querySelector('#story') || about.querySelector('main');
  expect(story.textContent.includes(copy.credentials[0])).toBe(true);
  expect(/Over\s+\d+\+\s+years/i.test(story.textContent)).toBe(false);
});

test('not-found copyright has the shared footer form', () => {
  const missing = new JSDOM(fs.readFileSync('dist/404.html', 'utf8')).window.document;
  const canonical = doc.querySelector('footer .text-center p:nth-child(2)').textContent;
  expect(missing.querySelector('body > footer p').textContent === canonical).toBe(true);
});

test.each([
  ['docs/marketing/ENGINEERING_SERVICES_BRIEF.md', 3],
  ['docs/marketing/ENGINEERING_SERVICES_ONE_PAGER.md', 9],
])('marketing contact uses only the canonical support address: %s', (file, line) => {
  const support = copy.home.contact.email;
  const text = fs.readFileSync(file, 'utf8');
  const addresses = text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi) || [];
  const domain = support.split('@')[1].toLowerCase();
  const firmAddresses = addresses.filter(address => address.split('@')[1].toLowerCase() === domain);
  expect(firmAddresses.length).toBeGreaterThan(0);
  expect(firmAddresses.every(address => address === support)).toBe(true);
  const contactLine = text.split('\n')[line - 1];
  expect(contactLine.includes(support)).toBe(true);
});

test('service cards link to distinct detail pages and keep one concise output line', () => {
  const cards = [...doc.querySelectorAll('#services article[data-engineering-service]')];
  const destinations = new Set();
  for (const card of cards) {
    const link = card.querySelector('h3 a');
    expect(link).not.toBeNull();
    destinations.add(link.getAttribute('href'));
    const output = card.querySelector('.home-receives');
    expect(output.textContent.trim().split(/\s+/).length).toBeLessThanOrEqual(26);
    expect(card.querySelectorAll('p')).toHaveLength(2);
    expect(card.querySelector('.service-samples').textContent.trim()).toBe('sample report in preparation');
    expect(card.querySelector('.service-samples a')).toBeNull();
  }
  expect(destinations.size).toBe(6);
});

test('the home invitation follows the opening copy and offers the form and canonical contact', () => {
  const invitation = doc.querySelector('.home-hero .scope-invitation');
  expect(invitation).not.toBeNull();
  expect(invitation.querySelector('a[href="contact.html"]')).not.toBeNull();
  expect(invitation.querySelector('a[href^="mailto:"]').textContent).toBe(copy.home.contact.email);
});

test('every home service destination builds with output, sample and invitation', () => {
  for (const service of copy.home.services) {
    expect(fs.existsSync('dist/' + service.page)).toBe(true);
    const page = new JSDOM(fs.readFileSync('dist/' + service.page, 'utf8')).window.document;
    expect(page.querySelector('h1').textContent).toBe(service.heading);
    expect(page.querySelector('[data-deliverable]').textContent).toContain(service.receives);
    expect(page.querySelector('.service-samples').textContent.trim()).toBe('sample report in preparation');
    expect(page.querySelector('.scope-invitation a[href="../contact.html"]')).not.toBeNull();
    expect(page.querySelector('.scope-invitation a[href^="mailto:"]').textContent).toBe(copy.home.contact.email);
  }
});

test('service sections follow problem, received output, method, sample and scoping order', () => {
  for (const service of copy.home.services) {
    const page = new JSDOM(fs.readFileSync('dist/' + service.page, 'utf8')).window.document;
    const container = page.querySelector('main > .container');
    const sections = [...container.children].filter(node => node.tagName !== 'H1');
    const detail = copy.service_details[copy.home.services.indexOf(service)];
    expect(sections.map(node => node.hasAttribute('data-problem') ? 'problem' : node.hasAttribute('data-deliverable') ? 'deliverable' : node.hasAttribute('data-method') ? 'method' : node.hasAttribute('data-sample') ? 'sample' : node.className))
      .toEqual([...(detail.problem ? ['problem'] : []), 'deliverable', 'method', 'sample', 'scope-invitation']);
    if (detail.problem) expect(page.querySelector('[data-problem] p').textContent).toBe(detail.problem);
    if (detail.contents) expect(page.querySelector('[data-deliverable]').textContent).toContain(detail.contents);
    for (const citation of detail.codes || []) expect(page.querySelector('[data-method]').textContent).toContain(citation);
  }
});

test('a published report is adjacent to its own service detail', async () => {
  const service = copy.home.services[4];
  const entry = { slug: 'published-analysis', title: 'Published analysis', summary: 'Installation analysis.', discipline: copy.service_details[4].sampleDiscipline, page: 'samples/published-analysis.html', status: 'published' };
  const rendered = await renderHtml(fs.readFileSync('content/partials/service-page.html', 'utf8'), { rootPath: '../', service: { problem: '', contents: '', codes: [], ...service, ...copy.service_details[4] }, copy, canonicalUrl: canonicalUrlFor(service.page), metadataExcluded: false, ...sampleLocals({ samples: [entry] }) });
  const page = new JSDOM(rendered).window.document;
  expect(page.querySelector('[data-sample] a').getAttribute('href')).toBe('../' + entry.page);
  expect(page.querySelector('[data-sample]').textContent).not.toContain('sample report in preparation');
});

test('each home output summary stays near twenty words without removing qualification', () => {
  for (const card of doc.querySelectorAll('#services article[data-engineering-service]')) {
    const words = card.querySelector('.home-receives').textContent.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(17);
    expect(words).toBeLessThanOrEqual(26);
  }
  const screening = [...doc.querySelectorAll('#services article')].find(card => card.querySelector('h3').textContent === copy.home.services[3].heading);
  expect(screening.textContent).toContain(copy.home.services[3].receives);
});

test('the home hero has exactly one scoping link with or without published work', async () => {
  const heroLinks = page => [...page.querySelectorAll('.home-hero a')]
    .filter(link => link.textContent.trim() === copy.home.discuss);
  expect(heroLinks(doc)).toHaveLength(1);
  expect(heroLinks(doc)[0].getAttribute('href')).toBe('contact.html');
  const entry = { slug: 'published-analysis', title: 'Published analysis', summary: 'Installation analysis.', discipline: copy.service_details[4].sampleDiscipline, page: 'samples/published-analysis.html', status: 'published' };
  const rendered = await renderHtml(fs.readFileSync('content/index.html', 'utf8'), { rootPath: '', metadataExcluded: false, canonicalUrl: canonicalUrlFor('index.html'), copy, ...sampleLocals({ samples: [entry] }) });
  const published = new JSDOM(rendered).window.document;
  expect(heroLinks(published)).toHaveLength(1);
  expect(published.querySelector('.home-hero a[href="#work"]').textContent).toBe(copy.home.work.button);
});

test('offshore card retains the regional coverage restriction', () => {
  const card = [...doc.querySelectorAll('#services article')]
    .find(node => node.querySelector('h3 a').getAttribute('href') === 'services/offshore-energy-data.html');
  expect(card.querySelector('.home-receives').textContent).toContain('for the United States Gulf of Mexico');
});

test.each([
  ['services/asset-integrity.html', 'API 579-1'],
  ['services/cathodic-protection.html', 'DNV-RP-B401'],
])('code list uses a designation where no published title is sourced: %s', (file, designation) => {
  const page = new JSDOM(fs.readFileSync('dist/' + file, 'utf8')).window.document;
  expect([...page.querySelectorAll('[data-method] li')].map(node => node.textContent)).toEqual([designation]);
});
