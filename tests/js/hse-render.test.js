/**
 * Render tests for the HSE risk dashboard's INLINE controller script
 * (issue #16 — innerHTML → DOM APIs).
 *
 * tests/js/hse-risk-dashboard.test.js covers the data module. This file drives
 * the real controller IIFE in jsdom and asserts on the DOM it produces, so the
 * innerHTML → createElement refactor is provably render-identical and cannot
 * silently regress.
 *
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const PAGE = path.join(__dirname, '..', '..', 'demos', 'hse-risk-dashboard.html');

const dataModule = require('../../demos/hse-risk-dashboard-data');

function controllerScript() {
  const html = fs.readFileSync(PAGE, 'utf8');
  const blocks = [
    ...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1]);
  const src = blocks.find((b) => b.includes('function updateTable'));
  if (!src) {
    throw new Error('inline dashboard controller not found in ' + PAGE);
  }
  return src;
}

function boot() {
  document.body.innerHTML = [
    '<select id="filter-category"><option value="all">All</option></select>',
    '<select id="filter-depth"><option value="all">All</option></select>',
    '<select id="filter-period"><option value="all">All</option></select>',
    '<button id="btn-reset">Reset</button>',
    '<div class="stats-strip" id="stats-strip"></div>',
    '<table><tbody id="risk-table-body"></tbody></table>',
    '<div id="chart-heatmap"></div>',
    '<div id="chart-bar"></div>',
    '<div id="chart-trend"></div>',
  ].join('');

  window.HseRiskDashboardData = dataModule;
  window.Plotly = { react: jest.fn() };

  window.eval(controllerScript());
}

describe('HSE dashboard controller — no HTML sink', () => {
  test('the inline controller contains no innerHTML assignment', () => {
    expect(controllerScript()).not.toMatch(/innerHTML/);
  });

  test('the unused lower-cased category assignment in colorForScore is gone', () => {
    expect(controllerScript()).not.toMatch(
      /var cat = data\.getRiskCategory\(score\)\.toLowerCase\(\);/
    );
  });

  // colorForScore and badgeHtml are declared but never called anywhere in the
  // page (verified by grep on origin/main). The review's "unused var cat" is a
  // symptom of a wholly dead function, so the whole dead pair goes.
  test.each(['colorForScore', 'badgeHtml'])(
    'the dead helper %s is removed, not merely tidied',
    (name) => {
      expect(controllerScript()).not.toMatch(new RegExp('function\\s+' + name));
    }
  );

  test('the one live helper still builds the score bar', () => {
    expect(controllerScript()).toMatch(/scoreBar/);
  });
});

describe('HSE dashboard controller — stats strip', () => {
  beforeEach(boot);

  test('renders exactly seven stat cards', () => {
    expect(document.querySelectorAll('#stats-strip .stat-card')).toHaveLength(7);
  });

  test('the first card reports the filtered row count', () => {
    const rows = dataModule.filterByWaterDepth(
      dataModule.filterByCategory(dataModule.RISK_DATA, 'all'),
      'all'
    );
    const first = document.querySelector('#stats-strip .stat-card .stat-val');
    expect(first.textContent).toBe(String(rows.length));
  });

  test('the stat labels are unchanged and in order', () => {
    const labels = [...document.querySelectorAll('#stats-strip .stat-lbl')].map(
      (el) => el.textContent
    );
    expect(labels).toEqual([
      'Activity Rows',
      'Total Incidents',
      'Avg Composite',
      'Critical',
      'High',
      'Medium',
      'Low',
    ]);
  });

  test('the severity cards keep their value classes', () => {
    const classes = [...document.querySelectorAll('#stats-strip .stat-val')].map(
      (el) => el.className
    );
    expect(classes).toEqual([
      'stat-val',
      'stat-val',
      'stat-val',
      'stat-val val-critical',
      'stat-val val-high',
      'stat-val val-medium',
      'stat-val val-low',
    ]);
  });

  test('re-rendering replaces the strip rather than appending to it', () => {
    document.getElementById('btn-reset').dispatchEvent(new Event('click'));
    expect(document.querySelectorAll('#stats-strip .stat-card')).toHaveLength(7);
  });
});

describe('HSE dashboard controller — ranked table', () => {
  beforeEach(boot);

  test('renders one row per filtered activity', () => {
    const rows = dataModule.filterByWaterDepth(
      dataModule.filterByCategory(dataModule.RISK_DATA, 'all'),
      'all'
    );
    expect(document.querySelectorAll('#risk-table-body tr')).toHaveLength(
      rows.length
    );
  });

  test('each row has nine cells', () => {
    const first = document.querySelector('#risk-table-body tr');
    expect(first.querySelectorAll('td')).toHaveLength(9);
  });

  test('rows are ordered by descending composite score', () => {
    const bars = [...document.querySelectorAll('#risk-table-body .score-bar-wrap span')].map(
      (el) => parseFloat(el.textContent)
    );
    const sorted = [...bars].sort((a, b) => b - a);
    expect(bars).toEqual(sorted);
  });

  test('the top row carries the highest-scoring activity name as text', () => {
    const rows = dataModule.filterByWaterDepth(
      dataModule.filterByCategory(dataModule.RISK_DATA, 'all'),
      'all'
    );
    const top = rows
      .slice()
      .sort((a, b) => b.composite_score - a.composite_score)[0];
    const firstRowCells = document.querySelectorAll('#risk-table-body tr td');
    expect(firstRowCells[0].textContent).toBe('1');
    expect(firstRowCells[1].textContent).toBe(top.activity_name);
  });

  test('the ranked table carries no risk badges (it never did)', () => {
    // Frozen behaviour: badgeHtml was dead code. The badge legend lives in
    // static page markup, not in the generated rows.
    expect(document.querySelectorAll('#risk-table-body .risk-badge')).toHaveLength(0);
  });

  test('every row renders a score bar with a percentage width and colour', () => {
    const fills = [...document.querySelectorAll('#risk-table-body .score-bar-fill')];
    expect(fills.length).toBe(
      document.querySelectorAll('#risk-table-body tr').length
    );
    fills.forEach((f) => {
      expect(f.style.width).toMatch(/^\d+(\.\d+)?%$/);
      expect(f.style.background).not.toBe('');
    });
  });

  test('confidence cells keep their conf- class and Capitalised label', () => {
    const cells = [...document.querySelectorAll('#risk-table-body tr')].map(
      (tr) => tr.querySelectorAll('td')[8]
    );
    cells.forEach((td) => {
      expect(td.className).toMatch(/^conf-\w+$/);
      expect(td.textContent).toMatch(/^[A-Z][a-z]+$/);
    });
  });

  test('activity names are rendered as text, so markup in data cannot become nodes', () => {
    const nameCells = [...document.querySelectorAll('#risk-table-body tr')].map(
      (tr) => tr.querySelectorAll('td')[1]
    );
    nameCells.forEach((td) => {
      expect(td.children).toHaveLength(0);
    });
  });

  test('re-rendering replaces the table body rather than appending to it', () => {
    const before = document.querySelectorAll('#risk-table-body tr').length;
    document.getElementById('btn-reset').dispatchEvent(new Event('click'));
    expect(document.querySelectorAll('#risk-table-body tr')).toHaveLength(before);
  });
});

describe('HSE dashboard controller — empty states', () => {
  test('an empty filter result renders the placeholder as text', () => {
    boot();
    const select = document.getElementById('filter-category');
    select.innerHTML = '<option value="__none__">None</option>';
    select.value = '__none__';
    select.dispatchEvent(new Event('change'));

    const heatmap = document.getElementById('chart-heatmap');
    expect(heatmap.textContent).toMatch(/No data for selected filters\./);
    expect(document.getElementById('chart-bar').textContent).toMatch(
      /No data for selected filters\./
    );
  });

  test('the empty-state placeholder replaces prior content', () => {
    boot();
    const select = document.getElementById('filter-category');
    select.innerHTML = '<option value="__none__">None</option>';
    select.value = '__none__';
    select.dispatchEvent(new Event('change'));
    expect(document.querySelectorAll('#chart-heatmap p')).toHaveLength(1);
  });
});
