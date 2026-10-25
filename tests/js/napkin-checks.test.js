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
  assert.doesNotMatch(html, /(?:src|href)=["']https?:[^"']*\.(?:js|css)/);
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
for (const verdict of ['FAIL: limit exceeded', 'PASS with qualifications', ' Failed check']) {
  for (const field of ['criterion', 'criterion_basis']) {
    test(`${verdict.trim()} without ${field} fails with or without a structured result`, () => {
      for (const structured of [true, false]) {
        invalid(run => {
          run.outputs[1].value = verdict;
          run.outputs[1].unit = '1';
          delete run.outputs[1][field];
          if (!structured) delete run.outputs[1].result;
        }, field);
      }
    });
  }
  test(`${verdict.trim()} requires a structured result even with criteria`, () => invalid(run => {
    run.outputs[1].value = verdict;
    delete run.outputs[1].result;
  }, 'result'));
}
test('structured result must agree with verdict text', () => invalid(run => {
  run.outputs[1].value = 'FAIL: limit exceeded';
  run.outputs[1].result = 'pass';
}, 'result'));
test('unstructured FAIL text with unit 1 and no criterion or basis is rejected', () => invalid(run => {
  run.outputs[1] = { name: 'SYNTHETIC check', value: 'FAIL: limit exceeded', unit: '1' };
}, 'criterion'));
test('structured fail with qualified wording and a numeric verdict render', () => {
  const data = fixture();
  data.runs[0].outputs[1].value = 'FAIL: limit exceeded';
  data.runs[0].outputs[1].result = 'fail';
  assert.match(renderPage(data), /FAIL: limit exceeded/);
  data.runs[0].outputs[1].value = 5;
  assert.match(renderPage(data), /5 1 — fail/);
});
test('numeric output with a result also requires criteria', () => invalid(run => { run.outputs[0].result = 'fail'; }, 'criterion'));

for (const value of ['TBD', ' n/a ', 'TODO', 'unknown', '-', '—']) {
  for (const field of ['inputs', 'outputs']) {
    test(`${field} reject placeholder ${value.trim()}`, () => invalid(run => {
      run[field][0].value = value;
      run[field][0].unit = '-';
    }, `${field}[0].value`));
  }
}
for (const [value, result] of [
  ['0.85 (pass)', 'pass'], ['Does not pass', 'fail'], ['acceptable', 'pass'],
  ['Not OK', 'fail'], ['check failed', 'fail'], ['not acceptable', 'fail'],
]) {
  for (const field of ['criterion', 'criterion_basis', 'result']) {
    test(`verdict ${value} requires ${field}`, () => invalid(run => {
      Object.assign(run.outputs[1], { value, result });
      delete run.outputs[1][field];
    }, field));
  }
  test(`verdict ${value} agrees with the structured result`, () => {
    const data = fixture();
    Object.assign(data.runs[0].outputs[1], { value, result });
    assert.ok(renderPage(data).includes(value));
    invalid(run => Object.assign(run.outputs[1], { value, result: result === 'pass' ? 'fail' : 'pass' }), 'result');
  });
}

test('sources require a public URL or dataset identifier', () => invalid(run => {
  delete run.source.url;
  delete run.source.dataset_id;
}, 'source'));
for (const url of ['http://example.org/data', 'https:example.org/data', 'javascript:alert(1)', '/data', `https://${['user:password', 'example.org'].join('@')}/data`]) {
  test('source rejects an unsafe or non-HTTPS URL', () => invalid(run => { run.source.url = url; }, 'source.url'));
}
test('source URL and page or table locators render beside the read date', () => {
  const data = fixture();
  Object.assign(data.runs[0].source, { page: '12–13', table: 'Table 2' });
  const html = renderPage(data);
  assert.ok(html.includes('href="https://example.org/synthetic"'));
  assert.match(html, /Page: 12–13/);
  assert.match(html, /Table: Table 2/);
  assert.match(html, /Read: 2026-10-21/);
});
test('a dataset identifier can replace or accompany a source URL', () => {
  const data = fixture();
  data.runs[0].source.dataset_id = 'SYNTHETIC:dataset-1';
  assert.match(renderPage(data), /Dataset: SYNTHETIC:dataset-1/);
  delete data.runs[0].source.url;
  assert.match(renderPage(data), /Dataset: SYNTHETIC:dataset-1/);
});
for (const field of ['dataset_id', 'page', 'table']) {
  test(`source rejects placeholder ${field}`, () => invalid(run => { run.source[field] = 'TBD'; }, `source.${field}`));
}
test('source citations escape template expressions and HTML', () => {
  const data = fixture();
  Object.assign(data.runs[0].source, { dataset_id: '<b>{{ value }}</b>', page: '<b>{{ value }}</b>', table: '<b>{{ value }}</b>' });
  assert.doesNotMatch(renderPage(data), /<b>|\{\{ value \}\}/);
});
test('discipline must agree with the run id', () => invalid(run => { run.discipline = 'HSE'; }, 'discipline'));
test('source cannot be read after the run date', () => invalid(run => { run.source.read_date = '2026-10-23'; }, 'source.read_date'));
test('report URLs require HTTPS or a site-relative path', () => {
  invalid(run => { run.report_url = 'http://example.org/report'; }, 'report_url');
  const data = fixture(); data.runs[0].report_url = 'https://example.org/report';
  assert.ok(renderPage(data).includes('href="https://example.org/report"'));
});
for (const target of ['header', 'register']) {
  test(`unknown ${target} fields fail`, () => {
    const data = fixture();
    (target === 'header' ? data.header : data).extra = 'SYNTHETIC';
    assert.throws(() => renderPage(data), new RegExp(`${target}.*extra`));
  });
}

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

for (const successor of ['NC-HSE-900-r2', 'NC-CP-901-r2', 'NC-CP-900']) {
  test(`successor ${successor} must share the stem and increase the revision`, () => {
    const data = fixture();
    Object.assign(data.runs[0], { run_id: 'NC-CP-900-r2', status: 'superseded', superseded_by: successor });
    data.runs.push({ ...structuredClone(fixture().runs[0]), run_id: successor, discipline: successor.includes('HSE') ? 'HSE' : 'CP' });
    assert.throws(() => renderPage(data), /NC-CP-900-r2.*superseded_by/);
  });
}
test('base id and its second revision cannot both be current in either order', () => {
  const data = fixture();
  data.runs.push({ ...structuredClone(data.runs[0]), run_id: 'NC-CP-900-r2' });
  for (const runs of [data.runs, [...data.runs].reverse()]) {
    assert.throws(() => renderPage({ ...data, runs }), /NC-CP-900.*current/);
  }
});
test('successor revisions increase numerically through a chain', () => {
  const data = fixture();
  Object.assign(data.runs[0], { status: 'superseded', superseded_by: 'NC-CP-900-r2' });
  data.runs.push({ ...structuredClone(data.runs[0]), run_id: 'NC-CP-900-r2', superseded_by: 'NC-CP-900-r10' });
  data.runs.push({ ...structuredClone(fixture().runs[0]), run_id: 'NC-CP-900-r10' });
  assert.match(renderPage(data), /href="#NC-CP-900-r10"/);
  data.runs[2].status = 'superseded';
  data.runs[2].superseded_by = 'NC-CP-900-r2';
  data.runs = [data.runs[2], { ...structuredClone(fixture().runs[0]), run_id: 'NC-CP-900-r2' }];
  assert.throws(() => renderPage(data), /NC-CP-900-r10.*superseded_by/);
});

test('empty and populated registers retain discipline anchors and confirmed site destinations', () => {
  for (const data of [JSON.parse(fs.readFileSync(source, 'utf8')), fixture()]) {
    const html = renderPage(data);
    for (const anchor of ['cp', 'hse', 'drilling-completions']) {
      assert.equal((html.match(new RegExp(`id="${anchor}"`, 'g')) || []).length, 1);
      assert.ok(html.includes(`href="#${anchor}"`));
    }
    for (const target of ['case-studies/', 'services/cathodic-protection.html', 'blog/marine-safety-incident-analysis.html', 'services/offshore-energy-data.html']) {
      assert.ok(html.includes(`href="../${target}"`), target);
      assert.ok(fs.existsSync(path.join(root, 'content', target, target.endsWith('/') ? 'index.html' : '')), target);
    }
    const registry = fs.readFileSync(path.join(root, 'config/capabilities.yaml'), 'utf8');
    for (const id of ['corrosion-control', 'dc-days-qaqc']) {
      assert.ok(html.includes(`href="../capabilities/${id}.html"`));
      assert.ok(registry.includes(`- id: ${id}`));
    }
  }
});

test('page metadata uses the shared head and safely encodes register text in JSON-LD', () => {
  const data = fixture();
  data.header.title = 'SYNTHETIC </script>{{ value }} "title"';
  const html = renderPage(data);
  assert.match(html, /partials\/head-common.html/);
  assert.match(html, /meta property="og:url" content="\{\{ canonicalUrl \}\}"/);
  for (const field of ['title', 'description', 'type', 'image']) assert.ok(html.includes(`property="og:${field}"`));
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const collection = schemas.find(node => node['@type'] === 'CollectionPage');
  assert.equal(collection.name, data.header.title);
  assert.equal(collection.description, data.header.purpose);
  assert.equal(collection.url, '{{ canonicalUrl }}');
  assert.equal(collection.inLanguage, 'en');
  assert.deepEqual(collection.publisher, { '@id': 'https://www.aceengineer.com/#organization' });
  assert.equal(schemas.find(node => node['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, '{{ canonicalUrl }}');
  assert.doesNotMatch(html, /<\/script>\{\{ value \}\}/);
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
