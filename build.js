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

// Copy assets directory
function copyAssets() {
  const assetsDir = './assets';
  const destDir = path.join(distDir, 'assets');

  if (fs.existsSync(assetsDir)) {
    fs.cpSync(assetsDir, destDir, { recursive: true });
    console.log('Copied: assets/');
  }
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

  // Copy assets
  copyAssets();
  writeSitemap();
  copyRobotsTxt();

  console.log(`\nBuild complete! ${files.length} pages built.`);
}

// PurgeCSS - strip unused Bootstrap CSS
async function purgeBootstrapCSS() {
  const cssSource = './assets/css/bootstrap-united.css';
  if (!fs.existsSync(cssSource)) {
    console.log('PurgeCSS: bootstrap-united.css not found, skipping.');
    return;
  }

  console.log('\nRunning PurgeCSS...');
  const purgeCSSResults = await new PurgeCSS().purge({
    content: ['./dist/**/*.html'],
    css: [cssSource],
    safelist: {
      standard: [
        /^navbar/, /^collapse/, /^collapsing/, /^nav/, /^in$/,
        /^container/, /^row/, /^col-/, /^btn/, /^form/,
        /^sr-only/, /^text-/, /^table/, /^input-group/,
        /^well/, /^lead/, /^breadcrumb/, /^list-/,
        /^page-header/, /^alert/, /^label/
      ],
      deep: [/navbar/, /collapse/]
    }
  });

  if (purgeCSSResults.length > 0) {
    const outputPath = path.join('./dist/assets/css/bootstrap-united.css');
    fs.writeFileSync(outputPath, purgeCSSResults[0].css);
    const originalSize = fs.statSync(cssSource).size;
    const purgedSize = Buffer.byteLength(purgeCSSResults[0].css, 'utf8');
    console.log(`PurgeCSS: ${(originalSize / 1024).toFixed(1)}KB → ${(purgedSize / 1024).toFixed(1)}KB (${((1 - purgedSize / originalSize) * 100).toFixed(0)}% reduction)`);
  }
}

// Concatenate and minify all CSS into a single file
async function bundleCSS() {
    console.log('\nBundling CSS...');
    const distCssDir = path.join(distDir, 'assets/css');

    // Read CSS files in correct order
    const cssFiles = ['fonts.css', 'bootstrap-united.css', 'responsive.css', 'marketing.css', 'components.css', 'theme.css'];
    let combined = '';
    let totalOriginal = 0;

    for (const file of cssFiles) {
        const filePath = path.join(distCssDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            combined += content + '\n';
            totalOriginal += Buffer.byteLength(content, 'utf8');
        }
    }

    // Minify
    const output = new CleanCSS({
        level: 2,
        compatibility: 'ie9'
    }).minify(combined);

    if (output.errors.length > 0) {
        console.error('CSS minification errors:', output.errors);
        return;
    }

    const outputPath = path.join(distCssDir, 'styles.min.css');
    fs.writeFileSync(outputPath, output.styles);

    const minifiedSize = Buffer.byteLength(output.styles, 'utf8');
    console.log(`CSS Bundle: ${(totalOriginal / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (${((1 - minifiedSize / totalOriginal) * 100).toFixed(0)}% reduction)`);
}

// Only run build when executed directly (not when required for testing)
if (require.main === module) {
  build()
    .then(() => purgeBootstrapCSS())
    .then(() => bundleCSS())
    .catch(err => {
      console.error('Build failed:', err);
      process.exit(1);
    });
}

module.exports = { parseFrontMatter, getHtmlFiles, ensureDir, copyRobotsTxt, loadCopy, loadCapabilities, loadHydratedCapabilities, validateSloshingRelease, writeSitemap, builtPages, canonicalUrlFor, gitLastModified, gitHistoryAvailable, SITE_ORIGIN, SITEMAP_EXCLUDE };
