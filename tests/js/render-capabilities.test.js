const fs = require('fs');
const path = require('path');
const {
  escapeHtml, renderCard, renderCards, hfDatasetUrl,
  renderTable, pickChartKeys, renderChartFor, renderBarChart,
  capabilityDetailDocument, detailFileName, orderedColumns,
} = require('../../scripts/render-capabilities');

const repoRoot = path.resolve(__dirname, '..', '..');

// A hydrated-registry fixture (shape produced by C2's hydrateRegistry).
function liveCap(over = {}) {
  return {
    id: 'field-explorer', title: 'World Energy Field Explorer', domain: 'worldenergy',
    summary: 'Global offshore field drill-down.', hf_dataset: 'aceengineer/worldenergydata-explorer',
    provenance_url: 'https://github.com/vamseeachanta/worldenergydata', status: 'live',
    data_limits: 'Coverage is primarily US Gulf of Mexico.',
    tables: [
      { config: 'fields', label: 'Fields', data: { total_rows: 10, rows: [{ a: 1 }] }, data_source: 'snapshot' },
      { config: 'wells', label: 'Wells', data: { total_rows: 56, rows: [{ a: 1 }] }, data_source: 'snapshot' },
    ],
    ...over,
  };
}

describe('escapeHtml', () => {
  test('escapes HTML-significant characters', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });
});

describe('renderCard (live)', () => {
  const html = renderCard(liveCap());
  test('links to the internal detail page and, secondarily, the HF dataset', () => {
    expect(html).toContain('World Energy Field Explorer');
    expect(html).toContain('World Energy');
    expect(html).toContain('href="/capabilities/field-explorer.html"');
    expect(html).toContain('View capability');
    expect(html).toContain(hfDatasetUrl('aceengineer/worldenergydata-explorer'));
  });
  test('shows per-table stat counts and the data-limits note', () => {
    expect(html).toContain('>10<');
    expect(html).toContain('>56<');
    expect(html).toContain('Coverage is primarily US Gulf of Mexico.');
  });
});

describe('renderCard (pending / no data)', () => {
  test('renders a placeholder linking to provenance, not an HF explore link', () => {
    const html = renderCard(liveCap({ status: 'pending', tables: [{ config: 'x', label: 'X', data: null, data_source: 'unavailable' }] }));
    expect(html).toContain('data pending');
    expect(html).toContain('Follow progress');
    expect(html).toContain('github.com/vamseeachanta/worldenergydata');
    expect(html).not.toContain('Explore data on Hugging Face');
  });
});

describe('renderCards', () => {
  test('filters out withheld capabilities', () => {
    const reg = { capabilities: [liveCap(), liveCap({ id: 'secret', title: 'Secret', status: 'withheld' })] };
    const html = renderCards(reg);
    expect(html).toContain('World Energy Field Explorer');
    expect(html).not.toContain('Secret');
  });
  test('handles an empty registry', () => {
    expect(renderCards({ capabilities: [] })).toContain('No capabilities');
  });
});

// A table fixture in the hydrated shape (columns carry dtypes; rows are objects).
function tableFixture(over = {}) {
  return {
    config: 'countries', label: 'Countries', viz: 'bar',
    highlight_columns: ['country', 'fields', 'facilities'],
    data: {
      columns: [
        { name: 'country', dtype: 'string' },
        { name: 'fields', dtype: 'int64' },
        { name: 'facilities', dtype: 'int64' },
        { name: 'badge', dtype: 'string' },
      ],
      rows: [
        { country: 'USA', fields: 30, facilities: 12, badge: 'x' },
        { country: 'Norway', fields: 18, facilities: 9, badge: 'y' },
      ],
      total_rows: 84,
    },
    ...over,
  };
}

describe('renderTable', () => {
  test('orders highlight columns first, then the rest', () => {
    expect(orderedColumns(tableFixture())).toEqual(['country', 'fields', 'facilities', 'badge']);
  });
  test('renders cells and a truncation note when rows exceed the cap', () => {
    const html = renderTable(tableFixture());
    expect(html).toContain('USA');
    expect(html).toContain('Showing 2 of 84 rows');
  });
  test('escapes cell content', () => {
    const t = tableFixture();
    t.data.rows = [{ country: '<script>', fields: 1, facilities: 1, badge: '' }];
    expect(renderTable(t)).toContain('&lt;script&gt;');
    expect(renderTable(t)).not.toContain('<script>');
  });
});

describe('charts', () => {
  test('pickChartKeys chooses a string label and a numeric value', () => {
    expect(pickChartKeys(tableFixture())).toEqual({ labelKey: 'country', valueKey: 'fields' });
  });
  test('renderChartFor emits an SVG bar chart for viz:bar', () => {
    const html = renderChartFor(tableFixture());
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
    expect(html).toContain('fields by country');
  });
  test('renderChartFor returns empty for viz:table', () => {
    expect(renderChartFor(tableFixture({ viz: 'table' }))).toBe('');
  });
  test('renderBarChart sorts by value and caps bars', () => {
    const svg = renderBarChart([{ label: 'a', value: 1 }, { label: 'b', value: 5 }]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('>a<');
    expect(svg).toContain('>b<');
  });
});

describe('capabilityDetailDocument', () => {
  const cap = {
    id: 'field-explorer', title: 'World Energy Field Explorer', domain: 'worldenergy',
    summary: 'Global drill-down.', hf_dataset: 'aceengineer/worldenergydata-explorer',
    provenance_url: 'https://github.com/vamseeachanta/worldenergydata', status: 'live',
    data_limits: 'GoM-focused.', tables: [tableFixture()],
  };
  const doc = capabilityDetailDocument(cap);
  test('is a full document with chrome includes and the title', () => {
    expect(doc).toContain('<!DOCTYPE html>');
    expect(doc).toContain('partials/nav.html');
    expect(doc).toContain('partials/footer.html');
    expect(doc).toContain('World Energy Field Explorer — AceEngineer Capabilities');
  });
  test('includes the table, chart, back-link, and provenance', () => {
    expect(doc).toContain('All capabilities');
    expect(doc).toContain('<svg');
    expect(doc).toContain('<table');
    expect(doc).toContain('aceengineer/worldenergydata-explorer');
    expect(doc).toContain('Data limits');
  });
  test('detailFileName is <id>.html', () => {
    expect(detailFileName(cap)).toBe('field-explorer.html');
  });
});

describe('page wiring', () => {
  test('content/capabilities/index.html injects the capabilitiesCards local', () => {
    const src = fs.readFileSync(path.join(repoRoot, 'content', 'capabilities', 'index.html'), 'utf8');
    expect(src).toContain('{{{ capabilitiesCards }}}');
  });
  test('nav links to the capabilities page', () => {
    const nav = fs.readFileSync(path.join(repoRoot, 'content', 'partials', 'nav.html'), 'utf8');
    expect(nav).toContain('capabilities/');
  });
});
