const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;

// Load Jest's discovery APIs outside the test sandbox; no test runner is started.
const nativeRequire = createRequire(__filename);
const { readConfigs } = nativeRequire('jest-config');
const { SearchSource } = nativeRequire('@jest/core');
const Runtime = nativeRequire('jest-runtime').default;
const root = path.resolve(__dirname, '../..');
const self = 'tests/js/test-discovery.test.js';
const relative = (base, file) => path.relative(base, file).split(path.sep).join('/');

function missingTests(base, inventory, discovered) {
  const matched = new Set(discovered.map(file => relative(base, file)));
  return [...new Set(inventory.map(file => relative(base, file)))]
    .filter(file => !matched.has(file)).sort();
}

function inventory(base) {
  const directory = path.join(base, 'tests/js');
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.test.js'))
    .map(entry => path.join(directory, entry.name)).sort();
}

async function discoveredTests(base) {
  const { configs, globalConfig } = await readConfigs({
    $0: 'jest',
    _: [],
    runInBand: true,
    watchman: false,
    cacheDirectory: path.join(os.tmpdir(), 'jest-discovery-cache'),
  }, [base]);
  const discovered = [];
  // Resolve each project's real roots, ignores and match rules using Jest itself.
  for (const config of configs) {
    const context = await Runtime.createContext(config, {
      maxWorkers: 1, // Discovery is serial and does not need worker processes.
      watch: false,
      watchman: false,
    });
    const result = await new SearchSource(context).getTestPaths(globalConfig, config);
    discovered.push(...result.tests.map(item => item.path));
  }
  return discovered;
}

async function assertCompleteInventory(base) {
  const files = inventory(base);
  const discovered = await discoveredTests(base);
  assert.ok(files.some(file => relative(base, file) === self), 'inventory includes this guard');
  assert.ok(discovered.some(file => relative(base, file) === self), 'Jest selects this guard');
  const missing = missingTests(base, files, discovered);
  assert.deepEqual(missing, [], `Unregistered test suites: ${missing.join(', ')}`);
}

// Hand-counted fixtures: two registered paths, then one orphan. An unrelated
// discovered path has no bearing on whether that orphan is registered.
const fixtureRoot = path.join(os.tmpdir(), 'discovery-comparator');
const first = path.join(fixtureRoot, 'tests/js/first.test.js');
const second = path.join(fixtureRoot, 'tests/js/second.test.js');
const orphan = path.join(fixtureRoot, 'tests/js/orphan.test.js');
const unrelated = path.join(fixtureRoot, 'other/extra.test.js');

test('comparator accepts two identical inventory and discovery paths', () => {
  const files = [first, second];
  assert.equal(files.length, 2); // Hand count: first + second.
  assert.deepEqual(missingTests(fixtureRoot, files, [second, first]), []);
});

test('comparator reports exactly one added orphan', () => {
  const files = [first, second, orphan];
  assert.equal(files.length, 3); // Hand count: first + second + orphan.
  assert.deepEqual(missingTests(fixtureRoot, files, [first, second, unrelated]),
    ['tests/js/orphan.test.js']);
});

test('comparator still reports the orphan without an unrelated discovery entry', () => {
  assert.deepEqual(missingTests(fixtureRoot, [first, second, orphan], [first, second]),
    ['tests/js/orphan.test.js']);
});

test('test_discovery_accepts_complete_inventory', async () => {
  await assertCompleteInventory(root);
});

test('test_discovery_rejects_unregistered_suite', async () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'test-discovery-'));
  fs.mkdirSync(path.join(fixture, 'tests/js'), { recursive: true });
  fs.copyFileSync(path.join(root, 'package.json'), path.join(fixture, 'package.json'));
  // Dependencies resolve in the isolated copy without installing or running tests.
  fs.symlinkSync(path.join(root, 'node_modules'), path.join(fixture, 'node_modules'), 'junction');
  for (const file of inventory(root)) {
    fs.copyFileSync(file, path.join(fixture, 'tests/js', path.basename(file)));
  }
  fs.writeFileSync(path.join(fixture, 'tests/js/synthetic-orphan.test.js'), '');
  const missing = missingTests(fixture, inventory(fixture), await discoveredTests(fixture));
  assert.deepEqual(missing, ['tests/js/synthetic-orphan.test.js']);
  await assert.rejects(() => assertCompleteInventory(fixture), /synthetic-orphan\.test\.js/);
});
