#!/usr/bin/env node
/**
 * verify-capabilities-online.js — the C7 going-forward CI gate (aceengineer-website#54).
 *
 * The offline structural gate (scripts/validate-capabilities.js, enforced by the
 * `capabilities-registry` jest project) proves the registry is well-formed. This gate
 * proves it is TRUE against Hugging Face — so "every new algorithm surfaces on the
 * website" is enforced by CI, not left to good intentions:
 *
 *   - each `live` capability's `hf_dataset` resolves via the datasets-server /splits API;
 *   - each table's `config` actually exists in that dataset;
 *   - every `highlight_columns` entry exists in the dataset's columns (a typo'd column
 *     would render an empty column — caught here, not in production);
 *   - no `withheld_columns` value can reach rendered output (renderers only emit
 *     highlight_columns, and the offline gate already forbids overlap — re-asserted here).
 *
 * Only `status: live` entries are resolved online — `pending` renders a placeholder and
 * `withheld` isn't surfaced, so neither requires a resolvable dataset yet.
 *
 * Resilience: a genuine "not found" (HTTP 404 — dataset/config really absent) is a hard
 * ERROR that fails CI. A transient failure (timeout, 5xx, network) is a WARNING that does
 * NOT fail CI, so a Hugging Face outage never red-lights an unrelated PR.
 *
 *   node scripts/verify-capabilities-online.js        # or: npm run validate:capabilities:online
 *
 * Exit 0 = no blocking errors, exit 1 = one or more resolution errors printed.
 */
const path = require('path');
const { loadRegistry, validateRegistry, DEFAULT_REGISTRY } = require('./validate-capabilities');
const { datasetConfigs, fetchTable } = require('./hf-fetch');

// Classify an hf-fetch error: a 404 means the dataset/config is genuinely absent
// (blocking); anything else (timeout, 5xx, DNS) is transient (non-blocking warning).
function classify(err) {
  return /HTTP 404\b/.test(err.message) ? 'not_found' : 'transient';
}

// Real network resolvers, built on the C2 datasets-server client. Each rethrows with a
// `.code` so the pure checker can decide blocking-vs-transient without knowing about HTTP.
function liveResolvers(timeoutMs) {
  return {
    async resolveConfigs(dataset) {
      try {
        return await datasetConfigs(dataset, timeoutMs);
      } catch (err) {
        const e = new Error(err.message); e.code = classify(err); throw e;
      }
    },
    async fetchColumns(dataset, config) {
      try {
        const t = await fetchTable(dataset, config, { maxRows: 1, timeoutMs });
        return t.columns.map(c => c.name);
      } catch (err) {
        const e = new Error(err.message); e.code = classify(err); throw e;
      }
    },
  };
}

/**
 * Pure resolution check. `resolvers` is { resolveConfigs, fetchColumns } — injected so
 * this is unit-testable offline with mocks. Returns { errors, warnings } (string arrays).
 * A resolver rejection with `.code === 'not_found'` is an error; anything else is a warning.
 */
async function checkResolution(registry, resolvers) {
  const errors = [];
  const warnings = [];
  const caps = (registry && registry.capabilities) || [];

  for (const cap of caps) {
    if (cap.status !== 'live') continue; // pending/withheld don't render live data
    const ds = cap.hf_dataset;

    let configs;
    try {
      configs = await resolvers.resolveConfigs(ds);
    } catch (err) {
      if (err.code === 'not_found') {
        errors.push(`${cap.id}: hf_dataset '${ds}' does not resolve on Hugging Face (dataset not found)`);
      } else {
        warnings.push(`${cap.id}: could not reach Hugging Face for '${ds}' (${err.message}) — skipping live checks`);
      }
      continue;
    }

    const configSet = new Set(configs);
    const withheld = new Set(Array.isArray(cap.withheld_columns) ? cap.withheld_columns : []);

    for (const table of cap.tables || []) {
      if (!configSet.has(table.config)) {
        errors.push(
          `${cap.id}: config '${table.config}' not found in '${ds}' (available: ${configs.join(', ') || 'none'})`,
        );
        continue;
      }

      let columns;
      try {
        columns = await resolvers.fetchColumns(ds, table.config);
      } catch (err) {
        if (err.code === 'not_found') {
          errors.push(`${cap.id}: config '${table.config}' rows not found in '${ds}'`);
        } else {
          warnings.push(`${cap.id}/${table.config}: could not read columns (${err.message}) — skipping column checks`);
        }
        continue;
      }

      const colSet = new Set(columns);
      for (const hc of table.highlight_columns || []) {
        if (!colSet.has(hc)) {
          errors.push(
            `${cap.id}/${table.config}: highlight column '${hc}' is not a column of the dataset ` +
            `(would render empty). Present columns: ${columns.join(', ')}`,
          );
        }
        // Belt-and-suspenders: a withheld column must never be surfaced (offline gate also forbids this).
        if (withheld.has(hc)) {
          errors.push(`${cap.id}/${table.config}: highlight column '${hc}' is withheld — would leak into rendered output`);
        }
      }
    }
  }

  return { errors, warnings };
}

async function main() {
  const registryFile = process.argv[2] || DEFAULT_REGISTRY;
  const timeoutMs = Number(process.env.HF_TIMEOUT_MS) || 15000;

  let registry;
  try {
    registry = loadRegistry(registryFile);
  } catch (err) {
    console.error(`validate:capabilities:online FAIL — cannot read/parse ${registryFile}: ${err.message}`);
    process.exit(1);
  }

  // Fail fast if the registry isn't even structurally valid — online checks assume shape.
  const structural = validateRegistry(registry);
  if (structural.length) {
    console.error('validate:capabilities:online FAIL — registry is not structurally valid; fix these first:');
    structural.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  const { errors, warnings } = await checkResolution(registry, liveResolvers(timeoutMs));

  warnings.forEach(w => console.warn(`  ~ (warning, non-blocking) ${w}`));

  if (errors.length) {
    console.error('validate:capabilities:online FAIL');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  const live = registry.capabilities.filter(c => c.status === 'live').length;
  const note = warnings.length ? ` (${warnings.length} transient warning${warnings.length === 1 ? '' : 's'})` : '';
  console.log(`validate:capabilities:online PASS — ${live} live capabilit${live === 1 ? 'y' : 'ies'} resolve${live === 1 ? 's' : ''} against Hugging Face${note}`);
}

if (require.main === module) main();

module.exports = { checkResolution, classify, liveResolvers };
