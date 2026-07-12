const { checkResolution, classify } = require('../../scripts/verify-capabilities-online');

// A live capability with two configs; `main` has columns [a, b], `aux` has [c].
function baseRegistry(overrides = {}) {
  return {
    version: 1,
    capabilities: [{
      id: 'demo', title: 'Demo', domain: 'worldenergy', summary: 's',
      hf_dataset: 'aceengineer/demo', provenance_url: 'u', status: 'live',
      primary_config: 'main', data_limits: 'd',
      withheld_columns: overrides.withheld || [],
      tables: [
        { config: 'main', label: 'Main', viz: 'table', highlight_columns: overrides.mainCols || ['a', 'b'] },
        { config: 'aux', label: 'Aux', viz: 'bar', highlight_columns: ['c'] },
      ],
    }],
  };
}

// A resolver set that "knows" demo -> {main:[a,b], aux:[c]}. Individual behaviours are
// overridable to simulate not-found / transient failures.
function resolvers(opts = {}) {
  const schema = { main: ['a', 'b'], aux: ['c'] };
  return {
    resolveConfigs: opts.resolveConfigs || (async (ds) => {
      if (opts.datasetNotFound) { const e = new Error('HTTP 404'); e.code = 'not_found'; throw e; }
      if (opts.datasetTransient) { const e = new Error('timeout'); e.code = 'transient'; throw e; }
      return Object.keys(schema);
    }),
    fetchColumns: opts.fetchColumns || (async (ds, config) => {
      if (opts.colsTransient) { const e = new Error('HTTP 503'); e.code = 'transient'; throw e; }
      return schema[config] || [];
    }),
  };
}

describe('checkResolution (online gate, mocked)', () => {
  test('passes when dataset, configs, and highlight columns all resolve', async () => {
    const { errors, warnings } = await checkResolution(baseRegistry(), resolvers());
    expect(errors).toEqual([]);
    expect(warnings).toEqual([]);
  });

  test('errors when the dataset does not resolve (404)', async () => {
    const { errors } = await checkResolution(baseRegistry(), resolvers({ datasetNotFound: true }));
    expect(errors.some(e => /does not resolve/.test(e))).toBe(true);
  });

  test('warns (does NOT error) on a transient dataset failure', async () => {
    const { errors, warnings } = await checkResolution(baseRegistry(), resolvers({ datasetTransient: true }));
    expect(errors).toEqual([]);
    expect(warnings.some(w => /could not reach Hugging Face/.test(w))).toBe(true);
  });

  test('errors when a listed config is absent from the dataset', async () => {
    const reg = baseRegistry();
    reg.capabilities[0].tables[0].config = 'ghost';
    reg.capabilities[0].primary_config = 'ghost';
    const { errors } = await checkResolution(reg, resolvers());
    expect(errors.some(e => /config 'ghost' not found/.test(e))).toBe(true);
  });

  test('errors when a highlight column is not a real dataset column', async () => {
    const { errors } = await checkResolution(baseRegistry({ mainCols: ['a', 'nope'] }), resolvers());
    expect(errors.some(e => /highlight column 'nope' is not a column/.test(e))).toBe(true);
  });

  test('errors when a highlight column is also withheld (leak guard, online)', async () => {
    const { errors } = await checkResolution(baseRegistry({ mainCols: ['a'], withheld: ['a'] }), resolvers());
    expect(errors.some(e => /is withheld — would leak/.test(e))).toBe(true);
  });

  test('warns (does NOT error) on transient column-read failure', async () => {
    const { errors, warnings } = await checkResolution(baseRegistry(), resolvers({ colsTransient: true }));
    expect(errors).toEqual([]);
    expect(warnings.some(w => /could not read columns/.test(w))).toBe(true);
  });

  test('skips non-live entries (pending/withheld need no resolvable dataset)', async () => {
    const reg = baseRegistry();
    reg.capabilities[0].status = 'pending';
    reg.capabilities[0].hf_dataset = 'aceengineer/does-not-exist-yet';
    const spy = { resolveConfigs: jest.fn(), fetchColumns: jest.fn() };
    const { errors } = await checkResolution(reg, spy);
    expect(errors).toEqual([]);
    expect(spy.resolveConfigs).not.toHaveBeenCalled();
  });
});

describe('classify', () => {
  test('404 → not_found (blocking)', () => {
    expect(classify(new Error('HTTP 404 for https://x'))).toBe('not_found');
  });
  test('503 / timeout → transient (non-blocking)', () => {
    expect(classify(new Error('HTTP 503 for https://x'))).toBe('transient');
    expect(classify(new Error('The operation was aborted'))).toBe('transient');
  });
});
