const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = typeof jest === 'undefined' ? require('node:test') : global.test;
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
const unsupportedStandardsClaims = [
  /Validated methodologies you can trust/i, /RP-C203\s+Validated/i,
  /RP\s+2A\s+Compliant/i, /7608\s+Certified/i, /API\s*\/\s*DNV\s+Compliant/i,
  /\b221\b/, /\b17\s+(?:international\s+)?standards\b/i,
  /\bvalidated\s+(?:S-N\s+)?curves\b/i,
  /Every result traces to a DNV \/ API \/ ISO \/ ASME clause\./i,
  /\bvalidated\b/i, /standards compliance/i, /multi-standard compliance/i,
  /full (?:standards )?traceability/i, /Every output traces/i,
  /standards-traceable calculations/i,
  /Automated regression testing against published standard values/i,
];
function assertNoUnsupportedStandardsClaims(html) {
  const text = html + ' ' + prose(html);
  for (const pattern of unsupportedStandardsClaims) assert.doesNotMatch(text, pattern);
}
test('engineering overview and fatigue calculator pages omit unsupported standards claims', () => {
  for (const page of ['engineering', 'contact', 'about', 'faq', 'platform', 'calculators/fatigue-sn-curve']) {
    assertNoUnsupportedStandardsClaims(fs.readFileSync(path.join(root, 'content', page + '.html'), 'utf8'));
  }
});
test('standards claim guard rejects the withdrawn claims, including split badges and metadata', () => {
  for (const claim of [
    'Validated methodologies you can trust', 'RP-C203 Validated', 'RP 2A Compliant', '7608 Certified',
    '<div>API/DNV</div><div>Compliant</div>', '221 validated S-N curves',
    '221 validated curves pre-loaded', '221 S-N curves, 17 standards',
    'All 221 S-N curves are validated against published standard values',
    'S-N fatigue (221 curves, 17 standards)', 'Batch analysis with validated curves',
    '<meta content="Every result traces to a DNV / API / ISO / ASME clause.">',
    'get validated, traceable results', 'You Review Validated Results',
    'Pre-built standards compliance', 'DNV, API, BS, and multi-standard compliance',
    'Full traceability from inputs to results',
    'computational tools with full standards traceability',
    'Every output traces back to inputs, standards references, and methodology',
    '<meta content="standards-traceable calculations">',
    'Automated regression testing against published standard values',
  ]) assert.throws(() => assertNoUnsupportedStandardsClaims(claim), assert.AssertionError, claim);
  assertNoUnsupportedStandardsClaims('DNV-RP-C203, API RP 2A, BS 7608. Tests cover the listed calculator classes.');
  assertNoUnsupportedStandardsClaims('Results with recorded inputs for engineering review; standards referenced.');
});
test('published fatigue class counts match the calculator engine', () => {
  const count = Object.keys(require('../../assets/js/dnv-c203-sn-engine').CURVES).length;
  const read = page => prose(fs.readFileSync(path.join(root, 'content', page + '.html'), 'utf8'));
  assert.match(read('about'), new RegExp(`\\b${count} DNV-RP-C203 classes Air, CP, free corrosion\\b`));
  assert.match(read('calculators/fatigue-sn-curve'), new RegExp(`\\b${count} DNV-RP-C203 S-N classes in air, seawater with cathodic protection and free corrosion\\b`));
});
test('published copy contains no active retired-agent or chat-service promises', () => {
  const paths = ['content', 'brand', 'config/seo'].flatMap(dir => files(path.join(root, dir)))
    .filter(file => /\.(html|yaml|md)$/.test(file));
  const defects = paths.flatMap(file => {
    const text = prose(fs.readFileSync(file, 'utf8'));
    const patterns = [/ask deckhand/i, /deckhand (?:is(?! not currently)|runs|can|selects|reports|estimates|summarises)/i,
      /(?:run|runs|analysis|checks|standards)[^.!?]{0,70}from (?:a )?chat/i,
      /live deckhand channel/i, /engine behind deckhand/i, /(?:try|run it on) open deck/i,
      /every workflow is an api path you can call/i, /what you can ask it to do/i];
    return patterns.some(pattern => pattern.test(text)) ? [path.relative(root, file)] : [];
  });
  assert.deepEqual(defects, []);
});
test('legacy routes are neutral status notices with published alternatives', () => {
  for (const route of ['deckhand.html', 'deckhand-api.html']) {
    const html = fs.readFileSync(path.join(root, 'content', route), 'utf8');
    assert.match(html, /not currently (?:available|offered)/i);
    assert.doesNotMatch(html, /retired/i);
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
  assert.match(html, /former service is not currently offered/i);
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

const qualityTargets = ['solutions/', 'case-studies/', 'calculators/', 'platform.html', 'proof.html'];
const menuLinks = html => [...html.matchAll(/href="\{\{ rootPath \}\}([^"]+)"[^>]*>([^<]+)<\/a>/g)]
  .map(match => [match[1], match[2]]);
function assertEngineeringMenu(menu, footer) {
  assert.deepEqual(menu.find(([, label]) => label === 'Services'), ['capabilities/', 'Services']);
  for (const target of qualityTargets) {
    const expected = footer.find(([href]) => href === target);
    assert.ok(expected, target + ' must exist in the footer');
    assert.deepEqual(menu.find(([href]) => href === target), expected, target);
  }
}
test('main menu shares the five requested footer targets and preserves Services', () => {
  const read = file => fs.readFileSync(path.join(root, 'content', file), 'utf8');
  const menu = menuLinks(read('partials/nav.html'));
  const footer = menuLinks(read('partials/footer.html'));
  assertEngineeringMenu(menu, footer);
  const mainOnly = ['index.html', 'about.html', 'samples/', 'capabilities/'];
  for (const entry of menu) {
    assert.ok(mainOnly.includes(entry[0]) || footer.some(item => item[0] === entry[0] && item[1] === entry[1]), entry.join(': '));
    assert.ok(fs.existsSync(path.join(root, 'content', entry[0], entry[0].endsWith('/') ? 'index.html' : '')) || entry[0] === 'samples/', entry[0]);
  }
  const cases = read('case-studies/index.html');
  assert.match(cases, /href="\.\.\/reports\/sloshing\/"/);
  assert.ok(fs.existsSync(path.join(root, 'content/reports/sloshing/index.html')));
});
test('menu guard rejects missing targets, changed wording and a retargeted Services link', () => {
  const menu = menuLinks(fs.readFileSync(path.join(root, 'content/partials/nav.html'), 'utf8'));
  const footer = menuLinks(fs.readFileSync(path.join(root, 'content/partials/footer.html'), 'utf8'));
  const validMenu = menu.map(([href, label]) => [label === 'Services' ? 'capabilities/' : href, label]);
  assertEngineeringMenu(validMenu, footer);
  const invalidMenus = qualityTargets.map(target => validMenu.filter(([href]) => href !== target));
  invalidMenus.push(validMenu.map(([href, label]) => [label === 'Services' ? 'engineering.html' : href, label]));
  invalidMenus.push(validMenu.map(([href, label]) => [href === 'proof.html' ? 'legacy.html' : href, label]));
  invalidMenus.push(validMenu.map(([href, label]) => [href, href === 'proof.html' ? 'Proof' : label]));
  for (const invalid of invalidMenus) assert.throws(() => assertEngineeringMenu(invalid, footer), assert.AssertionError);
});
