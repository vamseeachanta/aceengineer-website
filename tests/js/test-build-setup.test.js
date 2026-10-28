const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Execution allowance: one minute = 60 seconds * 1000 milliseconds.
const CHILD_TIMEOUT = 60 * 1000;
const SETUP = path.resolve(__dirname, '../setup/build.js');
const JEST = require.resolve('jest/bin/jest');

function runFixture({ fails = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'test-build-setup-'));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    scripts: { build: 'node fixture-build.js' },
  }));
  fs.writeFileSync(path.join(root, 'fixture-build.js'), `
    const fs = require('node:fs');
    fs.appendFileSync('invocations', 'build\\n');
    // The prescribed failure status is an independent fixture input.
    if (${fails}) process.exit(23);
    fs.promises.writeFile('completed', process.env.HF_FETCH);
  `);
  fs.writeFileSync(path.join(root, 'setup.cjs'), `
    const setup = require(${JSON.stringify(SETUP)});
    module.exports = (globalConfig, projectConfig) =>
      setup(globalConfig, projectConfig, { rootDir: __dirname });
  `);
  fs.writeFileSync(path.join(root, 'fixture.test.js'), `
    const fs = require('node:fs');
    // Record any module evaluation before reading build output.
    fs.writeFileSync('collected', 'yes');
    // These reads occur during module evaluation, before any test runs.
    const completed = fs.readFileSync('completed', 'utf8');
    const invocations = fs.readFileSync('invocations', 'utf8');
    test('fixture sees completed offline build at collection', () => {
      expect(completed).toBe('0'); // build.js enables live fetching only for '1'.
      // Hand count: one setup invocation must append exactly one line.
      expect(invocations).toBe('build\\n');
    });
  `);
  fs.writeFileSync(path.join(root, 'jest.config.cjs'), `
    module.exports = {
      rootDir: __dirname,
      globalSetup: './setup.cjs',
      projects: [{
        displayName: 'fixture',
        rootDir: __dirname,
        testEnvironment: 'node',
        testMatch: ['<rootDir>/fixture.test.js'],
      }],
    };
  `);
  const result = spawnSync(process.execPath, [
    JEST, '--config', path.join(root, 'jest.config.cjs'), '--runInBand',
    '--no-cache', '--json', '--outputFile', path.join(root, 'results.json'),
  ], {
    cwd: root,
    // Start with live fetching requested; setup must select committed snapshots.
    env: { ...process.env, HF_FETCH: '1' },
    encoding: 'utf8',
    timeout: CHILD_TIMEOUT,
  });
  return { root, result, output: result.stdout + result.stderr };
}

test('test_build_setup_waits_for_success', () => {
  const { root, result, output } = runFixture();
  expect(result.error).toBeUndefined();
  expect({ status: result.status, output: result.status ? output : '' })
    .toEqual({ status: 0, output: '' }); // Node success exit convention.
  expect(fs.readFileSync(path.join(root, 'collected'), 'utf8')).toBe('yes');
  expect(fs.readFileSync(path.join(root, 'completed'), 'utf8')).toBe('0');
  // Hand count: one invocation appends one line, independently of the setup code.
  expect(fs.readFileSync(path.join(root, 'invocations'), 'utf8')).toBe('build\n');
  const results = JSON.parse(fs.readFileSync(path.join(root, 'results.json'), 'utf8'));
  expect(results.numPassedTests).toBe(1); // The fixture declares one test above.
  expect(results.numFailedTests).toBe(0); // All declared fixture tests passed.
}, CHILD_TIMEOUT);

test('test_build_setup_failure_prevents_collection', () => {
  const { root, result, output } = runFixture({ fails: true });
  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0); // Node success exit convention.
  expect(output).toMatch(/build.*exit code 23/i); // Fixture status prescribed above.
  expect(fs.readFileSync(path.join(root, 'invocations'), 'utf8')).toBe('build\n');
  expect(fs.existsSync(path.join(root, 'completed'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'collected'))).toBe(false);
  expect(fs.existsSync(path.join(root, 'results.json'))).toBe(false);
}, CHILD_TIMEOUT);
