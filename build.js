const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const include = require('posthtml-include');
const expressions = require('posthtml-expressions');

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

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
