const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Run directly with Node, or through the newsletter-edition Jest project.
const test = typeof jest === 'undefined' ? require('node:test') : global.test;
const root = path.resolve(__dirname, '../..');
const article = 'newsletter/topics/one-place-to-work/index.html';
const articleUrl = 'https://www.aceengineer.com/newsletter/topics/one-place-to-work/';
const issueRoute = '/newsletter/issue-001-energy-street/';
const hero = 'assets/img/newsletter/issue-001/sloshing-hero-r30.png';
const heroDigest = 'd552ce5f8761ac4fc56025b1514bbb15a54c1c1dd73c29159e1faafc6df4a84a';
const description = 'We now use AI assistants for many tasks: in a chat window or an app, on a phone, and on personal and work computers.';
const indexDescription = 'Short issues on engineering analysis, open energy data, AI automation and agentic workflows, each linked to the public reports behind it.';
const charts = {
  'completion-strata': 'Completion strata',
  'diffraction-heave': 'Diffraction heave',
  'field-depth': 'Field depth',
  'hse-drilling': 'HSE drilling',
};
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const text = html => html.replace(/<[^>]*>/g, ' ')
  .replace(/&#64;/g, '@').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ').trim();

function assertArticle(html, built = false) {
  assert.match(html, /<title>One place to work \| AceEngineer<\/title>/);
  assert.match(html, /<h1>One place to work<\/h1>/);
  assert.ok(html.includes(`<meta name="description" content="${description}">`));
  assert.ok(html.includes(`<a href="${issueRoute}">`));
  const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const page = schemas.find(schema => schema['@type'] === 'Article');
  assert.equal(page.name, 'One place to work | AceEngineer');
  assert.equal(page.description, description);
  assert.equal(page.url, articleUrl);
  const breadcrumbs = schemas.find(schema => schema['@type'] === 'BreadcrumbList');
  assert.equal(breadcrumbs.itemListElement.at(-1).item, articleUrl);
  if (built) {
    assert.ok(html.includes(`<link rel="canonical" href="${articleUrl}">`));
    assert.match(html, /<nav\b/);
    assert.match(html, /<footer\b[^>]*class="footer-section"/);
    assert.doesNotMatch(html, /<include\b|\{\{/);
  } else {
    assert.match(html, /^---\nrootPath: "\.\.\/\.\.\/\.\.\/"\n---/);
    for (const partial of ['head-common', 'nav', 'footer']) {
      assert.ok(html.includes(`<include src="partials/${partial}.html">`));
    }
  }
}

function assertHero(file) {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.equal(bytes.length, 27084);
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(bytes.readUInt32BE(16), 600);
  assert.equal(bytes.readUInt32BE(20), 315);
  assert.equal(digest(bytes), heroDigest);
}

function assertIndex(html) {
  assert.ok(html.includes(indexDescription));
  assert.doesNotMatch(html, /public code and data behind it|reply to any issue/i);
  assert.match(html, /href="mailto:support&#64;aceengineer\.com\?subject=Subscribe%20Energy%20Street"/);
}

function assertChart(html, name, built = false) {
  assert.ok(html.includes(`<title>${name} chart retired | AceEngineer</title>`));
  assert.ok(html.includes('<meta name="description" content="This chart is no longer published.">'));
  assert.ok(html.includes('<h1>This chart is no longer published</h1>'));
  assert.ok(html.includes(`<a href="${issueRoute}">Read issue 1 of The Deckhand Chronicles, Energy Street edition.</a>`));
  assert.ok(html.includes('<meta name="robots" content="noindex">'));
  assert.ok(html.includes(`<meta http-equiv="refresh" content="0; url=${issueRoute}">`));
  const canonical = built ? `https://www.aceengineer.com${issueRoute}` : '{{ canonicalUrl }}';
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`));
  assert.doesNotMatch(html, /chart has moved|chart moved/);
}

test('source: article uses the newsletter template, metadata and issue backlink', () => {
  assertArticle(read(`content/${article}`));
});

test('source: article preserves the supplied body, table, emphasis and lists', () => {
  const html = read(`content/${article}`);
  const body = html.match(/<article id="one-place-to-work">([\s\S]*?)<\/article>/)[1];
  const approvedBody = body.replace(/<figure class="ladder-flow">[\s\S]*?<\/figure>/, '');
  assert.equal(digest(text(approvedBody)), '9036e4ef64fed09e7f84d381e2b92d16f3433c38f7308642265e863662d2977c');
  assert.equal((body.match(/<h1>/g) || []).length, 1);
  assert.equal((body.match(/<h2>/g) || []).length, 7);
  assert.equal((body.match(/<table\b/g) || []).length, 1);
  assert.equal((body.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr>/g) || []).length, 5);
  assert.equal((body.match(/<ol>/g) || []).length, 2);
  assert.equal((body.match(/<ul>/g) || []).length, 2);
  assert.match(body, /<strong>Summary:<\/strong>/);
  assert.match(body, /<em>How this article was made:/);
});

test('source: hero retains the supplied PNG bytes and dimensions', () => assertHero(hero));
test('source: index describes public reports and offers web subscription', () => assertIndex(read('content/newsletter/index.html')));
for (const [slug, name] of Object.entries(charts)) {
  test(`source: ${slug} chart states retirement and preserves its redirect`, () => {
    assertChart(read(`content/newsletter/charts/${slug}/index.html`), name);
  });
}

test('built: article is rendered, discoverable and linked back to the issue', () => {
  assertArticle(read(`dist/${article}`), true);
  assert.ok(read('dist/sitemap.xml').includes(`<loc>${articleUrl}</loc>`));
  assert.ok(read('dist/llms.txt').includes(articleUrl));
});
test('built: hero is copied without modification', () => assertHero(`dist/${hero}`));
test('built: index describes public reports and offers web subscription', () => assertIndex(read('dist/newsletter/index.html')));
for (const [slug, name] of Object.entries(charts)) {
  test(`built: ${slug} chart states retirement and preserves its redirect`, () => {
    assertChart(read(`dist/newsletter/charts/${slug}/index.html`), name, true);
  });
}

for (const prefix of ['content', 'dist']) {
  test(`${prefix}: issue 1 uses the exact newsletter tagline`, () => {
    const html = read(`${prefix}${issueRoute}index.html`);
    assert.match(html, /<p\b[^>]*>Deckhand: Make Engineering Enjoyable Again<\/p>/);
    assert.doesNotMatch(html, /enjoy\s+engineering\s+again/i);
  });
}
