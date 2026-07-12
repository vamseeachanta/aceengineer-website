#!/usr/bin/env node
/**
 * render-capabilities.js — render the capability registry into HTML for the website.
 *
 * C3 (aceengineer-website#51), epic workspace-hub#3485. Pure functions (no I/O) so they
 * are unit-testable; build.js injects the output into content/capabilities/index.html as
 * the `capabilitiesCards` template local. Cards use inline styles + existing container
 * classes so PurgeCSS can't strip them.
 *
 * Each card links to the capability's data on Hugging Face (a real, live target today).
 * When the per-capability detail pages land (C4, #52), the primary link flips to the
 * internal /capabilities/<id>.html page.
 *
 * Data comes from the hydrated registry (C2): each table carries `data` (columns/rows/
 * total_rows) + `data_source` ('live' | 'snapshot' | 'unavailable').
 */

const DOMAIN_LABELS = {
  worldenergy: 'World Energy',
  digitalmodel: 'Digital Model',
};
const DOMAIN_COLORS = {
  worldenergy: '#0e7e88',   /* teal-deep (theme accent) */
  digitalmodel: '#0b3d5c',  /* navy (theme structure) */
};

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hfDatasetUrl(dataset) {
  return `https://huggingface.co/datasets/${dataset}`;
}

// Per-table row counts for the little stat strip, e.g. [{count: 10, label: 'fields'}].
function tableStats(cap) {
  return (cap.tables || []).map(t => ({
    count: t.data && typeof t.data.total_rows === 'number' ? t.data.total_rows : null,
    label: t.label || t.config,
    truncated: !!(t.data && t.data.truncated),
  }));
}

// True when at least one table actually has data to show.
function hasData(cap) {
  return (cap.tables || []).some(t => t.data && Array.isArray(t.data.rows) && t.data.rows.length);
}

function renderStatStrip(cap) {
  const stats = tableStats(cap).filter(s => s.count != null);
  if (!stats.length) return '';
  const items = stats.map(s =>
    `<span style="display:inline-block;margin-right:18px;">` +
    `<strong style="font-size:1.4rem;color:#111;">${s.count.toLocaleString('en-US')}</strong> ` +
    `<span style="color:#555;">${escapeHtml(s.label)}</span></span>`
  ).join('');
  return `<div style="margin:14px 0 10px;">${items}</div>`;
}

function renderCard(cap) {
  const domainLabel = DOMAIN_LABELS[cap.domain] || cap.domain;
  const domainColor = DOMAIN_COLORS[cap.domain] || '#444';
  const pending = cap.status === 'pending' || !hasData(cap);

  const badge =
    `<span style="display:inline-block;background:${domainColor};color:#fff;font-size:.72rem;` +
    `font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:3px 10px;border-radius:999px;">` +
    `${escapeHtml(domainLabel)}</span>`;

  // Live vs pending body
  let body;
  let cta;
  if (pending) {
    body =
      `<p style="color:#555;margin:12px 0 6px;">${escapeHtml(cap.summary)}</p>` +
      `<p style="color:#a15c00;font-size:.9rem;margin:8px 0;">— data pending publication</p>`;
    cta =
      `<a href="${escapeHtml(cap.provenance_url)}" style="font-weight:600;color:${domainColor};">` +
      `Follow progress →</a>`;
  } else {
    body =
      `<p style="color:#555;margin:12px 0 4px;">${escapeHtml(cap.summary)}</p>` +
      renderStatStrip(cap) +
      `<p style="color:#777;font-size:.82rem;margin:6px 0 0;">${escapeHtml(cap.data_limits || '')}</p>`;
    cta =
      `<a href="${escapeHtml(detailHref(cap))}" ` +
      `style="font-weight:600;color:${domainColor};">View capability →</a>` +
      `<a href="${escapeHtml(hfDatasetUrl(cap.hf_dataset))}" rel="noopener" ` +
      `style="margin-left:18px;color:#666;font-size:.9rem;">Dataset on Hugging Face ↗</a>`;
  }

  return (
    `<article style="background:#fff;border:1px solid #e6e8eb;border-radius:12px;padding:24px;` +
    `box-shadow:0 1px 3px rgba(0,0,0,.05);display:flex;flex-direction:column;height:100%;">` +
    `<div style="margin-bottom:8px;">${badge}</div>` +
    `<h3 style="margin:6px 0 0;font-size:1.35rem;color:#111;">${escapeHtml(cap.title)}</h3>` +
    `<div style="flex:1 1 auto;">${body}</div>` +
    `<div style="margin-top:16px;">${cta}</div>` +
    `</article>`
  );
}

// ---------------------------------------------------------------------------
// Detail-page rendering (C4, #52): per-capability page with a data table + an
// inline-SVG chart. SVG is generated at build time — no chart library, so it's
// CSP-clean, SEO-indexable, and deterministic.
// ---------------------------------------------------------------------------

const MAX_TABLE_ROWS = 50;
const MAX_BARS = 15;

function detailFileName(cap) {
  return `${cap.id}.html`;
}

// Absolute, root-relative link to a capability's detail page — works whether the card
// is rendered on the homepage (root) or on /capabilities/.
function detailHref(cap) {
  return `/capabilities/${cap.id}.html`;
}

function isNumericDtype(dtype) {
  return /int|float|double|decimal|number/i.test(String(dtype || ''));
}

function formatCell(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? v.toLocaleString('en-US') : v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return escapeHtml(v);
}

// Column display order: highlight_columns first (in declared order), then the rest.
function orderedColumns(table) {
  const cols = (table.data && table.data.columns || []).map(c => c.name);
  const hi = (table.highlight_columns || []).filter(c => cols.includes(c));
  const rest = cols.filter(c => !hi.includes(c));
  return [...hi, ...rest];
}

// Pick (labelKey, valueKey) for a chart: first non-numeric highlight col as label,
// first numeric highlight col as value. Falls back across all columns.
function pickChartKeys(table) {
  const columns = table.data && table.data.columns || [];
  const dtypeOf = name => (columns.find(c => c.name === name) || {}).dtype;
  const pool = (table.highlight_columns && table.highlight_columns.length)
    ? table.highlight_columns.filter(c => columns.some(col => col.name === c))
    : columns.map(c => c.name);
  const valueKey = pool.find(c => isNumericDtype(dtypeOf(c)));
  const labelKey = pool.find(c => c !== valueKey && !isNumericDtype(dtypeOf(c))) || pool.find(c => c !== valueKey);
  return { labelKey, valueKey };
}

function renderTable(table) {
  const rows = (table.data && table.data.rows) || [];
  const cols = orderedColumns(table);
  if (!rows.length || !cols.length) {
    return `<p style="color:#777;">No rows to display.</p>`;
  }
  const shown = rows.slice(0, MAX_TABLE_ROWS);
  const head = cols.map(c => `<th style="text-align:left;padding:8px 12px;border-bottom:2px solid #dde1e5;white-space:nowrap;">${escapeHtml(c)}</th>`).join('');
  const body = shown.map(r =>
    `<tr>` + cols.map(c => `<td style="padding:7px 12px;border-bottom:1px solid #eef1f3;">${formatCell(r[c])}</td>`).join('') + `</tr>`
  ).join('\n');
  const total = table.data.total_rows != null ? table.data.total_rows : rows.length;
  const note = shown.length < total
    ? `<p style="color:#777;font-size:.85rem;margin:8px 0 0;">Showing ${shown.length} of ${total.toLocaleString('en-US')} rows — full table on Hugging Face.</p>`
    : '';
  return (
    `<div style="overflow-x:auto;">` +
    `<table style="border-collapse:collapse;width:100%;font-size:.92rem;">` +
    `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${note}`
  );
}

// Inline-SVG horizontal bar chart. `data` = [{label, value}].
function renderBarChart(data, opts = {}) {
  const { color = '#1d4e89' } = opts;
  const items = data.filter(d => typeof d.value === 'number' && !Number.isNaN(d.value)).slice(0, MAX_BARS);
  if (!items.length) return '';
  const max = Math.max(...items.map(d => d.value), 0) || 1;
  const rowH = 26, gap = 8, labelW = 160, chartW = 460, pad = 8;
  const width = labelW + chartW + pad * 2;
  const height = items.length * (rowH + gap) + pad * 2;
  const bars = items.map((d, i) => {
    const y = pad + i * (rowH + gap);
    const w = Math.max(1, Math.round((d.value / max) * chartW));
    const val = Number.isInteger(d.value) ? d.value.toLocaleString('en-US') : d.value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return (
      `<text x="${labelW - 6}" y="${y + rowH / 2 + 4}" text-anchor="end" font-size="12" fill="#333">${escapeHtml(String(d.label))}</text>` +
      `<rect x="${labelW}" y="${y}" width="${w}" height="${rowH}" rx="3" fill="${color}"></rect>` +
      `<text x="${labelW + w + 6}" y="${y + rowH / 2 + 4}" font-size="12" fill="#333">${val}</text>`
    );
  }).join('');
  return (
    `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" ` +
    `style="max-width:${width}px;height:auto;font-family:inherit;" preserveAspectRatio="xMinYMin meet">${bars}</svg>`
  );
}

// Inline-SVG line chart across the row order. `data` = [{label, value}].
function renderLineChart(data, opts = {}) {
  const { color = '#0b6e4f' } = opts;
  const items = data.filter(d => typeof d.value === 'number' && !Number.isNaN(d.value));
  if (items.length < 2) return renderBarChart(data, opts);
  const max = Math.max(...items.map(d => d.value));
  const min = Math.min(...items.map(d => d.value));
  const span = (max - min) || 1;
  const w = 640, h = 220, pad = 30;
  const step = (w - pad * 2) / (items.length - 1);
  const pts = items.map((d, i) => {
    const x = pad + i * step;
    const y = h - pad - ((d.value - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" style="max-width:${w}px;height:auto;" preserveAspectRatio="xMinYMin meet">` +
    `<polyline fill="none" stroke="${color}" stroke-width="2" points="${pts}"></polyline>` +
    `<text x="${pad}" y="16" font-size="12" fill="#666">max ${max.toLocaleString('en-US')}</text></svg>`
  );
}

function renderChartFor(table) {
  const viz = table.viz;
  if (viz !== 'bar' && viz !== 'line') return '';
  const { labelKey, valueKey } = pickChartKeys(table);
  if (!labelKey || !valueKey) return '';
  const rows = (table.data && table.data.rows) || [];
  let data = rows.map(r => ({ label: r[labelKey], value: r[valueKey] }))
    .filter(d => typeof d.value === 'number' && !Number.isNaN(d.value));
  if (!data.length) return '';
  if (viz === 'bar') {
    data = data.sort((a, b) => b.value - a.value);
    return `<div style="margin:10px 0 6px;">${renderBarChart(data)}</div>` +
      `<p style="color:#777;font-size:.82rem;margin:0 0 4px;">${escapeHtml(valueKey)} by ${escapeHtml(labelKey)} (top ${Math.min(MAX_BARS, data.length)})</p>`;
  }
  return `<div style="margin:10px 0 6px;">${renderLineChart(data)}</div>` +
    `<p style="color:#777;font-size:.82rem;margin:0 0 4px;">${escapeHtml(valueKey)} across ${escapeHtml(labelKey)}</p>`;
}

// The inner body of a capability detail page (no chrome).
function capabilityDetailBody(cap) {
  const domainLabel = DOMAIN_LABELS[cap.domain] || cap.domain;
  const domainColor = DOMAIN_COLORS[cap.domain] || '#444';
  const badge =
    `<span style="display:inline-block;background:${domainColor};color:#fff;font-size:.72rem;font-weight:600;` +
    `letter-spacing:.04em;text-transform:uppercase;padding:3px 10px;border-radius:999px;">${escapeHtml(domainLabel)}</span>`;

  const tables = (cap.tables || []).map(t => {
    const chart = renderChartFor(t);
    return (
      `<section style="margin:28px 0;">` +
      `<h2 style="font-size:1.3rem;color:#111;">${escapeHtml(t.label || t.config)}</h2>` +
      chart +
      renderTable(t) +
      `</section>`
    );
  }).join('\n');

  const provenance =
    `<div style="margin-top:32px;padding:18px 20px;background:#f8f9fa;border-radius:8px;">` +
    `<p style="margin:0 0 6px;"><strong>Source:</strong> ` +
    `<a href="${escapeHtml(hfDatasetUrl(cap.hf_dataset))}" rel="noopener">${escapeHtml(cap.hf_dataset)}</a> on Hugging Face` +
    (cap.provenance_url ? ` · <a href="${escapeHtml(cap.provenance_url)}" rel="noopener">pipeline</a>` : '') + `</p>` +
    (cap.data_limits ? `<p style="margin:0;color:#555;font-size:.9rem;"><strong>Data limits:</strong> ${escapeHtml(cap.data_limits)}</p>` : '') +
    `</div>`;

  return (
    `<a href="/capabilities/" style="color:#666;text-decoration:none;">← All capabilities</a>` +
    `<div style="margin:10px 0 6px;">${badge}</div>` +
    `<h1 style="margin:4px 0 8px;">${escapeHtml(cap.title)}</h1>` +
    `<p style="font-size:1.12rem;color:#444;max-width:760px;">${escapeHtml(cap.summary)}</p>` +
    tables +
    provenance
  );
}

// A full detail-page HTML document (with <include> chrome; rootPath resolved by build.js
// via posthtml expressions). One page per capability, written to dist/capabilities/<id>.html.
function capabilityDetailDocument(cap) {
  const title = `${cap.title} — AceEngineer Capabilities`;
  return (
    `<!DOCTYPE html>\n<html lang="en">\n<head>\n` +
    `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n` +
    `<meta name="description" content="${escapeHtml(cap.summary)}">\n` +
    `<meta property="og:title" content="${escapeHtml(title)}">\n` +
    `<meta property="og:description" content="${escapeHtml(cap.summary)}">\n` +
    `<meta property="og:type" content="website">\n` +
    `<meta property="og:url" content="https://aceengineer.com/capabilities/${escapeHtml(cap.id)}.html">\n` +
    `<title>${escapeHtml(title)}</title>\n` +
    `<include src="partials/head-common.html"></include>\n` +
    `</head>\n<body class="theme-page">\n` +
    `<include src="partials/nav.html"></include>\n` +
    `<section style="padding:40px 0 56px;"><div class="container">\n` +
    capabilityDetailBody(cap) +
    `\n</div></section>\n` +
    `<include src="partials/footer.html"></include>\n` +
    `</body>\n</html>\n`
  );
}

// Render the full grid. `registry` is the hydrated { version, capabilities: [...] }.
function renderCards(registry) {
  const caps = (registry && registry.capabilities || []).filter(c => c.status !== 'withheld');
  if (!caps.length) {
    return `<p style="color:#777;">No capabilities published yet.</p>`;
  }
  const cards = caps.map(cap =>
    `<div style="flex:1 1 340px;max-width:520px;">${renderCard(cap)}</div>`
  ).join('\n');
  return `<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:stretch;">\n${cards}\n</div>`;
}

module.exports = {
  escapeHtml, hfDatasetUrl, tableStats, hasData,
  renderStatStrip, renderCard, renderCards,
  detailFileName, detailHref, formatCell, orderedColumns, pickChartKeys,
  renderTable, renderBarChart, renderLineChart, renderChartFor,
  capabilityDetailBody, capabilityDetailDocument,
  DOMAIN_LABELS, MAX_TABLE_ROWS,
};
