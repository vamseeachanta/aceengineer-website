/** @jest-environment jsdom */
'use strict';

// Independent test definition: two synthetic rows (2020, 2) and (2021, 5).
// The increase is 5 - 2 = 3 events; the test limit 4 lies between the rows.
// These inputs are not observed data and must never appear in a built page.
const fs = require('fs');
const path = require('path');
const fixture = require('./fixtures/data-chart.json');
const chart = require('../../assets/js/data-chart');
const { validateCsv, loadChartBundles, renderChart, expandCharts } = require('../../scripts/data-charts');
const fresh = () => JSON.parse(JSON.stringify(fixture));

test('one quantity maps exactly to one x variable, without recalculation', () => {
  const { traces, layout } = chart.plotSpec(fixture);
  expect(traces).toHaveLength(1);
  expect(traces[0].x).toEqual([2020, 2021]);
  expect(traces[0].y).toEqual([2, 5]);
  expect(layout.yaxis.title.text).toBe('Synthetic count (events)');
  expect(layout.xaxis.title.text).toBe('Calendar year (year)');
  expect(traces[0].customdata[1]).toEqual(['events', 2021, fixture.source.name]);
  expect(traces[0].hovertemplate).toContain('%{y}');
  expect(traces[0].hovertemplate).toContain('%{customdata[0]}');
  expect(traces[0].hovertemplate).toContain('%{customdata[2]}');
});

test('limits are horizontal and carry their supplied citation', () => {
  const { layout } = chart.plotSpec(fixture);
  expect(layout.shapes[0]).toMatchObject({ y0: 4, y1: 4, xref: 'paper', x0: 0, x1: 1 });
  expect(layout.shapes[0].line.dash).toBe('dash');
  expect(layout.annotations[0].text).toContain(fixture.limits[0].citation);
  const data = fresh(); data.limits = [];
  expect(chart.plotSpec(data).layout.shapes).toEqual([]);
});

test.each(['unit', 'headline', 'quantity', 'text_alternative', 'id', 'csv'])('rejects missing %s', key => {
  const data = fresh(); delete data[key];
  expect(() => chart.validateBundle(data)).toThrow(key);
});

test.each(['name', 'url', 'date', 'date_kind', 'retrieved_at', 'input_sha256'])('rejects missing source.%s', key => {
  const data = fresh(); delete data.source[key];
  expect(() => chart.validateBundle(data)).toThrow(key);
});

test.each([
  data => { data.source = null; },
  data => { data.source.url = 'javascript:alert(1)'; },
  data => { data.source.date = '2021-02-30'; },
  data => { data.source.retrieved_at = 'yesterday'; },
  data => { data.source.retrieved_at = '2022-01-01T00:00:00+02:00'; },
  data => { data.source.retrieved_at = '2022-01-01T24:00:00Z'; },
  data => { data.source.input_sha256 = 'unknown'; },
  data => { data.csv = '../private.csv'; },
  data => { data.series = []; },
  data => { data.series[0].value = null; },
  data => { data.series[0].value = Infinity; },
  data => { data.series[0].year = 'unknown'; },
  data => { data.series[0].x = {}; },
  data => { data.series[1].x = data.series[0].x; },
  data => { delete data.limits[0].citation; },
  data => { data.limits[0].value = NaN; },
  data => { data.x.unit = ''; }
])('rejects malformed contract case %#', mutate => {
  const data = fresh(); mutate(data);
  expect(() => chart.validateBundle(data)).toThrow();
});

const csv = 'x,value,year,unit\r\n2020,2,2020,events\r\n2021,5,2021,events\r\n';
test('paired CSV preserves values, order, years and units', () => {
  expect(() => validateCsv(fixture, csv)).not.toThrow();
  for (const changed of [csv.replace(',5,', ',6,'), csv.replace('events', 'hours'), csv.replace('2021,5,2021', '2021,5,2020'), csv.replace('2020,2,2020,events\r\n', '')]) {
    expect(() => validateCsv(fixture, changed)).toThrow(/CSV/);
  }
});

test('CSV supports quoted categories and escaped quotes', () => {
  const data = fresh(); data.series[0].x = 'A, "quoted"';
  expect(() => validateCsv(data, csv.replace('2020,2', '"A, ""quoted""",2'))).not.toThrow();
  expect(() => validateCsv(data, csv.replace('2020,2', '"unclosed,2'))).toThrow(/CSV/);
});

test('furniture includes provenance, CSV, a text alternative and readable table', () => {
  document.body.innerHTML = renderChart(fixture, '/assets/data/charts/synthetic-counts.json');
  expect(document.querySelector('h2').textContent).toBe(fixture.headline);
  expect(document.body.textContent).toContain(fixture.source.retrieved_at);
  expect(document.body.textContent).toContain(fixture.source.date);
  expect(document.querySelector('a[download]').getAttribute('href')).toBe('/assets/data/charts/synthetic-counts.csv');
  expect(document.querySelectorAll('tbody tr')).toHaveLength(2);
  expect(document.querySelector('table').textContent).toContain('events');
  expect(document.querySelector('[data-chart-plot]').tabIndex).toBe(0);
  expect(document.body.textContent).toContain(fixture.text_alternative);
});

test('source and headline markup are escaped in HTML and Plotly text', () => {
  const data = fresh(); data.headline = '<img src=x onerror=alert(1)>';
  data.source.name = '<b>unsafe</b>';
  data.limits[0].citation = '<svg onload=alert(1)>';
  document.body.innerHTML = renderChart(data, '/assets/data/charts/synthetic-counts.json');
  expect(document.querySelector('img, svg, b')).toBeNull();
  expect(chart.plotSpec(data).traces[0].customdata[0][2]).toBe('&lt;b&gt;unsafe&lt;/b&gt;');
  expect(chart.plotSpec(data).layout.annotations[0].text).toContain('&lt;svg');
  data.series[0].x = '<b>category</b>'; data.series[1].x = 'other';
  expect(chart.plotSpec(data).traces[0].x[0]).toBe('&lt;b&gt;category&lt;/b&gt;');
});

test('keyboard traversal exposes the same point details and stops at endpoints', async () => {
  document.body.innerHTML = renderChart(fixture, '/assets/data/charts/synthetic-counts.json');
  const root = document.querySelector('[data-chart-bundle]');
  const Plotly = { newPlot: jest.fn().mockResolvedValue(), Fx: { hover: jest.fn() } };
  await chart.render(root, fixture, Plotly);
  const plot = root.querySelector('[data-chart-plot]');
  plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  expect(root.querySelector('[data-chart-status]').textContent).toContain('5 events');
  expect(root.querySelector('[data-chart-status]').textContent).toContain('2021');
  expect(root.querySelector('[data-chart-status]').textContent).toContain(fixture.source.name);
  expect(Plotly.Fx.hover).toHaveBeenLastCalledWith(plot, [{ curveNumber: 0, pointNumber: 1 }]);
  root.querySelector('[data-chart-next]').click();
  expect(Plotly.Fx.hover).toHaveBeenLastCalledWith(plot, [{ curveNumber: 0, pointNumber: 1 }]);
  plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  expect(root.querySelector('[data-chart-status]').textContent).toContain('2 events');
});

test('failed fetch or absent Plotly leaves the table readable', async () => {
  document.body.innerHTML = renderChart(fixture, '/assets/data/charts/synthetic-counts.json');
  const root = document.querySelector('[data-chart-bundle]');
  await chart.mount(root, { fetch: async () => ({ ok: false }), Plotly: {} });
  expect(root.querySelector('[data-chart-status]').textContent).toContain('Use the table');
  expect(root.querySelectorAll('tbody tr')).toHaveLength(2);
  await chart.mount(root, { fetch: async () => ({ ok: true, json: async () => fixture }), Plotly: {} });
  expect(root.querySelector('[data-chart-status]').textContent).toContain('Use the table');
});

test('mount loads the local bundle and enables interaction after Plotly succeeds', async () => {
  document.body.innerHTML = renderChart(fixture, '/assets/data/charts/synthetic-counts.json');
  const root = document.querySelector('[data-chart-bundle]');
  const fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => fixture });
  await chart.mount(root, { fetch, Plotly: { newPlot: async () => {}, Fx: { hover: jest.fn() } } });
  expect(fetch).toHaveBeenCalledWith('/assets/data/charts/synthetic-counts.json');
  expect(root.getAttribute('data-chart-ready')).toBe('true');
  expect(root.querySelector('[data-chart-next]').hidden).toBe(false);
});

test('pages without a chart retain their exact markup', async () => {
  const html = '<!DOCTYPE html><INPUT disabled><p>Existing page</p>';
  expect(await expandCharts(html, new Map())).toBe(html);
});

test('build expands only registered local bundles and rejects duplicate chart IDs', async () => {
  const bundles = new Map([['/assets/data/charts/synthetic-counts.json', fixture]]);
  const html = '<data-chart src="/assets/data/charts/synthetic-counts.json"></data-chart>';
  expect(await expandCharts(html, bundles)).toContain('<table');
  await expect(expandCharts('<data-chart src="https://example.org/x.json"></data-chart>', bundles)).rejects.toThrow();
  await expect(expandCharts(html + html, bundles)).rejects.toThrow(/duplicate/i);
});

test('committed sample matches the cited BSEE calendar-year cards', () => {
  // BSEE, Offshore Incident Statistics, 2023 CY and 2024 CY, Injuries cards.
  // Independently transcribed: 203 and 223 injuries; subtraction: 223 - 203 = 20.
  // This is an OCS-wide illustration, not a GoM-only export or exposure rate.
  const bundles = loadChartBundles();
  const data = bundles.get('/assets/data/charts/bsee-injuries.json');
  expect(data.series).toEqual([{ x: 2023, value: 203, year: 2023 }, { x: 2024, value: 223, year: 2024 }]);
  expect(data.source.date_kind).toBe('reporting-period-end');
  expect(data.limits).toEqual([]);
  expect(fs.readFileSync(path.join(__dirname, '../../content/data/_example/index.html'), 'utf8')).not.toContain('synthetic-counts');
});
