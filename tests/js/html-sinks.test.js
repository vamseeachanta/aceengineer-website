/**
 * Source-level regression guards for issue #16 (and epic #107's
 * "a test asserts this so it cannot regress" requirement).
 *
 * These are deliberately static assertions over the shipped source. The
 * behavioural coverage lives in npv-render.test.js and hse-render.test.js;
 * this file is the ratchet that stops the sinks coming back.
 *
 * Scope note: #16 covers the two pages the 2026-05-23 review named. The wider
 * innerHTML sweep across content/** is epic #107's remaining work, so
 * HARDENED_FILES is an explicit opt-in list rather than a whole-tree scan.
 *
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const HARDENED_FILES = [
  path.join('content', 'calculators', 'npv-field-development.html'),
  path.join('demos', 'hse-risk-dashboard.html'),
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('hardened pages carry no innerHTML sink', () => {
  test.each(HARDENED_FILES)('%s assigns no innerHTML', (rel) => {
    const lines = read(rel).split('\n');
    const offenders = lines
      .map((line, i) => ({ line, n: i + 1 }))
      .filter(({ line }) => /\binnerHTML\s*=/.test(line))
      .map(({ line, n }) => `${rel}:${n}: ${line.trim()}`);
    expect(offenders).toEqual([]);
  });
});

describe('navbar collapse timing is a named constant', () => {
  const rel = path.join('assets', 'js', 'navbar-toggle.js');

  test('no bare 350 ms timeout literal remains', () => {
    const src = read(rel);
    expect(src).not.toMatch(/setTimeout\([\s\S]*?,\s*350\s*\)/);
    expect(src).not.toMatch(/\}\s*,\s*350\s*\)/);
  });

  test('a single named constant carries the value and cites the CSS source', () => {
    const src = read(rel);
    const decl = src.match(
      /var\s+COLLAPSE_TRANSITION_MS\s*=\s*(\d+)\s*;([^\n]*)/
    );
    expect(decl).not.toBeNull();
    expect(Number(decl[1])).toBe(350);
    // The constant must explain itself — it is coupled to the stylesheet.
    expect(decl[2]).toMatch(/0\.35s|collapsing/i);
  });

  test('both timeouts use the constant', () => {
    const src = read(rel);
    const uses = src.match(/COLLAPSE_TRANSITION_MS/g) || [];
    // one declaration + two call sites
    expect(uses).toHaveLength(3);
  });
});

describe('external links in the served tree cannot leak window.opener', () => {
  function htmlFilesUnder(dir) {
    const out = [];
    (function walk(d) {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.html')) out.push(full);
      }
    })(dir);
    return out;
  }

  test('every target="_blank" under content/ carries rel="noopener"', () => {
    const offenders = [];
    for (const file of htmlFilesUnder(path.join(ROOT, 'content'))) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (!line.includes('target="_blank"')) return;
        if (/rel="[^"]*noopener/.test(line)) return;
        offenders.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
