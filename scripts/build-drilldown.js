#!/usr/bin/env node
/**
 * build-drilldown.js — render the D&C drill-down page from the Hugging Face snapshot.
 *
 * The drill-down (Field ▸ Block ▸ Bore) is an *interactive* surface, so it is not a
 * uniform capability table: it gets its own page at dist/capabilities/dc-drilldown.html.
 * Design comes from the committed template under scripts/templates/ (the approved,
 * self-contained page, identical chrome to the worldenergydata copy); DATA comes from HF
 * snapshot of `dc_bores`, so the site keeps its offline, deterministic build and
 * Hugging Face remains the data home.
 *
 * Snapshot absent or short → the page is skipped and the caller warns. Never
 * fabricates rows, never partially renders.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const TEMPLATE = path.join(__dirname, 'templates', 'dc-drilldown.html');
const SNAPSHOT = path.join(
  repoRoot, 'data', 'hf-cache',
  'aceengineer__worldenergydata-explorer__dc_bores.json'
);
const PAGES = 'https://vamseeachanta.github.io/worldenergydata/';

// Reconciliation status per development (mirrors the QA/QC matrix).
const STATUS = {
  'Anchor': ['exact', 'ok'],
  'Big Foot': ['WED-only — excluded from the article', 'idx'],
  'Buckskin': ['recovered — +52 days, bore missing from the article', 'idx'],
  'Cascade Chinook': ['exact', 'ok'],
  'Jack St Malo': ['open — +119 days, #846 completion boundary', 'warn'],
  'Julia': ['exact', 'ok'],
  'Kaskida': ['exact', 'ok'],
  'North Platte': ['days exact; +3 zero-day sidetracks', 'ok'],
  'Shenandoah': ['resolved — +24 recompletion-accounting days', 'idx'],
  'Stones': ['exact; +20 post-cutoff servicing days', 'ok'],
  'Tiber': ['exact', 'ok'],
};
const SLUG = {
  'Anchor': 'anchor', 'Big Foot': 'big_foot', 'Buckskin': 'buckskin',
  'Cascade Chinook': 'cascade_chinook', 'Jack St Malo': 'jack_st_malo', 'Julia': 'julia',
  'Kaskida': 'kaskida', 'North Platte': 'north_platte', 'Shenandoah': 'shenandoah',
  'Stones': 'stones', 'Tiber': 'tiber',
};
// Verified live: absent pages render as honest gaps, never as dead links.
const NO_LIFECYCLE = new Set(['buckskin']);
const NO_ECONOMICS = new Set(['kaskida', 'north_platte', 'tiber']);
const HAS_ASSETS = new Set(['stones']);
const VINTAGE_LABEL = {
  unchanged: 'unchanged across vintages',
  late_data: 'late data — zero-day placeholder in frozen V30',
  servicing_accrual: 'post-TD servicing accrued (drilling unchanged)',
  wed_only: 'present only in the current extract',
};

function toPayload(snapshot) {
  const names = new Set((snapshot.columns || []).map(c => (typeof c === 'string' ? c : c.name)));
  const need = ['development', 'api12', 'bore', 'lease_num', 'spud', 'td_date',
    'drilling_days', 'completion_days', 'sidetrack', 'producer', 'water_depth_ft',
    'max_md_ft', 'max_tvd_ft', 'max_mud_ppg', 'vintage_category'];
  const missing = need.filter(c => !names.has(c));
  if (missing.length) throw new Error(`snapshot missing columns: ${missing.join(', ')}`);

  const num = v => (v === null || v === undefined ? 0 : Math.round(Number(v)));
  const bores = snapshot.rows.map(r => ({
    api: String(r.api12),
    name: String(r.bore ?? ''),
    field: String(r.development),
    block: String(r.lease_num ?? ''),
    wd: num(r.water_depth_ft),
    spud: r.spud || '',
    td: r.td_date || '',
    drill: num(r.drilling_days),
    compl: num(r.completion_days),
    md: num(r.max_md_ft),
    tvd: num(r.max_tvd_ft),
    ppg: r.max_mud_ppg == null ? '' : String(r.max_mud_ppg),
    st: Boolean(r.sidetrack),
    prod: Boolean(r.producer),
    vin: r.vintage_category || 'unchanged',
  }));
  bores.sort((a, b) =>
    a.field.localeCompare(b.field) || a.block.localeCompare(b.block) ||
    (a.spud || '9999').localeCompare(b.spud || '9999') || a.api.localeCompare(b.api));

  const fields = new Map();
  const blocks = new Map();
  for (const b of bores) {
    if (!fields.has(b.field)) {
      const [status, badge] = STATUS[b.field] || ['—', 'hold'];
      fields.set(b.field, {
        name: b.field, slug: SLUG[b.field], bores: 0, drill: 0, compl: 0,
        prod: 0, blocks: [], wd: b.wd, status, badge,
      });
    }
    const f = fields.get(b.field);
    f.bores++; f.drill += b.drill; f.compl += b.compl; f.prod += b.prod ? 1 : 0;
    if (!f.blocks.includes(b.block)) f.blocks.push(b.block);

    if (!blocks.has(b.block)) {
      blocks.set(b.block, { id: b.block, field: b.field, bores: 0, drill: 0, compl: 0, prod: 0, wd: b.wd });
    }
    const k = blocks.get(b.block);
    k.bores++; k.drill += b.drill; k.compl += b.compl; k.prod += b.prod ? 1 : 0;
  }

  const links = {};
  for (const slug of Object.values(SLUG)) {
    links[slug] = {
      lifecycle: NO_LIFECYCLE.has(slug) ? null : `${PAGES}lifecycle/${slug}_lifecycle.html`,
      economics: NO_ECONOMICS.has(slug) ? null : `${PAGES}economics-${slug}.html`,
      assets: HAS_ASSETS.has(slug) ? `${PAGES}lifecycle/assets/${slug}_assets.html` : null,
    };
  }
  return {
    bores,
    fields: [...fields.values()].sort((a, b) => b.bores - a.bores),
    blocks: [...blocks.values()].sort((a, b) => b.bores - a.bores),
    links,
    vintage_label: VINTAGE_LABEL,
  };
}

/** Render the page into distDir. Returns the payload summary, or null if skipped. */
function buildDrilldown(distDir) {
  if (!fs.existsSync(SNAPSHOT) || !fs.existsSync(TEMPLATE)) return null;
  const snap = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  if (snap.truncated) {
    throw new Error(
      `snapshot holds ${snap.fetched} of ${snap.total_rows} bores — the drill-down needs ` +
      `every bore; raise max_rows for dc_bores and re-run refresh:hf`);
  }
  const payload = toPayload(snap);
  const json = JSON.stringify(payload).replace(/<\//g, '<\\/');
  const html = fs.readFileSync(TEMPLATE, 'utf8').replace('__DATA__', json);
  const outDir = path.join(distDir, 'capabilities');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'dc-drilldown.html'), html);
  return { fields: payload.fields.length, blocks: payload.blocks.length, bores: payload.bores.length };
}

/** Copy the static QA/QC hub page (no data payload) into distDir. */
function buildHub(distDir) {
  const tpl = path.join(__dirname, 'templates', 'dc-qaqc-hub.html');
  if (!fs.existsSync(tpl)) return null;
  const outDir = path.join(distDir, 'capabilities');
  fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(tpl, path.join(outDir, 'dc-qaqc-hub.html'));
  return 'capabilities/dc-qaqc-hub.html';
}

module.exports = { buildDrilldown, buildHub, toPayload, SNAPSHOT, TEMPLATE };

if (require.main === module) {
  const res = buildDrilldown(path.join(repoRoot, 'dist'));
  if (!res) { console.error('drill-down skipped — template or snapshot missing'); process.exit(1); }
  console.log(`Built: capabilities/dc-drilldown.html · ${res.fields} fields / ${res.blocks} blocks / ${res.bores} bores`);
}
