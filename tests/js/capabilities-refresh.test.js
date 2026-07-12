/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');
const R = require('../../assets/js/capabilities-refresh');
const { capabilityDetailBody, capabilityDetailDocument } = require('../../scripts/render-capabilities');

describe('CSP allows the datasets-server origin (C6)', () => {
  test('vercel.json connect-src includes the Hugging Face datasets-server', () => {
    const vercel = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'vercel.json'), 'utf8'));
    const csp = vercel.headers
      .flatMap(h => h.headers)
      .find(h => h.key === 'Content-Security-Policy').value;
    const connectSrc = csp.split(';').map(s => s.trim()).find(s => s.startsWith('connect-src'));
    expect(connectSrc).toContain('https://datasets-server.huggingface.co');
    // the refresh script itself is self-hosted, so script-src needs no new origin
    const scriptSrc = csp.split(';').map(s => s.trim()).find(s => s.startsWith('script-src'));
    expect(scriptSrc).toContain("'self'");
  });
});

// A datasets-server /rows payload with two columns (label + numeric) and two rows.
function rowsPayload() {
  return {
    features: [
      { feature_idx: 1, name: 'sn_curve', type: { dtype: 'string' } },
      { feature_idx: 0, name: 'damage', type: { dtype: 'float64' } },
    ],
    rows: [
      { row: { sn_curve: 'B1', damage: 0.42 } },
      { row: { sn_curve: 'D', damage: 0.91 } },
    ],
    num_rows_total: 312,
  };
}

describe('pure render helpers', () => {
  test('normalize sorts columns by feature_idx and unwraps rows', () => {
    const d = R.normalize(rowsPayload());
    expect(d.columns.map(c => c.name)).toEqual(['damage', 'sn_curve']); // feature_idx 0,1
    expect(d.rows).toEqual([{ sn_curve: 'B1', damage: 0.42 }, { sn_curve: 'D', damage: 0.91 }]);
    expect(d.total_rows).toBe(312);
  });

  test('orderColumns puts highlight columns first', () => {
    const cols = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    expect(R.orderColumns(cols, ['c', 'a'])).toEqual(['c', 'a', 'b']);
  });

  test('tableHtml renders a header, cells, and a truncation note', () => {
    const data = R.normalize(rowsPayload());
    const html = R.tableHtml(data, ['sn_curve', 'damage']);
    expect(html).toContain('<th');
    expect(html).toContain('B1');
    expect(html).toContain('Showing 2 of 312 rows');
  });

  test('pickKeys picks non-numeric label + numeric value', () => {
    const data = R.normalize(rowsPayload());
    const keys = R.pickKeys(data.columns, ['sn_curve', 'damage']);
    expect(keys.labelKey).toBe('sn_curve');
    expect(keys.valueKey).toBe('damage');
  });

  test('chartHtml emits an SVG for a bar viz', () => {
    const data = R.normalize(rowsPayload());
    const html = R.chartHtml('bar', data, ['sn_curve', 'damage']);
    expect(html).toContain('<svg');
    expect(html).toContain('damage by sn_curve');
  });

  test('chartHtml is empty for a plain table viz', () => {
    const data = R.normalize(rowsPayload());
    expect(R.chartHtml('table', data, ['sn_curve', 'damage'])).toBe('');
  });

  test('rowsUrl targets the datasets-server /rows endpoint with encoding', () => {
    const url = R.rowsUrl('aceengineer/demo', 'main', 'train', 100);
    expect(url).toContain('https://datasets-server.huggingface.co/rows');
    expect(url).toContain('dataset=aceengineer%2Fdemo');
    expect(url).toContain('config=main');
    expect(url).toContain('length=100');
  });
});

// Build a detail-page-style section with a [data-cap-render] target holding baked markup.
function makeSection() {
  const section = document.createElement('section');
  section.setAttribute('data-cap-table', '');
  section.setAttribute('data-hf-dataset', 'aceengineer/demo');
  section.setAttribute('data-hf-config', 'mooring_fatigue');
  section.setAttribute('data-hf-split', 'train');
  section.setAttribute('data-viz', 'bar');
  section.setAttribute('data-highlight', JSON.stringify(['sn_curve', 'damage']));
  section.innerHTML = '<div data-cap-render><p>BAKED PLACEHOLDER</p></div>';
  document.body.appendChild(section);
  return section;
}

describe('refreshSection (client fetch + re-render)', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('re-renders the target from a successful fetch', async () => {
    const section = makeSection();
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, json: async () => rowsPayload() });
    const ok = await R.refreshSection(section, fetchImpl);
    expect(ok).toBe(true);
    const target = section.querySelector('[data-cap-render]');
    expect(target.innerHTML).not.toContain('BAKED PLACEHOLDER');
    expect(target.innerHTML).toContain('B1');
    expect(target.innerHTML).toContain('<svg'); // chart re-rendered too
    // requested the right dataset/config
    expect(fetchImpl.mock.calls[0][0]).toContain('config=mooring_fatigue');
  });

  test('graceful degradation: a failed fetch leaves the baked markup intact', async () => {
    const section = makeSection();
    const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
    const ok = await R.refreshSection(section, fetchImpl);
    expect(ok).toBe(false);
    expect(section.querySelector('[data-cap-render]').innerHTML).toContain('BAKED PLACEHOLDER');
  });

  test('a non-ok HTTP response also leaves baked markup intact', async () => {
    const section = makeSection();
    const fetchImpl = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
    const ok = await R.refreshSection(section, fetchImpl);
    expect(ok).toBe(false);
    expect(section.querySelector('[data-cap-render]').innerHTML).toContain('BAKED PLACEHOLDER');
  });
});

describe('onRefresh (status + button state)', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('reports success status when all sections refresh', async () => {
    makeSection();
    const btn = document.createElement('button');
    const statusEl = document.createElement('span');
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true, json: async () => rowsPayload() });
    await R.onRefresh(document, btn, statusEl, fetchImpl);
    expect(statusEl.textContent).toMatch(/Updated just now/);
    expect(btn.disabled).toBe(false);
  });

  test('reports a graceful failure status when refresh is unavailable', async () => {
    makeSection();
    const btn = document.createElement('button');
    const statusEl = document.createElement('span');
    const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
    await R.onRefresh(document, btn, statusEl, fetchImpl);
    expect(statusEl.textContent).toMatch(/showing baked data/);
  });
});

describe('detail page wires the refresh affordance', () => {
  const cap = {
    id: 'mooring-fatigue', title: 'Mooring Fatigue', domain: 'digitalmodel',
    summary: 's', hf_dataset: 'aceengineer/demo', provenance_url: 'https://x', status: 'live',
    primary_config: 'mooring_fatigue', data_limits: 'd',
    tables: [{
      config: 'mooring_fatigue', label: 'Mooring Fatigue', viz: 'bar',
      highlight_columns: ['sn_curve', 'damage'],
      data: {
        columns: [{ name: 'sn_curve', dtype: 'string' }, { name: 'damage', dtype: 'float64' }],
        rows: [{ sn_curve: 'B1', damage: 0.42 }], total_rows: 312,
      },
    }],
  };

  test('body includes data attributes, a swap target, and a refresh button', () => {
    const body = capabilityDetailBody(cap);
    expect(body).toContain('data-cap-table');
    expect(body).toContain('data-hf-config="mooring_fatigue"');
    expect(body).toContain('data-cap-render');
    expect(body).toContain('data-refresh-capabilities');
    expect(body).toContain('data-highlight="[&quot;sn_curve&quot;,&quot;damage&quot;]"');
  });

  test('document includes the refresh script', () => {
    expect(capabilityDetailDocument(cap)).toContain('/assets/js/capabilities-refresh.js');
  });

  test('a pending capability (no data) gets no refresh button', () => {
    const pending = Object.assign({}, cap, { status: 'pending', tables: [Object.assign({}, cap.tables[0], { data: null })] });
    expect(capabilityDetailBody(pending)).not.toContain('data-refresh-capabilities');
  });
});
