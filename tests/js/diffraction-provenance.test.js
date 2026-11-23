const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');
const { SITEMAP_EXCLUDE } = require('../../build');

const root = path.join(__dirname, '../..');
const retired = [
  'analysis.html', 'comparison.html', 'aqwa-analysis.html',
  'orcawave-analysis.html', 'orcawave-aqwa-comparison.html',
];
const destination = '/reports/diffraction/';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const doc = file => new JSDOM(read(file)).window.document;

for (const file of retired) {
  test(`${file} redirects directly without forwarding query parameters`, () => {
    for (const directory of ['content', 'dist']) {
      const page = doc(`${directory}/reports/diffraction/${file}`);
      expect(page.querySelectorAll('h1')).toHaveLength(1);
      expect(page.querySelector('meta[name="robots"]').content).toBe('noindex');
      expect(page.querySelector('link[rel="canonical"]').href)
        .toBe(`https://www.aceengineer.com${destination}`);
      expect(page.querySelector('meta[http-equiv="refresh"]').content)
        .toBe(`0; url=${destination}`);
      expect(page.querySelector('main a[href]').getAttribute('href')).toBe(destination);
      const replace = jest.fn();
      const scripts = [...page.querySelectorAll('script')];
      expect(scripts).toHaveLength(1);
      vm.runInNewContext(scripts[0].textContent, {
        location: { replace, search: '?vessel=synthetic-unreviewed&damping=7' },
      });
      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith(destination);
    }
  });

  test(`${file} has a permanent hosting redirect and no discovery entry`, () => {
    const source = `${destination}${file}`;
    const redirects = JSON.parse(read('vercel.json')).redirects;
    expect(redirects.filter(entry => entry.source === source)).toEqual([
      { source, destination, permanent: true },
    ]);
    expect(SITEMAP_EXCLUDE).toHaveProperty([`reports/diffraction/${file}`]);
    for (const discovery of ['dist/sitemap.xml', 'dist/llms.txt']) {
      expect(read(discovery)).not.toContain(source);
    }
  });
}

test('diffraction pages cannot fetch or render unreviewed result series', () => {
  for (const directory of ['content', 'dist']) {
    const folder = path.join(root, directory, 'reports/diffraction');
    expect(fs.readdirSync(folder).sort()).toEqual(['index.html', ...retired].sort());
    for (const file of fs.readdirSync(folder)) {
      const html = read(`${directory}/reports/diffraction/${file}`);
      const page = new JSDOM(html).window.document;
      expect(html).not.toMatch(/datasets-server|digitalmodel-diffraction-rao|Plotly|fetch\s*\(|vessel_id|vessel_db/);
      expect(page.querySelector('table, canvas, svg, iframe, select')).toBeNull();
      for (const link of page.querySelectorAll('a[href]')) {
        const url = new URL(link.getAttribute('href'), `https://www.aceengineer.com${destination}`);
        expect(retired.some(name => url.pathname === `${destination}${name}`)).toBe(false);
      }
    }
  }
});

test('the index retains generic analysis and comparison methods', () => {
  const page = doc('dist/reports/diffraction/index.html');
  const text = page.querySelector('main').textContent.replace(/\s+/g, ' ').toLowerCase();
  for (const method of [
    'six-degree-of-freedom', 'radiation damping',
    'long-period', 'overlapping period band', 'linear interpolation', 'phase conventions',
  ]) expect(text).toContain(method);
  expect(text).toContain('results without a public source were removed pending source review.');
  expect(read('dist/sitemap.xml')).toContain(`<loc>https://www.aceengineer.com${destination}</loc>`);
});
