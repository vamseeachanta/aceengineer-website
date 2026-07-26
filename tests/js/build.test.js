const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseFrontMatter, getHtmlFiles, ensureDir, copyRobotsTxt, writeSitemap, canonicalUrlFor, SITEMAP_EXCLUDE } = require('../../build');

describe('parseFrontMatter', () => {
  test('parses valid front matter with multiple fields', () => {
    const input = '---\ntitle: Hello World\nauthor: Jane\n---\n<p>Body</p>';
    const result = parseFrontMatter(input);

    expect(result.locals).toEqual({ title: 'Hello World', author: 'Jane' });
    expect(result.content).toBe('<p>Body</p>');
  });

  test('returns empty locals when no front matter present', () => {
    const input = '<p>No front matter here</p>';
    const result = parseFrontMatter(input);

    expect(result.locals).toEqual({});
    expect(result.content).toBe('<p>No front matter here</p>');
  });

  test('strips surrounding quotes from values', () => {
    const input = '---\ntitle: "Quoted Title"\nname: \'Single Quoted\'\n---\nBody';
    const result = parseFrontMatter(input);

    expect(result.locals.title).toBe('Quoted Title');
    expect(result.locals.name).toBe('Single Quoted');
  });

  test('handles values containing colons', () => {
    const input = '---\nurl: https://example.com:8080/path\n---\nContent';
    const result = parseFrontMatter(input);

    expect(result.locals.url).toBe('https://example.com:8080/path');
  });

  test('handles empty front matter block', () => {
    const input = '---\n\n---\nContent after empty front matter';
    const result = parseFrontMatter(input);

    // The regex requires at least some content between ---, so an empty
    // block with just a newline should still match
    expect(result.content).toBeDefined();
  });

  test('handles front matter with single field', () => {
    const input = '---\nrootPath: ../\n---\n<html></html>';
    const result = parseFrontMatter(input);

    expect(result.locals.rootPath).toBe('../');
    expect(result.content).toBe('<html></html>');
  });

  test('ignores lines without colon separator', () => {
    const input = '---\ntitle: Valid\nno-colon-line\nauthor: Also Valid\n---\nBody';
    const result = parseFrontMatter(input);

    expect(result.locals.title).toBe('Valid');
    expect(result.locals.author).toBe('Also Valid');
    expect(Object.keys(result.locals)).toHaveLength(2);
  });
});

describe('getHtmlFiles', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('finds HTML files in a flat directory', () => {
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '<html></html>');
    fs.writeFileSync(path.join(tmpDir, 'about.html'), '<html></html>');
    fs.writeFileSync(path.join(tmpDir, 'style.css'), 'body {}');

    const files = getHtmlFiles(tmpDir);

    expect(files).toHaveLength(2);
    expect(files.every(f => f.endsWith('.html'))).toBe(true);
  });

  test('finds HTML files recursively in subdirectories', () => {
    const subDir = path.join(tmpDir, 'blog');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '');
    fs.writeFileSync(path.join(subDir, 'post.html'), '');

    const files = getHtmlFiles(tmpDir);

    expect(files).toHaveLength(2);
    expect(files.some(f => f.includes('blog'))).toBe(true);
  });

  test('excludes files inside partials directory', () => {
    const partialsDir = path.join(tmpDir, 'partials');
    fs.mkdirSync(partialsDir);
    fs.writeFileSync(path.join(tmpDir, 'index.html'), '');
    fs.writeFileSync(path.join(partialsDir, 'header.html'), '');

    const files = getHtmlFiles(tmpDir);

    expect(files).toHaveLength(1);
    expect(files[0]).toContain('index.html');
  });

  test('returns empty array for directory with no HTML files', () => {
    fs.writeFileSync(path.join(tmpDir, 'readme.md'), '# Hello');
    fs.writeFileSync(path.join(tmpDir, 'app.js'), '');

    const files = getHtmlFiles(tmpDir);

    expect(files).toEqual([]);
  });

  test('returns empty array for empty directory', () => {
    const files = getHtmlFiles(tmpDir);

    expect(files).toEqual([]);
  });

  test('accumulates into provided array', () => {
    fs.writeFileSync(path.join(tmpDir, 'page.html'), '');
    const existing = ['/some/other/file.html'];

    const files = getHtmlFiles(tmpDir, existing);

    expect(files).toHaveLength(2);
    expect(files[0]).toBe('/some/other/file.html');
  });
});

describe('ensureDir', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ensuredir-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('creates a directory that does not exist', () => {
    const newDir = path.join(tmpDir, 'new-folder');

    ensureDir(newDir);

    expect(fs.existsSync(newDir)).toBe(true);
    expect(fs.statSync(newDir).isDirectory()).toBe(true);
  });

  test('creates nested directories recursively', () => {
    const nestedDir = path.join(tmpDir, 'a', 'b', 'c');

    ensureDir(nestedDir);

    expect(fs.existsSync(nestedDir)).toBe(true);
  });

  test('does not throw when directory already exists', () => {
    const existingDir = path.join(tmpDir, 'existing');
    fs.mkdirSync(existingDir);

    expect(() => ensureDir(existingDir)).not.toThrow();
  });
});

describe('canonicalUrlFor', () => {
  test('always emits the www origin — the apex 301s (vercel.json)', () => {
    expect(canonicalUrlFor('about.html')).toBe('https://www.aceengineer.com/about.html');
  });

  test('directory index pages canonicalise to the directory, not to index.html', () => {
    expect(canonicalUrlFor('blog/index.html')).toBe('https://www.aceengineer.com/blog/');
    expect(canonicalUrlFor('index.html')).toBe('https://www.aceengineer.com/');
  });

  test('nested pages keep their path', () => {
    expect(canonicalUrlFor('capabilities/field-explorer.html'))
      .toBe('https://www.aceengineer.com/capabilities/field-explorer.html');
  });
});

describe('writeSitemap', () => {
  let tmpDir;
  let logSpy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitemap-test-'));
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  function seed(files) {
    for (const f of files) {
      const p = path.join(tmpDir, f);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, '<html></html>');
    }
  }

  test('lists every built page, recursively, as a canonical www URL', () => {
    seed(['index.html', 'about.html', 'blog/index.html', 'blog/a-post.html']);
    writeSitemap(tmpDir);
    const xml = fs.readFileSync(path.join(tmpDir, 'sitemap.xml'), 'utf8');
    expect(xml).toContain('<loc>https://www.aceengineer.com/</loc>');
    expect(xml).toContain('<loc>https://www.aceengineer.com/about.html</loc>');
    expect(xml).toContain('<loc>https://www.aceengineer.com/blog/</loc>');
    expect(xml).toContain('<loc>https://www.aceengineer.com/blog/a-post.html</loc>');
  });

  test('excludes 404 and the noindex redirect stubs', () => {
    seed(['index.html', '404.html', 'reports/diffraction/aqwa-analysis.html']);
    const listed = writeSitemap(tmpDir);
    expect(listed).toEqual(['index.html']);
    const xml = fs.readFileSync(path.join(tmpDir, 'sitemap.xml'), 'utf8');
    expect(xml).not.toContain('404.html');
    expect(xml).not.toContain('aqwa-analysis');
  });

  test('ignores non-HTML files in the output tree', () => {
    seed(['index.html']);
    fs.writeFileSync(path.join(tmpDir, 'robots.txt'), 'User-agent: *');
    const listed = writeSitemap(tmpDir);
    expect(listed).toEqual(['index.html']);
  });

  test('emits well-formed, sorted XML with a do-not-edit marker', () => {
    seed(['index.html', 'about.html']);
    writeSitemap(tmpDir);
    const xml = fs.readFileSync(path.join(tmpDir, 'sitemap.xml'), 'utf8');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('do not edit by hand');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    expect(xml.indexOf('/about.html')).toBeLessThan(xml.indexOf('aceengineer.com/</loc>'));
  });
});

describe('SITEMAP_EXCLUDE', () => {
  test('every exclusion carries a stated reason', () => {
    for (const [page, reason] of Object.entries(SITEMAP_EXCLUDE)) {
      expect(typeof reason).toBe('string');
      expect(reason.length).toBeGreaterThan(10);
      expect(page).toMatch(/\.html$/);
    }
  });
});

describe('copyRobotsTxt', () => {
  let tmpDir;
  let warnSpy;
  let logSpy;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copyrobotstxt-test-'));
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  test('copies robots.txt to destDir byte-identically to source', () => {
    const srcFile = path.join(tmpDir, 'robots.txt');
    const destDir = path.join(tmpDir, 'dist');
    fs.mkdirSync(destDir);
    const body = 'User-agent: *\nAllow: /\n\nSitemap: https://www.aceengineer.com/sitemap.xml\n';
    fs.writeFileSync(srcFile, body);

    copyRobotsTxt(srcFile, destDir);

    const destFile = path.join(destDir, 'robots.txt');
    expect(fs.existsSync(destFile)).toBe(true);
    expect(fs.readFileSync(destFile, 'utf8')).toBe(body);
    expect(logSpy).toHaveBeenCalledWith('Copied: robots.txt');
  });

  test('warns and skips (does not throw) when source file is missing', () => {
    const srcFile = path.join(tmpDir, 'does-not-exist.txt');
    const destDir = path.join(tmpDir, 'dist');
    fs.mkdirSync(destDir);

    expect(() => copyRobotsTxt(srcFile, destDir)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('robots.txt not found'));
    expect(fs.existsSync(path.join(destDir, 'robots.txt'))).toBe(false);
  });
});
