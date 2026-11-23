#!/usr/bin/env node
'use strict';

// Publish the damping / sizing work into the immutable sloshing release: the measured
// (period x roll amplitude) damping surface, the conduit-area and fill prediction checks,
// the closed-form tank moment and the design sweep. The reviewed bundle is produced by
// cfd_work/dm1528/prepare_damping_release.py.
//
// Three of the 33 cases exceed the declared 2 % exchange cycle-change limit (the two
// lowest-fill cases and the largest-amplitude shortest-period cell — the most nonlinear
// conditions in the set). They are published FLAGGED, not dropped: their case status is
// `accepted_with_exception`, their qa_audit row carries qa_status `review`, and the
// dispositions table counts them. Statistics over the release should exclude them.
//
// No time series are published. The `samples` table stands at 9,933 rows against a declared
// max_public_rows of 10,000, so a series would breach the release's own limit; the raw
// histories stay in the pinned private source.

const fs = require('fs');
const path = require('path');
const R = require('./refresh-sloshing-data');

const repoRoot = path.resolve(__dirname, '..');
const reviewRoot = path.resolve(process.env.SLOSHING_REVIEW_ROOT || '/home/undi/ws/cfd_work/dm1528');
const bundleDir = path.join(reviewRoot, 'review_output/damping_release');
const bundlePath = path.join(bundleDir, 'publication_bundle.json');
const revision = (process.env.SLOSHING_SOURCE_REVISION || '').trim();
if (!fs.existsSync(bundlePath)) throw new Error('reviewed damping bundle is required');
if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error('SLOSHING_SOURCE_REVISION must be the 40-hex dataset revision holding the bundle');

const parseCsv = R.parseCsv;
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
tables.case_catalog = upsert(tables.case_catalog, bundle.case_catalog, ['case_id']);
tables.inputs = upsert(tables.inputs, bundle.inputs, ['case_id']);
tables.qa_audit = upsert(tables.qa_audit, bundle.qa_audit, ['case_id']);
tables.derived_metrics = upsert(tables.derived_metrics, bundle.derived_metrics, ['case_id', 'quantity']);
tables.studies = upsert(tables.studies, bundle.studies, ['study_id']);

// Analytical metrics carry their own provenance: the reviewed model files on the pinned
// dataset revision, not a CFD aggregate.
const modelSha = R.sha256(fs.readFileSync(path.join(bundleDir, 'publication_bundle.json')));
tables.metrics = upsert(tables.metrics, bundle.analytical_metrics.map(row => ({
  case_id: row.case_id, quantity: row.quantity, value: row.value, unit: row.unit,
  statistic: row.statistic, qa_status: row.qa_status, source_class: 'analytical_closed_form',
  source_sha256: modelSha, source_revision: revision, transform_version: R.TRANSFORMER_VERSION,
})), ['case_id', 'quantity']);

// Dispositions are counts per family_class; replace this family's rows wholesale.
const family = new Set(bundle.dispositions.map(row => row.family_class));
tables.dispositions = tables.dispositions.filter(row => !family.has(row.family_class))
  .concat(bundle.dispositions)
  .sort((a, b) => `${a.family_class}\0${a.status}`.localeCompare(`${b.family_class}\0${b.status}`));

const release = R.buildRelease(tables, { assets });
const byPath = new Map(current.pointer.source.files.map(file => [file.path, file]));
for (const file of ['publication_bundle.json', 'response_surface.json', 'prediction_checks.json',
                    'moment_phase.json', 'loss_scaling.json', 'moment_model.json',
                    'design_sweep.json', 'utube_damped.json']) {
  const local = path.join(bundleDir, file);
  if (!fs.existsSync(local)) throw new Error(`declared source missing locally: ${file}`);
  const entry = sourceEntry(local, `review/damping/${file}`);
  byPath.set(entry.path, entry);
}
const source = { dataset: 'aceengineer/digitalmodel-sloshing', revision, files: [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path)) };
const published = R.publishRelease(release, { root: repoRoot, pointerPath: path.join(repoRoot, 'config/sloshing-data-release.json'), source });
console.log(JSON.stringify({
  previous_digest: current.digest, digest: published.digest, revision,
  counts: release.manifest.counts, sources: source.files.length,
  flagged: bundle.dispositions.find(d => d.status === 'accepted_with_exception'),
}, null, 2));
