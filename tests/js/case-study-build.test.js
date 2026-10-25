const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { renderHtml, parseFrontMatter, canonicalUrlFor, loadCopy } = require('../../build');
const { loadStudies } = require('../../scripts/case-study-summary');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const studies = loadStudies();

async function originalMain(page) {
  const { content, locals } = parseFrontMatter(read(`content/case-studies/${page}`));
  const html = await renderHtml(content, {
    ...locals, activeNav: '', metadataExcluded: false, copy: loadCopy(),
    canonicalUrl: canonicalUrlFor(`case-studies/${page}`), samplesPublished: false,
  });
  return new JSDOM(html).window.document.querySelector('main');
}

for (const page of Object.keys(studies)) {
  test(`built study preserves original content and ordered blocks: ${page}`, async () => {
    const main = new JSDOM(read(`dist/case-studies/${page}`)).window.document.querySelector('main');
    const overview = main.querySelector('[data-case-study-overview]');
    expect(overview).not.toBeNull();
    expect(overview.previousElementSibling.tagName).toBe('H1');
    expect(Array.from(overview.children).map(section => section.getAttributeNames().find(name => name.startsWith('data-'))))
      .toEqual(['data-case-study-summary', 'data-case-study-report', 'data-case-study-repeat']);
    expect(main.querySelectorAll('#case-study-summary')).toHaveLength(1);
    expect(overview.querySelector('[data-case-study-report]').textContent).toContain('No public full report yet');
    if (studies[page].workflow) {
      expect(overview.querySelector('[data-workflow-tool] a').getAttribute('href')).toBe(studies[page].workflow.toolUrl);
      expect(overview.textContent).toContain('Expected output:');
    } else {
      expect(overview.textContent).toContain('Not yet available as a public workflow');
    }
    overview.remove();
    const original = await originalMain(page);
    // Compare all existing words, not selected claims or the renderer's own strings.
    const text = element => element.textContent.replace(/\s+/g, ' ').trim();
    expect(text(main)).toBe(text(original));
    const contentElements = element => Array.from(element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, figure, img, svg, table, a'))
      .map(node => node.outerHTML);
    expect(contentElements(main)).toEqual(contentElements(original));
  });
}

test('built index adds only summary links to the original cards', async () => {
  const main = new JSDOM(read('dist/case-studies/index.html')).window.document.querySelector('main');
  const links = main.querySelectorAll('[data-case-study-summary-link]');
  expect(Array.from(links).map(node => node.firstElementChild.getAttribute('href')).sort())
    .toEqual(Object.keys(studies).map(page => `${page}#case-study-summary`).sort());
  for (const link of links) link.remove();
  const cards = element => Array.from(element.querySelectorAll('article')).map(node => node.outerHTML.replace(/\s+/g, ' '));
  expect(cards(main)).toEqual(cards(await originalMain('index.html')));
});
