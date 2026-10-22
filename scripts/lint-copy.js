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
const { JSDOM } = require('jsdom');

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

// Include nested pages and redirect stubs; sitemap exclusion is not an exemption.
function listVisiblePages() {
  for (const base of ['dist', 'content']) {
    const dir = path.join(repoRoot, base);
    if (fs.existsSync(dir)) {
      function walk(folder) {
        return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
          const file = path.join(folder, entry.name);
          if (entry.isDirectory()) return walk(file);
          return /\.html$/i.test(entry.name) ? [path.relative(repoRoot, file)] : [];
        });
      }
      const pages = walk(dir);
      if (pages.length) return pages;
    }
  }
  return [];
}

function bannedFindings(html, phrases) {
  const doc = new JSDOM(html).window.document;
  const metadata = [...doc.querySelectorAll('meta[content], a[href]')]
    .map(node => node.getAttribute('content') || node.getAttribute('href'));
  const structured = [...doc.querySelectorAll('script[type="application/ld+json"]')]
    .map(node => node.textContent);
  doc.querySelectorAll('script, style, template, noscript').forEach(node => node.remove());
  const text = norm([doc.title, doc.body.textContent, ...metadata, ...structured].join(' '));
  return [...new Set(phrases)].filter(phrase => text.includes(norm(phrase)));
}

// Rule source: issue #89 (2026), one visible purpose lead per target page.
function positioningFindings(html, positioning, page) {
  const selector = positioning.leads[page];
  if (!selector) return [];
  const doc = new JSDOM(html).window.document;
  const leads = [...doc.querySelectorAll(selector)];
  if (leads.length !== 1) return ['purpose lead missing or repeated'];
  const lead = leads[0];
  function hidden(node) {
    const style = doc.defaultView.getComputedStyle(node);
    return node.hidden || node.getAttribute('aria-hidden') === 'true' ||
      style.display === 'none' || ['hidden', 'collapse'].includes(style.visibility);
  }
  for (let node = lead; node; node = node.parentElement) {
    if (hidden(node)) return ['purpose lead is hidden'];
  }
  for (const node of [...lead.querySelectorAll('*')]) {
    if (hidden(node) || ['SCRIPT', 'STYLE', 'TEMPLATE'].includes(node.tagName)) node.remove();
  }
  const text = norm(lead.textContent);
  const errors = [];
  if (text !== norm(positioning.purpose)) errors.push('purpose lead differs from contract');
  for (const term of positioning.approved_key_terms) {
    if (!text.includes(norm(term))) errors.push(`purpose lead omits approved term: ${term}`);
  }
  return errors;
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

  if (targets.home) {
    const homeRel = resolveRendered(targets.home);
    const homeBody = readPage(homeRel);
    if (homeBody === null) errors.push(`target page missing: ${homeRel}`);
    else {
      const registryFile = path.join(repoRoot, 'config', 'samples.yaml');
      const registry = yaml.load(fs.readFileSync(registryFile, 'utf8'));
      const published = registry.samples.some(entry => entry.status === 'published');
      function checkHome(value, key) {
        if (typeof value === 'string') {
          const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
          if (!norm(homeBody).includes(norm(escaped))) errors.push(`DRIFT: copy.home.${key} not found verbatim in ${homeRel}`);
        } else for (const [child, item] of Object.entries(value)) checkHome(item, `${key}.${child}`);
      }
      for (const [key, value] of Object.entries(copy.home)) {
        if (key !== 'work' || published) checkHome(value, key);
      }
    }
  }

  // 2) Purpose belongs in the lead, before the showcase; metadata cannot supply it.
  if (copy.positioning) {
    for (const page of Object.keys(copy.positioning.leads)) {
      const rel = resolveRendered('content/' + page);
      const html = readPage(rel);
      if (html === null) errors.push(`target page missing: ${rel}`);
      else for (const error of positioningFindings(html, copy.positioning, page)) {
        errors.push(`POSITIONING: ${rel}: ${error}`);
      }
    }
  }

  // 3) Both banned lists apply throughout the published HTML tree.
  const forbidden = [
    ...(Array.isArray(copy.forbidden_phrases) ? copy.forbidden_phrases : []),
    ...(copy.positioning?.banned_wording || []),
  ];
  if (forbidden.length) {
    const pages = listVisiblePages();
    for (const rel of pages) {
      for (const phrase of bannedFindings(readPage(rel) || '', forbidden)) {
        errors.push(`FORBIDDEN: "${phrase}" appears in ${rel}`);
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

module.exports = { lint, norm, positioningFindings, bannedFindings, listVisiblePages };
