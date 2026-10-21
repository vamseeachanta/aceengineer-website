const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');
const { SITEMAP_EXCLUDE } = require('../../build');

const edition = 'newsletter/issue-001-energy-street/index.html';
const retired = 'newsletter/issue-001/index.html';
const route = '/newsletter/issue-001-energy-street/';
const expectedTitle = 'The Deckhand Chronicles — Energy Street · Issue 1';
const textDigest = '98ba78cfe3b96fa598b63616b5f5cc8a647404fb02db5172cf050614ab38be26';
const linksDigest = 'e752f70b277a9be80f8f2ba8ea86ac99bff1020f51189896e20dbd7915c12f7c';
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

test('the approved text and all eight links retain their order in source and output', () => {
  const sourceBody = read(`content/${edition}`).match(/<article id="newsletter-edition">([\s\S]*?)<\/article>/)[1];
  expect(digest(sourceBody)).toBe('ca9563bda9290ab6f51abc8be12e71d55114505822b64fffe01c8d8ea5b3e6d9');
  for (const prefix of ['content', 'dist']) {
    const article = documentFor(`${prefix}/${edition}`).querySelector('#newsletter-edition');
    expect(article).not.toBeNull();
    expect(digest(normalizedText(article))).toBe(textDigest);
    expect(orderedLinks(article)).toHaveLength(8);
    expect(digest(JSON.stringify(orderedLinks(article)))).toBe(linksDigest);
  }
});

test('copy and link controls reject altered wording, split headings, omissions and reordering', () => {
  const article = documentFor(`dist/${edition}`).querySelector('#newsletter-edition');
  for (const selector of ['h1 span', '#contact', '#contact-top']) {
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

function assertRetired(doc, source = false) {
  expect(doc.querySelector('meta[name="robots"]').content).toContain('noindex');
  const canonical = doc.querySelector('link[rel="canonical"]').getAttribute('href');
  expect(source ? canonical : new URL(canonical).pathname).toBe(source ? '{{ canonicalUrl }}' : route);
  expect(doc.querySelector('meta[http-equiv="refresh"]').content).toBe(`0; url=${route}`);
  expect(doc.querySelectorAll('main a')).toHaveLength(1);
  expect(doc.querySelector('main a').getAttribute('href')).toBe(route);
  expect(normalizedText(doc.body)).toBe('Skip to main content This issue has moved Read the Energy Street edition.');
}

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
  const rss = new JSDOM(read('dist/newsletter/feed.xml'), { contentType: 'text/xml' }).window.document;
  expect(rss.querySelectorAll('item')).toHaveLength(1);
  expect(rss.querySelector('item title').textContent).toBe(expectedTitle);
  expect(rss.querySelector('item pubDate').textContent).toBe('Thu, 22 Oct 2026 00:00:00 GMT');
  expect(SITEMAP_EXCLUDE[retired]).toBeDefined();
  for (const file of ['dist/sitemap.xml', 'dist/llms.txt']) {
    expect(read(file)).toContain(route);
    expect(read(file)).not.toMatch(/https?:\/\/[^/]+\/newsletter\/issue-001\//);
  }
  expect(fs.existsSync(path.join(root, 'content/newsletter/issue-001-main-street'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'dist/newsletter/issue-001-main-street'))).toBe(false);
});
