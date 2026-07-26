/**
 * dc-drilldown.test.js — gates for the interactive D&C drill-down page.
 *
 * The drill-down is rendered from the committed Hugging Face snapshot of
 * `dc_bores`. Unlike a capability table (which may honestly show a capped
 * sample), a drill-down must be COMPLETE: a user searching for a wellbore that
 * silently isn't loaded would conclude it does not exist. These gates lock that
 * completeness plus the honest-gap link policy.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { test } = require('node:test');

const { toPayload, SNAPSHOT, TEMPLATE } = require('../../scripts/build-drilldown');

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));

test('snapshot holds every bore (never a capped sample)', () => {
  assert.strictEqual(snapshot.truncated, false);
  assert.strictEqual(snapshot.fetched, snapshot.total_rows);
  assert.strictEqual(snapshot.total_rows, 253);
});

test('payload builds the field/block/bore tree', () => {
  const p = toPayload(snapshot);
  assert.strictEqual(p.bores.length, 253);
  assert.strictEqual(p.fields.length, 11);
  assert.strictEqual(p.blocks.length, 23);
});

test('every block belongs to exactly one field', () => {
  const p = toPayload(snapshot);
  const byBlock = new Map();
  for (const b of p.bores) {
    if (!byBlock.has(b.block)) byBlock.set(b.block, new Set());
    byBlock.get(b.block).add(b.field);
  }
  for (const [block, fields] of byBlock) {
    assert.strictEqual(fields.size, 1, `${block} spans ${fields.size} fields`);
  }
});

test('rollups tie to the reconciliation matrix on both axes', () => {
  const p = toPayload(snapshot);
  const drill = p.bores.reduce((s, b) => s + b.drill, 0);
  const compl = p.bores.reduce((s, b) => s + b.compl, 0);
  assert.strictEqual(drill, 12436);
  assert.strictEqual(compl, 12968);
  assert.strictEqual(drill + compl, 25404);
  assert.strictEqual(p.fields.reduce((s, f) => s + f.drill + f.compl, 0), 25404);
  assert.strictEqual(p.blocks.reduce((s, k) => s + k.drill + k.compl, 0), 25404);
});

test('absent engineering pages stay null, never fabricated links', () => {
  const { links } = toPayload(snapshot);
  assert.strictEqual(links.buckskin.lifecycle, null);
  for (const slug of ['kaskida', 'north_platte', 'tiber']) {
    assert.strictEqual(links[slug].economics, null);
  }
  assert.ok(links.stones.assets);
  assert.strictEqual(links.big_foot.assets, null);
});

test('template is self-contained and carries the data placeholder', () => {
  const t = fs.readFileSync(TEMPLATE, 'utf8');
  assert.ok(t.includes('__DATA__'));
  assert.ok(!t.includes('<link'));
  assert.ok(!t.includes('<img'));
  assert.ok(!t.includes('@import'));
  assert.strictEqual((t.match(/<\/script>/g) || []).length, 1);
});

test('built page embeds every bore and cannot break out of its script tag', () => {
  const out = path.join(__dirname, '..', '..', 'dist', 'capabilities', 'dc-drilldown.html');
  if (!fs.existsSync(out)) return; // dist only exists after a build
  const html = fs.readFileSync(out, 'utf8');
  const apis = new Set(html.match(/\b60\d{10}\b/g) || []);
  assert.strictEqual(apis.size, 253);
  const m = html.match(/<script>const DATA=(\{[\s\S]*?\});\nconst \$=/);
  assert.ok(m, 'embedded payload not found');
  assert.ok(!m[1].includes('</'), 'raw </ would terminate the script early');
});
