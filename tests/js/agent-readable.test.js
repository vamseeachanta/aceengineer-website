const fs = require('fs');
const os = require('os');
const path = require('path');
const { JSDOM } = require('jsdom');
const {
  builtPages, canonicalUrlFor, SITEMAP_EXCLUDE, writeSitemap, writeLlmsTxt,
  gitLastModified, sourceFileFor, writeLlmsFullTxt,
} = require('../../build');
const { mainText, renderReportRows, validateReportTargets } = require('../../scripts/agent-readable');
const { measureAgentReadable } = require('../../scripts/measure-agent-readable');

// Expected strings are hand transcriptions of these synthetic inputs, not output
// from the implementation. The date is the complete-date example in W3C's
// Date and Time Formats (1997), https://www.w3.org/TR/NOTE-datetime#Formats.
const date = '1997-07-16';
const fixture = '<html><head><title>Flow &amp; Loads</title>' +
  '<meta name="description" content="Loads &amp; response."></head><body>' +
  '<nav>Outside navigation</nav><main><h1>Flow &amp; Loads</h1>' +
  '<p>Read <em>this</em> first.<br>Then continue.</p><h2>Method</h2>' +
  '<ul><li>Check inputs.</li><li>Read limits.</li></ul>' +
  '<table><tr><th>Item</th><th>State</th></tr><tr><td>Input</td><td>Known</td></tr></table>' +
  '<script>unwantedScript()</script><style>.unwanted{}</style><template>Template</template>' +
  '<p hidden>Hidden</p><p aria-hidden="true">Also hidden</p><!-- Comment -->' +
  '<nav>Local navigation</nav><footer>Local footer</footer></main><footer>Outside footer</footer></body></html>';

describe('agent-readable fixtures', () => {
  let dir;
  let scratch;
  beforeEach(() => {
    scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-readable-'));
    dir = path.join(scratch, 'dist');
    fs.mkdirSync(dir);
  });
  afterEach(() => { fs.rmSync(scratch, { recursive: true, force: true }); jest.restoreAllMocks(); });
  function seed(page, html = fixture) {
    const file = path.join(dir, page);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }

  test('measurement counts an independently hand-listed fixture surface', () => {
    // Three destinations, one excluded error page; two case studies, only one
    // description; one schema block, two sitemap dates. These counts are seeded
    // explicitly here, without calling any generator to derive expected values.
    seed('index.html', fixture.replace('</head>', '<script type="application/ld+json">{}</script></head>'));
    seed('case-studies/a.html'); seed('case-studies/b.html'); seed('404.html');
    fs.writeFileSync(path.join(dir, 'llms.txt'), '- [A](https://www.aceengineer.com/case-studies/a.html): Loads.\n');
    fs.writeFileSync(path.join(dir, 'sitemap.xml'), '<urlset><url><loc>A</loc><lastmod>1997-07-16</lastmod></url><url><loc>B</loc><lastmod>1997-07-16</lastmod></url><url><loc>C</loc></url></urlset>');
    fs.writeFileSync(path.join(dir, 'robots.txt'), '# Guidance\nUser-agent: *\nAllow: /\n');
    expect(measureAgentReadable(dir)).toEqual({
      indexedPages: 3, llmsPresent: true, fullTextPresent: false, sitemapUrls: 3,
      sitemapLastmod: 2, caseStudies: { total: 2, described: 1 },
      dataPages: { total: 0, described: 0 }, reportsIndexPresent: false,
      jsonLdPages: 1, robotsRules: ['User-agent: *', 'Allow: /'],
    });
  });

  test('main content preserves headings, paragraphs, lists and table reading order', () => {
    expect(mainText(fixture)).toBe('# Flow & Loads\n\nRead this first.\nThen continue.\n\n## Method\n\nCheck inputs.\nRead limits.\n\nItem State\nInput Known');
  });

  test('role main is supported and absent main content is reported', () => {
    expect(mainText('<div role="main"><h1>Method</h1><p>Read limits.</p></div>'))
      .toBe('# Method\n\nRead limits.');
    expect(() => mainText('<body><nav>Navigation only</nav></body>')).toThrow(/main content/);
  });

  test('full text uses sorted page paths, decoded metadata and shared exclusions', () => {
    seed('z/index.html'); seed('index.html'); seed('case-studies/a.html'); seed('404.html');
    const pages = writeLlmsFullTxt(dir);
    expect(pages).toEqual(['case-studies/a.html', 'index.html', 'z/index.html']);
    const text = fs.readFileSync(path.join(dir, 'llms-full.txt'), 'utf8');
    expect(text).toContain('## Flow & Loads\n\nURL: https://www.aceengineer.com/case-studies/a.html\nDescription: Loads & response.\n\n# Flow & Loads');
    expect(text.indexOf('/case-studies/a.html')).toBeLessThan(text.indexOf('URL: https://www.aceengineer.com/\n'));
    expect(text).toContain('URL: https://www.aceengineer.com/z/\n');
    expect(text).not.toMatch(/404\.html|unwantedScript|Outside navigation|Hidden|Comment/);
    writeLlmsFullTxt(dir);
    expect(fs.readFileSync(path.join(dir, 'llms-full.txt'), 'utf8')).toBe(text);
  });

  test('missing metadata stops full-text generation rather than inventing copy', () => {
    seed('index.html', '<html><head><title>Method</title></head><main>Read limits.</main></html>');
    expect(() => writeLlmsFullTxt(dir)).toThrow(/missing title or description/);
  });

  test('case-study and data-page descriptions are copied exactly from metadata', () => {
    seed('index.html'); seed('case-studies/method.html'); seed('data/observations/index.html');
    writeLlmsTxt(dir, { capabilities: [] });
    const text = fs.readFileSync(path.join(dir, 'llms.txt'), 'utf8');
    expect(text).toContain('- [Flow & Loads](https://www.aceengineer.com/case-studies/method.html): Loads & response.');
    expect(text).toContain('- [Flow & Loads](https://www.aceengineer.com/data/observations/): Loads & response.');
  });

  test('source dates use the content file, not the rendered file or rebuild clock', () => {
    seed('index.html'); seed('about.html');
    const sourceDir = path.join(scratch, 'sources');
    fs.mkdirSync(sourceDir);
    fs.writeFileSync(path.join(sourceDir, 'index.html'), 'source');
    fs.writeFileSync(path.join(sourceDir, 'about.html'), 'source');
    const dateForSource = jest.fn(() => date);
    writeSitemap(dir, { sourceDir, historyAvailable: true, dateForSource });
    expect(dateForSource.mock.calls).toEqual([[path.join(sourceDir, 'about.html')], [path.join(sourceDir, 'index.html')]]);
    const doc = new JSDOM(fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' }).window.document;
    // Two HTML output files were hand-seeded above; sources are not HTML output.
    expect([...doc.querySelectorAll('url > lastmod')].map(node => node.textContent)).toEqual([date, date]);
  });

  test('shallow history and unavailable source dates never become build dates', () => {
    seed('index.html');
    const dateForSource = jest.fn(() => null);
    writeSitemap(dir, { historyAvailable: false, dateForSource });
    expect(dateForSource).not.toHaveBeenCalled();
    expect(fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8')).not.toContain('<lastmod>');
    writeSitemap(dir, { historyAvailable: true, dateForSource });
    expect(fs.readFileSync(path.join(dir, 'sitemap.xml'), 'utf8')).not.toContain('<lastmod>');
  });

  test('git dates read the last source commit in the documented short format', () => {
    const child = require('child_process');
    const spy = jest.spyOn(child, 'execFileSync').mockReturnValue(date + '\n');
    expect(gitLastModified('content/example.html')).toBe(date);
    expect(spy.mock.calls[0].slice(0, 2)).toEqual(['git', ['log', '-1', '--format=%cs', '--', 'content/example.html']]);
    spy.mockReturnValue('');
    expect(gitLastModified('content/untracked.html')).toBeNull();
  });

  test('generated drilldown sources refer to their own templates', () => {
    expect(sourceFileFor('capabilities/dc-drilldown.html')).toBe(path.join('scripts', 'templates', 'dc-drilldown.html'));
    expect(sourceFileFor('capabilities/dc-qaqc-hub.html')).toBe(path.join('scripts', 'templates', 'dc-qaqc-hub.html'));
  });

  const report = { title: 'Flow & Loads', date, format: 'HTML', href: '/reports/example.html', public: true };
  test('report rows escape metadata and state the content revision date', () => {
    expect(renderReportRows([report])).toBe('<tr><td><a href="/reports/example.html">Flow &amp; Loads</a></td><td><time datetime="1997-07-16">1997-07-16</time></td><td>HTML</td></tr>');
  });
  test.each([
    { public: false }, { date: 'not a date' }, { date: '1997-02-30' }, { title: '' },
    { format: '' }, { href: '/private/example.html' }, { href: '/reports/../private.html' },
    { href: 'https://example.com/reports/example.html' }, { href: '/reports/example.html?secret=value' },
  ])('invalid or non-public report entries are refused: %o', change => {
    expect(() => renderReportRows([{ ...report, ...change }])).toThrow(/report/i);
  });
  test('duplicate report URLs are refused', () => {
    expect(() => renderReportRows([report, report])).toThrow(/duplicate/i);
  });
  test('missing and excluded report targets are refused', () => {
    expect(() => validateReportTargets([report], dir, SITEMAP_EXCLUDE)).toThrow(/missing/i);
    seed('reports/example.html');
    expect(() => validateReportTargets([report], dir, SITEMAP_EXCLUDE)).not.toThrow();
    expect(() => validateReportTargets([report], dir, { 'reports/example.html': 'retired' })).toThrow(/excluded/i);
  });
});

describe('built agent-readable surface', () => {
  const dist = path.resolve(__dirname, '../../dist');
  const pages = builtPages(dist).filter(page => !Object.hasOwn(SITEMAP_EXCLUDE, page));
  test('every sitemap destination is listed in both text files', () => {
    const xml = new JSDOM(fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8'), { contentType: 'text/xml' }).window.document;
    const urls = [...xml.querySelectorAll('url > loc')].map(node => node.textContent).sort();
    const llms = fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8');
    const full = fs.readFileSync(path.join(dist, 'llms-full.txt'), 'utf8');
    expect(full.split('\n').filter(line => line.startsWith('URL: ')).map(line => line.slice('URL: '.length)).sort()).toEqual(urls);
    for (const url of urls) expect(llms).toContain(`](${url})`);
    for (const page of Object.keys(SITEMAP_EXCLUDE)) expect(full).not.toContain(`URL: ${canonicalUrlFor(page)}\n`);
  });
  test('every case study and data page retains its meta description', () => {
    const llms = fs.readFileSync(path.join(dist, 'llms.txt'), 'utf8');
    for (const page of pages.filter(page => /^(case-studies|data)\//.test(page))) {
      const doc = new JSDOM(fs.readFileSync(path.join(dist, page), 'utf8')).window.document;
      expect(llms).toContain(`](${canonicalUrlFor(page)}): ${doc.querySelector('meta[name="description"]').content}`);
    }
  });
  test('the documented worked example is a literal opening of the exported entry', () => {
    const documentation = fs.readFileSync(path.resolve(__dirname, '../../docs/agent-readable-site.md'), 'utf8');
    const excerpt = documentation.match(/```text\n([\s\S]*?)\n```/)[1];
    expect(fs.readFileSync(path.join(dist, 'llms-full.txt'), 'utf8')).toContain(excerpt);
  });
  test('report register covers only the built public report destinations', () => {
    const reports = require('../../config/public-reports.json').reports;
    validateReportTargets(reports, dist, SITEMAP_EXCLUDE);
    expect(reports.map(report => report.href).sort()).toEqual(pages.filter(page => page.startsWith('reports/') && page !== 'reports/index.html').map(canonicalUrlFor).map(url => new URL(url).pathname).sort());
    const doc = new JSDOM(fs.readFileSync(path.join(dist, 'reports/index.html'), 'utf8')).window.document;
    expect(doc.querySelectorAll('tbody tr')).toHaveLength(reports.length);
    for (const report of reports) expect(doc.querySelector(`a[href="${report.href}"]`)?.textContent).toBe(report.title);
  });
  test('crawler rules explicitly allow all paths without adding a block', () => {
    const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
    const rules = robots.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    expect(rules).toContain('User-agent: *');
    expect(rules).toContain('Allow: /');
    expect(rules).toContain('Sitemap: https://www.aceengineer.com/sitemap.xml');
    expect(rules.some(line => /^Disallow:/i.test(line))).toBe(false);
  });
});
