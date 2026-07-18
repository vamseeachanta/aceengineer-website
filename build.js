const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include');
const expressions = require('posthtml-expressions');
const yaml = require('js-yaml');
const { PurgeCSS } = require('purgecss');
const CleanCSS = require('clean-css');
const hf = require('./scripts/hf-fetch');
const { renderCards, capabilityDetailDocument, detailFileName } = require('./scripts/render-capabilities');

const srcDir = './content';
const distDir = './dist';

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
  const outDir = path.join(distDir, 'capabilities');
  ensureDir(outDir);
  for (const cap of caps) {
    const doc = capabilityDetailDocument(cap);
    const html = await renderHtml(doc, { rootPath: '../', copy: loadCopy() });
    fs.writeFileSync(path.join(outDir, detailFileName(cap)), html);
    console.log(`Built: capabilities/${detailFileName(cap)}`);
  }
  return caps.length;
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

// Copy sitemap.xml from repo root into dist/ so Vercel serves it
function copySitemap(srcFile = './sitemap.xml', destDirArg = distDir) {
  const dest = path.join(destDirArg, 'sitemap.xml');
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, dest);
    console.log('Copied: sitemap.xml');
  } else {
    console.warn('sitemap.xml not found at repo root; skipping');
  }
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

  // Copy assets
  copyAssets();
  copySitemap();
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

module.exports = { parseFrontMatter, getHtmlFiles, ensureDir, copySitemap, copyRobotsTxt, loadCopy, loadCapabilities, loadHydratedCapabilities, validateSloshingRelease };
