#!/usr/bin/env node
'use strict';

// Publish the conduit-area (A_c) sensitivity scan and its analytical validation
// into the immutable sloshing release. The three twin-tank forced-roll runs
// completed and cycle-converged but had never been reduced into a release; the
// reviewed bundle is produced by cfd_work/dm1528/analytical/prepare_dual_tank_extension.py.

const fs = require('fs');
const path = require('path');
const R = require('./refresh-sloshing-data');

const repoRoot = path.resolve(__dirname, '..');
const reviewRoot = path.resolve(process.env.SLOSHING_REVIEW_ROOT || '/home/undi/ws/cfd_work/dm1528');
const bundleDir = path.join(reviewRoot, 'review_output/dual_tank_extension');
const bundlePath = path.join(bundleDir, 'publication_bundle.json');
const revision = (process.env.SLOSHING_SOURCE_REVISION || '').trim();
if (!fs.existsSync(bundlePath)) throw new Error('reviewed conduit-area bundle is required');
if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('SLOSHING_SOURCE_REVISION must be the 40-hex dataset revision holding the bundle');

// RFC4180 reader: published summaries contain quoted commas, so a naive split
// silently shreds those rows into extra columns and breaks the closed schema.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch !== '"') { field += ch; continue; }
      if (text[i + 1] === '"') { field += '"'; i += 1; continue; }
      quoted = false;
    } else if (ch === '"' && field === '') { quoted = true; }
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') { field += ch; }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.map(cells => {
    if (cells.length !== headers.length) throw new Error(`malformed CSV row: ${cells[0]}`);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
  });
}
function upsert(base, rows, key) {
  const id = row => key.map(column => row[column]).join('\0');
  const result = new Map(base.map(row => [id(row), row]));
  rows.forEach(row => result.set(id(row), row));
  return [...result.values()].sort((a, b) => id(a).localeCompare(id(b)));
}
function sourceEntry(localPath, remotePath) {
  const body = fs.readFileSync(localPath);
  return { path: remotePath, sha256: R.sha256(body), bytes: body.length };
}

const current = R.validateCommittedRelease(repoRoot);
const currentDir = path.join(repoRoot, current.pointer.release.directory);
const tables = {};
for (const table of current.manifest.tables) tables[table.name] = parseCsv(fs.readFileSync(path.join(currentDir, table.file), 'utf8'));
const assets = Object.fromEntries(current.manifest.assets.map(asset => [asset.file, fs.readFileSync(path.join(currentDir, asset.file))]));
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

tables.cases = upsert(tables.cases, bundle.cases, ['case_id']);
tables.derived_metrics = upsert(tables.derived_metrics, bundle.derived_metrics, ['case_id', 'quantity']);
tables.qa_audit = upsert(tables.qa_audit, bundle.qa_audit, ['case_id']);
tables.studies = upsert(tables.studies, bundle.studies, ['study_id']);
tables.series = upsert(tables.series, bundle.series, ['series_id']);
const newSeries = new Set(bundle.series.map(row => row.series_id));
tables.samples = tables.samples.filter(row => !newSeries.has(row.series_id)).concat(bundle.samples)
  .sort((a, b) => a.series_id.localeCompare(b.series_id) || Number(a.ordinal) - Number(b.ordinal));

// Analytical U-tube metrics carry their own provenance: the reviewed validation
// file on the pinned dataset revision, not a CFD aggregate.
const validationSha = R.sha256(fs.readFileSync(path.join(bundleDir, 'ac_validation.json')));
tables.metrics = upsert(tables.metrics, bundle.analytical_metrics.map(row => ({
  case_id: row.case_id, quantity: row.quantity, value: row.value, unit: row.unit, statistic: row.statistic,
  qa_status: row.qa_status, source_class: 'analytical_closed_form', source_sha256: validationSha,
  source_revision: revision, transform_version: R.TRANSFORMER_VERSION,
})), ['case_id', 'quantity']);

const inputRows = bundle.cases.map(row => ({
  case_id: row.case_id, solver_family: 'incompressible_two_phase_vof', solver_version: 'OpenFOAM_2312_patch_260127',
  simulation_dimensionality: 'three_dimensional', forcing_period_s: row.period_s, forcing_amplitude_deg: bundle.roll_amplitude_deg,
  simulated_cycles: row.cycles, end_time_s: Number(row.period_s) * Number(row.cycles), initial_fill_fraction: 0.5,
  liquid_density_kg_m3: 1025, liquid_kinematic_viscosity_m2_s: 0.000001, gas_density_kg_m3: 1.225,
  gas_kinematic_viscosity_m2_s: 0.0000148, surface_tension_N_m: 0.07, gravity_m_s2: 9.81, mesh_cells: row.mesh_cells,
  time_integration: 'adaptive_first_order_euler', configured_max_courant: row.configured_max_courant,
  configured_max_interface_courant: row.configured_max_alpha_courant, maximum_timestep_s: 0.02,
  pressure_probe_count: 0, pressure_and_load_output_interval_s: 0.1, qa_output_interval_s: 0.1,
  geometry_disclosure: 'normalized_coordinates_only', sectional_load_extraction: 'aggregate_wall_patch',
}));
tables.inputs = upsert(tables.inputs, inputRows, ['case_id']);

const areaOf = new Map(bundle.derived_metrics.filter(row => row.quantity === 'conduit_area').map(row => [row.case_id, row.value]));
const catalogRows = bundle.cases.map(row => ({
  case_id: row.case_id, title: `Conduit area ${areaOf.get(row.case_id)} m2 - connected-tank exchange`,
  summary: 'Cycle-converged forced-roll run varying the connecting conduit area, validating the analytical exchange scaling law.',
  study_family: 'conduit_area_sensitivity', evidence_depth: 'standard', media_truth: 'none', representative_case_id: '',
  has_case_image: false, has_case_video: false, qa_summary: 'accepted_cycle_converged',
  analysis_path: `/reports/sloshing/analysis.html?case=${row.case_id}`, validation_fixture_path: '/reports/sloshing/dual-connected-tanks.html',
}));
tables.case_catalog = upsert(tables.case_catalog, catalogRows, ['case_id']);

const release = R.buildRelease(tables, { assets });
const byPath = new Map(current.pointer.source.files.map(file => [file.path, file]));
for (const file of ['publication_bundle.json', 'ac_scan_results.json', 'ac_validation.json', 'analytical_results.json']) {
  const entry = sourceEntry(path.join(bundleDir, file), `review/dual_tank_extension/${file}`);
  byPath.set(entry.path, entry);
}
const source = { dataset: 'aceengineer/digitalmodel-sloshing', revision, files: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path)) };
const published = R.publishRelease(release, { root: repoRoot, pointerPath: path.join(repoRoot, 'config/sloshing-data-release.json'), source });
console.log(JSON.stringify({
  previous_digest: current.digest, digest: published.digest, revision,
  counts: release.manifest.counts, sources: source.files.length,
}, null, 2));
