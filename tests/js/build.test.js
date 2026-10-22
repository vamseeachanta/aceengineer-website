const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseFrontMatter, getHtmlFiles, ensureDir, copyRobotsTxt, writeSitemap, writeLlmsTxt, loadCopy, canonicalUrlFor, SITEMAP_EXCLUDE } = require('../../build');

test('copied technical pages retain their canonical URLs, assets and forecast labels in the build', () => {
  const { execFileSync } = require('child_process');
  execFileSync(process.execPath, ['--test', path.join(__dirname, '../node/digitalmodel-build.test.js')], {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, DIGITALMODEL_BUILD_DIR: path.resolve(__dirname, '../../dist') },
    stdio: 'pipe',
  });
});

test('newsletter web sources contain no e-mail campaign tracking tags', () => {
  const newsletterDir = path.join(__dirname, '../../content/newsletter');
  function checkDirectory(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) checkDirectory(file);
      else expect({ file: path.relative(newsletterDir, file), tagged: /utm_/i.test(fs.readFileSync(file, 'utf8')) })
        .toEqual({ file: path.relative(newsletterDir, file), tagged: false });
    }
  }
  checkDirectory(newsletterDir);
});

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
  test('copied technical pages retain their specified apex URLs', () => {
    const { COPIED_PAGES } = require('../../scripts/copy-digitalmodel-pages');
    for (const page of COPIED_PAGES) expect(canonicalUrlFor(page)).toBe(`https://aceengineer.com/${page}`);
  });
  test('ordinary site pages emit the www origin — the apex redirects (vercel.json)', () => {
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

describe('writeLlmsTxt', () => {
  let tmpDir;
  const registry = { capabilities: [
    { id: 'live-example', title: 'Live Capability', summary: 'Live\n  summary.', status: 'live' },
    { id: 'pending-example', title: 'Pending Capability', summary: 'Pending summary.', status: 'pending' },
    { id: 'withheld-example', title: 'Withheld Capability', summary: 'Withheld summary.', status: 'withheld' },
    { id: 'release-example', title: 'Release Capability', summary: 'Release summary.', status: 'live',
      backing: 'release', release: { hub_url: '/reports/sloshing/' } },
  ] };
  function seed(page, title, description) {
    const file = path.join(tmpDir, page);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `<html><head><title>${title}</title><meta content="${description}" name="description"></head><body></body></html>`);
  }
  function read() { return fs.readFileSync(path.join(tmpDir, 'llms.txt'), 'utf8'); }
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(process.env.TEST_TEMP_DIR || os.tmpdir(), 'llms-test-'));
    seed('index.html', 'Home', 'Home description.');
    seed('about.html', 'About', 'About description.');
    seed('blog/index.html', 'Articles', 'Articles description.');
    seed('blog/example.html', 'Flow &amp; Loads', 'Loads &#38; response &quot;summary&quot;.');
    for (const page of Object.keys(SITEMAP_EXCLUDE)) seed(page, 'Excluded', 'Excluded description.');
    expect(writeLlmsTxt).toEqual(expect.any(Function));
  });
  afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  test('lists live and pending capabilities with collapsed summaries', () => {
    writeLlmsTxt(tmpDir, registry);
    expect(read()).toContain('- [Live Capability](https://www.aceengineer.com/capabilities/live-example.html): Live summary.');
    expect(read()).toContain('- [Pending Capability (pending)](https://www.aceengineer.com/capabilities/pending-example.html): Pending summary.');
  });
  test('withheld capabilities are absent', () => {
    writeLlmsTxt(tmpDir, registry);
    expect(read()).not.toContain('Withheld Capability');
    expect(read()).not.toContain('withheld-example');
  });
  test('sitemap exclusions are absent', () => {
    writeLlmsTxt(tmpDir, registry);
    for (const page of Object.keys(SITEMAP_EXCLUDE)) expect(read()).not.toContain(page);
    expect(read()).not.toContain('Excluded description.');
  });
  test('page line count equals the sitemap count for the same tree', () => {
    const sitemap = writeSitemap(tmpDir);
    writeLlmsTxt(tmpDir, registry);
    const pageLines = read().split('\n').filter(line => line.startsWith('- ')).length - 3;
    expect(pageLines).toBe(sitemap.length);
  });
  test('two writes produce identical bytes', () => {
    writeLlmsTxt(tmpDir, registry);
    const first = fs.readFileSync(path.join(tmpDir, 'llms.txt'));
    writeLlmsTxt(tmpDir, registry);
    expect(fs.readFileSync(path.join(tmpDir, 'llms.txt')).equals(first)).toBe(true);
  });
  test('a forbidden page description rejects the output before writing', () => {
    seed('about.html', 'About', loadCopy().forbidden_phrases[0].toUpperCase());
    expect(() => writeLlmsTxt(tmpDir, registry)).toThrow(/forbidden phrase/i);
    expect(fs.existsSync(path.join(tmpDir, 'llms.txt'))).toBe(false);
  });
  test('the firm heading and home description come from canonical copy and metadata', () => {
    writeLlmsTxt(tmpDir, registry);
    expect(read().split('\n')[0]).toBe('# AceEngineer');
    expect(read()).toContain('> Home description.');
  });
  test('entities are decoded and directory pages use canonical URLs', () => {
    writeLlmsTxt(tmpDir, registry);
    expect(read()).toContain('- [Flow & Loads](https://www.aceengineer.com/blog/example.html): Loads & response "summary".');
    expect(read()).toContain('- [Articles](https://www.aceengineer.com/blog/): Articles description.');
    expect(read()).toContain('## Company');
    expect(read().indexOf('[Articles]')).toBeLessThan(read().indexOf('[Home]'));
  });
  test('release-backed capabilities use the existing report hub', () => {
    writeLlmsTxt(tmpDir, registry);
    expect(read()).toContain('- [Release Capability](https://www.aceengineer.com/reports/sloshing/): Release summary.');
  });

  test('copied technical pages remain listed without adding source descriptions', () => {
    const page = 'digitalmodel/cfd/sloshing-cfd-study.html';
    seed(page, 'Sloshing study', '');
    writeLlmsTxt(tmpDir, registry);
    expect(read()).toContain('- [Sloshing study](https://aceengineer.com/digitalmodel/cfd/sloshing-cfd-study.html)\n');
    expect(writeSitemap(tmpDir)).toContain(page);
  });
  test('a forbidden registry summary rejects the output', () => {
    const forbidden = { capabilities: [{ ...registry.capabilities[0], summary: loadCopy().forbidden_phrases[0] }] };
    expect(() => writeLlmsTxt(tmpDir, forbidden)).toThrow(/forbidden phrase/i);
  });

  test.each([
    'Reduction of 12%.', 'Reduction of 12 percent.', 'Reduction of 60-80%.',
    'Cost of $120.', 'Cost of €120.', 'Cost of 120 USD.', 'Cost of 120 dollars.',
    'Cost of GBP 120.',
  ])('page line omits a description containing a figure: %s', description => {
    const { formatLlmsPageLine } = require('../../build');
    expect(formatLlmsPageLine('Example', 'https://www.aceengineer.com/example.html', description))
      .toBe('- [Example](https://www.aceengineer.com/example.html)');
  });

  test('page line keeps a number without a percentage or currency unit', () => {
    const { formatLlmsPageLine } = require('../../build');
    expect(formatLlmsPageLine('Example', 'https://www.aceengineer.com/example.html', 'Analysis of 253 wellbores.'))
      .toBe('- [Example](https://www.aceengineer.com/example.html): Analysis of 253 wellbores.');
  });

  test('omission preserves forbidden phrase validation and capability summaries', () => {
    seed('about.html', 'About', 'Reduction of 12%.');
    writeLlmsTxt(tmpDir, registry);
    expect(read().split('\n')).toContain('- [About](https://www.aceengineer.com/about.html)');
    expect(read()).toContain('- [Live Capability](https://www.aceengineer.com/capabilities/live-example.html): Live summary.');
    seed('about.html', 'About', `${loadCopy().forbidden_phrases[0]} 12%.`);
    expect(() => writeLlmsTxt(tmpDir, registry)).toThrow(/forbidden phrase/i);
  });
});
