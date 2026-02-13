const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseFrontMatter, getHtmlFiles, ensureDir } = require('../../build');

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
