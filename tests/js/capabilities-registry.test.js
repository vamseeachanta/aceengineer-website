const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  loadRegistry,
  validateRegistry,
  DEFAULT_REGISTRY,
} = require('../../scripts/validate-capabilities');

const repoRoot = path.resolve(__dirname, '..', '..');
const validateScript = path.join(repoRoot, 'scripts', 'validate-capabilities.js');

function runValidate(file) {
  const args = [validateScript];
  if (file) args.push(file);
  try {
    const stdout = execFileSync('node', args, { cwd: repoRoot, encoding: 'utf8' });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status, stdout: (err.stdout || '') + (err.stderr || '') };
  }
}

describe('config/capabilities.yaml', () => {
  test('exists, parses, and passes structural validation', () => {
    const registry = loadRegistry(DEFAULT_REGISTRY);
    expect(registry.version).toBe(1);
    expect(Array.isArray(registry.capabilities)).toBe(true);
    expect(registry.capabilities.length).toBeGreaterThan(0);
    expect(validateRegistry(registry)).toEqual([]);
  });

  test('is seeded with the World Energy Field Explorer entry', () => {
    const registry = loadRegistry(DEFAULT_REGISTRY);
    const explorer = registry.capabilities.find(c => c.id === 'field-explorer');
    expect(explorer).toBeDefined();
    expect(explorer.hf_dataset).toBe('aceengineer/worldenergydata-explorer');
    expect(explorer.domain).toBe('worldenergy');
    expect(explorer.tables.map(t => t.config).sort()).toEqual(['countries', 'fields', 'wells']);
    // economics RE-SURFACED on the fields table after the #971 correctness fix (C9 / #978):
    // npv_mm + breakeven_wti now shown (life-to-date basis), no longer withheld.
    const fields = explorer.tables.find(t => t.config === 'fields');
    expect(fields.highlight_columns).toEqual(expect.arrayContaining(['npv_mm', 'breakeven_wti']));
    expect(explorer.withheld_columns || []).not.toContain('npv_mm');
  });

  test('CLI exits 0 with PASS on the real registry', () => {
    const { code, stdout } = runValidate();
    expect(stdout).toContain('validate:capabilities PASS');
    expect(code).toBe(0);
  });
});

describe('validateRegistry catches malformed entries', () => {
  const base = () => ({
    version: 1,
    capabilities: [{
      id: 'x', title: 'X', domain: 'worldenergy', summary: 's',
      hf_dataset: 'aceengineer/x', provenance_url: 'u', status: 'live',
      primary_config: 'main', data_limits: 'd',
      tables: [{ config: 'main', label: 'Main', viz: 'table', highlight_columns: ['a'] }],
    }],
  });

  test('flags a bad domain enum', () => {
    const r = base(); r.capabilities[0].domain = 'aerospace';
    expect(validateRegistry(r).some(e => /domain must be one of/.test(e))).toBe(true);
  });

  test('flags a bad viz enum', () => {
    const r = base(); r.capabilities[0].tables[0].viz = 'pie';
    expect(validateRegistry(r).some(e => /viz must be one of/.test(e))).toBe(true);
  });

  test('flags duplicate ids', () => {
    const r = base(); r.capabilities.push({ ...r.capabilities[0] });
    expect(validateRegistry(r).some(e => /duplicate id/.test(e))).toBe(true);
  });

  test('flags primary_config not among tables', () => {
    const r = base(); r.capabilities[0].primary_config = 'nope';
    expect(validateRegistry(r).some(e => /primary_config/.test(e))).toBe(true);
  });

  test('flags a highlight column that is also withheld (leak guard)', () => {
    const r = base();
    r.capabilities[0].withheld_columns = ['a'];
    expect(validateRegistry(r).some(e => /also in withheld_columns/.test(e))).toBe(true);
  });

  test('CLI exits 1 with FAIL on a malformed registry fixture', () => {
    const tmp = path.join(repoRoot, 'tests', 'js', '__tmp_bad_registry.yaml');
    fs.writeFileSync(tmp, 'version: 1\ncapabilities:\n  - id: BAD_ID\n    title: t\n');
    try {
      const { code, stdout } = runValidate(tmp);
      expect(code).toBe(1);
      expect(stdout).toContain('validate:capabilities FAIL');
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});
