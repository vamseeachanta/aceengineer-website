const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include');
const expressions = require('posthtml-expressions');
const { PurgeCSS } = require('purgecss');
const CleanCSS = require('clean-css');

const srcDir = './src';
const distDir = './dist';

// Parse YAML front matter
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    const locals = {};
    match[1].split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        locals[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      }
    });
    return { locals, content: match[2] };
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

  // Process includes first, then expressions (so included content gets variables expanded)
  const result = await posthtml([
    include({ root: srcDir }),
    expressions({ locals })
  ]).process(content);

  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, result.html);
  console.log(`Built: ${relativePath}`);
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

// Main build function
async function build() {
  console.log('Building site...\n');

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir);

  // Process all HTML files
  const files = getHtmlFiles(srcDir);
  for (const file of files) {
    await processFile(file);
  }

  // Copy assets
  copyAssets();

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
    const cssFiles = ['fonts.css', 'bootstrap-united.css', 'responsive.css', 'marketing.css'];
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

build()
  .then(() => purgeBootstrapCSS())
  .then(() => bundleCSS())
  .catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
  });
