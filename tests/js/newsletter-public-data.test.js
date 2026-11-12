const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;

const root = path.resolve(__dirname, '../..');
const page = 'newsletter/issue-002-public-data/index.html';
const title = 'Gulf of Mexico well permits: a public US data file';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const num = cell => Number(cell.replace(/<sup>.*?<\/sup>/g, '').replace(/,/g, ''));
const tables = html => [...html.matchAll(/<div class="nl-tablewrap"><table>([\s\S]*?)<\/table><\/div>/g)].map(match => {
  const head = [...match[1].match(/<thead>[\s\S]*?<\/thead>/)[0].matchAll(/<th scope="col">([\s\S]*?)<\/th>/g)].map(m => m[1]);
  const rows = match[1].match(/<tbody>[\s\S]*?<\/tbody>/)[0].match(/<tr>[\s\S]*?<\/tr>/g)
    .map(row => [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map(m => m[1]));
  return { head, rows };
});
const parse = file => {
  const lines = read(file).trim().split('\n');
  const head = lines[0].split(',');
  return lines.slice(1).map(line => Object.fromEntries(line.split(',').map((v, i) => [head[i], Number(v)])));
};
const depth = parse('assets/data/newsletter/issue-002/new-well-permits-by-water-depth.csv');
const rig = parse('assets/data/newsletter/issue-002/fig-p1-new-well-permits-by-rig-type.csv');
const BANDS = ['under_100_m', '100_to_500_m', '500_to_1500_m', '1500_m_and_deeper'];

for (const prefix of ['content', 'dist']) {
  test(`${prefix}: public data page carries the title, heading, both figures and the table footnote`, () => {
    const html = read(`${prefix}/${page}`);
    assert.ok(html.includes(`<h1>${title}</h1>`));
    assert.ok(html.includes(`<title>${title} (Deckhand newsletter, issue 2)</title>`));
    assert.ok(!html.includes('well permits by rig type: a public US data file'));
    assert.ok(html.includes('<h2>Well permits by rig type and water depth</h2>'));
    assert.ok(html.includes('<p class="dc">a. The counts here are from the file of 2 November 2026.</p>'));
    assert.ok(html.includes('Gulf of America (formerly the Gulf of Mexico)'));
    assert.ok(html.includes('id="fig-permits"') && html.includes('id="fig-depth"'));
    assert.ok(html.includes('<figcaption>Figure 2 - New-well permits by water depth'));
    assert.equal(tables(html).length, 1, 'one table: Figure 2 carries the bands by year');
    assert.equal((html.match(/<p>Our hypothesis: /g) || []).length, 2);
    assert.ok(html.includes('Prepared: Analyst Deckhand &middot; Checked: Editor Deckhand'));
  });

  test(`${prefix}: Table 1 rows are square, the bands add up to the permits, and the totals match the per-year file`, () => {
    const [t1] = tables(read(`${prefix}/${page}`));
    t1.rows.forEach(row => assert.equal(row.length, t1.head.length));
    t1.rows.forEach(row => assert.equal([2, 3, 4, 5].reduce((sum, c) => sum + num(row[c]), 0), num(row[1]), row[0]));
    const all = t1.rows.at(-1);
    for (const col of [1, 2, 3, 4, 5]) {
      assert.equal(t1.rows.slice(0, -1).reduce((sum, row) => sum + num(row[col]), 0), num(all[col]), `${t1.head[col]} total`);
    }
    assert.equal(num(all[1]), 2895);
    assert.deepEqual([2, 3, 4, 5].map(c => num(all[c])), BANDS.map(b => depth.reduce((sum, r) => sum + r[b], 0)));
  });
}

test('the per-year water-depth file agrees with the per-year rig-type file', () => {
  assert.deepEqual(depth.map(r => r.year), rig.map(r => r.year));
  depth.forEach((r, i) => {
    assert.equal(BANDS.reduce((sum, b) => sum + r[b], 0), r.permits, `${r.year} bands`);
    assert.equal(r.permits, rig[i].total, `${r.year} permits`);
  });
});

test('the opening trends hold in the per-year files', () => {
  const html = read(`content/${page}`);
  const lead = html.match(/<p class="lead">([\s\S]*?)<\/p>/)[1];
  assert.match(lead, /\(Figure 1\)/);
  assert.match(lead, /\(Figure 2\)/);
  const since2015 = y => y.year >= 2015;
  // since 2015, most permits each year name a drillship and are in 500 m of water or more
  rig.filter(since2015).forEach(r => assert.ok(2 * r.Drillship > r.total, `${r.year} drillship majority`));
  depth.filter(since2015).forEach(r => assert.ok(2 * (r['500_to_1500_m'] + r['1500_m_and_deeper']) > r.permits, `${r.year} deep majority`));
  // most permits once named a jack-up: every year 2005 to 2008
  rig.filter(r => r.year <= 2008).forEach(r => assert.ok(2 * r['Jack-up'] > r.total, `${r.year} jack-up majority`));
  // permits in under 100 m fell the most; those in 500 m or more changed far less (mean per year, 2005 to 2008 against 2015 on)
  const mean = (rows, f) => rows.reduce((sum, r) => sum + f(r), 0) / rows.length;
  const early = depth.filter(r => r.year <= 2008), late = depth.filter(since2015);
  const drop = f => mean(early, f) - mean(late, f);
  const shallow = drop(r => r.under_100_m), mid = drop(r => r['100_to_500_m']);
  const deep = drop(r => r['500_to_1500_m'] + r['1500_m_and_deeper']);
  assert.ok(shallow > mid && shallow > deep && shallow > 5 * deep, `drops ${shallow}, ${mid}, ${deep}`);
  // far fewer permits each year than in the mid-2000s: every year from 2015 is under a third of the 2005 to 2008 low
  const low = Math.min(...rig.filter(r => r.year <= 2008).map(r => r.total));
  rig.filter(since2015).forEach(r => assert.ok(3 * r.total < low, `${r.year} permits`));
});
