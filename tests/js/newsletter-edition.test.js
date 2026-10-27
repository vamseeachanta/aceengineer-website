const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');
const { SITEMAP_EXCLUDE } = require('../../build');
require('./newsletter-link-targets.test');
require('./newsletter-deploy.test');

const edition = 'newsletter/issue-001-energy-street/index.html';
const retired = 'newsletter/issue-001/index.html';
const retiredCharts = ['hse-drilling', 'diffraction-heave', 'field-depth', 'completion-strata'];
const retiredClaims = /The Deckhand Chronicle · Issue 1|Specialists|Well-control classifications|68 of 85|85 classified|Heave agrees within|0\.055 m\/m|4\.25 degrees|Water depth less than 1,000 ft|1,151 distinct field codes|Records before 2000|55,269 of 72,844|An interactive version of this chart is planned/i;
const route = '/newsletter/issue-001-energy-street/';
const expectedTitle = 'The Deckhand Chronicles: Energy Street, Issue 1';
const textDigest = '2ce3aebe37afc73f3b6a41a92050a4971165fbf1ba90e5bd907b1f7285512c05';
const linksDigest = '6698ac58fd2aa89b6d015397d59d2243a754d6e516c990fa6a15bcb9c88800fe';
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const documentFor = file => new JSDOM(read(file).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')).window.document;
const normalizedText = node => node.textContent.replace(/\s+/g, ' ').trim();
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const orderedLinks = node => [...node.querySelectorAll('a')]
  .map(link => [link.getAttribute('href'), normalizedText(link)]);

test('the edition is built at its public route with the approved title and heading', () => {
  const doc = documentFor(`dist/${edition}`);
  expect(doc.title).toBe(expectedTitle);
  expect([...doc.querySelectorAll('h1')].map(normalizedText)).toEqual(['The Deckhand Chronicles']);
  expect(new URL(doc.querySelector('link[rel="canonical"]').href).pathname).toBe(route);
  expect(doc.querySelectorAll('main')).toHaveLength(1);
  expect(doc.querySelector('nav')).not.toBeNull();
  expect(doc.querySelector('main').nextElementSibling.matches('footer.footer-section')).toBe(true);
});

test('the approved text and all ten links retain their order in source and output', () => {
  const sourceBody = read(`content/${edition}`).match(/<article id="newsletter-edition">([\s\S]*?)<\/article>/)[1];
  expect(digest(sourceBody)).toBe('c7e9edcd42f58c6da438a1af3e57c41370185994c16a4a5db67e495b8d53c436');
  for (const prefix of ['content', 'dist']) {
    const article = documentFor(`${prefix}/${edition}`).querySelector('#newsletter-edition');
    expect(article).not.toBeNull();
    expect(digest(normalizedText(article))).toBe(textDigest);
    expect(orderedLinks(article)).toHaveLength(10);
    expect(digest(JSON.stringify(orderedLinks(article)))).toBe(linksDigest);
  }
});

test('copy and link controls reject altered wording, split headings, omissions and reordering', () => {
  const article = documentFor(`dist/${edition}`).querySelector('#newsletter-edition');
  for (const selector of ['h1 span', '#about-issue', '#ask-top']) {
    const changed = article.cloneNode(true);
    changed.querySelector(selector).remove();
    expect(digest(normalizedText(changed))).not.toBe(textDigest);
  }
  const changed = article.cloneNode(true);
  changed.querySelector('p').append(' changed');
  expect(digest(normalizedText(changed))).not.toBe(textDigest);
  const links = orderedLinks(article);
  [links[0], links[1]] = [links[1], links[0]];
  expect(digest(JSON.stringify(links))).not.toBe(linksDigest);
});

function assertRetired(doc, source = false, kind = 'issue') {
  expect(doc.querySelector('meta[name="robots"]')?.content).toMatch(/\bnoindex\b/i);
  const canonical = doc.querySelector('link[rel="canonical"]').getAttribute('href');
  expect(source ? canonical : new URL(canonical).pathname).toBe(source ? '{{ canonicalUrl }}' : route);
  expect(doc.querySelector('meta[http-equiv="refresh"]').content).toBe(`0; url=${route}`);
  expect(doc.querySelectorAll('main a')).toHaveLength(1);
  expect(doc.querySelector('main a').getAttribute('href')).toBe(route);
  expect(normalizedText(doc.body)).toBe(kind === 'chart'
    ? 'Skip to main content This chart is no longer published Read issue 1 of The Deckhand Chronicles, Energy Street edition.'
    : `Skip to main content This ${kind} has moved Read the Energy Street edition.`);
}

function assertNoRetiredClaims(html) {
  expect(html).not.toMatch(retiredClaims);
}

function assertNoOldChartLinks(doc) {
  for (const link of doc.querySelectorAll('a')) {
    expect(link.getAttribute('href')).not.toMatch(/(?:^|\/)issue-001\/#/);
  }
}

function assertChartUnlisted(index, chart) {
  expect(index).not.toContain(`/newsletter/charts/${chart}/`);
}

describe.each(retiredCharts)('retired chart %s', chart => {
  const page = `newsletter/charts/${chart}/index.html`;

  test('source and output are short noindex redirects to the current edition', () => {
    expect(read(`content/${page}`)).toContain(`canonicalPath: "${edition}"`);
    for (const prefix of ['content', 'dist']) {
      const doc = documentFor(`${prefix}/${page}`);
      assertRetired(doc, prefix === 'content', 'chart');
      expect(doc.querySelectorAll('img, script, include')).toHaveLength(0);
    }
    expect(documentFor(`dist/${page}`).querySelector('link[rel="canonical"]').href)
      .toBe(`https://www.aceengineer.com${route}`);
  });

  test('retired claims are absent from all source and output markup', () => {
    for (const prefix of ['content', 'dist']) assertNoRetiredClaims(read(`${prefix}/${page}`));
  });

  test('source and output have no links to the old issue anchors', () => {
    for (const prefix of ['content', 'dist']) assertNoOldChartLinks(documentFor(`${prefix}/${page}`));
  });

  test('the chart is excluded from the sitemap and discovery index', () => {
    expect(SITEMAP_EXCLUDE[page]).toBeDefined();
    for (const file of ['dist/sitemap.xml', 'dist/llms.txt']) assertChartUnlisted(read(file), chart);
  });

  test('negative controls reject indexing, wrong destinations, old links and hidden claims', () => {
    const original = documentFor(`dist/${retired}`);
    original.querySelector('h1').textContent = 'This chart is no longer published';
    original.querySelector('main a').textContent = 'Read issue 1 of The Deckhand Chronicles, Energy Street edition.';
    assertRetired(original, false, 'chart');
    const missingNoindex = original.cloneNode(true);
    missingNoindex.querySelector('meta[name="robots"]').content = 'index';
    expect(() => assertRetired(missingNoindex, false, 'chart')).toThrow();
    const wrongCanonical = original.cloneNode(true);
    wrongCanonical.querySelector('link[rel="canonical"]').href = 'https://www.aceengineer.com/newsletter/';
    expect(() => assertRetired(wrongCanonical, false, 'chart')).toThrow();
    const wrongLink = original.cloneNode(true);
    wrongLink.querySelector('main a').href = '/newsletter/';
    expect(() => assertRetired(wrongLink, false, 'chart')).toThrow();
    const oldLink = original.cloneNode(true);
    oldLink.querySelector('main a').href = `https://www.aceengineer.com/newsletter/issue-001/#${chart}`;
    expect(() => assertNoOldChartLinks(oldLink)).toThrow();
    for (const claim of ['68 of 85', '0.055 m/m', '1,151 distinct field codes', '55,269 of 72,844']) {
      const hiddenClaim = original.cloneNode(true);
      hiddenClaim.querySelector('meta[name="description"]').content = claim;
      expect(() => assertNoRetiredClaims(hiddenClaim.documentElement.outerHTML)).toThrow();
    }
    for (const file of ['dist/sitemap.xml', 'dist/llms.txt']) {
      const contaminated = `${read(file)}\nhttps://www.aceengineer.com/newsletter/charts/${chart}/`;
      expect(() => assertChartUnlisted(contaminated, chart)).toThrow();
    }
  });
});

test('the superseded issue is only a short noindex redirect to the edition', () => {
  expect(read(`content/${retired}`)).toContain(`canonicalPath: "${edition}"`);
  for (const prefix of ['content', 'dist']) assertRetired(documentFor(`${prefix}/${retired}`), prefix === 'content');
});

test('retirement controls reject old copy and an incorrect destination', () => {
  const oldCopy = documentFor(`dist/${retired}`);
  oldCopy.body.append('Specialists edition');
  expect(() => assertRetired(oldCopy)).toThrow();
  const wrongLink = documentFor(`dist/${retired}`);
  wrongLink.querySelector('main a').href = '/newsletter/';
  expect(() => assertRetired(wrongLink)).toThrow();
});

test('discovery replaces the superseded route in navigation, archive, RSS and indexes', () => {
  for (const file of ['dist/index.html', 'dist/newsletter/index.html', 'dist/newsletter/feed.xml']) {
    const html = read(file);
    expect(html).toContain('issue-001-energy-street/');
    expect(html).not.toMatch(/(?:href=")?(?:https?:\/\/[^/]+)?\/?newsletter\/issue-001\//);
    expect(html).not.toMatch(/href="issue-001\/"/);
  }
  for (const prefix of ['content', 'dist']) {
    const feed = new JSDOM(read(prefix + '/newsletter/feed.xml'), { contentType: 'text/xml' }).window.document;
    expect(feed.querySelectorAll('item')).toHaveLength(1);
    expect(feed.querySelector('item description').textContent).toBe('Deckhand: Make Engineering Enjoyable Again');
    expect(feed.querySelector('item title').textContent).toBe(expectedTitle);
    expect(feed.querySelector('item pubDate').textContent).toBe('Tue, 27 Oct 2026 00:00:00 GMT');
    expect(feed.querySelector('item link').textContent).toBe('https://www.aceengineer.com' + route);
    expect(feed.querySelector('item guid').textContent).toBe('https://www.aceengineer.com' + route);
    const archive = documentFor(prefix + '/newsletter/index.html').querySelector('article');
    expect(archive.querySelector('a').textContent).toBe(expectedTitle);
    expect(new URL(archive.querySelector('a').getAttribute('href'), 'https://www.aceengineer.com/newsletter/').href)
      .toBe('https://www.aceengineer.com' + route);
    expect(archive.querySelector('time').getAttribute('datetime')).toBe('2026-10-27');
    expect(archive.querySelector('time').textContent).toBe('27 October 2026');
    expect(normalizedText(archive.querySelector('p'))).toBe('27 October 2026 · Deckhand: Make Engineering Enjoyable Again');
    const issue = documentFor(prefix + '/' + edition);
    expect(normalizedText(issue.querySelector('#send-date'))).toBe('October 27, 2026 · Launch issue');
    const schemas = JSON.parse(issue.querySelector('script[type="application/ld+json"]').textContent);
    expect(schemas.find(schema => schema['@type'] === 'Article').datePublished).toBe('2026-10-27');
    expect(schemas.find(schema => schema['@type'] === 'Article').description)
      .toBe(issue.querySelector('meta[name="description"]').content);
  }
  expect(SITEMAP_EXCLUDE[retired]).toBeDefined();
  for (const file of ['dist/sitemap.xml', 'dist/llms.txt']) {
    expect(read(file)).toContain(route);
    expect(read(file)).not.toMatch(/https?:\/\/[^/]+\/newsletter\/issue-001\//);
  }
  expect(fs.existsSync(path.join(root, 'content/newsletter/issue-001-main-street'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'dist/newsletter/issue-001-main-street'))).toBe(false);
});
