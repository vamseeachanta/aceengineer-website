#!/usr/bin/env node
/**
 * hf-fetch.js — build-time Hugging Face datasets-server client + snapshot layer.
 *
 * Part of C2 (aceengineer-website#50), epic workspace-hub#3485. Pulls tabular data
 * for each registered capability (config/capabilities.yaml) from the public, CORS-
 * enabled datasets-server REST API — no auth, no backend.
 *
 * Design (see docs/capabilities-registry.md): "refresh" (network) is separated from
 * "build" (deterministic).
 *   - scripts/refresh-hf-data.js does the live fetch and writes committed snapshots
 *     under data/hf-cache/.
 *   - build.js hydrates from those snapshots by default (offline → deterministic CI),
 *     and only fetches live when HF_FETCH=1. The committed snapshot is also the
 *     outage fallback, so a build never depends on HF being reachable.
 *
 * Row cap: DEFAULT_MAX_ROWS rows are materialized for on-page display; the full
 * dataset always remains linkable on Hugging Face. Truncation is surfaced, never silent.
 */
const fs = require('fs');
const path = require('path');

const API = 'https://datasets-server.huggingface.co';
const PAGE = 100;                 // datasets-server /rows hard max per request
const DEFAULT_MAX_ROWS = 100;     // rows materialized per table for display
const DEFAULT_TIMEOUT_MS = 15000;

// Deterministic snapshot filename: "owner/name" + config → owner__name__config.json
function snapshotPath(dir, dataset, config) {
  const safe = String(dataset).replace(/\//g, '__');
  return path.join(dir, `${safe}__${config}.json`);
}

async function getJson(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// List available configs for a dataset via /splits. Returns array of config names.
async function datasetConfigs(dataset, timeoutMs) {
  const j = await getJson(`${API}/splits?dataset=${encodeURIComponent(dataset)}`, timeoutMs);
  const splits = (j && j.splits) || [];
  return [...new Set(splits.map(s => s.config))];
}

// Turn a datasets-server /rows response into a compact, render-ready shape.
function normalize(apiJson, dataset, config) {
  const features = (apiJson && apiJson.features) || [];
  const columns = features
    .slice()
    .sort((a, b) => a.feature_idx - b.feature_idx)
    .map(f => ({ name: f.name, dtype: (f.type && f.type.dtype) || 'string' }));
  const rows = ((apiJson && apiJson.rows) || []).map(r => r.row);
  return {
    dataset,
    config,
    columns,
    rows,
    total_rows: typeof apiJson.num_rows_total === 'number' ? apiJson.num_rows_total : rows.length,
  };
}

// Live-fetch one table (config), paging up to maxRows. Throws on network/HTTP failure.
async function fetchTable(dataset, config, opts = {}) {
  const { maxRows = DEFAULT_MAX_ROWS, timeoutMs = DEFAULT_TIMEOUT_MS, split = 'train' } = opts;
  const first = await getJson(
    `${API}/rows?dataset=${encodeURIComponent(dataset)}&config=${encodeURIComponent(config)}` +
    `&split=${encodeURIComponent(split)}&offset=0&length=${Math.min(PAGE, maxRows)}`,
    timeoutMs,
  );
  const out = normalize(first, dataset, config);
  const want = Math.min(maxRows, out.total_rows);
  let offset = out.rows.length;
  while (offset < want) {
    const page = await getJson(
      `${API}/rows?dataset=${encodeURIComponent(dataset)}&config=${encodeURIComponent(config)}` +
      `&split=${encodeURIComponent(split)}&offset=${offset}&length=${Math.min(PAGE, want - offset)}`,
      timeoutMs,
    );
    const norm = normalize(page, dataset, config);
    if (!norm.rows.length) break;
    out.rows.push(...norm.rows);
    offset += norm.rows.length;
  }
  out.rows = out.rows.slice(0, maxRows);
  out.fetched = out.rows.length;
  out.truncated = out.fetched < out.total_rows;
  return out;
}

// Snapshot IO. Snapshots are byte-stable (no timestamps) so diffs mean "data changed".
function readSnapshot(dir, dataset, config) {
  const p = snapshotPath(dir, dataset, config);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeSnapshot(dir, data) {
  fs.mkdirSync(dir, { recursive: true });
  const p = snapshotPath(dir, data.dataset, data.config);
  const { source, ...clean } = data; // don't persist provenance-of-fetch into the snapshot
  fs.writeFileSync(p, JSON.stringify(clean, null, 2) + '\n');
  return p;
}

/**
 * Attach data to every table of every capability, mutating each table with:
 *   table.data        = normalized { columns, rows, total_rows, fetched, truncated } | null
 *   table.data_source = 'live' | 'snapshot' | 'unavailable'
 * Never throws — a table that can't be fetched or read falls back to snapshot, then
 * to 'unavailable' (which C3/C4 render as a placeholder, not a silent gap).
 */
async function hydrateRegistry(registry, opts = {}) {
  const { snapshotDir, live = false, maxRows = DEFAULT_MAX_ROWS, timeoutMs = DEFAULT_TIMEOUT_MS, logger = () => {} } = opts;
  const caps = (registry && registry.capabilities) || [];
  for (const cap of caps) {
    if (cap.status === 'withheld') continue;
    for (const table of cap.tables || []) {
      let data = null;
      let source = 'unavailable';
      if (live) {
        try {
          data = await fetchTable(cap.hf_dataset, table.config, { maxRows, timeoutMs });
          source = 'live';
        } catch (err) {
          logger(`  ! live fetch failed for ${cap.hf_dataset}/${table.config}: ${err.message} — trying snapshot`);
        }
      }
      if (!data && snapshotDir) {
        const snap = readSnapshot(snapshotDir, cap.hf_dataset, table.config);
        if (snap) { data = snap; source = 'snapshot'; }
      }
      if (!data) logger(`  ! no data for ${cap.hf_dataset}/${table.config} (live=${live}) — placeholder`);
      table.data = data;
      table.data_source = source;
    }
  }
  return registry;
}

module.exports = {
  API, DEFAULT_MAX_ROWS,
  snapshotPath, datasetConfigs, normalize, fetchTable,
  readSnapshot, writeSnapshot, hydrateRegistry,
};
