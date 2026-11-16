const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const page = 'newsletter/topics/one-place-to-work/index.html';
const source = `content/${page}`;
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
// Approved article text without the figure or the ladder ids, committed so the
// baseline does not move with the main branch or with this change once merged.
const original = read('tests/js/fixtures/one-place-to-work-article.html');
const documentFor = html => new JSDOM(html.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')).window.document;
const text = node => node.textContent.replace(/\s+/g, ' ').trim();
const articleMarkup = html => html.match(/<article id="one-place-to-work">([\s\S]*?)<\/article>/)[1];
const summaryMarkup = html => articleMarkup(html).match(/^[\s\S]*?<hr>/)[0];
const withoutFlowchart = markup => markup
  .replace(/^<figure class="ladder-flow">[\s\S]*?<\/figure>\r?\n/m, '')
  .replace(/(<li) id="ladder-[123]"/g, '$1');
const caption = "Figure 1. From a general chatbot to a team's central place: each step keeps more of the job together.";
const stages = ['General chatbot', 'One person, one place', 'Team central place', 'Organisation'];
// Approved card copy; each description paraphrases the article or its ladder item.
const cards = [
  ['Starting point', 'General chatbot',
    "Files pasted into a chat window. The job's files live in many places."],
  ['Level 1', 'One person, one place',
    'Each job in one folder, with one set of tools and one instruction file for your AI assistant: the units, the design code and edition, and how to rerun the calculation.'],
  ['Level 2', 'Team central place',
    'One scope for each job. Calculation tools and checklists in the shared harness. One copy of each corrected checklist. The reviewer sees each proposed change before it is accepted.'],
  ['Level 3', 'Organisation',
    "The organisation's own chat or workspace, with the staff's existing sign-ins. One scope and one audit trail per project. Permissions enforce the guardrails. Outside partners in a separate place, with their own scope."],
];

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

// Splits CSS into top-level [prelude, body] pairs; an @media body keeps its rules.
function blocks(css) {
  const found = [];
  let depth = 0;
  let start = 0;
  let prelude = '';
  for (let index = 0; index < css.length; index += 1) {
    if (css[index] === '{') {
      if (depth === 0) {
        prelude = css.slice(start, index).trim();
        start = index + 1;
      }
      depth += 1;
    } else if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        found.push([prelude, css.slice(start, index)]);
        start = index + 1;
      }
    }
  }
  return found;
}

const declaration = (body, name) =>
  ((body.match(new RegExp(`(?:^|[;{\\s])${name}\\s*:\\s*([^;}]+)`)) || [])[1] || '').trim();
const rule = (list, selector) => (list.find(([prelude]) => prelude === selector) || [])[1] || '';
const media = (list, query) => blocks(rule(list, `@media ${query}`));

// Returns the layout, colour and focus regressions found in the figure's stylesheet.
function cssProblems(css) {
  const top = blocks(css);
  const problems = [];
  if (declaration(rule(top, '.ladder-flow-grid'), 'grid-template-columns') !== 'minmax(0, 1fr)') {
    problems.push('phones: the grid is not a single column');
  }
  const wide = declaration(rule(media(top, '(min-width: 1200px)'), '.ladder-flow-grid'), 'grid-template-columns');
  // Four cards on wide screens: four minmax tracks between three arrow tracks.
  if ((wide.match(/minmax\(/g) || []).length !== 4) problems.push('wide screens: the grid lacks four card columns');
  const light = rule(top, '.ladder-flow');
  const dark = rule(media(top, '(prefers-color-scheme: dark)'), '.ladder-flow');
  for (const name of ['--flow-bg', '--flow-card', '--flow-ink', '--flow-accent', '--flow-border']) {
    if (!declaration(dark, name)) problems.push(`dark mode: ${name} is not set`);
  }
  if (declaration(dark, '--flow-ink') && declaration(dark, '--flow-ink') === declaration(light, '--flow-ink')) {
    problems.push('dark mode: text colour does not change');
  }
  const focus = declaration(rule(top, '.ladder-flow a.ladder-flow-card:focus-visible'), 'outline');
  if (!/^[1-9]\d*px solid var\(--flow-accent\)$/.test(focus)) problems.push('focus: no visible outline');
  return problems;
}

// The source's <include> element ends <head> early in the HTML parser, so this
// searches every <style>; the figure test separately forbids one in the figure.
const flowStyle = doc => [...doc.querySelectorAll('style')]
  .map(node => node.textContent).find(css => css.includes('.ladder-flow-grid'));

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
    copy.querySelectorAll('svg, figcaption').forEach(node => node.remove());
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

  test('each card carries exactly its approved level, title and description', () => {
    const found = [...figureFor(doc).querySelectorAll('.ladder-flow-card')]
      .map(card => [...card.children].map(text));
    expect(found).toEqual(cards);
  });

  test('the arrows are decorative and the figure has no style, script or external assets', () => {
    const figure = figureFor(doc);
    const arrows = [...figure.querySelectorAll('svg')];
    expect(arrows).toHaveLength(3); // One arrow between each pair of the four cards.
    for (const arrow of arrows) {
      expect(arrow.getAttribute('aria-hidden')).toBe('true');
      expect(arrow.hasAttribute('role')).toBe(false);
      expect(arrow.hasAttribute('aria-label')).toBe(false);
    }
    expect(figure.querySelectorAll('style, script, img, image, iframe, link, object, embed')).toHaveLength(0);
    expect(figure.querySelector('[onclick], [onkeydown]')).toBeNull();
  });

  test('the page stylesheet keeps one column on phones, dark colours and visible focus', () => {
    const css = flowStyle(doc);
    expect(css).toBeDefined();
    expect(cssProblems(css)).toEqual([]);
  });

  test('the summary and the article outside the figure retain their approved text', () => {
    const article = doc.querySelector('#one-place-to-work').cloneNode(true);
    article.querySelector('figure.ladder-flow')?.remove();
    const originalDoc = documentFor(original);
    expect(originalDoc.querySelector('figure.ladder-flow')).toBeNull();
    expect(text(article)).toBe(text(originalDoc.querySelector('#one-place-to-work')));
    const introductoryParagraphs = node => [...node.querySelectorAll('p')].slice(0, 3).map(item => item.outerHTML);
    expect(introductoryParagraphs(article)).toEqual(introductoryParagraphs(originalDoc.querySelector('article')));
  });
});

describe('the stylesheet check rejects each regression', () => {
  const css = flowStyle(documentFor(read(source)));

  test('a multi-column phone grid', () => {
    const changed = css.replace(
      'grid-template-columns: minmax(0, 1fr); gap: 1em;',
      'grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1em;',
    );
    expect(changed).not.toBe(css);
    expect(cssProblems(changed)).toEqual(['phones: the grid is not a single column']);
  });

  test('a missing dark-mode block', () => {
    const changed = css.replace(/@media \(prefers-color-scheme: dark\) \{[\s\S]*?\}\s*\}/, '');
    expect(changed).not.toBe(css);
    expect(cssProblems(changed)).toEqual([
      'dark mode: --flow-bg is not set',
      'dark mode: --flow-card is not set',
      'dark mode: --flow-ink is not set',
      'dark mode: --flow-accent is not set',
      'dark mode: --flow-border is not set',
    ]);
  });

  test('dark mode that keeps the light text colour', () => {
    const changed = css.replace('--flow-ink: var(--bg);', '--flow-ink: var(--ink);');
    expect(changed).not.toBe(css);
    expect(cssProblems(changed)).toEqual(['dark mode: text colour does not change']);
  });

  test('a removed focus outline', () => {
    const changed = css.replace('outline: 3px solid var(--flow-accent);', 'outline: none;');
    expect(changed).not.toBe(css);
    expect(cssProblems(changed)).toEqual(['focus: no visible outline']);
  });
});

test('the approved fixture is the article without the figure or the ladder ids', () => {
  expect(original).toMatch(/^<article id="one-place-to-work">/);
  expect(original).not.toMatch(/ladder-flow|id="ladder-/);
});

test('source changes preserve the complete approved article markup outside the figure and new ids', () => {
  const current = read(source);
  expect(withoutFlowchart(articleMarkup(current))).toBe(articleMarkup(original));
  expect(summaryMarkup(current)).toBe(summaryMarkup(original));
});

test('comparison remains stable when the baseline already contains the flowchart', () => {
  const baseline = articleMarkup(original);
  const figure = articleMarkup(read(source)).match(/^<figure class="ladder-flow">[\s\S]*?<\/figure>\r?\n/m)[0];
  const baselineWithFigure = baseline.replace('</ol>\n', `</ol>\n${figure}`);
  expect(baselineWithFigure).not.toBe(baseline);
  expect(withoutFlowchart(baselineWithFigure)).toBe(baseline);
  expect(withoutFlowchart(withoutFlowchart(baselineWithFigure))).toBe(baseline);
  // Any edit outside the figure must survive the comparison.
  const sentinel = 'The ladder';
  expect(baseline).toContain(sentinel);
  expect(withoutFlowchart(baselineWithFigure.replace(sentinel, 'Altered ladder'))).not.toBe(baseline);
  const otherFigure = '<figure><figcaption>Another figure</figcaption></figure>\n';
  expect(withoutFlowchart(`${baselineWithFigure}${otherFigure}`)).toBe(`${baseline}${otherFigure}`);
});
