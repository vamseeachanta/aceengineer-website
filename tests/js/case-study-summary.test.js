const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
// The same assertions run in Jest and in Node when project dependencies are absent.
const test = typeof jest === 'undefined' ? require('node:test').test : global.test;
const {
  addCaseStudyBlocks, renderSummary, reportHref, loadStudies,
} = require('../../scripts/case-study-summary');

const root = path.resolve(__dirname, '../..');
const studies = loadStudies();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const fixture = () => ({
  summary: {
    what: 'The example describes a method.',
    inputs: 'The inputs are illustrative.',
    result: 'The output is a method description.',
    basis: 'The basis is the example text.',
  },
  evidence: [{ path: 'content/case-studies/bsee-field-economics.html', section: 'Illustrative Example' }],
  report: null,
  workflow: null,
});

test('slice 1: the shared partial renders the labelled summary and escapes text', () => {
  const data = fixture();
  data.summary.what = 'A <sample> & "quoted" method.';
  const html = renderSummary(data);
  for (const label of ['What was done', 'Inputs', 'Result', 'Data basis']) assert.ok(html.includes(label));
  assert.ok(html.includes('A &lt;sample&gt; &amp; &quot;quoted&quot; method.'));
  assert.ok(!html.includes('{{'));
});

test('slice 1: template expressions in data remain text and missing evidence fails closed', () => {
  const data = fixture();
  data.summary.what = '{{ copy.firm_lede }}';
  assert.ok(renderSummary(data).includes('&#123;&#123; copy.firm_lede &#125;&#125;'));
  assert.throws(() => renderSummary({ ...fixture(), summary: {} }), /summary field/);
  assert.throws(() => renderSummary({ ...fixture(), evidence: [] }), /source evidence/);
  data.evidence = [{ path: 'content/case-studies/bsee-field-economics.html', section: 'Missing source section' }];
  assert.throws(() => renderSummary(data), /source evidence/);
});

test('slice 2: absent and unresolved reports have explicit text without a report link', () => {
  for (const report of [null, { url: '/reports/absent-full-report.html' }, { url: 'javascript:alert(1)' }]) {
    const html = renderSummary({ ...fixture(), report });
    assert.ok(html.includes('No public full report yet'));
    assert.ok(!html.includes('data-full-report-link'));
  }
});

test('slice 2: an existing site report renders a link', () => {
  // Existence fixture only: content/reports/sloshing/study.html is a public report page.
  // This does not associate the sloshing report with any of the case studies.
  const html = renderSummary({ ...fixture(), report: { url: '/reports/sloshing/study.html' } });
  assert.ok(html.includes('href="/reports/sloshing/study.html"'));
  assert.ok(html.includes('See the full report'));
  assert.ok(!html.includes('No public full report yet'));
});

test('slice 2: public repository files require a matching recorded confirmation', () => {
  // Synthetic URL and date, not a claim that a remote file exists.
  const url = 'https://github.com/example/reports/blob/abcdef/report.md';
  assert.equal(reportHref({ url }), null);
  assert.equal(reportHref({ url, verification: { url, checkedAt: '2026-10-22', publicFile: true } }), url);
  assert.equal(reportHref({ url, verification: { url: url + 'x', checkedAt: '2026-10-22', publicFile: true } }), null);
  assert.equal(reportHref({ url: url.replace('/blob/abcdef/', '/blob/main/'), verification: { url, checkedAt: '2026-10-22', publicFile: true } }), null);
});

test('slice 2: report validation rejects traversal, unpublished sources and non-file destinations', () => {
  for (const url of ['/reports/../case-studies/index.html', '/reports/%2e%2e/index.html',
    '//example.org/report.html', '/partials/nav.html', '/scripts/generate_field_economics_data.py',
    'https://example.org/report.html', '/reports/sloshing/study.html?redirect=elsewhere']) {
    assert.equal(reportHref({ url }), null, url);
  }
});

test('slice 3: missing or incomplete workflows use the explicit unavailable state', () => {
  for (const workflow of [null, {}, { inputs: ['Example input.'] }]) {
    const html = renderSummary({ ...fixture(), workflow });
    assert.ok(html.includes('Not yet available as a public workflow'));
    assert.ok(!html.includes('data-workflow-tool'));
  }
});

test('slice 3: a documented calculator workflow names inputs, method and expected output', () => {
  const html = renderSummary(studies['pipeline-on-bottom-stability-assessment.html']);
  for (const text of ['Expected output', 'Method', 'Inputs', 'Calculate Stability', '/calculators/on-bottom-stability.html']) {
    assert.ok(html.includes(text), text);
  }
  assert.ok(!html.includes('Not yet available as a public workflow'));
  const data = fixture();
  data.workflow = { ...studies['pipeline-on-bottom-stability-assessment.html'].workflow, toolUrl: '/missing.html' };
  assert.ok(renderSummary(data).includes('Not yet available as a public workflow'));
});

test('slice 3: repeat actions and inputs have public calculator evidence', () => {
  // Independent transcription of the visible form labels and buttons in the
  // calculators linked by each study's Tools section; no engineering thresholds.
  const evidence = {
    'pipeline-on-bottom-stability-assessment.html': ['Seawater Density', 'Pipe Outer Diameter',
      'Wall Thickness', 'Coating Density', 'Coating Thickness', 'Contents Density',
      'Current Velocity', 'Wave Acceleration', 'Soil Friction Coefficient', 'Calculate Stability'],
    'multi-code-wall-thickness-comparison.html': ['Pipe Outer Diameter', 'Wall Thickness',
      'Internal Pressure', 'External Pressure', 'Corrosion Allowance', 'Design Factor',
      "Young's Modulus", "Poisson's Ratio", 'Calculate Wall Thickness'],
  };
  for (const [page, labels] of Object.entries(evidence)) {
    const workflow = studies[page].workflow;
    const calculator = read(`content${workflow.toolUrl}`);
    for (const label of labels) assert.ok(calculator.includes(label), label);
    assert.ok(read(`content/case-studies/${page}`).includes(path.basename(workflow.toolUrl)));
    assert.ok(workflow.limitation.includes('does not repeat'));
  }
});

test('slices 4 and 5: every case study gains ordered parts without removing any original bytes', () => {
  // Independent inventory: economics, safety, wall thickness, platform fatigue,
  // riser sensitivity, stability, FEA and wind foundations are the eight studies in #165.
  const pages = fs.readdirSync(path.join(root, 'content/case-studies')).filter(name => name !== 'index.html');
  assert.equal(pages.length, 8);
  assert.deepEqual(Object.keys(studies).sort(), pages.sort());
  for (const page of pages) {
    const before = read(`content/case-studies/${page}`);
    const after = addCaseStudyBlocks(before, `case-studies/${page}`);
    const summary = after.indexOf('data-case-study-summary');
    const report = after.indexOf('data-case-study-report');
    const repeat = after.indexOf('data-case-study-repeat');
    assert.ok(after.indexOf('</h1>') < summary && summary < report && report < repeat, page);
    // Removing only the inserted block must recover the entire pre-change source:
    // paragraphs, figures, headings, scripts and whitespace, not selected sentences.
    assert.equal(after.replace(/\n<!-- case-study-overview:start -->[\s\S]*?<!-- case-study-overview:end -->\n/, ''), before, page);
    assert.throws(() => addCaseStudyBlocks(after, `case-studies/${page}`), /already/);
    assert.throws(() => addCaseStudyBlocks(before.replace(/<h1>.*?<\/h1>/, ''), `case-studies/${page}`), /heading/);
  }
});

test('slice 5: index cards retain all text and links, adding only summary links', () => {
  const before = read('content/case-studies/index.html');
  const after = addCaseStudyBlocks(before, 'case-studies/index.html');
  assert.equal(after.replace(/<p data-case-study-summary-link>[\s\S]*?<\/p>\n/g, ''), before);
  for (const page of Object.keys(studies)) assert.ok(after.includes(`href="${page}#case-study-summary"`));
  // The additional sloshing card is outside the eight-study scope of #165.
  assert.ok(!after.includes('../reports/sloshing/#case-study-summary'));
  assert.equal(addCaseStudyBlocks(before, 'blog/index.html'), before);
  assert.throws(() => addCaseStudyBlocks('<h1>Missing data</h1>', 'case-studies/new-study.html'), /register/);
});

test('slices 1 and 3: source records exist and current summaries introduce no figures', () => {
  for (const data of Object.values(studies)) {
    for (const evidence of data.evidence) {
      assert.ok(read(evidence.path).includes(evidence.section), evidence.path);
    }
    assert.deepEqual(Object.keys(data.summary).sort(), ['basis', 'inputs', 'result', 'what']);
    for (const sentence of Object.values(data.summary)) assert.ok(!/\d/.test(sentence), sentence);
    assert.equal(data.report, null);
  }
});

test('slice 6: worked example answers are restated from the saved economics outputs', () => {
  // Independent transcription: the page table lists NPV 6,078.1 million USD
  // and production 373.5 million bbl. This checks the saved fixture, not a new model.
  const metrics = JSON.parse(read('assets/data/field_economics_metrics.json'));
  assert.equal(metrics.npv_mm.toFixed(1), '6078.1');
  assert.equal(metrics.total_production_mmbbls.toFixed(1), '373.5');
  const doc = read('docs/case-study-summary.md');
  assert.ok(doc.includes('6,078.1 million USD'));
  assert.ok(doc.includes('373.5 million bbl'));
  assert.ok(doc.includes('placeholder'));
});
