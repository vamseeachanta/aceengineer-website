const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const lintScript = path.join(repoRoot, 'scripts', 'lint-copy.js');
const { loadCopy } = require('../../build');

// Run the lint script as a child process so we exercise the real CLI exit code.
function runLint() {
  try {
    const stdout = execFileSync('node', [lintScript], { cwd: repoRoot, encoding: 'utf8' });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status, stdout: (err.stdout || '') + (err.stderr || '') };
  }
}

describe('brand/copy.yaml', () => {
  test('exists and parses with the expected canonical keys', () => {
    const copy = loadCopy(path.join(repoRoot, 'brand', 'copy.yaml'));
    expect(copy.names && copy.names.firm).toBe('AceEngineer');
    expect(typeof copy.firm_lede).toBe('string');
    expect(copy.firm_lede.length).toBeGreaterThan(0);
    expect(Array.isArray(copy.capabilities)).toBe(true);
    expect(copy.capabilities.length).toBe(3);
    expect(Array.isArray(copy.forbidden_phrases)).toBe(true);
  });
});

describe('lint:copy', () => {
  test('passes on the current tree (no drift)', () => {
    const { code, stdout } = runLint();
    expect(stdout).toContain('lint:copy PASS');
    expect(code).toBe(0);
  });

  test('fails when a page drifts from the canonical lede', () => {
    // Copy the repo's content/about.html into a sandbox repo with a reworded lede,
    // pointing copy.yaml's about target at it, and confirm the lint flags drift.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-lint-drift-'));
    try {
      fs.mkdirSync(path.join(tmp, 'brand'));
      fs.mkdirSync(path.join(tmp, 'scripts'));
      fs.mkdirSync(path.join(tmp, 'content'));
      // Minimal copy.yaml with one canonical lede + a target page.
      fs.writeFileSync(path.join(tmp, 'brand', 'copy.yaml'),
        'tagline: Canonical Tagline\n' +
        'firm_lede: This exact canonical sentence must appear verbatim.\n' +
        'forbidden_phrases:\n  - consultancy\n' +
        'targets:\n  about: content/about.html\n');
      // Page with a *reworded* lede -> should fail drift.
      fs.writeFileSync(path.join(tmp, 'content', 'about.html'),
        '<h1>Canonical Tagline</h1><p>A totally different lede that drifted.</p>');
      fs.copyFileSync(lintScript, path.join(tmp, 'scripts', 'lint-copy.js'));
      // node_modules: reuse repo's so js-yaml resolves.
      fs.symlinkSync(path.join(repoRoot, 'node_modules'), path.join(tmp, 'node_modules'));

      let code = 0;
      let out = '';
      try {
        out = execFileSync('node', [path.join(tmp, 'scripts', 'lint-copy.js')], { cwd: tmp, encoding: 'utf8' });
      } catch (err) {
        code = err.status;
        out = (err.stdout || '') + (err.stderr || '');
      }
      expect(code).toBe(1);
      expect(out).toContain('DRIFT');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('fails when a forbidden phrase reappears on a page', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'copy-lint-forbidden-'));
    try {
      fs.mkdirSync(path.join(tmp, 'brand'));
      fs.mkdirSync(path.join(tmp, 'scripts'));
      fs.mkdirSync(path.join(tmp, 'content'));
      fs.writeFileSync(path.join(tmp, 'brand', 'copy.yaml'),
        'firm_lede: lede\n' +
        'forbidden_phrases:\n  - consultancy\n' +
        'targets:\n  about: content/about.html\n');
      fs.writeFileSync(path.join(tmp, 'content', 'about.html'),
        '<p>lede</p><p>We are an offshore consultancy.</p>');
      fs.copyFileSync(lintScript, path.join(tmp, 'scripts', 'lint-copy.js'));
      fs.symlinkSync(path.join(repoRoot, 'node_modules'), path.join(tmp, 'node_modules'));

      let code = 0;
      let out = '';
      try {
        out = execFileSync('node', [path.join(tmp, 'scripts', 'lint-copy.js')], { cwd: tmp, encoding: 'utf8' });
      } catch (err) {
        code = err.status;
        out = (err.stdout || '') + (err.stderr || '');
      }
      expect(code).toBe(1);
      expect(out).toContain('FORBIDDEN');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
