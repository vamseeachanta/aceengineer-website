const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.resolve(__dirname, '../..');
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}
function prose(text) {
  return text.replace(/<!--[^]*?-->/g, '').replace(/(?:https?:\/\/|\/?(?:domains\/)?)[^\s<>"']*deckhand[^\s<>"']*/gi, '')
    .replace(/(?:href|data-src)="[^"]*"/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
test('published copy contains no active retired-agent or chat-service promises', () => {
  const paths = ['content', 'brand', 'config/seo'].flatMap(dir => files(path.join(root, dir)))
    .filter(file => /\.(html|yaml|md)$/.test(file));
  const defects = paths.flatMap(file => {
    const text = prose(fs.readFileSync(file, 'utf8'));
    const patterns = [/ask deckhand/i, /deckhand (?:is|runs|can|selects|reports|estimates|summarises)/i,
      /(?:run|runs|analysis|checks|standards)[^.!?]{0,70}from (?:a )?chat/i,
      /live deckhand channel/i, /engine behind deckhand/i, /(?:try|run it on) open deck/i,
      /every workflow is an api path you can call/i, /what you can ask it to do/i];
    return patterns.some(pattern => pattern.test(text)) ? [path.relative(root, file)] : [];
  });
  assert.deepEqual(defects, []);
});
test('legacy routes are retirement notices with published alternatives', () => {
  for (const route of ['deckhand.html', 'deckhand-api.html']) {
    const html = fs.readFileSync(path.join(root, 'content', route), 'utf8');
    assert.match(html, /retired/i);
    assert.match(html, /href="\/?capabilities\//);
    assert.match(html, /href="\/?contact\.html"/);
    assert.doesNotMatch(html, /SoftwareApplication|"price"|POST \/api\/run|Telegram|WhatsApp/i);
  }
});
test('standard-page generator cannot resurrect retired service CTAs', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/seo/generate_standard_pages.py'), 'utf8');
  assert.doesNotMatch(source, /Deckhand|Open Deck|t\.me\/|from chat|What you can ask it to do/i);
});

test('catalog records do not advertise an active API tier', () => {
  const html = fs.readFileSync(path.join(root, 'content/api-catalog.html'), 'utf8');
  assert.match(html, /former service has been retired/i);
  assert.match(html, /historical reference records/i);
  assert.doesNotMatch(html, />LIVE<|>ONBOARDING<|Call a live path|Runnable today|Every call returns/i);
  assert.match(html, /deckhand-sandbox/);
});

test('standards pages retain the navigation skip-link target', () => {
  for (const file of files(path.join(root, 'content/standards')).filter(p => p.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /<main id="main">/, path.basename(file));
  }
  const generator = fs.readFileSync(path.join(root, 'scripts/seo/generate_standard_pages.py'), 'utf8');
  assert.equal((generator.match(/<main id="main">/g) || []).length, 2);
});

test('standards FAQs retain substantive answers after agent removal', () => {
  const yaml = require('js-yaml');
  const manifest = yaml.load(fs.readFileSync(path.join(root, 'config/seo/standards.yaml'), 'utf8'));
  for (const entry of manifest.standards) {
    for (const item of entry.faqs || []) assert.ok(item.a.trim().length > 12, entry.slug + ': ' + item.q);
  }
});

test('all page JSON-LD remains valid and prose has no deletion fragments', () => {
  for (const file of files(path.join(root, 'content')).filter(p => p.endsWith('.html'))) {
    const html = fs.readFileSync(file, 'utf8');
    for (const block of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(block[1]), path.relative(root, file));
      const data = JSON.parse(block[1]);
      if (data['@type'] === 'FAQPage') {
        for (const item of data.mainEntity) assert.ok(item.acceptedAnswer.text.trim().length > 12, path.relative(root, file) + ': ' + item.name);
      }
    }
    assert.doesNotMatch(html, /the calculator and<\/em>|<p>Yes —<\/p>/, path.relative(root, file));
  }
});
