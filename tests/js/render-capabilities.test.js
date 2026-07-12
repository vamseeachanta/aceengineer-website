const fs = require('fs');
const path = require('path');
const { escapeHtml, renderCard, renderCards, hfDatasetUrl } = require('../../scripts/render-capabilities');

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
  test('shows title, domain label, and the HF explore link', () => {
    expect(html).toContain('World Energy Field Explorer');
    expect(html).toContain('World Energy');
    expect(html).toContain(hfDatasetUrl('aceengineer/worldenergydata-explorer'));
    expect(html).toContain('Explore data on Hugging Face');
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
