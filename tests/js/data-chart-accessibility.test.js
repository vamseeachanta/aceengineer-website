/** @jest-environment node */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { PALETTE } = require('../../assets/js/data-chart');
const { loadChartBundles } = require('../../scripts/data-charts');
const { SITEMAP_EXCLUDE } = require('../../build');
const fixture = require('./fixtures/data-chart.json');
const read = file => fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
const theme = read('assets/css/theme.css');
const token = name => theme.match(new RegExp(`--${name}:\\s*(#[a-f0-9]+)`, 'i'))[1].toLowerCase();

// WCAG 2.2 (2024), relative-luminance and contrast-ratio definitions:
// https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
// All transfer coefficients and the contrast offset below are from that definition.
function luminance(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map(value => {
    const c = parseInt(value, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('contrast calculation has independent black and white endpoints', () => {
  // By hand: black L=0 and white L=1; (1 + .05) / (0 + .05) = 21.
  expect(contrast('#000000', '#ffffff')).toBe(21);
});

test('chart palette matches house theme and passes WCAG text and graphics contrast', () => {
  expect(PALETTE).toEqual({ data: token('blue'), limit: token('navy'), ink: token('ink'), background: token('bg') });
  // WCAG 2.2 (2024), 1.4.3: normal text >= 4.5:1; 1.4.11: graphics >= 3:1.
  for (const name of ['ink', 'navy', 'muted']) expect(contrast(token(name), token('bg'))).toBeGreaterThanOrEqual(4.5);
  for (const name of ['blue', 'navy']) expect(contrast(token(name), token('bg'))).toBeGreaterThanOrEqual(3);
});

test('example opts into local deferred scripts and has no executable inline code', () => {
  const html = read('content/data/_example/index.html');
  expect(html).toMatch(/<script defer src="\/assets\/js\/plotly-2\.32\.0\.min\.js"><\/script>/);
  expect(html).toMatch(/<script defer src="\/assets\/js\/data-chart\.js"><\/script>/);
  expect(html).not.toMatch(/<script[^>]*>\s*[^<\s]/);
  expect(html).not.toMatch(/\son\w+=/);
  expect(html).toContain('name="robots" content="noindex"');
  expect(SITEMAP_EXCLUDE).toHaveProperty(['data/_example/index.html']);
});

test('built example has no-script data and is excluded from discovery', () => {
  const html = read('dist/data/_example/index.html');
  expect(html).toContain('<table>');
  expect(html).toContain('<td>203</td>');
  expect(html).toContain('<td>223</td>');
  expect(html).not.toContain('<data-chart ');
  expect(html).not.toContain('synthetic-counts');
  expect(read('dist/sitemap.xml')).not.toContain('/data/_example/');
  expect(read('dist/llms.txt')).not.toContain('/data/_example/');
  expect(fs.existsSync(path.join(__dirname, '../../dist/assets/data/charts/synthetic-counts.json'))).toBe(false);
});

describe('build bundle validation', () => {
  let directory;
  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chart-validation-'));
    fs.writeFileSync(path.join(directory, 'synthetic-counts.csv'), 'x,value,year,unit\n2020,2,2020,events\n2021,5,2021,events\n');
  });
  function write(data) { fs.writeFileSync(path.join(directory, 'chart.json'), JSON.stringify(data)); }

  test.each(['unit', 'source', 'date'])('fails on a bundle missing %s', key => {
    const data = JSON.parse(JSON.stringify(fixture));
    if (key === 'date') delete data.source.date;
    else delete data[key];
    write(data);
    expect(() => loadChartBundles(directory)).toThrow(key);
  });

  test('fails on mismatched CSV values, including unused bundles', () => {
    write(fixture);
    fs.writeFileSync(path.join(directory, fixture.csv), 'x,value,year,unit\n2020,2,2020,events\n2021,6,2021,events\n');
    expect(() => loadChartBundles(directory)).toThrow(/CSV differs/);
  });

  test('fails when CSV is absent or IDs collide', () => {
    const data = { ...fixture, csv: 'absent.csv' }; write(data);
    expect(() => loadChartBundles(directory)).toThrow(/ENOENT/);
    write(fixture);
    fs.writeFileSync(path.join(directory, 'duplicate.json'), JSON.stringify(fixture));
    expect(() => loadChartBundles(directory)).toThrow(/Duplicate/);
  });
});
