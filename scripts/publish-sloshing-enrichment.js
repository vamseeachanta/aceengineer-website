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
