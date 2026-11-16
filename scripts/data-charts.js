'use strict';

const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const { validateBundle, escape } = require('../assets/js/data-chart');

// RFC 4180 (2005), section 2: quoted fields, doubled quotes and CRLF records.
// LF records are also accepted for repository text-file compatibility.
function csvRows(text) {
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === ',' || c === '\n' || c === '\r') {
      row.push(field); field = ''; closed = false;
      if (c !== ',') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        rows.push(row); row = [];
      }
    } else if (c === '"' && !field && !closed) quoted = true;
    else if (closed || c === '"') throw new Error('Invalid CSV quoting');
    else field += c;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  if (row.length || field || closed) { row.push(field); rows.push(row); }
  return rows;
}

function validateCsv(bundle, text) {
  const rows = csvRows(text);
  if (JSON.stringify(rows.shift()) !== JSON.stringify(['x', 'value', 'year', 'unit'])) throw new Error('CSV header must be x,value,year,unit');
  if (rows.length !== bundle.series.length) throw new Error('CSV row count differs from JSON');
  rows.forEach((row, i) => {
    const expected = bundle.series[i];
    if (row.length !== 4 || row[0] !== String(expected.x) || !row[1].trim() || Number(row[1]) !== expected.value
      || !row[2].trim() || Number(row[2]) !== expected.year || row[3] !== bundle.unit) throw new Error(`CSV differs from JSON at data row ${i + 1}`);
  });
}

function loadChartBundles(directory = path.resolve('assets/data/charts')) {
  const bundles = new Map();
  const ids = new Set();
  if (!fs.existsSync(directory)) return bundles;
  for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.json')).sort()) {
    try {
      const bundle = validateBundle(JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')));
      if (ids.has(bundle.id)) throw new Error('Duplicate chart id');
      ids.add(bundle.id);
      validateCsv(bundle, fs.readFileSync(path.join(directory, bundle.csv), 'utf8'));
      bundles.set(`/assets/data/charts/${file}`, bundle);
    } catch (error) {
      throw new Error(`Chart bundle ${file}: ${error.message}`);
    }
  }
  return bundles;
}

function renderChart(bundle, url) {
  validateBundle(bundle);
  const e = escape, id = bundle.id;
  const csvUrl = `/assets/data/charts/${bundle.csv}`;
  const limits = bundle.limits.length ? `<ul>${bundle.limits.map(limit => `<li>${e(limit.label)}: ${e(limit.value)} ${e(bundle.unit)}. ${e(limit.citation)}</li>`).join('')}</ul>` : '<p>No reference limits were supplied. No acceptance check is evaluated.</p>';
  return `<section class="data-chart" data-chart-bundle="${e(url)}" aria-labelledby="${id}-headline">
<h2 id="${id}-headline">${e(bundle.headline)}</h2>
<p>Source: <a href="${e(bundle.source.url)}">${e(bundle.source.name)}</a>. Source date (${e(bundle.source.date_kind)}): <time datetime="${e(bundle.source.date)}">${e(bundle.source.date)}</time>. Retrieved (UTC): <time datetime="${e(bundle.source.retrieved_at)}">${e(bundle.source.retrieved_at)}</time>.</p>
<p id="${id}-alternative">${e(bundle.text_alternative)}</p>
<p id="${id}-help">Focus the chart and use Left, Right, Home or End to read points. The table contains the same values.</p>
<div class="data-chart-plot" data-chart-plot tabindex="0" role="img" aria-label="${e(bundle.quantity)} against ${e(bundle.x.variable)}" aria-describedby="${id}-alternative ${id}-help ${id}-status"></div>
<button type="button" data-chart-previous hidden aria-label="Previous point: ${e(bundle.quantity)}">Previous point</button>
<button type="button" data-chart-next hidden aria-label="Next point: ${e(bundle.quantity)}">Next point</button>
<p id="${id}-status" data-chart-status role="status" aria-live="polite">Interactive chart requires JavaScript. Use the table below.</p>
${limits}
<p><a href="${e(csvUrl)}" download>Download CSV</a></p>
<div class="data-chart-table"><table>
<caption>${e(bundle.quantity)} by ${e(bundle.x.variable)}. Values as published; no conversion.</caption>
<thead><tr><th scope="col">${e(bundle.x.variable)} (${e(bundle.x.unit)})</th><th scope="col">${e(bundle.quantity)} (${e(bundle.unit)})</th><th scope="col">Year</th></tr></thead>
<tbody>${bundle.series.map(row => `<tr><td>${e(row.x)}</td><td>${e(row.value)}</td><td>${e(row.year)}</td></tr>`).join('')}</tbody>
</table></div>
</section>`;
}

async function expandCharts(html, bundles) {
  if (!/<data-chart\b/i.test(html)) return html;
  const ids = new Set();
  const result = await posthtml([tree => tree.walk(node => {
    if (node.tag !== 'data-chart') return node;
    const url = node.attrs && node.attrs.src;
    const bundle = bundles.get(url);
    if (!bundle) throw new Error('data-chart requires a registered local bundle');
    if (ids.has(bundle.id)) throw new Error('Duplicate chart on page');
    ids.add(bundle.id);
    return { tag: false, content: [renderChart(bundle, url)] };
  })]).process(html);
  return result.html;
}

module.exports = { validateCsv, loadChartBundles, renderChart, expandCharts };
