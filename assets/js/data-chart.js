/* One public chart bundle, without unit conversion or derived engineering values.
 * Field requirements: public chart-bundle contract, issue #1679 (2026).
 * Plotly hovertemplate/customdata: https://plotly.com/javascript/hover-text-and-formatting/
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.DataChart = api;
    const start = () => root.document.querySelectorAll('[data-chart-bundle]').forEach(section => api.mount(section));
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
}(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  // House tokens, assets/css/theme.css. A single hue for data; dashed references
  // and square markers convey meaning without red/green discrimination (WCAG 2.2, 1.4.1).
  const PALETTE = Object.freeze({ data: '#2364aa', limit: '#0b3d5c', ink: '#26323a', background: '#ffffff' });
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const required = (value, field) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`Chart requires ${field}`);
  };
  const dateOnly = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

  function validateBundle(bundle) {
    if (!bundle || typeof bundle !== 'object') throw new Error('Chart requires a bundle');
    for (const field of ['id', 'headline', 'quantity', 'unit', 'text_alternative', 'csv']) required(bundle[field], field);
    if (!/^[a-z][a-z0-9-]*$/.test(bundle.id)) throw new Error('Invalid chart id');
    if (!/^[a-z][a-z0-9-]*\.csv$/.test(bundle.csv)) throw new Error('Invalid chart csv filename');
    if (!bundle.x) throw new Error('Chart requires x');
    required(bundle.x.variable, 'x.variable'); required(bundle.x.unit, 'x.unit');
    if (!bundle.source) throw new Error('Chart requires source');
    for (const field of ['name', 'url', 'date', 'date_kind', 'retrieved_at', 'input_sha256']) required(bundle.source[field], `source.${field}`);
    const source = bundle.source;
    let url;
    try { url = new URL(source.url); } catch { throw new Error('Invalid source.url'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid source.url');
    if (!dateOnly(source.date)) throw new Error('Invalid source.date');
    if (!['publication', 'reporting-period-end'].includes(source.date_kind)) throw new Error('Invalid source.date_kind');
    // RFC 3339 UTC spelling; a real calendar date is checked separately.
    if (!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?Z$/.test(source.retrieved_at)
      || !dateOnly(source.retrieved_at.slice(0, 10)) || !Number.isFinite(Date.parse(source.retrieved_at))) throw new Error('Invalid source.retrieved_at');
    if (Date.parse(source.date) > Date.parse(source.retrieved_at)) throw new Error('source.date follows retrieval');
    if (!/^[a-f0-9]{64}$/.test(source.input_sha256)) throw new Error('Invalid source.input_sha256');
    if (!Array.isArray(bundle.series) || !bundle.series.length) throw new Error('Chart requires series values');
    const seen = new Set();
    let xType;
    for (const row of bundle.series) {
      if (!row || !Number.isFinite(row.value) || !Number.isInteger(row.year)) throw new Error('Invalid series value or year');
      if (!(typeof row.x === 'number' && Number.isFinite(row.x)) && !(typeof row.x === 'string' && row.x.trim())) throw new Error('Invalid series x');
      if (xType && xType !== typeof row.x) throw new Error('Mixed series x types');
      xType = typeof row.x;
      if (seen.has(row.x)) throw new Error('Duplicate series x');
      seen.add(row.x);
    }
    if (!Array.isArray(bundle.limits)) throw new Error('Chart requires limits (an empty array if none are supplied)');
    for (const limit of bundle.limits) {
      if (!limit || !Number.isFinite(limit.value)) throw new Error('Invalid limit value');
      required(limit.label, 'limit.label'); required(limit.citation, 'limit.citation');
    }
    return bundle;
  }

  function plotSpec(bundle, palette = PALETTE) {
    validateBundle(bundle);
    return {
      traces: [{
        type: 'scatter', mode: 'lines+markers',
        x: bundle.series.map(row => typeof row.x === 'string' ? escape(row.x) : row.x), y: bundle.series.map(row => row.value),
        // Escape all bundle strings handed to Plotly's formatted-text parser.
        customdata: bundle.series.map(row => [escape(bundle.unit), row.year, escape(bundle.source.name)]),
        name: escape(bundle.quantity),
        hovertemplate: '%{y} %{customdata[0]}<br>Year: %{customdata[1]}<br>Source: %{customdata[2]}<extra></extra>',
        line: { color: palette.data }, marker: { color: palette.data, symbol: 'square' }
      }],
      layout: {
        paper_bgcolor: palette.background, plot_bgcolor: palette.background, font: { color: palette.ink },
        xaxis: { title: { text: escape(`${bundle.x.variable} (${bundle.x.unit})`) }, type: typeof bundle.series[0].x === 'string' ? 'category' : 'linear', automargin: true },
        yaxis: { title: { text: escape(`${bundle.quantity} (${bundle.unit})`) }, automargin: true },
        showlegend: false, dragmode: false, hovermode: 'closest',
        shapes: bundle.limits.map(limit => ({ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: limit.value, y1: limit.value, line: { color: palette.limit, dash: 'dash' } })),
        annotations: bundle.limits.map(limit => ({ xref: 'paper', x: 0, y: limit.value, xanchor: 'left', yanchor: 'bottom', showarrow: false,
          text: escape(`${limit.label}: ${limit.value} ${bundle.unit} — ${limit.citation}`), font: { color: palette.limit } }))
      }
    };
  }

  async function render(section, bundle, Plotly) {
    validateBundle(bundle);
    if (!Plotly || !Plotly.newPlot || !Plotly.Fx) throw new Error('Plotly unavailable');
    const plot = section.querySelector('[data-chart-plot]');
    const status = section.querySelector('[data-chart-status]');
    const previous = section.querySelector('[data-chart-previous]');
    const next = section.querySelector('[data-chart-next]');
    const style = section.ownerDocument.defaultView.getComputedStyle(section);
    const token = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    const palette = { data: token('--blue', PALETTE.data), limit: token('--navy', PALETTE.limit), ink: token('--ink', PALETTE.ink), background: token('--bg', PALETTE.background) };
    const spec = plotSpec(bundle, palette);
    await Plotly.newPlot(plot, spec.traces, spec.layout, { responsive: true, displayModeBar: false, displaylogo: false });
    let index = 0;
    function select(value, hover = true) {
      index = Math.max(0, Math.min(bundle.series.length - 1, value));
      const row = bundle.series[index];
      status.textContent = `${bundle.x.variable}: ${row.x}; ${row.value} ${bundle.unit}; year ${row.year}; source: ${bundle.source.name}.`;
      previous.disabled = index === 0;
      next.disabled = index === bundle.series.length - 1;
      if (hover) Plotly.Fx.hover(plot, [{ curveNumber: 0, pointNumber: index }]);
    }
    previous.hidden = false; next.hidden = false;
    previous.onclick = () => select(index - 1);
    next.onclick = () => select(index + 1);
    plot.onkeydown = event => {
      const keys = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: bundle.series.length - 1 };
      if (Object.prototype.hasOwnProperty.call(keys, event.key)) { event.preventDefault(); select(keys[event.key]); }
    };
    select(0, false);
    section.setAttribute('data-chart-ready', 'true');
  }

  async function mount(section, dependencies = {}) {
    try {
      const response = await (dependencies.fetch || window.fetch.bind(window))(section.getAttribute('data-chart-bundle'));
      if (!response.ok) throw new Error('Bundle unavailable');
      await render(section, await response.json(), dependencies.Plotly || window.Plotly);
    } catch {
      section.querySelector('[data-chart-status]').textContent = 'Chart unavailable. Use the table and Download CSV link below.';
    }
  }

  return { validateBundle, plotSpec, render, mount, escape, PALETTE };
}));
