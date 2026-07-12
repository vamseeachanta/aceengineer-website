#!/usr/bin/env node
/**
 * refresh-hf-data.js — live-fetch every registered capability's tables from the
 * Hugging Face datasets-server and write committed snapshots under data/hf-cache/.
 *
 * This is the *network* half of C2 (aceengineer-website#50). Run it locally, or on a
 * schedule / from the C5 deploy hook, then commit the changed JSON. `npm run build`
 * reads these snapshots offline, so the build stays deterministic and outage-proof.
 *
 *   npm run refresh:hf                 # refresh all live capabilities
 *
 * Exit 0 if every table refreshed; exit 1 if any table failed (existing snapshots are
 * left untouched on failure, so a partial outage never destroys good data).
 */
const path = require('path');
const { loadCapabilities } = require('../build');
const { fetchTable, writeSnapshot } = require('./hf-fetch');

const repoRoot = path.resolve(__dirname, '..');
const SNAPSHOT_DIR = path.join(repoRoot, 'data', 'hf-cache');

async function main() {
  const registry = loadCapabilities(path.join(repoRoot, 'config', 'capabilities.yaml'));
  const caps = (registry && registry.capabilities) || [];
  let ok = 0;
  let failed = 0;

  for (const cap of caps) {
    if (cap.status === 'withheld') {
      console.log(`- skip ${cap.id} (status: withheld)`);
      continue;
    }
    for (const table of cap.tables || []) {
      const ref = `${cap.hf_dataset}/${table.config}`;
      try {
        const data = await fetchTable(cap.hf_dataset, table.config);
        const p = writeSnapshot(SNAPSHOT_DIR, data);
        const flag = data.truncated ? ` (capped ${data.fetched}/${data.total_rows})` : '';
        console.log(`✓ ${ref} → ${path.relative(repoRoot, p)} · ${data.fetched} rows${flag}`);
        ok++;
      } catch (err) {
        console.error(`✗ ${ref} — ${err.message} (snapshot left unchanged)`);
        failed++;
      }
    }
  }

  console.log(`\nrefresh:hf — ${ok} refreshed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();
