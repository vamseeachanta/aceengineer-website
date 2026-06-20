#!/usr/bin/env node
/**
 * lint-copy.js — drift detection for canonical firm-copy (issue #9, Option 2).
 *
 * Asserts that the canonical strings in brand/copy.yaml are actually present in
 * their target page(s), and that no forbidden phrase has reappeared on a visible
 * page. Fails (exit 1) on drift so it can gate CI / pre-commit.
 *
 *   node scripts/lint-copy.js        # lint the rendered pages (dist/**)
 *   npm run lint:copy                # run `npm run build` first
 *
 * Detection model: each canonical string must appear verbatim (case-insensitive,
 * whitespace-collapsed) in its mapped *rendered* page. The lint reads dist/ (the
 * user-visible output) so it works whether a page hardcodes the copy or pulls it
 * via the {{ copy.* }} template vars build.js injects. If About's lede is reworded
 * in the page but not in copy.yaml (or vice-versa), the substring no longer matches
 * and the lint fails — which is exactly the drift that triggered #6. Falls back to
 * the source page when no dist/ build is present.
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..');
const copyFile = path.join(repoRoot, 'brand', 'copy.yaml');

// Normalize for comparison: collapse all whitespace runs, lowercase.
function norm(s) {
  return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
}

function readPage(rel) {
  const p = path.join(repoRoot, rel);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

// Map a content/ source path to its rendered dist/ equivalent, preferring the
// rendered output (where {{ copy.* }} vars are expanded) and falling back to source.
function resolveRendered(rel) {
  if (rel && rel.startsWith('content/')) {
    const distRel = 'dist/' + rel.slice('content/'.length);
    if (fs.existsSync(path.join(repoRoot, distRel))) return distRel;
  }
  return rel;
}

// List rendered visible pages: top-level dist/*.html, falling back to content/*.html.
function listVisiblePages() {
  for (const base of ['dist', 'content']) {
    const dir = path.join(repoRoot, base);
    if (fs.existsSync(dir)) {
      const pages = fs.readdirSync(dir)
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(base, f));
      if (pages.length) return pages;
    }
  }
  return [];
}

function lint() {
  if (!fs.existsSync(copyFile)) {
    console.error('lint:copy FAIL — brand/copy.yaml not found');
    return 1;
  }
  const copy = yaml.load(fs.readFileSync(copyFile, 'utf8')) || {};
  const targets = copy.targets || {};
  const errors = [];

  // Resolve the About page (primary consumer per issue #9 "Done when") to its
  // rendered output, falling back to source if no build is present.
  const aboutRel = targets.about ? resolveRendered(targets.about) : null;
  const aboutBody = aboutRel ? readPage(aboutRel) : null;
  if (aboutRel && aboutBody === null) {
    errors.push(`target page missing: ${aboutRel}`);
  }

  // 1) Canonical strings that must appear on the About page.
  const mustAppearOnAbout = [
    ['tagline', copy.tagline],
    ['firm_lede', copy.firm_lede],
    ['founding', copy.founding],
    ['service_model', copy.service_model],
    ...(Array.isArray(copy.capabilities) ? copy.capabilities : []).map(c => [c.id, c.blurb]),
    ...(Array.isArray(copy.credentials) ? copy.credentials : []).map((c, i) => [`credential[${i}]`, c]),
  ];

  if (aboutBody) {
    const haystack = norm(aboutBody);
    for (const [key, val] of mustAppearOnAbout) {
      if (val == null || val === '') continue;
      if (!haystack.includes(norm(val))) {
        errors.push(`DRIFT: copy.${key} not found verbatim in ${aboutRel}\n    canonical: "${String(val).trim()}"`);
      }
    }
  }

  // 2) Forbidden phrases must not appear on any visible source page.
  const forbidden = Array.isArray(copy.forbidden_phrases) ? copy.forbidden_phrases : [];
  if (forbidden.length) {
    const pages = listVisiblePages();
    for (const rel of pages) {
      const body = norm(readPage(rel) || '');
      for (const phrase of forbidden) {
        if (body.includes(norm(phrase))) {
          errors.push(`FORBIDDEN: "${phrase}" appears in ${rel}`);
        }
      }
    }
  }

  if (errors.length) {
    console.error('lint:copy FAIL — firm-copy drift detected:\n');
    errors.forEach(e => console.error('  - ' + e));
    console.error('\nFix: reconcile the page with brand/copy.yaml (the single source of truth).');
    return 1;
  }
  console.log('lint:copy PASS — all canonical firm-copy is in sync with brand/copy.yaml.');
  return 0;
}

if (require.main === module) {
  process.exit(lint());
}

module.exports = { lint, norm };
