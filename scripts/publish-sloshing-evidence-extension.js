#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const R = require('./refresh-sloshing-data');

const repoRoot = path.resolve(__dirname, '..');
const reviewRoot = path.resolve(process.env.SLOSHING_REVIEW_ROOT || '/home/undi/cfd_work/dm1528');
const bundlePath = path.join(reviewRoot, 'review_output/evidence_extension/publication_bundle.json');
const mediaRoot = path.join(reviewRoot, 'review_output/evidence_extension/media');
const mediaManifestPath = path.join(mediaRoot, 'media_manifest.json');
if (!fs.existsSync(bundlePath) || !fs.existsSync(mediaManifestPath)) throw new Error('reviewed evidence-extension bundle and media manifest are required');

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/); const headers = lines.shift().split(',');
  return lines.map(line => Object.fromEntries(line.split(',').map((value, index) => [headers[index], value])));
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
const mediaManifest = JSON.parse(fs.readFileSync(mediaManifestPath, 'utf8'));

tables.cases = upsert(tables.cases, bundle.cases, ['case_id']);
tables.derived_metrics = upsert(tables.derived_metrics, bundle.derived_metrics, ['case_id', 'quantity']);
tables.qa_audit = upsert(tables.qa_audit, bundle.qa_audit, ['case_id']);
tables.series = upsert(tables.series, bundle.series, ['series_id']);
const newSeries = new Set(bundle.series.map(row => row.series_id));
tables.samples = tables.samples.filter(row => !newSeries.has(row.series_id)).concat(bundle.samples).sort((a, b) => a.series_id.localeCompare(b.series_id) || Number(a.ordinal) - Number(b.ordinal));
tables.pressure_envelopes = upsert(tables.pressure_envelopes, bundle.pressure_envelopes, ['case_id', 'probe_id', 'window']);

const publishedCases = new Map(bundle.cases.map(row => [row.case_id, row]));
const inputRows = bundle.cases.map(row => ({
  case_id: row.case_id, solver_family: 'incompressible_two_phase_vof', solver_version: 'OpenFOAM_2312_patch_260127', simulation_dimensionality: 'three_dimensional',
  forcing_period_s: row.period_s, forcing_amplitude_deg: row.loading_condition === 'stationary' ? 0 : 5, simulated_cycles: row.cycles, end_time_s: Number(row.period_s) * Number(row.cycles),
  initial_fill_fraction: 0.5, liquid_density_kg_m3: 1025, liquid_kinematic_viscosity_m2_s: 0.000001, gas_density_kg_m3: 1.225, gas_kinematic_viscosity_m2_s: 0.0000148,
  surface_tension_N_m: 0.07, gravity_m_s2: 9.81, mesh_cells: row.mesh_cells, time_integration: 'adaptive_first_order_euler', configured_max_courant: row.configured_max_courant,
  configured_max_interface_courant: row.configured_max_alpha_courant, maximum_timestep_s: 0.02, pressure_probe_count: row.case_id.includes('pressure') ? 20 : 0,
  pressure_and_load_output_interval_s: row.case_id.includes('pressure') ? 0.05 : 0.1, qa_output_interval_s: 0.1, geometry_disclosure: 'normalized_coordinates_only',
  sectional_load_extraction: row.case_id.includes('sectional') ? 'left_right_boundary_patches' : 'aggregate_wall_patch',
}));
tables.inputs = upsert(tables.inputs, inputRows, ['case_id']);
const meshRows = bundle.cases.map(row => ({
  case_id: row.case_id, mesh_cells: row.mesh_cells, mesh_points: row.mesh === 'fine' ? 76975 : 24021, mesh_regions: 1, mesh_check: 'passed', evaluated_state: 'initial_mesh',
  max_aspect_ratio: '', max_non_orthogonality_deg: 0, average_non_orthogonality_deg: 0, max_skewness: '', minimum_cell_determinant: '', minimum_face_interpolation_weight: '', minimum_face_volume_ratio: '',
  minimum_cell_volume_m3: '', maximum_cell_volume_m3: '', total_domain_volume_m3: 3200, sectional_face_zones_available: false,
}));
tables.mesh_quality = upsert(tables.mesh_quality, meshRows, ['case_id']);

const mediaCaseMap = {
  'no-roll-t24': 'baseline-static-t24',
  'forced-medium-t22-fullcycle': 'forced-medium-t22',
  'forced-medium-t24-fullcycle': 'forced-medium-t24',
  'forced-fine-t24-co025': 'forced-fine-co025-pressure-t24',
};
const replacedCases = new Set(Object.values(mediaCaseMap));
tables.previews = tables.previews.filter(row => !replacedCases.has(row.case_id));
tables.media_metadata = tables.media_metadata.filter(row => !replacedCases.has((tables.previews.find(preview => preview.preview_id === row.preview_id) || {}).case_id));
const newPreviewMetadata = [];
for (const record of mediaManifest.records) {
  const caseId = mediaCaseMap[record.case_public_id];
  for (const kind of ['video', 'snapshot']) {
    const media = record[kind]; const localPath = path.join(mediaRoot, record.case_public_id, media.file);
    const body = fs.readFileSync(localPath);
    if (R.sha256(body) !== media.sha256 || body.length !== media.bytes) throw new Error(`media hash mismatch: ${media.file}`);
    const publicFile = media.file; assets[publicFile] = body;
    const previewId = `${caseId}-${kind}`;
    tables.previews.push({ preview_id: previewId, case_id: caseId, media_type: kind === 'video' ? 'video/mp4' : 'image/png', relative_path: publicFile, sha256: media.sha256, bytes: media.bytes, status: 'published', alt_text: `${kind === 'video' ? 'Complete-cycle CFD animation with synchronized response graphs' : 'Case-specific CFD field and response snapshot'} for ${caseId}.` });
    newPreviewMetadata.push({ preview_id: previewId, evidence_relation: 'case_specific', width_px: media.width, height_px: media.height, duration_s: kind === 'video' ? record.field_frame_count / 4 : '', frame_count: kind === 'video' ? record.field_frame_count : '', field_window_start_s: record.field_window_start_s, field_window_end_s: record.field_window_end_s, temporal_interpolation: 'none', review_scope: 'complete_final_cycle_fields_with_full_history_graphs' });
  }
}
tables.previews.sort((a, b) => a.preview_id.localeCompare(b.preview_id));
tables.media_metadata = upsert(tables.media_metadata, newPreviewMetadata, ['preview_id']);

function representative(row) {
  if (row.loading_condition !== 'forced_roll' || replacedCases.has(row.case_id)) return '';
  const period = Number(row.period_s); return period <= 22 ? 'forced-medium-t22' : 'forced-medium-t24';
}
const catalogRows = bundle.cases.map(row => {
  const own = tables.previews.filter(preview => preview.case_id === row.case_id); const rep = representative(row);
  const depth = row.case_id.includes('pressure') || row.case_id.includes('sectional') || replacedCases.has(row.case_id) ? 'detailed' : 'standard';
  const title = row.loading_condition === 'stationary' ? 'Stationary tank baseline - 24 s observation' : row.case_id.includes('sectional') ? '24 s forced roll - sectional wall loads' : row.case_id.includes('pressure') ? '24 s forced roll - fine pressure and Courant refinement' : `${row.period_s} s forced roll - ${row.mesh} mesh`;
  return { case_id: row.case_id, title, summary: row.loading_condition === 'stationary' ? 'No-roll CFD baseline confirming static liquid level and numerical load stability.' : row.case_id.includes('sectional') ? 'Case-specific left/right wall-patch loads with aggregate reconstruction.' : 'Accepted forced-roll CFD response with complete input, QA, and response histories.', study_family: row.loading_condition === 'stationary' ? 'stationary_baseline' : row.study_axis, evidence_depth: depth, media_truth: own.length ? 'case_specific' : rep ? 'representative' : 'none', representative_case_id: rep, has_case_image: own.some(p => p.media_type.startsWith('image/')), has_case_video: own.some(p => p.media_type === 'video/mp4'), qa_summary: row.case_id.includes('pressure') ? 'accepted_with_reduced_courant_caveat' : row.loading_condition === 'stationary' ? 'accepted_static_baseline' : 'accepted_cycle_converged', analysis_path: `/reports/sloshing/analysis.html?case=${row.case_id}`, validation_fixture_path: '/reports/sloshing/validation.html' };
});
tables.case_catalog = upsert(tables.case_catalog, catalogRows, ['case_id']);

const referencedAssets = new Set(tables.previews.map(row => row.relative_path));
for (const file of Object.keys(assets)) if (!referencedAssets.has(file)) delete assets[file];
const release = R.buildRelease(tables, { assets });
const sources = [...current.pointer.source.files];
sources.push(sourceEntry(bundlePath, 'review/evidence_extension/publication_bundle.json'));
sources.push(sourceEntry(mediaManifestPath, 'review/evidence_extension/media_manifest.json'));
for (const record of mediaManifest.records) for (const kind of ['video', 'snapshot']) {
  const file = record[kind].file; sources.push(sourceEntry(path.join(mediaRoot, record.case_public_id, file), `review/evidence_extension/${record.case_public_id}/${file}`));
}
const byPath = new Map(sources.map(file => [file.path, file]));
const source = { dataset: 'aceengineer/digitalmodel-sloshing', revision: current.pointer.source.revision, files: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path)) };
const published = R.publishRelease(release, { root: repoRoot, pointerPath: path.join(repoRoot, 'config/sloshing-data-release.json'), source });
console.log(JSON.stringify({ digest: published.digest, counts: release.manifest.counts, assets: release.manifest.assets.length, sources: source.files.length }, null, 2));
