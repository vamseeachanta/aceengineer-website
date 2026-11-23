const fs = require('fs');
const os = require('os');
const path = require('path');
const hf = require('../../scripts/hf-fetch');

// Build a fake datasets-server /rows payload with `total` rows; honors offset/length.
function rowsPayload(total, offset, length) {
  const rows = [];
  for (let i = offset; i < Math.min(offset + length, total); i++) {
    rows.push({ row_idx: i, row: { name: `r${i}`, n: i } });
  }
  return {
    features: [
      { feature_idx: 1, name: 'n', type: { dtype: 'int64' } },
      { feature_idx: 0, name: 'name', type: { dtype: 'string' } },
    ],
    rows,
    num_rows_total: total,
  };
}

// Install a mock global.fetch that serves /rows for a dataset of `total` rows.
function mockFetch(total) {
  const orig = global.fetch;
  global.fetch = async (url) => {
    const u = new URL(url);
    const offset = Number(u.searchParams.get('offset') || 0);
    const length = Number(u.searchParams.get('length') || 100);
    return { ok: true, json: async () => rowsPayload(total, offset, length) };
  };
  return () => { global.fetch = orig; };
}

let tmpDir;
beforeEach(() => { tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hfcache-')); });
afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

describe('normalize', () => {
  test('orders columns by feature_idx and flattens rows', () => {
    const out = hf.normalize(rowsPayload(3, 0, 100), 'owner/ds', 'main');
    expect(out.columns.map(c => c.name)).toEqual(['name', 'n']);
    expect(out.columns[0].dtype).toBe('string');
    expect(out.rows).toEqual([{ name: 'r0', n: 0 }, { name: 'r1', n: 1 }, { name: 'r2', n: 2 }]);
    expect(out.total_rows).toBe(3);
  });
});

describe('fetchTable', () => {
  test('caps at maxRows and flags truncation', async () => {
    const restore = mockFetch(50);
    try {
      const out = await hf.fetchTable('owner/ds', 'main', { maxRows: 10 });
      expect(out.fetched).toBe(10);
      expect(out.total_rows).toBe(50);
      expect(out.truncated).toBe(true);
    } finally { restore(); }
  });

  test('paginates across multiple 100-row pages', async () => {
    const restore = mockFetch(150);
    try {
      const out = await hf.fetchTable('owner/ds', 'main', { maxRows: 150 });
      expect(out.fetched).toBe(150);
      expect(out.rows[149]).toEqual({ name: 'r149', n: 149 });
      expect(out.truncated).toBe(false);
    } finally { restore(); }
  });
});

describe('snapshot IO', () => {
  test('round-trips and strips the transient source field; sanitizes the path', () => {
    const data = { dataset: 'aceengineer/worldenergydata-explorer', config: 'fields',
      columns: [{ name: 'a', dtype: 'string' }], rows: [{ a: '1' }], total_rows: 1,
      fetched: 1, truncated: false, source: 'live' };
    const p = hf.writeSnapshot(tmpDir, data);
    expect(path.basename(p)).toBe('aceengineer__worldenergydata-explorer__fields.json');
    const back = hf.readSnapshot(tmpDir, 'aceengineer/worldenergydata-explorer', 'fields');
    expect(back.rows).toEqual([{ a: '1' }]);
    expect(back.source).toBeUndefined();
  });

  test('readSnapshot returns null when absent', () => {
    expect(hf.readSnapshot(tmpDir, 'x/y', 'z')).toBeNull();
  });
});

describe('hydrateRegistry', () => {
  const reg = () => ({ capabilities: [
    { id: 'c', status: 'live', hf_dataset: 'owner/ds',
      tables: [{ config: 'main', highlight_columns: ['name'] }] },
    { id: 'w', status: 'withheld', hf_dataset: 'owner/secret',
      tables: [{ config: 'x', highlight_columns: ['a'] }] },
  ] });

  test('offline: reads snapshot → data_source snapshot; skips withheld', async () => {
    hf.writeSnapshot(tmpDir, { dataset: 'owner/ds', config: 'main',
      columns: [{ name: 'name', dtype: 'string' }], rows: [{ name: 'r0' }], total_rows: 1 });
    const r = reg();
    await hf.hydrateRegistry(r, { snapshotDir: tmpDir, live: false });
    expect(r.capabilities[0].tables[0].data_source).toBe('snapshot');
    expect(r.capabilities[0].tables[0].data.rows).toEqual([{ name: 'r0' }]);
    expect(r.capabilities[1].tables[0].data).toBeUndefined(); // withheld untouched
  });

  test('offline with no snapshot → unavailable, never throws', async () => {
    const r = reg();
    await expect(hf.hydrateRegistry(r, { snapshotDir: tmpDir, live: false })).resolves.toBeDefined();
    expect(r.capabilities[0].tables[0].data_source).toBe('unavailable');
  });

  test('live: fetches → data_source live', async () => {
    const restore = mockFetch(3);
    try {
      const r = reg();
      await hf.hydrateRegistry(r, { snapshotDir: tmpDir, live: true });
      expect(r.capabilities[0].tables[0].data_source).toBe('live');
      expect(r.capabilities[0].tables[0].data.total_rows).toBe(3);
    } finally { restore(); }
  });

  test('live failure falls back to snapshot without throwing', async () => {
    hf.writeSnapshot(tmpDir, { dataset: 'owner/ds', config: 'main',
      columns: [{ name: 'name', dtype: 'string' }], rows: [{ name: 'cached' }], total_rows: 1 });
    const orig = global.fetch;
    global.fetch = async () => { throw new Error('network down'); };
    try {
      const r = reg();
      await hf.hydrateRegistry(r, { snapshotDir: tmpDir, live: true, logger: () => {} });
      expect(r.capabilities[0].tables[0].data_source).toBe('snapshot');
      expect(r.capabilities[0].tables[0].data.rows).toEqual([{ name: 'cached' }]);
    } finally { global.fetch = orig; }
  });
});
