const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const output = process.env.DIGITALMODEL_BUILD_DIR || path.join(root, 'dist');
const pages = [
  'cfd/sloshing-cfd-study.html',
  'hydro/short-horizon-motion-forecast.html',
  'buckling/ship-plate-buckling.html',
];

function localReferences(html) {
  const references = [];
  // Raw script text can contain HTML examples and is not document markup.
  const markup = html.replace(/<!--[^]*?-->/g, '')
    .replace(/<(script|style)\b([^>]*)>[^]*?<\/\1\s*>/gi, '<$1$2>');
  for (const tag of markup.matchAll(/<([a-z][\w:-]*)\b([^>]*?)>/gi)) {
    const attrs = Object.fromEntries([...tag[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
      .map(match => [match[1].toLowerCase(), match[2] ?? match[3]]));
    for (const name of ['src', 'poster']) if (attrs[name]) references.push(attrs[name]);
    if (tag[1].toLowerCase() === 'object' && attrs.data) references.push(attrs.data);
    if (tag[1].toLowerCase() === 'link' && /stylesheet|icon|preload|modulepreload/i.test(attrs.rel || '')) {
      if (attrs.href) references.push(attrs.href);
    }
    if (tag[1].toLowerCase() === 'a' && /\.(?:json|csv|txt|pdf|png|gif|jpe?g|webp|svg|js|css|woff2?|ttf|otf|mp4|webm|zip|dat|bin)(?:[?#]|$)/i.test(attrs.href || '')) {
      references.push(attrs.href);
    }
    if (attrs.srcset) references.push(...attrs.srcset.split(',').map(item => item.trim().split(/\s+/)[0]));
  }
  for (const style of html.matchAll(/<style\b[^>]*>([^]*?)<\/style>/gi)) references.push(...cssReferences(style[1]));
  for (const style of markup.matchAll(/\bstyle=(?:"([^"]*)"|'([^']*)')/gi)) references.push(...cssReferences(style[1] ?? style[2]));
  return references.filter(ref => ref && !/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(ref));
}

function cssReferences(css) {
  const clean = css.replace(/\/\*[^]*?\*\//g, '');
  return [
    ...[...clean.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/gi)].map(match => match[1]),
    ...[...clean.matchAll(/@import\s+['"]([^'"]+)['"]/gi)].map(match => match[1]),
  ];
}

function checkAssets(file, seen = new Set()) {
  if (seen.has(file)) return;
  seen.add(file);
  const text = fs.readFileSync(file, 'utf8');
  const refs = file.endsWith('.css') ? cssReferences(text) : localReferences(text);
  for (const ref of refs.filter(ref => !/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(ref))) {
    const urlPath = decodeURIComponent(ref.replace(/&amp;/g, '&').split(/[?#]/)[0]);
    const asset = urlPath.startsWith('/') ? path.join(output, urlPath) : path.resolve(path.dirname(file), urlPath);
    assert.ok(!path.relative(output, asset).startsWith('..'), 'asset must remain in the build output');
    assert.ok(fs.existsSync(asset) && fs.statSync(asset).isFile(), `missing asset: ${path.relative(output, asset)}`);
    if (/\.(?:css|html)$/.test(asset)) checkAssets(asset, seen);
  }
}

for (const page of pages) {
  test(`built digitalmodel/${page} preserves the copy, canonical and local assets`, () => {
    const file = path.join(output, 'digitalmodel', page);
    assert.ok(fs.existsSync(file), `missing built page: digitalmodel/${page}`);
    const html = fs.readFileSync(file, 'utf8');
    assert.equal(html, fs.readFileSync(path.join(root, 'content/digitalmodel', page), 'utf8'));
    const canonical = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/gi)];
    assert.equal(canonical.length, 1);
    assert.ok(canonical[0][0].includes(`href="https://aceengineer.com/digitalmodel/${page}"`));
    checkAssets(file);
  });
}

test('built forecast retains all four claim qualification labels', () => {
  const html = fs.readFileSync(path.join(output, 'digitalmodel', pages[1]), 'utf8');
  for (const label of ['Illustrative', 'synthetic', 'simplified analytic RAOs', 'MMS / MRU integration is planned']) {
    assert.ok(html.includes(label), `missing forecast label: ${label}`);
  }
  assert.ok(!/epic #1356|child #1361|AQWA phase sign pending validation/.test(html));
});

test('asset discovery checks resources without treating navigation or script text as assets', () => {
  assert.deepEqual(localReferences('<script>const sample = \'<img src="example.png">\';</script><a href="other.html">Next</a><img src="viz/chart.png"><link rel="stylesheet" href="../_assets/brand.css"><a href="data/curve.csv">Data</a><style>.chart{background:url(viz/background.png)}</style>'),
    ['viz/chart.png', '../_assets/brand.css', 'data/curve.csv', 'viz/background.png']);
});
