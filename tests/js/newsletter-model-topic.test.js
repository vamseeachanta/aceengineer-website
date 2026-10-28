const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;

const root = path.resolve(__dirname, '../..');
const article = 'newsletter/topics/why-the-model-you-use-matters/index.html';
const articleUrl = 'https://www.aceengineer.com/newsletter/topics/why-the-model-you-use-matters/';
const title = 'Why the model you use matters: test each new AI model on your own problems';
const description = 'A newer AI model can solve problems that an older one may get confidently wrong. Test each new model on problems you know.';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const text = html => html.replace(/<\/?em>/g, '').replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const bodyFor = html => html.match(/<article id="why-the-model-you-use-matters">([\s\S]*?)<\/article>/)[1];

function assertMetadata(html, built) {
  assert.ok(html.includes(`<title>${title}</title>`));
  assert.ok(html.includes(`<meta property="og:title" content="${title}">`));
  assert.ok(html.includes(`<meta name="twitter:title" content="${title}">`));
  for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    assert.ok(html.includes(`<meta ${attribute} content="${description}">`));
  }
  const schemas = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const page = schemas.find(schema => schema['@type'] === 'Article');
  assert.equal(page.headline, title);
  assert.equal(page.name, title);
  assert.equal(page.description, description);
  assert.equal(page.url, articleUrl);
  assert.equal(schemas.find(schema => schema['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, articleUrl);
  if (built) {
    assert.ok(html.includes(`<link rel="canonical" href="${articleUrl}">`));
    assert.ok(html.includes(`<meta property="og:url" content="${articleUrl}">`));
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

for (const prefix of ['content', 'dist']) {
  test(`${prefix}: model topic uses shared chrome and approved metadata`, () => {
    assertMetadata(read(`${prefix}/${article}`), prefix === 'dist');
  });

  test(`${prefix}: model topic preserves approved text, table and lists`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const prose = body.replace(/<figure>[\s\S]*?<\/figure>/, '');
    assert.equal(digest(text(prose)), '914ee57033979165ab9cfe98a0419cc5d6935e6062c91295b051a4542288cb24');
    assert.equal((body.match(/<h1>/g) || []).length, 1);
    assert.equal((body.match(/<h2>/g) || []).length, 9);
    assert.equal((body.match(/<ol>/g) || []).length, 1);
    assert.equal((body.match(/<ul>/g) || []).length, 1);
    assert.equal((body.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr>/g) || []).length, 5);
    assert.equal((body.match(/<th scope="col">/g) || []).length, 3);
    assert.match(body, /<div class="table-responsive">/);
    assert.match(body, /<em>How this article was made:/);
  });

  test(`${prefix}: model topic preserves both preformatted worked examples`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const blocks = [...body.matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(match => match[1]);
    assert.deepEqual(blocks, [
      'L = 1.0 m        tank length in the direction of sloshing\nh = 0.15 m       fill depth\ng = 9.81 m/s^2   gravity\nk = pi / L       = 3.14 per m              (wave number of the first mode)\ntanh(k h)        = tanh(0.471) = 0.439      (hyperbolic tangent; it tends to 1 for a deep fill)\nw^2 = g k tanh(k h)  -&gt; w = 3.68 rad/s     (w: angular frequency)\nf = w / (2 pi)   = 0.586 Hz\n',
      'w^2 = g k        -&gt; w = 5.55 rad/s,  f = 0.884 Hz\n',
    ]);
  });

  test(`${prefix}: model topic retains the accessible schematic and caption in place`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const svg = body.match(/<svg\b[\s\S]*?<\/svg>/)[0];
    if (prefix === 'content') {
      assert.equal(digest(svg), '48fc90a182dcb2d20e4bedfc41e3fce94ea3588dd1cd7d040a911e0ed76ba56a');
    } else {
      const { JSDOM } = require('jsdom');
      const sourceSvg = bodyFor(read(`content/${article}`)).match(/<svg\b[\s\S]*?<\/svg>/)[0];
      const parsed = value => new JSDOM(value).window.document.querySelector('svg').outerHTML;
      assert.equal(parsed(svg), parsed(sourceSvg));
    }
    assert.match(svg, /role="img" aria-labelledby="a2-step-title a2-step-desc"/);
    assert.match(svg, /<desc id="a2-step-desc">/);
    const caption = text(svg.match(/<title id="a2-step-title">([\s\S]*?)<\/title>/)[1]);
    assert.ok(body.includes(`<figcaption>${caption}</figcaption>`));
    assert.match(body, /The schematic shows the idea; it is not a measurement\.<\/p>\s*<figure>/);
    assert.equal((body.match(/id="a2-step-title"/g) || []).length, 1);
    assert.equal((body.match(/id="a2-step-desc"/g) || []).length, 1);
  });

  test(`${prefix}: model topic links resolve to the relative about and contact pages`, () => {
    const links = [...bodyFor(read(`${prefix}/${article}`)).matchAll(/<a href="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(links, ['/about.html', '/contact.html']);
    for (const href of links) {
      assert.ok(fs.existsSync(path.join(root, prefix, href.slice(1))));
    }
  });

  test(`${prefix}: model topic omits editorial placeholders and subject labels`, () => {
    const html = read(`${prefix}/${article}`);
    for (const token of ['Fill before send', 'Editor notes', 'Subject line:']) {
      assert.ok(!html.includes(token));
    }
  });
}

test('dist: model topic is discoverable without adding a topic to the issue feed', () => {
  assert.ok(read('dist/sitemap.xml').includes(`<loc>${articleUrl}</loc>`));
  assert.ok(read('dist/llms.txt').includes(articleUrl));
  assert.ok(!read('dist/newsletter/feed.xml').includes(articleUrl));
});

test('the worked example agrees with independent linear-theory arithmetic', () => {
  const waveNumber = Math.PI / 1.0;
  const full = Math.sqrt(9.81 * waveNumber * Math.tanh(waveNumber * 0.15)) / (2 * Math.PI);
  const shortcut = Math.sqrt(9.81 * waveNumber) / (2 * Math.PI);
  assert.equal(full.toFixed(3), '0.586');
  assert.equal(shortcut.toFixed(3), '0.884');
  assert.equal(Math.round((shortcut / full - 1) * 100), 51);
  const deep = Math.sqrt(9.81 * waveNumber * Math.tanh(waveNumber * 0.70)) / (2 * Math.PI);
  assert.equal(Math.round((shortcut / deep - 1) * 100), 1);
});
