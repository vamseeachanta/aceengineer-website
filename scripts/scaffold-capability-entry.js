#!/usr/bin/env node
/**
 * scaffold-capability-entry.js — emit a ready-to-paste capabilities.yaml block for a
 * freshly published Hugging Face dataset. Closes the C7 loop (aceengineer-website#54):
 * registering a new algorithm becomes the path of least resistance, so the going-forward
 * contract ("new algorithm → HF dataset + registry entry") is easy to satisfy.
 *
 * It introspects the dataset live (datasets-server /splits + first row of each config)
 * and pre-fills configs and highlight_columns, leaving human-judgement fields as TODOs.
 *
 *   node scripts/scaffold-capability-entry.js <hf_dataset> [--domain worldenergy|digitalmodel]
 *   # e.g. node scripts/scaffold-capability-entry.js aceengineer/mooring-fatigue --domain digitalmodel
 *
 * Prints YAML to stdout — review, fill the TODOs, and paste under `capabilities:` in
 * config/capabilities.yaml, then run `npm run validate:registry` to confirm it resolves.
 */
const { datasetConfigs, fetchTable } = require('./hf-fetch');

const VIZ_HINT = { table: 'table', bar: 'bar', line: 'line', map: 'map' };

function slugFromDataset(dataset) {
  const name = String(dataset).split('/').pop() || 'capability';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// YAML-safe scalar: quote if it could be misparsed. Kept minimal — scaffold output is
// meant to be reviewed by a human before commit.
function y(v) {
  const s = String(v);
  return /^[A-Za-z0-9_][A-Za-z0-9_ .\/-]*$/.test(s) ? s : JSON.stringify(s);
}

async function scaffold(dataset, { domain = 'TODO(one of: worldenergy|digitalmodel)', maxCols = 5 } = {}) {
  const configs = await datasetConfigs(dataset);
  if (!configs.length) throw new Error(`dataset '${dataset}' resolved but has no configs`);

  const id = slugFromDataset(dataset);
  const lines = [];
  lines.push(`  - id: ${id}`);
  lines.push(`    title: TODO(human-readable capability name)`);
  lines.push(`    domain: ${domain}`);
  lines.push(`    summary: >-`);
  lines.push(`      TODO(one-sentence description shown on the card + detail page).`);
  lines.push(`    hf_dataset: ${dataset}`);
  lines.push(`    provenance_url: TODO(link to the repo/report that produced the data)`);
  lines.push(`    status: live`);
  lines.push(`    primary_config: ${configs[0]}`);
  lines.push(`    tables:`);

  for (const config of configs) {
    let cols = [];
    try {
      const t = await fetchTable(dataset, config, { maxRows: 1 });
      cols = t.columns.map(c => c.name);
    } catch (err) {
      cols = [`TODO(columns — could not read: ${err.message})`];
    }
    const highlight = cols.slice(0, maxCols).map(y).join(', ');
    lines.push(`      - config: ${config}`);
    lines.push(`        label: ${config.charAt(0).toUpperCase() + config.slice(1)}`);
    lines.push(`        viz: ${VIZ_HINT.table}   # TODO(one of: table|bar|line|map)`);
    lines.push(`        highlight_columns: [${highlight}]`);
  }

  lines.push(`    # withheld_columns: []   # columns that must NEVER be surfaced (CI blocks them)`);
  lines.push(`    data_limits: >-`);
  lines.push(`      TODO(honest disclosure of coverage + known limitations).`);
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dataset = args.find(a => !a.startsWith('--'));
  const di = args.indexOf('--domain');
  const domain = di >= 0 ? args[di + 1] : undefined;

  if (!dataset) {
    console.error('usage: node scripts/scaffold-capability-entry.js <hf_dataset> [--domain worldenergy|digitalmodel]');
    process.exit(2);
  }
  try {
    const block = await scaffold(dataset, domain ? { domain } : {});
    console.log('# Paste under `capabilities:` in config/capabilities.yaml, fill the TODOs,');
    console.log('# then run `npm run validate:registry` to confirm it resolves.');
    console.log(block);
  } catch (err) {
    console.error(`scaffold failed: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { scaffold, slugFromDataset };
