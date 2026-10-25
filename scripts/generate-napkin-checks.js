const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, 'content/data/napkin-checks.json');
const pageFile = path.join(root, 'content/data/napkin-checks.html');
const checks = ['hand-checked', 'tool-checked', 'not yet checked'];
const idPattern = /^NC-(CP|HSE|DC)-\d{3}(?:-r(?:[2-9]|[1-9]\d+))?$/;
const fields = ['run_id', 'discipline', 'asset_type', 'method', 'inputs', 'outputs', 'check_status', 'source', 'tool_or_commit', 'run_date', 'report_url', 'public_data', 'status'];
const text = value => typeof value === 'string' && value.trim().length > 0 && !/^(?:tbd|todo|n\/?a|unknown|none|null|[-—])$/i.test(value.trim());
const disciplines = { CP: ['CP', 'Cathodic protection'], HSE: ['HSE'], DC: ['DC', 'Drilling and completions'] };
const escape = value => String(value).replace(/[&<>"'{}]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '{': '&#123;', '}': '&#125;' }[char]));
// Encode string content for both the HTML script element and the template pass.
const jsonText = value => JSON.stringify(value).replace(/[<>&{}]/g, char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`);
function revision(id) {
  const [, stem, number] = id.match(/^(NC-(?:CP|HSE|DC)-\d{3})(?:-r(\d+))?$/);
  return { stem, number: BigInt(number || '1') };
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function safeUrl(value, siteRelative = true) {
  if (!text(value) || /[\s\\]/.test(value)) return false;
  if (siteRelative && /^\/(?!\/)/.test(value)) return true;
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}
function verdictInText(value) {
  const wording = String(value);
  if (/\b(?:(?:does\s+not|not|no)\s+(?:pass(?:ed)?|ok|acceptable)|fail(?:ed|ure)?|unacceptable)\b/i.test(wording)) return 'fail';
  if (/\b(?:pass(?:ed)?|ok|acceptable)\b/i.test(wording)) return 'pass';
  return null;
}
function validate(data) {
  const header = data?.header;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('register: invalid object');
  for (const field of Object.keys(data)) if (!['header', 'runs'].includes(field)) throw new Error(`register: invalid ${field}`);
  if (!header || typeof header !== 'object' || Array.isArray(header)) throw new Error('header: invalid object');
  for (const field of Object.keys(header)) if (!['title', 'purpose', 'what_this_page_does_not_do', 'last_updated'].includes(field)) throw new Error(`header: invalid ${field}`);
  for (const field of ['title', 'purpose', 'what_this_page_does_not_do', 'last_updated']) {
    if (!text(header?.[field]) || (field === 'last_updated' && !date(header[field]))) throw new Error(`header: invalid ${field}`);
  }
  if (!Array.isArray(data.runs)) throw new Error('register: invalid runs');
  const ids = new Map();
  data.runs.forEach((run, index) => {
    const label = idPattern.test(run?.run_id) ? run.run_id : `runs[${index}]`;
    const fail = field => { throw new Error(`${label}: invalid ${field}`); };
    for (const field of fields) if (!run || !Object.hasOwn(run, field)) fail(field);
    if (!idPattern.test(run.run_id) || ids.has(run.run_id)) fail('run_id');
    ids.set(run.run_id, run);
    for (const field of ['discipline', 'asset_type', 'method', 'tool_or_commit']) if (!text(run[field])) fail(field);
    if (!disciplines[run.run_id.split('-')[1]].includes(run.discipline)) fail('discipline');
    if (!/\b(?:\d{4}|edition|classical)\b/i.test(run.method)) fail('method (name an edition or a classical method)');
    if (!checks.includes(run.check_status)) fail('check_status');
    if (run.public_data !== true) fail('public_data');
    if (!['current', 'superseded', 'withdrawn'].includes(run.status)) fail('status');
    const allowed = new Set([...fields, ...(run.status === 'superseded' ? ['superseded_by'] : run.status === 'withdrawn' ? ['reason', 'date'] : [])]);
    for (const field of Object.keys(run)) if (!allowed.has(field)) fail(field);
    if (!date(run.run_date)) fail('run_date');
    if (!safeUrl(run.report_url)) fail('report_url');
    if (!text(run.source?.name)) fail('source.name');
    if (!date(run.source?.read_date)) fail('source.read_date');
    if (run.source.read_date > run.run_date) fail('source.read_date (after run_date)');
    if (!Object.hasOwn(run.source, 'url') && !text(run.source.dataset_id)) fail('source (URL or dataset_id required)');
    if (Object.hasOwn(run.source, 'url') && !safeUrl(run.source.url, false)) fail('source.url');
    for (const field of ['dataset_id', 'page', 'table']) if (Object.hasOwn(run.source, field) && !text(run.source[field])) fail(`source.${field}`);
    for (const field of Object.keys(run.source)) if (!['name', 'read_date', 'url', 'dataset_id', 'page', 'table'].includes(field)) fail(`source.${field}`);
    if (run.status === 'withdrawn') {
      if (!text(run.reason)) fail('reason');
      if (!date(run.date)) fail('date');
    }
    for (const field of ['inputs', 'outputs']) {
      if (!Array.isArray(run[field])) fail(field);
      if (run.status === 'withdrawn') {
        if (run[field].length) fail(`${field} (withdrawn runs must have no numbers)`);
        continue;
      }
      if (!run[field].length) fail(field);
      run[field].forEach((item, position) => {
        const at = `${field}[${position}]`;
        if (!item || typeof item !== 'object') fail(at);
        const allowed = field === 'inputs' ? ['name', 'value', 'unit', 'our_assumption'] : ['name', 'value', 'unit', 'our_assumption', 'result', 'criterion', 'criterion_basis'];
        for (const key of Object.keys(item)) if (!allowed.includes(key)) fail(`${at}.${key}`);
        for (const key of ['name', 'value', 'unit']) {
          if (!Object.hasOwn(item, key)) fail(`${at}.${key}`);
          if (key === 'value') {
            if (!(text(item[key]) || (typeof item[key] === 'number' && Number.isFinite(item[key])))) fail(`${at}.${key}`);
          } else if (!(key === 'unit' && item[key] === '-') && !text(item[key])) fail(`${at}.${key}`);
        }
        if (Object.hasOwn(item, 'our_assumption') && typeof item.our_assumption !== 'boolean') fail(`${at}.our_assumption`);
        if (field === 'outputs') {
          if (Object.hasOwn(item, 'result') && !['pass', 'fail'].includes(item.result)) fail(`${at}.result`);
          const wording = verdictInText(item.value);
          const verdict = wording || Object.hasOwn(item, 'result');
          if (verdict || Object.hasOwn(item, 'criterion') || Object.hasOwn(item, 'criterion_basis')) {
            for (const key of ['criterion', 'criterion_basis']) if (!text(item[key])) fail(`${at}.${key}`);
          }
          if (wording && item.result !== wording) fail(`${at}.result`);
        }
      });
    }
  });
  const current = new Set();
  for (const run of data.runs) {
    const from = revision(run.run_id);
    if (run.status === 'current') {
      if (current.has(from.stem)) throw new Error(`${run.run_id}: invalid current revision (only one per id stem)`);
      current.add(from.stem);
    }
    if (run.status !== 'superseded') continue;
    const fail = () => { throw new Error(`${run.run_id}: invalid superseded_by`); };
    if (!text(run.superseded_by) || !ids.has(run.superseded_by)) fail();
    const to = revision(run.superseded_by);
    if (from.stem !== to.stem || to.number <= from.number) fail();
    const seen = new Set([run.run_id]);
    let next = ids.get(run.superseded_by);
    while (next) {
      if (seen.has(next.run_id)) fail();
      seen.add(next.run_id);
      next = next.status === 'superseded' ? ids.get(next.superseded_by) : null;
    }
  }
  return data;
}
function quantities(items) {
  return `<ul>${items.map(item => `<li>${escape(item.name)}: ${escape(item.value)} ${escape(item.unit)}${item.result ? ` — ${escape(item.result)}` : ''}${item.our_assumption ? ' (Our assumption)' : ''}${item.criterion ? `<br>Criterion: ${escape(item.criterion)}<br>Basis: ${escape(item.criterion_basis)}` : ''}</li>`).join('')}</ul>`;
}
function row(run) {
  const attrs = `id="${escape(run.run_id)}" data-run data-discipline="${escape(run.discipline)}" data-asset_type="${escape(run.asset_type)}" data-check_status="${escape(run.check_status)}"`;
  if (run.status === 'withdrawn') return `<tr ${attrs}><th scope="row">${escape(run.run_id)}</th><td colspan="10">withdrawn. ${escape(run.reason)} Date: ${escape(run.date)}.</td></tr>`;
  const successor = run.status === 'superseded' ? `<br>superseded. See <a href="#${escape(run.superseded_by)}">${escape(run.superseded_by)}</a>.` : '';
  const source = `${run.source.url ? `<a href="${escape(run.source.url)}">${escape(run.source.name)}</a>` : escape(run.source.name)}${[['dataset_id', 'Dataset'], ['page', 'Page'], ['table', 'Table']].map(([field, label]) => run.source[field] ? `<br>${label}: ${escape(run.source[field])}` : '').join('')}<br>Read: ${escape(run.source.read_date)}`;
  return `<tr ${attrs}><th scope="row">${escape(run.run_id)}${successor}</th><td>${escape(run.discipline)}</td><td>${escape(run.asset_type)}</td><td>${escape(run.method)}</td><td>${quantities(run.inputs)}</td><td>${quantities(run.outputs)}</td><td>${escape(run.check_status)}</td><td>${source}</td><td>${escape(run.tool_or_commit)}</td><td>${escape(run.run_date)}</td><td><a href="${escape(run.report_url)}">Full report</a></td></tr>`;
}
function table(runs, caption, empty) {
  return `<div class="table-responsive"><table class="table table-striped"><caption>${caption}</caption>
<thead><tr>${['Run id', 'Discipline', 'Asset type', 'Method and edition', 'Inputs and units', 'Outputs and criteria', 'Check status', 'Source and read date', 'Tool or commit', 'Run date', 'Report'].map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead>
<tbody>${runs.length ? runs.map(row).join('\n') : `<tr><td colspan="11">${empty}</td></tr>`}</tbody></table></div>`;
}
function renderPage(data) {
  validate(data);
  const { header, runs } = data;
  const filter = (field, label) => `<label for="filter-${field}">${label}</label>
<select class="form-control" id="filter-${field}" data-filter data-field="${field}"><option value="">All</option>${[...new Set(runs.map(run => run[field]))].sort().map(value => `<option value="${escape(value)}">${escape(value)}</option>`).join('')}</select>`;
  return `---
rootPath: "../"
---
<!-- Generated from napkin-checks.json. Use scripts/generate-napkin-checks.js. -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(header.title)}</title>
<meta name="description" content="${escape(header.purpose)}">
<meta property="og:title" content="${escape(header.title)}">
<meta property="og:description" content="${escape(header.purpose)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{{ canonicalUrl }}">
<meta property="og:image" content="https://www.aceengineer.com/assets/img/logo.png">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": ${jsonText(header.title)},
  "description": ${jsonText(header.purpose)},
  "url": "{{ canonicalUrl }}",
  "inLanguage": "en",
  "publisher": { "@id": "https://www.aceengineer.com/#organization" }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.aceengineer.com/" },
    { "@type": "ListItem", "position": 2, "name": ${jsonText(header.title)}, "item": "{{ canonicalUrl }}" }
  ]
}
</script>
<include src="partials/head-common.html"></include>
</head>
<body class="theme-page">
<include src="partials/nav.html"></include>
<main id="main" class="samples-page"><section class="container">
<h1>${escape(header.title)}</h1>
<p>${escape(header.purpose)}</p>
<h2>What this page does not do</h2>
<p>${escape(header.what_this_page_does_not_do)}</p>
<p>Last updated: <time datetime="${escape(header.last_updated)}">${escape(header.last_updated)}</time>.</p>
<nav aria-label="Analyses and discipline data">
<p><a href="../case-studies/">Analyses</a> · <a href="#cp">CP</a> · <a href="#hse">HSE</a> · <a href="#drilling-completions">Drilling and completions</a></p>
</nav>
<h2>Discipline resources</h2>
<section aria-labelledby="cp">
<h3 id="cp">Cathodic protection (CP)</h3>
<p><a href="../services/cathodic-protection.html">Cathodic protection analysis</a> · <a href="../capabilities/corrosion-control.html">Corrosion control data</a></p>
</section>
<section aria-labelledby="hse">
<h3 id="hse">HSE</h3>
<p><a href="../blog/marine-safety-incident-analysis.html">Marine safety incident analysis</a> · <a href="../services/offshore-energy-data.html">Offshore energy data analysis</a></p>
</section>
<section aria-labelledby="drilling-completions">
<h3 id="drilling-completions">Drilling and completions</h3>
<p><a href="../services/offshore-energy-data.html">Offshore energy data analysis</a> · <a href="../capabilities/dc-days-qaqc.html">Drilling and completion days data</a></p>
</section>
<h2>Filter runs</h2>
<p>Use the filters to find runs. All rows remain available without JavaScript.</p>
<div class="row">${[['discipline', 'Discipline'], ['asset_type', 'Asset type'], ['check_status', 'Check status']].map(([field, label]) => `<div class="col-md-4">${filter(field, label)}</div>`).join('\n')}</div>
<p id="no-filter-results" role="status" hidden>No runs match the filters.</p>
<h2>Current runs</h2>
${table(runs.filter(run => run.status === 'current'), 'Current runs', 'No current runs are published.')}
<h2>Earlier revisions</h2>
${table(runs.filter(run => run.status === 'superseded'), 'Superseded runs', 'No earlier revisions are published.')}
<h2>Withdrawn runs</h2>
${table(runs.filter(run => run.status === 'withdrawn'), 'Withdrawn runs', 'No withdrawn runs are published.')}
</section></main>
<include src="partials/footer.html"></include>
<script>
(function () {
  'use strict';
  var filters = Array.from(document.querySelectorAll('[data-filter]'));
  var rows = Array.from(document.querySelectorAll('[data-run]'));
  function applyFilters() {
    rows.forEach(function (row) {
      row.hidden = !filters.every(function (filter) {
        return !filter.value || row.dataset[filter.dataset.field] === filter.value;
      });
    });
    document.getElementById('no-filter-results').hidden = !filters.some(function (filter) { return filter.value; }) || rows.some(function (row) { return !row.hidden; });
  }
  filters.forEach(function (filter) { filter.addEventListener('change', applyFilters); });
}());
</script>
</body>
</html>
`;
}
function generatePage(input = dataFile, output = pageFile) {
  const html = renderPage(JSON.parse(fs.readFileSync(input, 'utf8')));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html, 'utf8');
  return html;
}
if (require.main === module) {
  try { generatePage(process.argv[2], process.argv[3]); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { validate, renderPage, generatePage };
