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
const directionLeadIn = '<p>In my experience, our code once had to spell out the catenary equation for a hanging line. A frontier model now knows that equation without being given it. Our hypothesis: a newer model may also take on more engineering itself, as more mathematics and physics are trained into it. Engineering that once had to be written out for a model then becomes something it knows unaided. The illustration shows this direction in three stages. Where the engineer keeps the check, the work is checked against a known answer at every stage and then signed. A problem set with known answers, described below, is that check.</p>';
const directionCaption = 'How the next model may take in engineering: an illustration of a direction, not measured data (note 1). Stages are in order only. The catenary example is the author\'s experience. Hover a stage or the example for detail.';
const sourceLinks = [
  'https://help.openai.com/en/articles/7730893-data-controls-in-chatgpt',
  'https://support.google.com/gemini/answer/13594961',
  'https://www.anthropic.com/news/updates-to-our-consumer-terms',
];
const cells = row => (row.match(/<t[hd]\b/g) || []).length;

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
    const prose = body.replace(/<figure>[\s\S]*?<\/figure>/g, '').replace(directionLeadIn, '');
    assert.equal(digest(text(prose)), '24d5d996f167bd78ff9b3ca84381144f700b79d1e67937539ca827d2494814cc');
    assert.equal((body.match(/<h1>/g) || []).length, 1);
    assert.equal((body.match(/<h2>/g) || []).length, 10);
    assert.equal((body.match(/<ol>/g) || []).length, 0);
    assert.equal((body.match(/<ul>/g) || []).length, 1);
    assert.doesNotMatch(body, /Try it out/);
    assert.match(body, /Prepared: Analyst Deckhand \(AI assistant\) (?:&middot;|·) Checked: Editor Deckhand (?:&middot;|·) Approved: Vamsee Achanta (?:&middot;|·) 4 November 2026/);
    assert.match(body, /<p class="figure-note"><small>Note 1\. Three frontier labs state that/);
    assert.ok(body.lastIndexOf('<h2>') === body.indexOf('<h2>Appendix A. Reusable prompts</h2>'));
    for (const line of [
      'Additionally, as we solve complex problems, improvements at every solution step compound to enhance the quality of the result and thus increase the chance of success.',
      'Additionally, enhanced AI solutions provide humans with the opportunity to take further steps at the frontier.',
      'It is provided as a demonstration for this article.',
      'However, it is less likely to do so due to advanced math and due diligence.',
      'Examples are the summary, format change, etc. These examples should be determined based on work type and user experience.',
    ]) {
      assert.ok(body.includes(line), line);
    }
    for (const removed of ['It is invented for this article', 'In my experience it does so less often', 'named under "Frontier and behind"',
      'Your problem set shows which path and which model suits each task']) {
      assert.ok(!body.includes(removed), removed);
    }
    const invitation = 'If you have run your own analysis, see a way to improve this one, or have an idea for a future issue, write to support@aceengineer.com. We read every reply and credit the ideas we use.';
    assert.ok(body.includes(`<p>${invitation}</p>`));
    assert.ok(body.indexOf(invitation) < body.indexOf('Prepared: Analyst Deckhand'));
    assert.ok(body.indexOf(invitation) < body.indexOf('<h2>Appendix A. Reusable prompts</h2>'));
  });

  test(`${prefix}: model topic tables are numbered, captioned, sourced and square`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    const tables = [...body.matchAll(/<div class="table-responsive">\s*(<table class="table table-bordered">[\s\S]*?<\/table>)\s*<\/div>/g)].map(match => match[1]);
    assert.equal(tables.length, 2);
    const expected = [
      { caption: 'Table 1. Frontier model against a model two releases behind (illustrative, not a measured test)', columns: 5, rows: 7,
        header: ['No.', 'What to compare', 'Frontier model', 'Model two releases behind (N-2)', 'Source'] },
      { caption: 'Table 2. Typical paths to a model, and what to check on each', columns: 4, rows: 6,
        header: ['No.', 'Path', 'What you get', 'What to check with your problem set'] },
    ];
    tables.forEach((table, index) => {
      const want = expected[index];
      assert.ok(table.includes(`<caption>${want.caption}</caption>`));
      const header = table.match(/<thead>[\s\S]*?<\/thead>/)[0];
      assert.deepEqual([...header.matchAll(/<th scope="col"[^>]*>([\s\S]*?)<\/th>/g)].map(match => match[1]), want.header);
      const rows = table.match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr>[\s\S]*?<\/tr>/g);
      assert.equal(rows.length, want.rows);
      rows.forEach((row, n) => {
        assert.equal(cells(row), want.columns);
        assert.ok(row.startsWith(`<tr><td class="text-center">${n + 1}</td>`));
      });
    });
    const sources = tables[0].match(/<tr>[\s\S]*?<\/tr>/g).slice(1).map(row => text(row.match(/<td>([^<]*)<\/td><\/tr>$/)[1]));
    assert.deepEqual(sources, ['Worked example above (illustrative)', 'Worked example above (illustrative)', 'Worked example above (illustrative)',
      "Author's experience", "Author's experience", 'Our hypothesis', "Author's experience"]);
    assert.match(tables[0], /<td>Worked example: first sloshing frequency, f \(Hz\)<\/td><td>0\.586<\/td><td>0\.884<\/td>/);
    assert.match(tables[0], /<td>Worked example: error against the full answer \(%\)<\/td><td>0<\/td><td>\+51<\/td>/);
    assert.match(body, /<\/table>\s*<\/div>\s*<p class="table-note"><small>Note to Table 2\./);
    for (const pointer of ['<p>Table 1 is illustrative.', 'Table 1 shows which answer is more likely', '<p>Table 2 lists the paths']) {
      assert.ok(body.includes(pointer));
    }
    for (const stale of ['<p>The table is illustrative.', 'the table shows which answer is more likely', '<p>The table lists the paths']) {
      assert.ok(!body.includes(stale));
    }
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
    const caption = 'Illustrative schematic, not data and not to scale. When many of your problems sit near the edge of what models can do, a small gain in capability can move a whole group of them from wrong to right.';
    assert.ok(body.includes(`<figcaption>${caption}</figcaption>`));
    assert.match(body, /The schematic shows the idea; it is not a measurement\.<\/p>\s*<figure>/);
    assert.equal((body.match(/id="a2-step-title"/g) || []).length, 1);
    assert.equal((body.match(/id="a2-step-desc"/g) || []).length, 1);
  });

  test(`${prefix}: model topic carries the direction illustration after its lead-in`, () => {
    const body = bodyFor(read(`${prefix}/${article}`));
    assert.equal((body.match(/<figure>/g) || []).length, 2);
    const svg = [...body.matchAll(/<svg\b[\s\S]*?<\/svg>/g)][1][0];
    if (prefix === 'content') {
      assert.equal(digest(svg), 'd1a283973890b66dc66c01a8a1de3877cee45dca0f1ea9b528431fb39cb31469');
    } else {
      const { JSDOM } = require('jsdom');
      const sourceSvg = [...bodyFor(read(`content/${article}`)).matchAll(/<svg\b[\s\S]*?<\/svg>/g)][1][0];
      const parsed = value => new JSDOM(value).window.document.querySelector('svg').outerHTML;
      assert.equal(parsed(svg), parsed(sourceSvg));
    }
    assert.match(svg, /role="img" aria-labelledby="a2-model-title a2-model-desc"/);
    assert.match(svg, />Illustration of a direction, not measured data<\/text>/);
    assert.match(svg, />Where the engineer keeps the check, at every stage: checks against a known answer, and signs<\/text>/);
    assert.match(svg, />Each new model generation may take in more mathematics and physics through further training<\/text>/);
    assert.match(svg, />Example: the catenary equation \(hanging line\)<\/text>/);
    assert.doesNotMatch(text(svg), /\d+(\.\d+)? ?%/);
    assert.ok(body.includes(`<figcaption>${directionCaption}</figcaption>`));
    const leadIn = body.indexOf(directionLeadIn);
    assert.ok(leadIn > body.indexOf('<h2>A share of your problems, area by area</h2>'));
    assert.ok(leadIn < body.indexOf('<h2>A worked example: a confident shortcut</h2>'));
    assert.match(body.slice(leadIn), /^<p>[\s\S]*?<\/p>\s*<figure>\s*<svg\b[^>]*aria-labelledby="a2-model-title/);
    for (const id of ['a2-model-title', 'a2-model-desc', 'a2-mx-head']) {
      assert.equal((body.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
    }
  });

  test(`${prefix}: model topic links are the three cited sources, then the relative about and contact pages`, () => {
    const links = [...bodyFor(read(`${prefix}/${article}`)).matchAll(/<a href="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(links, [...sourceLinks, '/about.html', '/contact.html']);
    for (const href of links.slice(sourceLinks.length)) {
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
