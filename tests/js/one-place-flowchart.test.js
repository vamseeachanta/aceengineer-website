const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const page = 'newsletter/topics/one-place-to-work/index.html';
const source = `content/${page}`;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const original = execFileSync('git', ['show', `origin/main:${source}`], {
  cwd: root,
  encoding: 'utf8',
});
const documentFor = html => new JSDOM(html.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')).window.document;
const text = node => node.textContent.replace(/\s+/g, ' ').trim();
const articleMarkup = html => html.match(/<article id="one-place-to-work">([\s\S]*?)<\/article>/)[1];
const summaryMarkup = html => articleMarkup(html).match(/^[\s\S]*?<hr>/)[0];
const withoutFlowchart = markup => markup
  .replace(/^<figure class="ladder-flow">[\s\S]*?<\/figure>\r?\n/m, '')
  .replace(/(<li) id="ladder-[123]"/g, '$1');
const caption = "Figure 1. From a general chatbot to a team's central place: each step keeps more of the job together.";
const stages = ['General chatbot', 'One person, one place', 'Team central place', 'Organisation'];

function ladderFor(doc) {
  const heading = [...doc.querySelectorAll('h2')].find(node => text(node) === 'The ladder');
  expect(heading).toBeDefined();
  expect(heading.nextElementSibling.tagName).toBe('OL');
  return heading.nextElementSibling;
}

function figureFor(doc) {
  const ladder = ladderFor(doc);
  const figure = ladder.nextElementSibling;
  expect(figure.tagName).toBe('FIGURE');
  expect(text(figure.querySelector('figcaption'))).toBe(caption);
  expect(figure.nextElementSibling.tagName).toBe('P');
  expect(text(figure.nextElementSibling)).toMatch(/^You can start at level 1 on your own\./);
  return figure;
}

describe.each(['content', 'dist'])('the work progression in %s', prefix => {
  let doc;

  beforeAll(() => {
    doc = documentFor(read(`${prefix}/${page}`));
  });

  test('the captioned figure immediately follows the ladder list', () => {
    figureFor(doc);
  });

  test('three keyboard links resolve to their existing ladder items in order', () => {
    const figure = figureFor(doc);
    const links = [...figure.querySelectorAll('a')];
    const items = [...ladderFor(doc).children];
    expect(links).toHaveLength(3);
    expect(items).toHaveLength(3);
    links.forEach((link, index) => {
      const id = `ladder-${index + 1}`;
      expect(link.getAttribute('href')).toBe(`#${id}`);
      expect(doc.getElementById(id)).toBe(items[index]);
      expect(doc.querySelectorAll(`[id="${id}"]`)).toHaveLength(1);
      expect(text(link)).toContain(stages[index + 1]);
      expect(link.getAttribute('tabindex')).not.toBe('-1');
      expect(link.hasAttribute('inert')).toBe(false);
    });
    expect(links.some(link => text(link).includes(stages[0]))).toBe(false);
  });

  test('the starting point, four stages and transition labels are readable in order', () => {
    const figure = figureFor(doc);
    const copy = figure.cloneNode(true);
    copy.querySelectorAll('style, svg, figcaption').forEach(node => node.remove());
    const visibleText = text(copy);
    let previous = -1;
    for (const stage of stages) {
      const index = visibleText.indexOf(stage);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(visibleText).toMatch(/starting point/i);
    expect(visibleText).not.toMatch(/(?:level|stage)\s*0/i);
    for (const label of ['keep the job together', 'share it', 'govern it']) {
      expect(text(figure)).toContain(label);
    }
  });

  test('an accessible SVG describes the progression without script or external assets', () => {
    const figure = figureFor(doc);
    const diagram = figure.querySelector('svg[role="img"]');
    expect(diagram).not.toBeNull();
    expect(text(diagram.querySelector('title')).length).toBeGreaterThan(0);
    const label = diagram.getAttribute('aria-label');
    expect(label).toBeTruthy();
    let previous = -1;
    for (const stage of stages) {
      const index = label.indexOf(stage);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(figure.querySelectorAll('script, img, image, iframe, link, object, embed')).toHaveLength(0);
    expect(figure.querySelector('[onclick], [onkeydown]')).toBeNull();
  });

  test('the summary and the article outside the figure retain their original text', () => {
    const article = doc.querySelector('#one-place-to-work').cloneNode(true);
    article.querySelector('figure.ladder-flow')?.remove();
    const originalDoc = documentFor(original);
    originalDoc.querySelector('figure.ladder-flow')?.remove();
    expect(text(article)).toBe(text(originalDoc.querySelector('#one-place-to-work')));
    const introductoryParagraphs = node => [...node.querySelectorAll('p')].slice(0, 3).map(item => item.outerHTML);
    expect(introductoryParagraphs(article)).toEqual(introductoryParagraphs(originalDoc.querySelector('article')));
  });
});

test('source changes preserve the complete original article markup outside the figure and new ids', () => {
  const current = read(source);
  expect(withoutFlowchart(articleMarkup(current))).toBe(withoutFlowchart(articleMarkup(original)));
  expect(summaryMarkup(current)).toBe(summaryMarkup(original));
});

test('comparison remains stable when the baseline already contains the flowchart', () => {
  const baseline = withoutFlowchart(articleMarkup(original));
  const figure = articleMarkup(read(source)).match(/^<figure class="ladder-flow">[\s\S]*?<\/figure>\r?\n/m)[0];
  const baselineWithFigure = baseline.replace('</ol>\n', `</ol>\n${figure}`);
  expect(withoutFlowchart(baselineWithFigure)).toBe(baseline);
  expect(withoutFlowchart(withoutFlowchart(baselineWithFigure))).toBe(baseline);
  expect(withoutFlowchart(baselineWithFigure.replace('Language models', 'Altered models'))).not.toBe(baseline);
  const otherFigure = '<figure><figcaption>Another figure</figcaption></figure>\n';
  expect(withoutFlowchart(`${baselineWithFigure}${otherFigure}`)).toBe(`${baseline}${otherFigure}`);
});
