const path = require('node:path');
const { spawn } = require('node:child_process');

// Jest runs this root prerequisite once, before evaluating any project test file.
// The explicit root override lets isolated regressions use a synthetic package.
module.exports = async function buildBeforeTests(
  _globalConfig,
  _projectConfig,
  { rootDir = path.resolve(__dirname, '../..') } = {},
) {
  const options = {
    cwd: rootDir,
    // build.js selects live fetching only for '1'; tests use committed snapshots.
    env: { ...process.env, HF_FETCH: '0' },
    stdio: 'inherit',
  };
  await new Promise((resolve, reject) => {
    // On Windows npm is a .cmd shim, which Node starts only through a shell.
    // The command is a fixed string, so no caller input reaches the shell.
    const child = process.platform === 'win32'
      ? spawn('npm run build', { ...options, shell: true })
      : spawn('npm', ['run', 'build'], options);
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) resolve(); // Node success exit convention.
      else reject(new Error(
        `Test prerequisite build failed (${signal ? `signal ${signal}` : `exit code ${code}`})`,
      ));
    });
  });
};
