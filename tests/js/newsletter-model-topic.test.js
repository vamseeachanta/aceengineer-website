const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;

const root = path.resolve(__dirname, '../..');
const article = 'newsletter/topics/why-the-model-you-use-matters/index.html';
const articleUrl = 'https://www.aceengineer.com/newsletter/topics/why-the-model-you-use-matters/';
const title = 'The model we use matters';
const description = 'Two examples from our own work, a fender design calculation and project management, and a reusable prompt to test each new AI model on problems whose answers you know.';
const dataFile = 'assets/data/newsletter/why-the-model-you-use-matters/fig1-model-generations.csv';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const text = html => html.replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const bodyFor = html => html.match(/<article id="why-the-model-you-use-matters">([\s\S]*?)<\/article>/)[1];
const between = (body, from, to) => body.slice(body.indexOf(from) + from.length, body.indexOf(to));
const words = value => text(value).split(' ').filter(Boolean).length;
const prefixes = fs.existsSync(path.join(root, 'dist', article)) ? ['content', 'dist'] : ['content'];

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
    assert.doesNotMatch(html, /<include\b|\{\{/);
  } else {
    assert.match(html, /^---\nrootPath: "\.\.\/\.\.\/\.\.\/"\n---/);
    for (const partial of ['head-common', 'nav', 'footer']) {
      assert.ok(html.includes(`<include src="partials/${partial}.html">`));
    }
  }
}

for (const prefix of prefixes) {
  test(`${prefix}: model topic uses shared chrome and its metadata`, () => {
    assertMetadata(read(`${prefix}/${article}`), prefix === 'dist');
  });

  test(`${prefix}: model topic infographic has the four panels and no "What you can do"`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const figure = body.match(/<figure id="infographic"[\s\S]*?<\/figure>/)[0];
    const labels = [...figure.matchAll(/<p style="margin:0 0 4px;font-weight:700">([^<]+)<\/p>/g)].map(match => match[1]);
    assert.deepEqual(labels, ['Objective', 'Starting point', 'What we did', 'Analysis findings']);
    assert.doesNotMatch(body, /What you can do|What we found/);
  });

  test(`${prefix}: model topic introduction has its three parts, with "Why it matters" within 80 words`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const ids = [...body.matchAll(/<h2 id="([^"]+)">/g)].map(match => match[1]);
    assert.deepEqual(ids.slice(0, 3), ['what-we-did', 'why-it-matters', 'what-is-inside']);
    assert.doesNotMatch(body, /<h3/);
    const why = between(body, '<h2 id="why-it-matters">Why it matters</h2>', '<h2 id="what-is-inside">');
    assert.equal((why.match(/<li>/g) || []).length, 4);
    assert.ok(words(why) <= 80, `Why it matters has ${words(why)} words`);
    // no result figure in the first two parts of the introduction
    const intro = between(body, '<h2 id="what-we-did">', '<h2 id="what-is-inside">');
    assert.doesNotMatch(text(intro).replace(/\[\d\]/g, ''), /\d/);
  });

  test(`${prefix}: model topic sections, contents list and appendices are in order`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const ids = [...body.matchAll(/<h2 id="([^"]+)">/g)].map(match => match[1]);
    assert.deepEqual(ids, ['what-we-did', 'why-it-matters', 'what-is-inside', 'the-model-you-use', 'simple-problems-and-complex-ones', 'a-calculation-with-a-known-answer',
      'project-management-decision-by-decision', 'keep-your-future-problem-sets', 'charts-and-data', 'references',
      'appendix-a-method-and-data', 'appendix-b-reusable-prompts']);
    for (const href of [...body.matchAll(/<a href="#([^"]+)"/g)].map(match => match[1])) {
      assert.ok(body.includes(`id="${href}"`), `no target for #${href}`);
    }
    assert.equal((body.match(/<h1>/g) || []).length, 1);
    assert.doesNotMatch(body, /Try it out|utm_|data:image/);
    assert.doesNotMatch(body, /[–—]/);
  });

  test(`${prefix}: model topic states the fender module as under review`, () => {
    const body = text(bodyFor(read(`${prefix}/${article}`)));
    assert.ok(body.includes('to our open-source fender design module. The module is under review and is not yet merged.'));
    assert.ok(body.includes('Hand check of the fender case, under review in an open pull request and not yet merged:'));
  });

  test(`${prefix}: model topic closes with the invitation, the sign-off and the version history`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const invitation = 'If you have run your own analysis, see a way to improve this one, or have an idea for a future issue, write to support@aceengineer.com. We read every reply and credit the ideas we use and provide results we obtained.';
    const at = body.indexOf(invitation);
    assert.ok(at > body.indexOf('reusable prompt</a>.') && at < body.indexOf('Prepared: Analyst Deckhand'));
    assert.match(body, /Prepared: Analyst Deckhand (?:&middot;|·) Checked: Editor Deckhand (?:&middot;|·) Approved: Vamsee Achanta/);
    assert.ok(body.includes('Revision 8, 20 Nov 2026; first published 4 Nov 2026.'));
    assert.ok(body.indexOf('Version history: revision 8, 20 Nov 2026') < body.indexOf('<h2 id="references">'));
    assert.equal((between(body, '<h2 id="references">', '<h2 id="appendix-a-method-and-data">').match(/<li>/g) || []).length, 4);
  });

  test(`${prefix}: model topic figures and table carry their notes above and their titles below`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    assert.equal((body.match(/<figure aria-label="Figure \d">/g) || []).length, 2);
    for (const caption of ['Figure 1. One review, two generations of one model.', 'Figure 2. Codex shadow score for each hourly run, 19 Nov 2026', 'Table 1. Two examples, two providers']) {
      const at = body.indexOf(caption);
      assert.ok(at > 0, caption);
      assert.ok(body.lastIndexOf('<ol>', at) > body.lastIndexOf('<em>', at - 5), `${caption}: notes come first`);
    }
    const table = body.match(/<table class="table table-bordered">[\s\S]*?<\/table>/)[0];
    const rows = table.match(/<tr>[\s\S]*?<\/tr>/g);
    assert.equal(rows.length, 6);
    for (const row of rows) assert.equal((row.match(/<t[hd]\b/g) || []).length, 3);
    assert.ok(body.includes(`href="../../../${dataFile}"`));
    assert.ok(fs.existsSync(path.join(root, prefix === 'dist' ? 'dist' : '.', dataFile)));
  });
}

if (prefixes.includes('dist')) {
  test('dist: model topic is discoverable without adding a topic to the issue feed', () => {
    assert.ok(read('dist/sitemap.xml').includes(`<loc>${articleUrl}</loc>`));
    assert.ok(read('dist/llms.txt').includes(articleUrl));
    assert.ok(!read('dist/newsletter/feed.xml').includes(articleUrl));
  });
}

test('the published fender values agree with each other and with the stated case', () => {
  const body = text(bodyFor(read(`content/${article}`)));
  // Hand calculation from the case printed on the page: mass = block coefficient x sea-water density x L x B x T
  //   0.40 x 1.025 t/m3 x 180 m x 32 m x 12 m = 28,339.2 t, printed as 28,339 t.
  assert.equal(Math.round(0.40 * 1.025 * 180 * 32 * 12), 28339);
  assert.ok(body.includes('= 28,339 t'));
  // Energy = 0.5 x M x v^2 x Cm x 1.5 with the printed Cm (four significant figures), so the tolerance is 0.5 kNm:
  //   0.5 x 28,339.2 x 0.10^2 x 3.876 x 1.5 = 823.8 kNm (printed 823.7); with Cm 2.843: 604.3 kNm (printed 604.2).
  const energy = cm => 0.5 * 28339.2 * 0.10 ** 2 * cm * 1.5;
  assert.ok(Math.abs(energy(3.876) - 823.7) < 0.5);
  assert.ok(Math.abs(energy(2.843) - 604.2) < 0.5);
  assert.ok(body.includes('= 823.7 kNm') && body.includes('-> 604.2 kNm'));
  // "about 27 % low": 1 - 604.2 / 823.7 = 0.2665
  assert.equal(Math.round((1 - 604.2 / 823.7) * 100), 27);
});

test('the Figure 2 scores printed in the chart give the stated range and mean', () => {
  const body = bodyFor(read(`content/${article}`));
  const scores = [...body.matchAll(/UTC: score (\d\.\d\d), below the 0\.80 pass line/g)].map(match => Number(match[1]));
  assert.equal(scores.length, 24);
  assert.equal(Math.min(...scores).toFixed(2), '0.00');
  assert.equal(Math.max(...scores).toFixed(2), '0.43');
  // mean of the 24 hourly scores: 5.03 / 24 = 0.2096, printed as 0.21
  assert.equal((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2), '0.21');
  assert.ok(scores.every(score => score < 0.80));
});

test('the Figure 1 data file holds the five findings shown in the chart', () => {
  const lines = read(dataFile).trim().split('\n');
  assert.equal(lines.length, 6);
  assert.equal(lines.slice(1).filter(line => line.includes(',Marked to fix before merge,')).length >= 5, true);
});
