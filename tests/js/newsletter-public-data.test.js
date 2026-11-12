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
const csv = read('assets/data/newsletter/issue-002/new-well-permits-by-water-depth.csv').trim().split('\n')
  .slice(1).map(line => line.split(','));

for (const prefix of ['content', 'dist']) {
  test(`${prefix}: public data page carries the r6 title, heading and table footnote`, () => {
    const html = read(`${prefix}/${page}`);
    assert.ok(html.includes(`<h1>${title}</h1>`));
    assert.ok(html.includes(`<title>${title} (Deckhand newsletter, issue 2)</title>`));
    assert.ok(!html.includes('well permits by rig type: a public US data file'));
    assert.ok(html.includes('<h2>Well permits by rig type and water depth</h2>'));
    assert.ok(html.includes('<p class="dc">b. The counts here are from the file of 2 November 2026.</p>'));
    assert.ok(html.includes('Gulf of America (formerly the Gulf of Mexico)'));
    assert.equal((html.match(/<p>Our hypothesis: /g) || []).length, 2);
    assert.ok(html.includes('Prepared: Analyst Deckhand &middot; Checked: Editor Deckhand'));
  });

  test(`${prefix}: every table row is square and its water-depth bands add up to its permits`, () => {
    const [t1, t2] = tables(read(`${prefix}/${page}`));
    for (const t of [t1, t2]) {
      t.rows.forEach(row => assert.equal(row.length, t.head.length));
      t.rows.forEach(row => assert.equal(num(row[2]) + num(row[3]) + num(row[4]), num(row[1]), row[0]));
      const all = t.rows.at(-1);
      for (const col of [1, 2, 3, 4]) {
        assert.equal(t.rows.slice(0, -1).reduce((sum, row) => sum + num(row[col]), 0), num(all[col]), `${t.head[col]} total`);
      }
    }
    assert.equal(num(t1.rows.at(-1)[1]), 2895);
    assert.deepEqual(t1.rows.at(-1).slice(1, 5), t2.rows.at(-1).slice(1, 5));
  });

  test(`${prefix}: Table 2 periods are the sums of the published per-year water-depth file`, () => {
    const [, t2] = tables(read(`${prefix}/${page}`));
    const periods = [[2005, 2009], [2010, 2014], [2015, 2019], [2020, 2024], [2025, 2026]];
    periods.forEach(([a, b], i) => {
      const years = csv.filter(r => Number(r[0]) >= a && Number(r[0]) <= b);
      const sums = [1, 2, 3, 4].map(col => years.reduce((sum, r) => sum + Number(r[col]), 0));
      assert.deepEqual(sums, t2.rows[i].slice(1, 5).map(num), `${a} to ${b}`);
    });
  });
}

test('the opening counts agree with Table 2 and the per-year files', () => {
  const html = read(`content/${page}`);
  const lead = html.match(/<p class="lead">([\s\S]*?)<\/p>/)[1];
  const [, t2] = tables(html);
  // 2005 to 2009: 1,100 of 1,476 under 1,000 ft; 2020 to 2024: 104 + 116 = 220 of 277 at 1,000 ft or more
  assert.match(lead, /1,100 of the 1,476 permits were in less than 1,000 ft/);
  assert.equal(num(t2.rows[0][2]), 1100);
  assert.equal(num(t2.rows[3][3]) + num(t2.rows[3][4]), 220);
  assert.match(lead, /220 of the 277 were in 1,000 ft or more, 116 of them in 5,000 ft/);
  const rig = read('assets/data/newsletter/issue-002/fig-p1-new-well-permits-by-rig-type.csv').trim().split('\n');
  const head = rig[0].split(',');
  const year = y => Object.fromEntries(rig.find(line => line.startsWith(`${y},`)).split(',').map((v, i) => [head[i], Number(v)]));
  assert.deepEqual([year(2005).total, year(2005)['Jack-up'], year(2005).Drillship], [322, 234, 15]);
  assert.deepEqual([year(2025).total, year(2025).Drillship, year(2025)['Jack-up']], [47, 44, 1]);
});
