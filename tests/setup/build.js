const path = require('node:path');
const { spawn } = require('node:child_process');

// Jest runs this root prerequisite once, before evaluating any project test file.
// The explicit root override lets isolated regressions use a synthetic package.
module.exports = async function buildBeforeTests(
  _globalConfig,
  _projectConfig,
  { rootDir = path.resolve(__dirname, '../..') } = {},
) {
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd: rootDir,
      // build.js selects live fetching only for '1'; tests use committed snapshots.
      env: { ...process.env, HF_FETCH: '0' },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) resolve(); // Node success exit convention.
      else reject(new Error(
        `Test prerequisite build failed (${signal ? `signal ${signal}` : `exit code ${code}`})`,
      ));
    });
  });
};
