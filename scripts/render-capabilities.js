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
  worldenergy: '#0b6e4f',
  digitalmodel: '#1d4e89',
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
      `<a href="${escapeHtml(hfDatasetUrl(cap.hf_dataset))}" rel="noopener" ` +
      `style="font-weight:600;color:${domainColor};">Explore data on Hugging Face →</a>`;
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
  DOMAIN_LABELS,
};
