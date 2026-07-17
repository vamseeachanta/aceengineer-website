#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const R = require('./refresh-sloshing-data');

const REVISION = 'd9ff6967021755156c3daa35f93e6385f672b257';
const repoRoot = path.resolve(__dirname, '..');
const reviewRoot = process.env.SLOSHING_REVIEW_ROOT && path.resolve(process.env.SLOSHING_REVIEW_ROOT);
if (!reviewRoot || !fs.existsSync(reviewRoot)) throw new Error('SLOSHING_REVIEW_ROOT must point to the reviewed dm1528 output directory');

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/); const headers = lines.shift().split(',');
  return lines.map(line => Object.fromEntries(line.split(',').map((value, i) => [headers[i], value])));
}
function sourceEntry(localPath, remotePath) {
  const body = fs.readFileSync(localPath);
  return { path: remotePath, sha256: R.sha256(body), bytes: body.length };
}

const current = R.validateCommittedRelease(repoRoot);
const currentDir = path.join(repoRoot, current.pointer.release.directory);
const tables = {};
for (const table of current.manifest.tables) tables[table.name] = parseCsv(fs.readFileSync(path.join(currentDir, table.file), 'utf8'));
tables.derived_metrics = parseCsv(fs.readFileSync(path.join(reviewRoot, 'report_enrichment', 'derived_metrics.csv'), 'utf8'));
tables.pressure_envelopes = parseCsv(fs.readFileSync(path.join(reviewRoot, 'report_enrichment', 'pressure_envelopes.csv'), 'utf8'));

const assets = {};
for (const asset of current.manifest.assets) assets[asset.file] = fs.readFileSync(path.join(currentDir, asset.file));
const mediaManifestPath = path.join(reviewRoot, 'representative_videos', 'representative_media_manifest.json');
const mediaManifest = JSON.parse(fs.readFileSync(mediaManifestPath, 'utf8'));
const mediaByCase = new Map(mediaManifest.records.map(record => [record.case_public_id, record]));
const regeneratedPreviewIds = new Set(mediaManifest.records.flatMap(record =>
  ['video', 'snapshot'].map(kind => `${record.case_public_id}-${kind}`)));
tables.previews = tables.previews.filter(preview => !regeneratedPreviewIds.has(preview.preview_id));
for (const record of mediaManifest.records) {
  for (const kind of ['video', 'snapshot']) {
    const media = record[kind];
    const localPath = path.join(reviewRoot, 'representative_videos', record.case_public_id, media.file);
    if (R.sha256(fs.readFileSync(localPath)) !== media.sha256 || fs.statSync(localPath).size !== media.bytes) throw new Error(`media manifest mismatch: ${media.file}`);
    const publicFile = media.file;
    assets[publicFile] = fs.readFileSync(localPath);
    tables.previews.push({
      preview_id: `${record.case_public_id}-${kind}`, case_id: record.case_public_id,
      media_type: media.media_type, relative_path: publicFile, sha256: media.sha256,
      bytes: media.bytes, status: 'published',
      alt_text: `${kind === 'video' ? '1080p CFD animation with synchronized response graphs' : 'Final CFD frame with response graphs'} for forced-roll period ${record.period_s} seconds.`,
    });
  }
}
tables.previews.sort((a, b) => a.preview_id.localeCompare(b.preview_id));

const exactMediaCases = new Set(tables.previews.map(row => row.case_id));
function nearestRepresentative(caseRow) {
  if (caseRow.loading_condition !== 'forced_roll' || exactMediaCases.has(caseRow.case_id)) return '';
  return [...mediaByCase.values()].sort((a, b) =>
    Math.abs(a.period_s - Number(caseRow.period_s)) - Math.abs(b.period_s - Number(caseRow.period_s)) ||
    a.case_public_id.localeCompare(b.case_public_id))[0].case_public_id;
}
function caseTitle(row) {
  if (row.case_id === 'forced-fine-co035-pressure-t24') return '24 s forced roll pressure and load QA';
  if (row.loading_condition === 'forced_roll') return `${row.period_s} s forced roll - ${row.mesh} mesh`;
  return row.study_axis === 'mesh'
    ? `Free-decay mesh verification - ${row.mesh_cells} cells`
    : `Free-decay timestep verification - ${row.timestep_s} s`;
}
tables.case_catalog = tables.cases.map(row => {
  const ownPreviews = tables.previews.filter(preview => preview.case_id === row.case_id);
  const hasImage = ownPreviews.some(preview => preview.media_type.startsWith('image/'));
  const hasVideo = ownPreviews.some(preview => preview.media_type === 'video/mp4');
  const representative = nearestRepresentative(row);
  const isPressureQa = row.case_id === 'forced-fine-co035-pressure-t24';
  return {
    case_id: row.case_id,
    title: caseTitle(row),
    summary: row.loading_condition === 'forced_roll'
      ? 'Accepted forced-roll CFD response case for period and mesh comparison.'
      : 'Accepted free-decay CFD verification case compared with the analytical frequency.',
    study_family: row.loading_condition === 'forced_roll' ? 'forced_roll_response' : 'free_decay_validation',
    evidence_depth: isPressureQa ? 'standard' : 'simple',
    media_truth: hasImage || hasVideo ? 'case_specific' : representative ? 'representative' : 'none',
    representative_case_id: representative,
    has_case_image: hasImage,
    has_case_video: hasVideo,
    qa_summary: isPressureQa ? 'accepted_with_courant_caveat' : row.loading_condition === 'forced_roll' ? 'accepted_cycle_converged' : 'accepted_verification',
    analysis_path: `/reports/sloshing/analysis.html?case=${row.case_id}`,
    validation_fixture_path: '/reports/sloshing/validation.html',
  };
}).sort((a, b) => a.case_id.localeCompare(b.case_id));

tables.media_metadata = tables.previews.map(preview => {
  const record = mediaByCase.get(preview.case_id);
  const isVideo = preview.media_type === 'video/mp4';
  const isPressurePreview = preview.case_id === 'forced-fine-co035-pressure-t24';
  const dimensions = record ? (isVideo ? record.video : record.snapshot) : { width: 1200, height: 750 };
  return {
    preview_id: preview.preview_id,
    evidence_relation: 'case_specific',
    width_px: dimensions.width,
    height_px: dimensions.height,
    duration_s: record && isVideo ? 3 : isPressurePreview && preview.media_type === 'image/gif' ? 0.6 : '',
    frame_count: record && isVideo ? record.field_frame_count : isPressurePreview && preview.media_type === 'image/gif' ? 6 : '',
    field_window_start_s: record ? record.field_window_start_s : isPressurePreview ? 237.5 : '',
    field_window_end_s: record ? record.field_window_end_s : isPressurePreview ? 240 : '',
    temporal_interpolation: record || preview.media_type === 'image/gif' ? 'none' : 'not_applicable',
    review_scope: record ? 'final_window_fields_with_full_history_graphs' : isPressurePreview ? 'final_window_liquid_fraction' : 'final_state_liquid_fraction',
  };
}).sort((a, b) => a.preview_id.localeCompare(b.preview_id));

const release = R.buildRelease(tables, { assets });
const oldSource = current.pointer.source.files.map(file => ({ ...file }));
const newSources = [];
for (const record of mediaManifest.records) for (const kind of ['video', 'snapshot']) {
  const file = record[kind].file;
  newSources.push(sourceEntry(path.join(reviewRoot, 'representative_videos', record.case_public_id, file), `review/representative_videos/${record.case_public_id}/${file}`));
}
newSources.push(sourceEntry(mediaManifestPath, 'review/representative_videos/representative_media_manifest.json'));
for (const file of ['derived_metrics.csv', 'pressure_envelopes.csv', 'manifest.json']) newSources.push(sourceEntry(path.join(reviewRoot, 'report_enrichment', file), `review/report_enrichment/${file}`));
const byPath = new Map([...oldSource, ...newSources].map(file => [file.path, file]));
const source = { dataset: 'aceengineer/digitalmodel-sloshing', revision: REVISION, files: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path)) };
const published = R.publishRelease(release, { root: repoRoot, pointerPath: path.join(repoRoot, 'config', 'sloshing-data-release.json'), source });
console.log(JSON.stringify({ digest: published.digest, counts: release.manifest.counts, assets: release.manifest.assets.length, sources: source.files.length }, null, 2));
