const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const { renderPage, generatePage } = require('../../scripts/generate-napkin-checks');
const fixture = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../fixtures/napkin-checks/synthetic.json'), 'utf8'));
const root = path.resolve(__dirname, '../..');
const source = 'content/data/napkin-checks.json';
const page = 'content/data/napkin-checks.html';
function invalid(change, field) {
  const data = fixture(); change(data.runs[0], data);
  assert.throws(() => renderPage(data), error => (field === 'run_id' || error.message.includes('NC-CP-900')) && error.message.includes(field));
}

test('committed page equals a fresh generation from the empty public register', () => {
  const data = JSON.parse(fs.readFileSync(source, 'utf8'));
  assert.deepEqual(data.runs, []);
  assert.equal(renderPage(data), fs.readFileSync(page, 'utf8'));
  assert.match(renderPage(data), /No current runs are published/);
});

test('complete SYNTHETIC run renders every column and assumption', () => {
  const html = renderPage(fixture());
  for (const text of ['NC-CP-900', 'Synthetic plate', 'Classical synthetic example', '2 m²', '3 A', 'Our assumption', 'pass', 'Current is at most 4 A.', 'SYNTHETIC test limit.', 'hand-checked', 'SYNTHETIC fixture', '2026-10-21', 'PR #1', '2026-10-22', '/reports/synthetic-plate.html']) assert.ok(html.includes(text), text);
  assert.equal((html.match(/scope="col"/g) || []).length, 33);
  assert.match(html, /partials\/nav.html/);
  assert.match(html, /partials\/footer.html/);
  assert.doesNotMatch(html, /(?:src|href)=["']https?:/);
});

for (const field of Object.keys(fixture().runs[0])) {
  test(`missing run field ${field} fails`, () => invalid(run => { delete run[field]; }, field));
}
for (const [list, fields] of [['inputs', ['name', 'value', 'unit']], ['outputs', ['name', 'value', 'unit']], ['source', ['name', 'read_date']]]) {
  for (const field of fields) test(`missing ${list}.${field} fails`, () => invalid(run => { delete (Array.isArray(run[list]) ? run[list][0] : run[list])[field]; }, `${list}`));
}
for (const verdict of ['pass', 'fail', 'PASS', ' FAIL ']) {
  for (const field of ['criterion', 'criterion_basis']) {
    test(`${verdict.trim()} without ${field} fails`, () => invalid(run => { run.outputs[1].value = verdict; delete run.outputs[1][field]; }, field));
  }
}
test('numeric output with a result also requires criteria', () => invalid(run => { run.outputs[0].result = 'fail'; }, 'criterion'));

test('all check states and discipline codes render with revised ids', () => {
  for (const [discipline, check_status] of [['Cathodic protection', 'hand-checked'], ['HSE', 'tool-checked'], ['DC', 'not yet checked']]) {
    const data = fixture();
    Object.assign(data.runs[0], { run_id: `NC-${discipline === 'Cathodic protection' ? 'CP' : discipline}-900-r10`, discipline, check_status });
    assert.ok(renderPage(data).includes(check_status));
  }
});

for (const [field, value] of [['run_id', 'NC-CP-900-r1'], ['inputs', null], ['outputs', {}], ['source', null], ['asset_type', ''], ['public_data', null]]) {
  test(`rejects wrong type or empty ${field}`, () => {
    const data = fixture(); data.runs[0][field] = value;
    assert.throws(() => renderPage(data), new RegExp(field));
  });
}

test('malformed JSON leaves the destination unchanged', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'napkin-json-'));
  const input = path.join(dir, 'data.json'); const output = path.join(dir, 'page.html');
  fs.writeFileSync(input, '{'); fs.writeFileSync(output, 'sentinel\n');
  assert.throws(() => generatePage(input, output), SyntaxError);
  assert.equal(fs.readFileSync(output, 'utf8'), 'sentinel\n');
});
for (const [field, value] of [['public_data', false], ['public_data', 'true'], ['run_id', 'NC-CP-9'], ['run_id', 'NC-OTHER-900'], ['check_status', 'approved'], ['status', 'draft'], ['run_date', '2026-02-30'], ['report_url', 'javascript:alert(1)'], ['method', 'Unnamed method'], ['inputs', []], ['outputs', []]]) {
  test(`invalid ${field} fails`, () => {
    const data = fixture(); data.runs[0][field] = value;
    assert.throws(() => renderPage(data), new RegExp(field));
  });
}
test('duplicate run id fails', () => invalid((run, data) => data.runs.push(structuredClone(run)), 'run_id'));
for (const field of Object.keys(fixture().header)) test(`missing header ${field} fails`, () => {
  const data = fixture(); delete data.header[field]; assert.throws(() => renderPage(data), new RegExp(field));
});

test('earlier revisions link to the successor; withdrawals show no measurements', () => {
  const data = fixture();
  const earlier = { ...structuredClone(data.runs[0]), run_id: 'NC-CP-901', status: 'superseded', superseded_by: 'NC-CP-901-r2' };
  const successor = { ...structuredClone(data.runs[0]), run_id: 'NC-CP-901-r2' };
  const withdrawn = { ...structuredClone(data.runs[0]), run_id: 'NC-CP-902', status: 'withdrawn', inputs: [], outputs: [], reason: 'SYNTHETIC input error.', date: '2026-10-22' };
  data.runs.push(earlier, successor, withdrawn);
  const html = renderPage(data);
  assert.match(html, /Earlier revisions/);
  assert.match(html, /href="#NC-CP-901-r2"/);
  const row = html.match(/<tr id="NC-CP-902"[\s\S]*?<\/tr>/)[0];
  assert.match(row, /withdrawn/); assert.match(row, /SYNTHETIC input error/); assert.match(row, /2026-10-22/);
  assert.doesNotMatch(row, /2 m²|3 A|Current check|Classical|Full report/);
  for (const field of ['reason', 'date']) {
    const broken = structuredClone(data); delete broken.runs[3][field];
    assert.throws(() => renderPage(broken), new RegExp(`NC-CP-902.*${field}`));
  }
  for (const field of ['inputs', 'outputs']) {
    const broken = structuredClone(data); broken.runs[3][field] = fixture().runs[0][field];
    assert.throws(() => renderPage(broken), new RegExp(`NC-CP-902.*${field}`));
  }
  const hiddenNumbers = structuredClone(data); hiddenNumbers.runs[3].measurements = [12];
  assert.throws(() => renderPage(hiddenNumbers), /NC-CP-902.*measurements/);
  const hiddenSource = structuredClone(data); hiddenSource.runs[3].source.measurement = 12;
  assert.throws(() => renderPage(hiddenSource), /NC-CP-902.*source.measurement/);
});

test('successors must exist and form no cycle', () => {
  for (const successor of [undefined, 'NC-CP-903', 'NC-CP-900']) {
    invalid(run => { run.status = 'superseded'; run.superseded_by = successor; }, 'superseded_by');
  }
  const data = fixture(); data.runs[0].status = 'superseded'; data.runs[0].superseded_by = 'NC-CP-900-r2';
  data.runs.push({ ...structuredClone(data.runs[0]), run_id: 'NC-CP-900-r2', superseded_by: 'NC-CP-900' });
  assert.throws(() => renderPage(data), /superseded_by/);
  data.runs[1].status = 'current'; delete data.runs[1].superseded_by;
  assert.match(renderPage(data), /href="#NC-CP-900-r2"/);
});

test('filters combine all three fields and restore the unfiltered rows', () => {
  const html = renderPage(fixture());
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const controls = ['discipline', 'asset_type', 'check_status'].map(field => ({ dataset: { field }, value: '', addEventListener(event, callback) { this.change = callback; } }));
  const rows = [
    { dataset: { discipline: 'CP', asset_type: 'Synthetic plate', check_status: 'hand-checked' } },
    { dataset: { discipline: 'DC', asset_type: 'Synthetic plate', check_status: 'tool-checked' } },
    { dataset: { discipline: 'CP', asset_type: 'Synthetic pipe', check_status: 'not yet checked' } },
  ];
  const message = { hidden: true };
  vm.runInNewContext(script, { document: { querySelectorAll: selector => selector === '[data-filter]' ? controls : rows, getElementById: () => message } });
  controls[0].value = 'CP'; controls[0].change(); assert.deepEqual(rows.map(row => row.hidden), [false, true, false]);
  controls[1].value = 'Synthetic plate'; controls[1].change(); assert.deepEqual(rows.map(row => row.hidden), [false, true, true]);
  controls[2].value = 'tool-checked'; controls[2].change(); assert.ok(rows.every(row => row.hidden)); assert.equal(message.hidden, false);
  controls.forEach(control => { control.value = ''; }); controls[0].change(); assert.ok(rows.every(row => !row.hidden));
});

test('all data text is escaped, including template expressions', () => {
  const data = fixture(); data.runs[0].asset_type = '<img onerror="bad()">{{ value }}';
  const html = renderPage(data);
  assert.doesNotMatch(html, /<img onerror|\{\{ value \}\}/);
  assert.match(html, /&lt;img/);
});

test('invalid data leaves an existing output unchanged; CLI fails without a partial file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'napkin-checks-'));
  const input = path.join(dir, 'data.json'); const output = path.join(dir, 'page.html');
  const data = fixture(); data.runs.push({ ...data.runs[0], run_id: 'NC-CP-901', public_data: false });
  fs.writeFileSync(input, JSON.stringify(data)); fs.writeFileSync(output, 'sentinel\n');
  assert.throws(() => generatePage(input, output), /public_data/);
  assert.equal(fs.readFileSync(output, 'utf8'), 'sentinel\n');
  const cliOutput = path.join(dir, 'absent.html');
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/generate-napkin-checks.js'), input, cliOutput], { encoding: 'utf8' });
  assert.notEqual(result.status, 0); assert.match(result.stderr, /NC-CP-901.*public_data/);
  assert.equal(fs.existsSync(cliOutput), false);
  fs.writeFileSync(input, JSON.stringify(fixture())); generatePage(input, output);
  assert.equal(fs.readFileSync(output, 'utf8'), renderPage(fixture()));
});
