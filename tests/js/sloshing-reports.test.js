/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const R = require('../../assets/js/sloshing-reports');

const cases = [
  { case_id: 'fd-1', evidence_type: 'cfd_validation', status: 'accepted', loading_condition: 'free-decay', period: '3.0', mesh: 'medium' },
  { case_id: 'fr-1', evidence_type: 'cfd_forced_roll', status: 'accepted', loading_condition: 'forced-roll', period: '4.0', mesh: 'medium' },
  { case_id: 'fr-2', evidence_type: 'cfd_forced_roll', status: 'accepted', loading_condition: 'forced-roll', period: '5.0', mesh: 'fine' },
  { case_id: 'verify-1', evidence_type: 'verification', status: 'verification_only', loading_condition: 'forced-roll', period: '4.0', mesh: 'coarse' },
];

const detailedData = {
  cases: [...cases, { case_id: 'pressure-1', evidence_type: 'cfd_forced_roll', status: 'accepted', loading_condition: 'forced_roll', period_s: '2.4', mesh: 'fine', mesh_cells: '160000', timestep_s: '0.001', configured_max_courant: '0.35', solver_class: 'interFoam-compatible', geometry_basis: 'source-neutral tank' }],
  metrics: [
    { case_id: 'pressure-1', quantity: 'max_courant', value: '0.478', unit: 'dimensionless', statistic: 'maximum', qa_status: 'configured_limit_exceeded' },
    { case_id: 'pressure-1', quantity: 'volume_drift', value: '-0.0017', unit: 'percent', statistic: 'full_run', qa_status: 'pass' },
  ],
  series: [
    { series_id: 'p-left-10', case_id: 'pressure-1', quantity: 'wall_pressure', unit: 'Pa', public_location: 'left-inner', z_over_height: '0.1', label: 'Left pressure 10%', qa_status: 'configured_limit_exceeded' },
    { series_id: 'force-x', case_id: 'pressure-1', quantity: 'aggregate_force_x', unit: 'N', public_location: 'aggregate_wall', label: 'Force X', qa_status: 'configured_limit_exceeded' },
    { series_id: 'moment-z', case_id: 'pressure-1', quantity: 'aggregate_moment_z', unit: 'N_m', public_location: 'aggregate_wall', label: 'Moment Z', qa_status: 'configured_limit_exceeded' },
  ],
  samples: [
    { series_id: 'p-left-10', ordinal: '0', x: '0', y: '10' }, { series_id: 'p-left-10', ordinal: '1', x: '1', y: '20' },
    { series_id: 'force-x', ordinal: '0', x: '0', y: '100' }, { series_id: 'force-x', ordinal: '1', x: '1', y: '120' },
    { series_id: 'moment-z', ordinal: '0', x: '0', y: '500' }, { series_id: 'moment-z', ordinal: '1', x: '1', y: '550' },
  ],
  previews: [],
};

describe('state model', () => {
  test('dependent choices never produce a mixed or verification-only case', () => {
    const next = R.reduceState(R.defaultState(cases), { type: 'SELECT', field: 'loading_condition', value: 'forced-roll' }, cases);
    expect(next.case).toBe('fr-1');
    expect(R.optionsFor(cases, next, 'period')).toEqual(['4.0', '5.0']);
    expect(R.selectableCases(cases).map(c => c.case_id)).not.toContain('verify-1');
  });

  test('style changes preserve uirevision while case changes reset it', () => {
    const initial = R.defaultState(cases);
    const styled = R.reduceState(initial, { type: 'STYLE', field: 'theme', value: 'contrast' }, cases);
    const changed = R.reduceState(styled, { type: 'CASE', value: 'fr-2' }, cases);
    expect(styled.uirevision).toBe(initial.uirevision);
    expect(changed.uirevision).not.toBe(styled.uirevision);
  });

  test('URL state has canonical order, round trips, and visibly normalizes invalid input', () => {
    const state = { ...R.defaultState(cases), case: 'fr-2', curves: ['c2', 'c1'], theme: 'contrast', sections: ['plots'] };
    const query = R.serializeState(state);
    expect(query).toMatch(/^v=1&case=fr-2&curves=c1%2Cc2&theme=contrast&lines=/);
    expect(R.parseState(query, cases).state.case).toBe('fr-2');
    const bad = R.parseState('v=99&case=nope&theme=evil', cases);
    expect(bad.normalized).toBe(true);
    expect(bad.state).toEqual(R.defaultState(cases));
  });
});

describe('data and rendering safety', () => {
  test('CSV parser rejects duplicate headers and non-rectangular rows', () => {
    expect(() => R.parseCsv('a,a\n1,2\n')).toThrow(/duplicate/i);
    expect(() => R.parseCsv('a,b\n1\n')).toThrow(/column/i);
  });

  test('stale load cannot replace a newer committed release', async () => {
    const commits = [];
    const gate = R.createLoadGate(value => commits.push(value));
    const first = gate.begin();
    const second = gate.begin();
    expect(gate.commit(first, 'old')).toBe(false);
    expect(gate.commit(second, 'new')).toBe(true);
    expect(commits).toEqual(['new']);
  });

  test('legend synchronization suppresses programmatic feedback loops', () => {
    const sync = R.createLegendSync();
    expect(sync.consume(() => sync.consume(() => {}))).toBe(true);
    expect(sync.consume(() => {})).toBe(true);
  });

  test('detailed histories separate pressure, force, and moment units', () => {
    const selected = detailedData.cases.find(c => c.case_id === 'pressure-1');
    const groups = R.detailedTraceGroups(selected, detailedData, R.defaultState([selected]));
    expect(groups.pressure.map(t => t.name)).toEqual(['Left pressure 10%']);
    expect(groups.force.map(t => t.name)).toEqual(['Force X']);
    expect(groups.moment.map(t => t.name)).toEqual(['Moment Z']);
    expect(groups.pressure[0].y).toEqual([10, 20]);
  });

  test('QA view model exposes source-neutral inputs and flags configured-limit exceedance', () => {
    const selected = detailedData.cases.find(c => c.case_id === 'pressure-1');
    const qa = R.qaViewModel(selected, detailedData);
    expect(qa.inputs).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Time step', value: '0.001', unit: 's' })]));
    expect(qa.mesh).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Mesh cells', value: '160000' })]));
    expect(qa.results).toEqual(expect.arrayContaining([expect.objectContaining({ quantity: 'max_courant', status: 'configured_limit_exceeded' })]));
    expect(qa.preview).toBeNull();
  });
});

describe('DOM accessibility and lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main data-sloshing-report data-report-kind="case" data-manifest-url="../assets/data/sloshing/release/manifest.json" aria-busy="false">
        <p data-report-status role="status" aria-live="polite"></p>
        <div data-report-error role="alert" hidden></div>
        <select data-state-field="case" aria-label="Published CFD case"></select>
        <div data-plot></div><table data-accessible-table><caption>Chart data</caption><tbody></tbody></table>
      </main>`;
  });

  test('mount commits a case, accessible table and Plotly chart atomically', () => {
    const plotly = { react: jest.fn(), Plots: { resize: jest.fn() } };
    const root = document.querySelector('[data-sloshing-report]');
    R.mount(root, { cases, metrics: [], series: [], samples: [] }, { Plotly: plotly, history: window.history });
    expect(root.getAttribute('aria-busy')).toBe('false');
    expect(root.querySelector('[data-state-field="case"]').value).toBe('fd-1');
    expect(root.querySelector('[data-accessible-table] caption')).not.toBeNull();
    expect(plotly.react).toHaveBeenCalledTimes(1);
  });

  test('export controls call Plotly for both accessible formats', () => {
    document.querySelector('[data-sloshing-report]').insertAdjacentHTML('beforeend', '<button data-export="png">PNG</button><button data-export="svg">SVG</button>');
    const plotly = { react: jest.fn(), downloadImage: jest.fn(), Plots: { resize: jest.fn() } };
    const root = document.querySelector('[data-sloshing-report]');
    R.mount(root, { cases, metrics: [], series: [], samples: [] }, { Plotly: plotly, history: window.history });
    root.querySelector('[data-export="png"]').click();
    root.querySelector('[data-export="svg"]').click();
    expect(plotly.downloadImage.mock.calls.map(call => call[1].format)).toEqual(['png', 'svg']);
  });

  test('print lifecycle resizes plots before and after print', () => {
    const resize = jest.fn();
    const cleanup = R.bindPrintLifecycle(document.querySelector('[data-sloshing-report]'), { Plots: { resize } }, window);
    window.dispatchEvent(new Event('beforeprint'));
    window.dispatchEvent(new Event('afterprint'));
    expect(resize).toHaveBeenCalledTimes(2);
    cleanup();
  });

  test('individual report renders detailed histories into distinct Plotly regions', () => {
    document.body.innerHTML = `<main data-sloshing-report data-report-kind="case"><p data-report-status></p><select data-state-field="case"></select><div data-plot-group="pressure"></div><div data-plot-group="force"></div><div data-plot-group="moment"></div><table data-accessible-table><caption>Data</caption><tbody></tbody></table></main>`;
    history.replaceState(null, '', '?v=1&case=pressure-1&curves=&theme=light&lines=normal&markers=on&density=comfortable&sections=overview%2Cplots%2Cdata');
    const plotly = { react: jest.fn(), Plots: { resize: jest.fn() } };
    R.mount(document.querySelector('main'), detailedData, { Plotly: plotly, history });
    expect(plotly.react).toHaveBeenCalledTimes(3);
    expect(plotly.react.mock.calls.map(call => call[2].yaxis.title)).toEqual(['Pressure (Pa)', 'Force (N)', 'Moment (N·m)']);
  });
});

describe('report templates and standalone styles', () => {
  const root = path.resolve(__dirname, '..', '..');
  for (const name of ['sloshing-cfd-case', 'sloshing-tank-summary', 'sloshing-cfd-analysis']) {
    test(`${name} uses site partials, vendored Plotly, relative CSS, and semantic controls`, () => {
      const html = fs.readFileSync(path.join(root, 'content/reports', `${name}.html`), 'utf8');
      expect(html).toContain('rootPath: "../"');
      expect(html).toContain('<include src="partials/head-common.html"');
      expect(html).toContain('assets/js/plotly-2.32.0.min.js');
      expect(html).toContain('assets/css/sloshing-reports.css');
      expect(html).toMatch(/<fieldset[\s>]/);
      expect(html).toContain('data-accessible-table');
      expect(html).toContain('role="status"');
      expect(html).toContain('data-state-field="loading_condition"');
      expect(html).toContain('data-state-field="period"');
      expect(html).toContain('data-state-field="mesh"');
      expect(html).not.toMatch(/cdn\.plot\.ly|huggingface\.co/);
    });
  }

  test('case report has distinct pressure and aggregate-load history regions', () => {
    const html = fs.readFileSync(path.join(root, 'content/reports/sloshing-cfd-case.html'), 'utf8');
    expect(html).toContain('data-plot-group="pressure"');
    expect(html).toContain('data-plot-group="force"');
    expect(html).toContain('data-plot-group="moment"');
    expect(html).not.toContain('Pressure-tap and sectional series are not published');
  });

  test('analysis report contains inputs, mesh quality, reviewed preview, and QA result regions', () => {
    const html = fs.readFileSync(path.join(root, 'content/reports/sloshing-cfd-analysis.html'), 'utf8');
    for (const attr of ['data-qa-inputs', 'data-qa-mesh', 'data-qa-preview', 'data-qa-results']) expect(html).toContain(attr);
    expect(html).toMatch(/No reviewed animation preview is published/);
  });

  test('CSS defines focus, reduced-motion, selected-section, and print behavior', () => {
    const css = fs.readFileSync(path.join(root, 'assets/css/sloshing-reports.css'), 'utf8');
    expect(css).toMatch(/:focus-visible/);
    expect(css).toMatch(/prefers-reduced-motion/);
    expect(css).toMatch(/@media\s+print/);
    expect(css).toMatch(/data-print-excluded/);
    expect(css).toMatch(/modebar/);
  });
});
