const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  loadRegistry,
  validateRegistry,
  DEFAULT_REGISTRY,
  isDatasetBacked,
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
    // The live fields config currently publishes operational/production columns;
    // economics stays off this table until its upstream config is republished.
    const fields = explorer.tables.find(t => t.config === 'fields');
    expect(fields.highlight_columns).toEqual(expect.arrayContaining(['status', 'cum_oil_mmbbl', 'avg_uptime_pct']));
    expect(fields.highlight_columns).not.toEqual(expect.arrayContaining(['npv_mm', 'breakeven_wti']));
    expect(registry.capabilities.find(c => c.id === 'field-economics-sensitivity').status).toBe('pending');
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

// Release-backed capabilities: pinned to an immutable release published by this site,
// for work whose upstream dataset is private (e.g. CFD review artifacts) and therefore
// cannot resolve on the public datasets-server.
describe('release-backed capabilities', () => {
  const releaseCap = () => ({
    version: 1,
    capabilities: [{
      id: 'x-cfd', title: 'X', domain: 'digitalmodel', summary: 's',
      hf_dataset: 'org/private-ds', provenance_url: 'https://example.com/p',
      status: 'live', data_limits: 'limits', backing: 'release',
      release: { hub_url: '/reports/x/', digest: 'a'.repeat(64), revision: 'b'.repeat(40) },
    }],
  });

  test('a well-formed release-backed entry validates without tables', () => {
    expect(validateRegistry(releaseCap())).toEqual([]);
  });

  test('rejects an unknown backing', () => {
    const r = releaseCap(); r.capabilities[0].backing = 'magic';
    expect(validateRegistry(r).some(e => /backing must be one of/.test(e))).toBe(true);
  });

  test('requires a release block', () => {
    const r = releaseCap(); delete r.capabilities[0].release;
    expect(validateRegistry(r).some(e => /requires a 'release' block/.test(e))).toBe(true);
  });

  test.each([
    ['digest', 'digest', 'not-a-digest', /digest must be a 64-hex/],
    ['revision', 'revision', 'nope', /revision must be a 40-hex/],
    ['hub_url', 'hub_url', 'https://elsewhere.example/x', /hub_url must be a site-root path/],
  ])('rejects a malformed %s', (_label, field, value, pattern) => {
    const r = releaseCap(); r.capabilities[0].release[field] = value;
    expect(validateRegistry(r).some(e => pattern.test(e))).toBe(true);
  });

  test('rejects declaring both release and tables', () => {
    const r = releaseCap();
    r.capabilities[0].tables = [{ config: 'c', label: 'l', viz: 'table', highlight_columns: ['a'] }];
    expect(validateRegistry(r).some(e => /declare 'release', not 'tables'/.test(e))).toBe(true);
  });

  test('isDatasetBacked excludes release-backed and defaults to dataset', () => {
    expect(isDatasetBacked(releaseCap().capabilities[0])).toBe(false);
    expect(isDatasetBacked({ id: 'y' })).toBe(true);
    expect(isDatasetBacked({ id: 'y', backing: 'dataset' })).toBe(true);
  });

  test('the committed sloshing entry is release-backed and pins the live release', () => {
    const cap = loadRegistry(DEFAULT_REGISTRY).capabilities.find(c => c.id === 'tank-sloshing-cfd');
    expect(cap).toBeDefined();
    const pointer = JSON.parse(fs.readFileSync(path.join(repoRoot, 'config', 'sloshing-data-release.json'), 'utf8'));
    expect(cap.release.digest).toBe(pointer.release.digest);
    expect(cap.release.revision).toBe(pointer.source.revision);
  });
});

// Every surfaced capability must be discoverable. Five live capability pages once served
// 200 while being wholly absent from sitemap.xml, so search engines never saw them; this
// ties the sitemap to the registry rather than to anyone remembering to edit both.
describe('capability discoverability', () => {
  // Reads the GENERATED sitemap (dist/sitemap.xml, #85), not a hand-maintained file —
  // this asserts against the artifact actually served. `npm run build` runs before
  // `npm test` in CI.
  const sitemap = fs.readFileSync(path.join(repoRoot, 'dist', 'sitemap.xml'), 'utf8');
  const surfaced = loadRegistry(DEFAULT_REGISTRY).capabilities.filter(c => c.status !== 'withheld');
  const generated = surfaced.filter(c => c.backing !== 'release');
  const released = surfaced.filter(c => c.backing === 'release');

  test('the capabilities index is in the sitemap', () => {
    expect(sitemap).toContain('<loc>https://www.aceengineer.com/capabilities/</loc>');
  });

  test.each(generated.map(c => [c.id]))('capability %s has a sitemap entry', id => {
    expect(sitemap).toContain(`<loc>https://www.aceengineer.com/capabilities/${id}.html</loc>`);
  });

  // Release-backed capabilities generate no detail page; their hub is the destination,
  // so it is the hub that has to be discoverable.
  test.each(released.map(c => [c.id, c.release.hub_url]))('release-backed %s has its hub %s in the sitemap', (id, hub) => {
    expect(sitemap).toContain(`<loc>https://www.aceengineer.com${hub}</loc>`);
  });

  test('no sitemap entry points at a capability that is withheld, absent, or release-backed', () => {
    const listed = [...sitemap.matchAll(/capabilities\/([a-z0-9-]+)\.html/g)].map(m => m[1]);
    // Interactive surfaces declared by a capability (`experiences`) are real pages under
    // /capabilities/ without being registry ids of their own, so they are allowed too.
    const experiencePages = surfaced
      .flatMap(c => c.experiences || [])
      .map(x => (x.url.match(/capabilities\/([a-z0-9-]+)\.html/) || [])[1])
      .filter(Boolean);
    const allowed = new Set([...generated.map(c => c.id), ...experiencePages]);
    expect(listed.filter(id => !allowed.has(id))).toEqual([]);
  });
});
