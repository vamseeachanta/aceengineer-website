const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '../..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// Guard the public qualification boundary, including search-engine descriptions.
test('corrosion card bounds screening and distinguishes compatibility findings', () => {
  const registry = yaml.load(read('config/capabilities.yaml'));
  const entry = registry.capabilities.find((item) => item.id === 'corrosion-control');
  assert.match(entry.summary, /two reference geometries/i);
  assert.match(entry.summary, /not qualified for client delivery/i);
  assert.match(entry.summary, /not a material-compatibility finding/i);
  assert.doesNotMatch(entry.title, /galvanic compatibility/i);
  assert.doesNotMatch(entry.tables.map((table) => table.label).join(' '), /galvanic compatibility/i);
});

test('CP FAQ has the same exclusions in visible copy and structured data', () => {
  const html = read('content/standards/dnv-rp-b401-cathodic-protection.html');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = blocks.find((block) => block['@type'] === 'FAQPage');
  const answer = faq.mainEntity.find((item) => /screening scope/i.test(item.name)).acceptedAnswer.text;
  for (const condition of ['conditionally implemented', 'inputs are qualified', 'named engineer', 'Terminal anode banks and attenuation', 'monopile interiors and buried zones', 'ICCP', 'not offered']) assert.ok(answer.includes(condition), condition);
  assert.ok(text(html).includes(answer), 'visible and structured answers agree');
  assert.doesNotMatch(html, /anode spacing and reach|Apply it to a jacket|Ask Deckhand/);
  assert.doesNotMatch(html, /Run DNV-RP-B401 on your own inputs/);
});

test('solution CP copy and structured offer identify screening with project conditions', () => {
  const html = read('content/solutions/subsea-pipelines-integrity.html');
  assert.match(text(html), /Cathodic protection \(screening\)/);
  assert.match(text(html), /qualified inputs and an engineer-of-record check/);
  assert.match(text(html), /does not establish that an installed system is protected/);
  assert.doesNotMatch(html, /Cathodic protection design \(DNV-RP-B401 \/ F103\)|pipeline, jacket, manifold, monopile or FPSO hull/);
  assert.doesNotMatch(html, /Deckhand|run from chat|from a chat message/i);
});
