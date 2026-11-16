// The tank sloshing CFD article page carries the approved version 1.2 text word for word.
// The approved text, with the site adaptations it lists, is in fixtures/issue-001-tank-sloshing-v1.2.json.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');
const page = 'newsletter/issue-001-tank-sloshing/index.html';
const approved = require('./fixtures/issue-001-tank-sloshing-v1.2.json');
const squash = s => s.replace(/\s+/g, ' ').trim();

function editionFor(prefix) {
  const doc = new JSDOM(fs.readFileSync(path.join(root, prefix, page), 'utf8')).window.document;
  const wrap = doc.querySelector('.nl-wrap').cloneNode(true);
  wrap.querySelectorAll('[data-site-only], .foot, script, noscript, style').forEach(node => node.remove());
  return { doc, wrap };
}

describe.each(['content', 'dist'])('article 01 page (%s)', prefix => {
  const file = path.join(root, prefix, page);
  const run = fs.existsSync(file) ? test : test.skip;

  run('the page text equals the approved text', () => {
    const { wrap } = editionFor(prefix);
    expect(squash(wrap.textContent)).toBe(approved.text);
  });

  run('chart and animation descriptions are the approved alt texts', () => {
    const { doc } = editionFor(prefix);
    const described = [...doc.querySelectorAll('.nl-wrap [role="img"][aria-label], .nl-wrap img[alt]')]
      .map(node => node.getAttribute('aria-label') || node.getAttribute('alt'));
    expect(described).toEqual(approved.alts);
  });

  run('animations start still and play only on request', () => {
    const { doc } = editionFor(prefix);
    const images = [...doc.querySelectorAll('.nl-wrap img.nl-gif')];
    expect(images).toHaveLength(2);
    for (const img of images) {
      expect(img.getAttribute('src')).toMatch(/-still\.png$/);
      expect(img.dataset.anim).toMatch(/\.gif$/);
      expect(img.parentNode.querySelector('button.nl-play')).not.toBeNull();
    }
    expect(doc.querySelectorAll('.nl-wrap img[src$=".gif"]')).toHaveLength(0);
  });
});
