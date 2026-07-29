const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include');
const expressions = require('posthtml-expressions');
const yaml = require('js-yaml');
const { PurgeCSS } = require('purgecss');
const CleanCSS = require('clean-css');
const hf = require('./scripts/hf-fetch');
const { renderCards, capabilityDetailDocument, detailFileName, isReleaseBacked } = require('./scripts/render-capabilities');

const srcDir = './content';
const distDir = './dist';

// Canonical origin (#85). vercel.json 301s the apex to www, so every self-referencing
// URL the site emits — canonical, og:url, sitemap — must already be on www or the
// crawler takes a redirect hop to reach it.
const SITE_ORIGIN = 'https://www.aceengineer.com';

// Pages excluded from the sitemap, with the reason. These are `noindex` redirect
// stubs for reports that were consolidated: they canonicalise to their replacement,
// so listing them would advertise URLs we are actively telling crawlers to ignore.
// Shared with the reachability allowlist when #81 lands — one list, two consumers.
const SITEMAP_EXCLUDE = {
  '404.html': 'error page — not a destination',
  'reports/diffraction/aqwa-analysis.html': 'noindex redirect stub -> analysis.html',
  'reports/diffraction/orcawave-analysis.html': 'noindex redirect stub -> analysis.html',
  'reports/diffraction/orcawave-aqwa-comparison.html': 'noindex redirect stub -> comparison.html',
};

// Classes that only ever appear because JavaScript adds them at runtime, so PurgeCSS
// cannot see them in the markup it scans. Derived from the actual `classList` calls in
// assets/js — not guessed. Keep this list minimal: every entry is CSS that ships
// whether or not it is needed.
//
//   navbar-toggle.js toggles: collapse, collapsing, in
//   Bootstrap state classes applied by our own inline handlers: active, open, disabled
//
// The previous safelist matched essentially all of Bootstrap (/^nav/, /^btn/, /^col-/,
// /^text-/, deep: /navbar/ …), which is why the step logged "0% reduction" on every
// build while appearing to succeed (#86).
const PURGE_SAFELIST = [
  /^col-(xs|sm|md|lg)-\d+$/, /^col-(xs|sm|md|lg)-offset-\d+$/,
  /^collapse$/, /^collapsing$/, /^in$/,
  /^active$/, /^open$/, /^disabled$/,
  /^has-(error|warning|success|feedback)$/,
  /^sr-only(-focusable)?$/,
];

// Selectors the site cannot render without. A byte-size floor alone is not a
// correctness check — a purge can strip something essential and still hit its
// target — so the build asserts these survived.
const PURGE_REQUIRED = [
  '.container', '.row', '.navbar', '.navbar-toggle', '.collapse', '.btn',
  '.form-control', '.table', '.col-md-6', '.sr-only',
];

// Minimum reduction we expect from purging Bootstrap. Below this, something has
// re-broadened the safelist and dead CSS is shipping again.
const PURGE_MIN_REDUCTION = 0.30;

// CSS concatenated into styles.min.css, in cascade order. These are bundle INPUTS —
// they are never copied to dist/ individually (see copyAssets).
const BUNDLE_INPUTS = [
  'fonts.css', 'bootstrap-united.css', 'responsive.css',
  'marketing.css', 'components.css', 'theme.css',
];

// Turn a dist-relative path into the canonical absolute URL. Directory index pages
// canonicalise to the directory ("/blog/", not "/blog/index.html") so the site has
// one URL per page rather than two that serve identical bytes.
function canonicalUrlFor(relPath) {
  let p = String(relPath).split(path.sep).join('/');
  if (p.endsWith('index.html')) p = p.slice(0, -'index.html'.length);
  return `${SITE_ORIGIN}/${p}`;
}

// Rendered capability cards (C3, #51), computed once at build start from the hydrated
// registry and injected into every page as the `capabilitiesCards` template local.
let _capabilitiesCards = '';

// The hydrated registry (C2), captured at build start so the detail-page pass (C4)
// can reuse it without re-fetching.
let _hydratedRegistry = null;
let _sloshingRelease = null;

// Validate the committed content-addressed sloshing release before rendering any
// report. This reuses the publication trust loop and never performs network I/O.
function validateSloshingRelease(repoRoot = path.resolve('.')) {
  const { validateCommittedRelease } = require('./scripts/refresh-sloshing-data');
  const result = validateCommittedRelease(repoRoot);
  return {
    digest: result.digest,
    assetPath: `assets/data/sloshing/${result.digest}`,
    files: ['manifest.json', ...result.manifest.tables.map(table => table.file)],
  };
}

// Load canonical firm-copy (brand/copy.yaml) — single source of truth (issue #9).
// Exposed to every page as the `copy` template object, e.g. {{ copy.firm_lede }}.
// Cached so each build only reads/parses once.
let _copyCache;
function loadCopy(copyFile = './brand/copy.yaml') {
  if (_copyCache === undefined) {
    _copyCache = fs.existsSync(copyFile)
      ? (yaml.load(fs.readFileSync(copyFile, 'utf8')) || {})
      : {};
  }
  return _copyCache;
}

// Load the capability registry (config/capabilities.yaml) — SSOT for the HF-backed
// capability pages (docs/capabilities-registry.md, epic workspace-hub#3485). Returns
// { version, capabilities: [...] } (or {} if absent). Cached like loadCopy. Consumed by
// the build-time HF fetch + render layer (aceengineer-website#50/#51/#52).
let _capabilitiesCache;
function loadCapabilities(registryFile = './config/capabilities.yaml') {
  if (_capabilitiesCache === undefined) {
    _capabilitiesCache = fs.existsSync(registryFile)
      ? (yaml.load(fs.readFileSync(registryFile, 'utf8')) || {})
      : {};
  }
  return _capabilitiesCache;
}

// Directory of committed HF snapshots (data/hf-cache/*.json), refreshed by
// `npm run refresh:hf`. Read by the build as the deterministic/offline data source.
const SNAPSHOT_DIR = './data/hf-cache';

// Load the registry and attach data to each capability's tables (C2, #50). Offline by
// default — reads committed snapshots so CI/local builds are deterministic and need no
// network. Set HF_FETCH=1 to fetch live at build time (Vercel production does this via
// the C5 deploy hook), with the snapshot as the outage fallback. Never throws.
async function loadHydratedCapabilities(opts = {}) {
  const registry = loadCapabilities(opts.registryFile);
  const live = opts.live !== undefined ? opts.live : process.env.HF_FETCH === '1';
  await hf.hydrateRegistry(registry, {
    snapshotDir: opts.snapshotDir || SNAPSHOT_DIR,
    live,
    logger: opts.logger || (msg => console.log(msg)),
  });
  return registry;
}

// Parse YAML front matter
function parseFrontMatter(content) {
  // Tolerate CRLF line endings and a missing trailing newline after the closing ---
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (match) {
    const locals = {};
    const body = match[2] || '';
    match[1].split(/\r?\n/).forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        locals[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      }
    });
    return { locals, content: body };
  }
  return { locals: {}, content };
}

// Recursively get all HTML files
function getHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html') && !fullPath.includes('/partials/')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Process a single HTML file
async function processFile(filePath) {
  const relativePath = path.relative(srcDir, filePath);
  const outputPath = path.join(distDir, relativePath);

  const rawContent = fs.readFileSync(filePath, 'utf8');
  const { locals, content } = parseFrontMatter(rawContent);

  // Default rootPath to empty string if not specified
  if (!locals.rootPath) {
    locals.rootPath = '';
  }

  // Default the active-nav marker so shared navs can reference it safely on any
  // page (strict expressions throw on undefined). Pages opt into highlighting by
  // setting `activeNav: <slug>` in front matter; others render no current item.
  if (locals.activeNav === undefined) {
    locals.activeNav = '';
  }

  // Expose canonical firm-copy to every page as `copy` (issue #9). Page-level
  // front matter still wins for any explicitly redefined key.
  if (locals.copy === undefined) {
    locals.copy = loadCopy();
  }

  // Expose the rendered capability cards (C3) to any page that wants them
  // (content/capabilities/index.html uses {{{ capabilitiesCards }}}).
  if (locals.capabilitiesCards === undefined) {
    locals.capabilitiesCards = _capabilitiesCards;
  }

  // Canonical URL (#85). Derived from the output path so it can't drift from where
  // the page actually lands. Pages that are duplicates of another URL (the report
  // redirect stubs) override it with `canonicalPath` in front matter.
  if (locals.canonicalUrl === undefined) {
    locals.canonicalUrl = canonicalUrlFor(locals.canonicalPath || relativePath);
  }
  if (locals.sloshingAssetPath === undefined && _sloshingRelease) {
    locals.sloshingAssetPath = _sloshingRelease.assetPath;
  }

  const html = await renderHtml(content, locals);

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, html);
  console.log(`Built: ${relativePath}`);
}

// Run a raw HTML string through the same pipeline pages use: resolve <include>
// partials, then expand {{ }} expressions with `locals`. Shared by processFile and
// the generated capability detail pages (C4) so they get identical chrome.
async function renderHtml(content, locals) {
  // Process includes first, then expressions (so included content gets variables expanded)
  const result = await posthtml([
    include({ root: srcDir }),
    expressions({ locals })
  ]).process(content);
  return result.html;
}

// Generate one detail page per non-withheld capability at dist/capabilities/<id>.html
// (C4, #52). Pages live one level deep, so rootPath is '../' for the shared partials.
async function buildCapabilityDetailPages(registry) {
  const caps = (registry && registry.capabilities || []).filter(c => c.status !== 'withheld');
  // Release-backed capabilities have no generated detail page — their canonical
  // destination is an existing hub on this site (see render-capabilities detailHref).
  const generated = caps.filter(c => !isReleaseBacked(c));
  const outDir = path.join(distDir, 'capabilities');
  ensureDir(outDir);
  const renderedAt = new Date().toISOString().slice(0, 10);
  for (const cap of generated) {
    const doc = capabilityDetailDocument(cap, caps, { renderedAt });
    const html = await renderHtml(doc, {
      rootPath: '../',
      copy: loadCopy(),
      canonicalUrl: canonicalUrlFor(`capabilities/${detailFileName(cap)}`),
    });
    fs.writeFileSync(path.join(outDir, detailFileName(cap)), html);
    console.log(`Built: capabilities/${detailFileName(cap)}`);
  }
  return generated.length;
}

// Copy assets/ into dist/, minus the CSS that buildCSS() produces or consumes (#86).
//
// Skipped:
//   - BUNDLE_INPUTS — they are concatenated into styles.min.css; shipping them too was
//     ~124KB of dead weight no page references.
//   - styles.min.css — a stale committed build artifact (predates theme.css). It was
//     copied in and then overwritten by the bundle step, so the copy was pointless and
//     the stale file could ship if the bundle ever failed. Untracking it belongs with
//     the legacy-root cleanup (#88), which still needs it.
//
// Directly-referenced stylesheets (sloshing-browser.css, sloshing-reports.css) are NOT
// bundle inputs and must keep shipping — hence a skip list rather than "copy only the
// bundle".
const CSS_NOT_COPIED = new Set([...BUNDLE_INPUTS, 'styles.min.css']);

// Verify every vendored third-party blob that ships a `<file>.sha256` sidecar (#86).
//
// `assets/js/plotly-2.32.0.min.js` is 3.6MB of third-party code served from our own
// origin, and its `.sha256` sidecar existed for months with nothing reading it —
// integrity theatre. Now that the CSP no longer allows cdn.plot.ly, this copy is the
// only Plotly the site can load, so a corrupted or swapped file breaks every chart on
// 18 pages with no external fallback. Fail the build rather than ship it.
//
// Format is `sha256sum` output: "<hex>  <path>". Throws on mismatch, missing target,
// or a malformed sidecar — a check that silently passes when it can't run is worse
// than no check.
function verifyVendoredAssets(assetsDir = './assets') {
  if (!fs.existsSync(assetsDir)) return [];
  const crypto = require('crypto');
  const verified = [];

  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.sha256')) continue;

      const target = p.slice(0, -'.sha256'.length);
      const rel = path.relative(assetsDir, target).split(path.sep).join('/');
      if (!fs.existsSync(target)) {
        throw new Error(`vendored-asset integrity: ${rel}.sha256 exists but ${rel} does not`);
      }
      const expected = (fs.readFileSync(p, 'utf8').trim().split(/\s+/)[0] || '').toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(expected)) {
        throw new Error(`vendored-asset integrity: ${rel}.sha256 is not a sha256 digest`);
      }
      const actual = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
      if (actual !== expected) {
        throw new Error(
          `vendored-asset integrity: ${rel} does not match its .sha256\n` +
          `  expected ${expected}\n  actual   ${actual}`);
      }
      verified.push(rel);
    }
  };

  walk(assetsDir);
  return verified;
}

function copyAssets() {
  const assetsDir = './assets';
  const destDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return;

  let skipped = 0;
  fs.cpSync(assetsDir, destDir, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(assetsDir, src).split(path.sep).join('/');
      if (rel.startsWith('css/') && CSS_NOT_COPIED.has(path.basename(src))) {
        skipped++;
        return false;
      }
      return true;
    },
  });
  console.log(`Copied: assets/ (${skipped} bundled/stale CSS files not copied)`);
}

// Can this checkout answer "when did this file last change?" — i.e. is it a git repo
// with full history? On a shallow clone `git log -- <path>` only sees the commits in
// the shallow window, so files touched by the tip get a date and everything else gets
// nothing. That yields a sitemap where a handful of pages carry a lastmod and the rest
// don't, which reads to a crawler as "only these changed" — worse than omitting the
// field entirely. CI checks out with fetch-depth: 0; Vercel's clone depth is not ours
// to control, so this is detected rather than assumed.
function gitHistoryAvailable() {
  try {
    const { execFileSync } = require('child_process');
    const run = args => execFileSync('git', args,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    run(['rev-parse', '--git-dir']);
    return run(['rev-parse', '--is-shallow-repository']) !== 'true';
  } catch {
    return false;
  }
}

// Last commit date for a source file, as YYYY-MM-DD. Used for sitemap <lastmod> so the
// date reflects when the page actually changed rather than when the site was rebuilt —
// a build-time stamp would tell crawlers every page changed on every deploy. Returns
// null when the file has no history reachable from this checkout.
function gitLastModified(sourceFile) {
  if (!sourceFile) return null;
  try {
    const { execFileSync } = require('child_process');
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', sourceFile],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

// Every built page, dist-relative, sorted — the input to the sitemap.
function builtPages(dir = distDir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) builtPages(p, base, out);
    else if (e.name.endsWith('.html')) out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out.sort();
}

// Which source file produced a built page — for the lastmod lookup. Generated pages
// (capability details, the drill-down) have no 1:1 source, so they fall back to the
// generator that produces them.
function sourceFileFor(relPath) {
  const direct = path.join(srcDir, relPath);
  if (fs.existsSync(direct)) return direct;
  if (relPath.startsWith('capabilities/')) return './config/capabilities.yaml';
  return null;
}

// Generate sitemap.xml from the build output (#85).
//
// Replaces the hand-maintained file, which had drifted badly: it listed /samples/
// (not built) and omitted 13 built pages including every capability page, so
// everything shipped since the capability work was invisible to search. Deriving it
// from dist/ means a new page is listed the moment it builds.
function writeSitemap(destDirArg = distDir) {
  const pages = builtPages(destDirArg).filter(p => !(p in SITEMAP_EXCLUDE));
  // All-or-nothing on lastmod: a partial set is a misleading signal (see
  // gitHistoryAvailable). <lastmod> is optional in the sitemap protocol, so omitting it
  // everywhere is valid; emitting it for an arbitrary subset is not honest.
  const datesAvailable = gitHistoryAvailable();
  if (!datesAvailable) {
    console.warn('sitemap: shallow or non-git checkout — omitting <lastmod> (all-or-nothing)');
  }
  const entries = pages.map(p => {
    const lastmod = datesAvailable ? gitLastModified(sourceFileFor(p)) : null;
    return [
      '  <url>',
      `    <loc>${canonicalUrlFor(p)}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '  </url>',
    ].join('\n');
  });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- Generated by build.js from dist/ — do not edit by hand (#85). -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(destDirArg, 'sitemap.xml'), xml);
  const skipped = Object.keys(SITEMAP_EXCLUDE).length;
  const dated = datesAvailable ? ' with lastmod' : ' without lastmod';
  console.log(`Generated: sitemap.xml — ${pages.length} URLs (${skipped} excluded)${dated}`);
  return pages;
}

// Copy robots.txt from repo root into dist/ so Vercel serves it
// (same root cause as sitemap.xml — source file was never reaching dist/)
function copyRobotsTxt(srcFile = './robots.txt', destDirArg = distDir) {
  const dest = path.join(destDirArg, 'robots.txt');
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, dest);
    console.log('Copied: robots.txt');
  } else {
    console.warn('robots.txt not found at repo root; skipping');
  }
}

// Main build function
async function build() {
  console.log('Building site...\n');

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir);

  // The two report pages must never build against an absent, partial, or mixed
  // release. Read and validate the pointer once so every page receives the same
  // immutable path.
  _sloshingRelease = validateSloshingRelease(path.resolve('.'));

  // Hydrate the capability registry (C2) and render its cards (C3) before processing
  // pages, so content/capabilities/index.html can inject them. Never fails the build.
  try {
    const reg = await loadHydratedCapabilities();
    _hydratedRegistry = reg;
    _capabilitiesCards = renderCards(reg);
    const tables = (reg.capabilities || []).flatMap(c => c.tables || []);
    const bySource = tables.reduce((a, t) => { a[t.data_source] = (a[t.data_source] || 0) + 1; return a; }, {});
    console.log(`Capabilities: ${(reg.capabilities || []).length} registered · ${tables.length} tables · sources ${JSON.stringify(bySource)}`);
  } catch (err) {
    _capabilitiesCards = '';
    console.warn(`Capabilities render skipped: ${err.message}`);
  }

  // Process all HTML files
  const files = getHtmlFiles(srcDir);
  for (const file of files) {
    await processFile(file);
  }

  // Generate per-capability detail pages (C4) from the hydrated registry.
  if (_hydratedRegistry) {
    try {
      const n = await buildCapabilityDetailPages(_hydratedRegistry);
      console.log(`Capability detail pages: ${n}`);
    } catch (err) {
      console.warn(`Capability detail pages skipped: ${err.message}`);
    }
  }

  // Interactive drill-down page (Field ▸ Block ▸ Bore) from the HF snapshot.
  try {
    const { buildDrilldown, buildHub } = require('./scripts/build-drilldown');
    const res = buildDrilldown(distDir);
    if (res) console.log(`Built: capabilities/dc-drilldown.html · ${res.bores} bores`);
    else console.warn('Drill-down skipped: template or snapshot missing');
    const hub = buildHub(distDir);
    if (hub) console.log(`Built: ${hub}`);
  } catch (err) {
    console.warn(`Drill-down skipped: ${err.message}`);
  }

  // Copy assets — integrity-check vendored blobs before they reach dist/
  const verified = verifyVendoredAssets();
  console.log(`Verified: ${verified.length} vendored asset(s) against .sha256 — ${verified.join(', ') || 'none'}`);
  copyAssets();
  writeSitemap();
  copyRobotsTxt();

  console.log(`\nBuild complete! ${files.length} pages built.`);
}

// PurgeCSS - strip unused Bootstrap CSS
// Build dist/assets/css/styles.min.css: purge Bootstrap against the built HTML, then
// concatenate and minify — all reading from ./assets/css (source), never from dist/.
//
// The previous order was copy → purge-in-place → bundle-from-dist, which meant the
// bundle silently depended on the copy step having run and on files existing in dist/;
// a missing input produced a smaller bundle and a successful exit.
async function buildCSS() {
  const srcCssDir = './assets/css';
  const distCssDir = path.join(distDir, 'assets/css');
  ensureDir(distCssDir);

  console.log('\nBuilding CSS...');

  const pieces = [];
  let totalOriginal = 0;

  for (const file of BUNDLE_INPUTS) {
    const srcPath = path.join(srcCssDir, file);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`CSS bundle input missing: ${srcPath}`);
    }
    let css = fs.readFileSync(srcPath, 'utf8');
    totalOriginal += Buffer.byteLength(css, 'utf8');

    if (file === 'bootstrap-united.css') {
      const before = Buffer.byteLength(css, 'utf8');
      const [result] = await new PurgeCSS().purge({
        // Scan the built HTML plus the JS that ships with it — dist/assets/js is where
        // runtime class names live.
        content: [`${distDir}/**/*.html`, `${distDir}/assets/js/*.js`],
        css: [{ raw: css, extension: 'css' }],
        safelist: { standard: PURGE_SAFELIST },
      });
      css = result.css;
      const after = Buffer.byteLength(css, 'utf8');
      const reduction = 1 - after / before;
      console.log(`  PurgeCSS: ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB (${(reduction * 100).toFixed(0)}% reduction)`);

      if (reduction < PURGE_MIN_REDUCTION) {
        throw new Error(
          `PurgeCSS reduction ${(reduction * 100).toFixed(0)}% is below the ${(PURGE_MIN_REDUCTION * 100)}% floor — ` +
          `the safelist has probably re-broadened and dead CSS is shipping again (#86).`
        );
      }
      const stripped = PURGE_REQUIRED.filter(sel => !css.includes(sel));
      if (stripped.length) {
        throw new Error(`PurgeCSS stripped required selectors: ${stripped.join(', ')}`);
      }
    }

    pieces.push(css);
  }

  const output = new CleanCSS({ level: 2, compatibility: 'ie9' }).minify(pieces.join('\n'));
  if (output.errors.length) {
    throw new Error(`CSS minification failed: ${output.errors.join('; ')}`);
  }

  fs.writeFileSync(path.join(distCssDir, 'styles.min.css'), output.styles);
  const minified = Buffer.byteLength(output.styles, 'utf8');
  console.log(`  Bundle: ${(totalOriginal / 1024).toFixed(1)}KB → ${(minified / 1024).toFixed(1)}KB (${((1 - minified / totalOriginal) * 100).toFixed(0)}% reduction)`);
}

// Only run build when executed directly (not when required for testing)
if (require.main === module) {
  build()
    .then(() => buildCSS())
    .catch(err => {
      console.error('Build failed:', err);
      process.exit(1);
    });
}

module.exports = { parseFrontMatter, getHtmlFiles, ensureDir, copyRobotsTxt, loadCopy, loadCapabilities, loadHydratedCapabilities, validateSloshingRelease, writeSitemap, builtPages, buildCSS, copyAssets, verifyVendoredAssets, BUNDLE_INPUTS, CSS_NOT_COPIED, PURGE_SAFELIST, PURGE_REQUIRED, PURGE_MIN_REDUCTION, canonicalUrlFor, gitLastModified, gitHistoryAvailable, SITE_ORIGIN, SITEMAP_EXCLUDE };
