#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SCHEMA_VERSION = '1.0.0';
const TRANSFORMER_VERSION = '1.0.0';
const DATASET = 'aceengineer/digitalmodel-sloshing';
const SOURCE_HASHES = Object.freeze({
  forced: '34f678a045a211986405b3a28dd8b4216231bfb5ee282dfb15e13c42e427a6af',
  fine: '38eec090aca469b00f6d8615ad5e7157acdf92637baf05781ce8e4ff2636aade',
  decay: 'e093a0609d25aa207c55d64cbc06f897d2d085f3ca71c3a83d193c08e5e231ea',
});
const TABLE_ORDER = ['cases', 'metrics', 'studies', 'inputs', 'mesh_quality', 'qa_audit', 'series', 'samples', 'previews', 'dispositions'];
const FORBIDDEN = /anti[\s_-]*roll|withheld|source[\s_-]*(?:record[\s_-]*)?id|client|project|(?:^|[\\/])[a-z]:[\\/]|\/home\/|<script|authorization|bearer\s/i;

const COLUMNS = Object.freeze({
  cases: ['case_id', 'evidence_type', 'status', 'study_axis', 'loading_condition', 'mesh', 'mesh_cells', 'period_s', 'frequency_hz', 'timestep_s', 'cycles', 'configured_max_courant', 'configured_max_alpha_courant', 'excitation', 'geometry_basis', 'solver_class'],
  metrics: ['case_id', 'quantity', 'value', 'unit', 'statistic', 'qa_status', 'source_class', 'source_sha256', 'source_revision', 'transform_version'],
  studies: ['study_id', 'study_type', 'quantity', 'unit', 'case_count', 'analytical_target', 'target_unit', 'qa_status'],
  inputs: ['case_id', 'solver_family', 'solver_version', 'simulation_dimensionality', 'forcing_period_s', 'forcing_amplitude_deg', 'simulated_cycles', 'end_time_s', 'initial_fill_fraction', 'liquid_density_kg_m3', 'liquid_kinematic_viscosity_m2_s', 'gas_density_kg_m3', 'gas_kinematic_viscosity_m2_s', 'surface_tension_N_m', 'gravity_m_s2', 'mesh_cells', 'time_integration', 'configured_max_courant', 'configured_max_interface_courant', 'maximum_timestep_s', 'pressure_probe_count', 'pressure_and_load_output_interval_s', 'qa_output_interval_s', 'geometry_disclosure', 'sectional_load_extraction'],
  mesh_quality: ['case_id', 'mesh_cells', 'mesh_points', 'mesh_regions', 'mesh_check', 'evaluated_state', 'max_aspect_ratio', 'max_non_orthogonality_deg', 'average_non_orthogonality_deg', 'max_skewness', 'minimum_cell_determinant', 'minimum_face_interpolation_weight', 'minimum_face_volume_ratio', 'minimum_cell_volume_m3', 'maximum_cell_volume_m3', 'total_domain_volume_m3', 'sectional_face_zones_available'],
  qa_audit: ['case_id', 'completion_marker', 'end_time_s', 'configured_max_courant', 'observed_max_courant', 'observed_max_courant_time_s', 'courant_median', 'courant_p95', 'courant_target_exceeded', 'courant_steps_above_target', 'courant_step_count', 'pressure_probe_count', 'pressure_times_per_probe', 'pressure_row_count', 'aggregate_load_row_count', 'output_interval_s', 'all_reduced_values_finite', 'exchange_cycle_change_pct', 'moment_cycle_change_pct', 'declared_exchange_limit_pct', 'declared_moment_limit_pct', 'cycle_converged', 'exchange_change_from_prior_fine_pct', 'roll_moment_change_from_prior_fine_pct', 'max_courant_change_from_prior_fine_pct', 'qa_status'],
  series: ['series_id', 'case_id', 'quantity', 'unit', 'x_quantity', 'x_unit', 'sample_count', 'public_location', 'z_over_height', 'label', 'line_dash', 'qa_status', 'source_class', 'source_sha256'],
  samples: ['series_id', 'ordinal', 'x', 'y'],
  previews: ['preview_id', 'case_id', 'media_type', 'relative_path', 'sha256', 'bytes', 'status', 'alt_text'],
  dispositions: ['family_class', 'status', 'count', 'reason_code'],
});

const PERIOD_KEYS = new Set(['period_s', 'mesh', 'status', 'cycles', 'end_time_s', 'exchange_amplitude_m3', 'level_difference_amplitude_m', 'exchange_cycle_change_pct', 'exchange_residual_fraction', 'roll_moment_amplitude_Nm', 'moment_cycle_change_pct', 'moment_residual_fraction', 'volume_drift_pct', 'alpha_min', 'alpha_max', 'max_courant', 'cycle_converged']);
const MESH_KEYS = new Set(['period_s', 'medium_cells', 'fine_cells', 'exchange_change_pct', 'roll_moment_change_pct', 'medium_cycle_converged', 'fine_cycle_converged']);
const CONV_KEYS = new Set(['tag', 'sweep', 'cells_per_breadth', 'cells', 'dt', 'timesteps', 'cell_size', 'status', 'runtime_s', 'predicted_runtime_s', 'freq_meas_hz', 'freq_analytical_hz', 'rel_error_pct']);
const PRESSURE_KEYS = new Set(['time_s', 'probe_id', 'z_over_height', 'pressure_Pa', 'water_fraction']);
const LOAD_KEYS = new Set(['time_s', 'force_x_N', 'force_y_N', 'force_z_N', 'moment_x_Nm', 'moment_y_Nm', 'moment_z_Nm']);
const PRESSURE_QA_KEYS = new Set(['period_s', 'mesh', 'status', 'cycles', 'end_time_s', 'exchange_amplitude_m3', 'level_difference_amplitude_m', 'exchange_cycle_change_pct', 'exchange_residual_fraction', 'roll_moment_amplitude_Nm', 'moment_cycle_change_pct', 'moment_residual_fraction', 'volume_drift_pct', 'alpha_min', 'alpha_max', 'max_courant', 'cycle_converged', 'configured_maxCo', 'configured_maxAlphaCo', 'pressure_probe_count', 'pressure_sample_rows', 'aggregate_load_rows', 'sectional_load_status']);
const INPUT_KEYS = new Set(['evidence_type', 'solver_family', 'solver_version', 'simulation_dimensionality', 'forcing_period_s', 'forcing_amplitude_deg', 'simulated_cycles', 'end_time_s', 'initial_fill_fraction', 'liquid_density_kg_m3', 'liquid_kinematic_viscosity_m2_s', 'gas_density_kg_m3', 'gas_kinematic_viscosity_m2_s', 'surface_tension_N_m', 'gravity_m_s2', 'mesh_cells', 'time_integration', 'configured_max_courant', 'configured_max_interface_courant', 'maximum_timestep_s', 'pressure_probe_count', 'pressure_and_load_output_interval_s', 'qa_output_interval_s', 'geometry_disclosure', 'sectional_load_extraction']);
const MESH_QUALITY_KEYS = new Set(['mesh_cells', 'mesh_points', 'mesh_regions', 'mesh_check', 'evaluated_state', 'max_aspect_ratio', 'max_non_orthogonality_deg', 'average_non_orthogonality_deg', 'max_skewness', 'minimum_cell_determinant', 'minimum_face_interpolation_weight', 'minimum_face_volume_ratio', 'minimum_cell_volume_m3', 'maximum_cell_volume_m3', 'total_domain_volume_m3', 'sectional_face_zones_available']);
const AUDIT_KEYS = new Set(['completion_marker', 'end_time_s', 'observed_max_courant', 'observed_max_courant_time_s', 'courant_median', 'courant_p95', 'courant_target_exceeded', 'courant_steps_above_0p35', 'courant_step_count', 'pressure_probe_count', 'pressure_times_per_probe', 'pressure_row_count', 'aggregate_load_row_count', 'output_interval_s', 'all_reduced_values_finite', 'exchange_cycle_change_pct', 'moment_cycle_change_pct', 'declared_exchange_limit_pct', 'declared_moment_limit_pct', 'cycle_converged', 'exchange_change_from_prior_fine_pct', 'roll_moment_change_from_prior_fine_pct', 'max_courant_change_from_prior_fine_pct', 'qa_label', 'recommendation']);
const PROBE_MAP = Object.freeze(Object.fromEntries(['L_outer', 'L_inner', 'R_inner', 'R_outer'].flatMap(side => [10, 30, 50, 70, 90].map(height => {
  const publicSide = { L_outer: 'left-outer', L_inner: 'left-inner', R_inner: 'right-inner', R_outer: 'right-outer' }[side];
  return [`${side}_z${height}`, { id: `${publicSide}-h${height}`, location: publicSide, height: height / 100, label: `${publicSide.replace('-', ' ')} at ${height}% height` }];
}))));
const PRESSURE_SOURCE_SHA = 'f58256876d30ed00d0618b7bf3472fc8f160a5d5ab7fce865c0d018329b828d4';
const LOAD_SOURCE_SHA = 'ae337c378561c9c334d1b59adce7cf3772640699e75ddce1e36a6e3a692edd3a';
const QA_SOURCE_SHA = 'c03a7639d27dbefd3ffa7f6eddcba336f32a80f8cf1c8a3df45d4c8f8424bce7';

function sha256(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableJson(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
}
function assertFinite(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
}
function assertClosed(obj, allowed, label) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(obj)) {
    if (!allowed.has(key) || FORBIDDEN.test(key) || (typeof obj[key] === 'string' && FORBIDDEN.test(obj[key]))) {
      throw new Error(`${label}: unknown or forbidden field ${key}`);
    }
  }
}
function publicIdNumber(n) { return String(n).replace('.', 'p'); }
function blankInputs(row) { return { configured_max_courant: '', configured_max_alpha_courant: '', excitation: row.loading_condition === 'forced_roll' ? 'sinusoidal_roll_period' : 'initial_free_surface_perturbation' }; }

function addMetric(metrics, caseId, quantity, value, unit, statistic, revision, qa = 'pass', sourceHash = SOURCE_HASHES.forced) {
  assertFinite(value, quantity);
  metrics.push({
    case_id: caseId, quantity, value, unit, statistic, qa_status: qa,
    source_class: 'reviewed_aggregate', source_sha256: sourceHash,
    source_revision: revision, transform_version: TRANSFORMER_VERSION,
  });
}

function transformReviewed(source, { revision }) {
  if (!/^[0-9a-f]{40}$/.test(revision || '')) throw new Error('revision must be 40 lowercase hex');
  const periodRows = source.periodRows || [];
  const convergenceRows = source.convergenceRows || [];
  if (periodRows.length !== 6 || convergenceRows.length !== 7) throw new Error('expected six forced and seven unique free-decay rows');
  assertClosed(source.fine, PERIOD_KEYS, 'fine');
  assertClosed(source.mesh, MESH_KEYS, 'mesh');
  const cases = [];
  const metrics = [];

  for (const row of [...periodRows].sort((a, b) => a.period_s - b.period_s)) {
    assertClosed(row, PERIOD_KEYS, 'period row');
    if (row.status !== 'completed' || row.mesh !== 'medium' || row.cycles !== 10 || row.cycle_converged !== true) throw new Error('forced row not accepted');
    const id = `forced-medium-t${assertFinite(row.period_s, 'period_s')}`;
    const caseRow = { case_id: id, evidence_type: 'cfd_forced_roll', status: 'accepted', study_axis: 'period', loading_condition: 'forced_roll', mesh: 'medium', mesh_cells: 20480, period_s: row.period_s, frequency_hz: 1 / row.period_s, timestep_s: '', cycles: 10, geometry_basis: 'source_neutral_twin_tank', solver_class: 'vof_cfd' };
    cases.push({ ...caseRow, ...blankInputs(caseRow) });
    addMetric(metrics, id, 'level_difference_amplitude', row.level_difference_amplitude_m, 'm', 'last_cycle_harmonic_amplitude', revision);
    addMetric(metrics, id, 'exchange_amplitude', row.exchange_amplitude_m3, 'm3', 'last_cycle_harmonic_amplitude', revision);
    addMetric(metrics, id, 'roll_moment_amplitude', row.roll_moment_amplitude_Nm, 'N_m', 'last_cycle_harmonic_amplitude', revision);
    addMetric(metrics, id, 'exchange_cycle_change', row.exchange_cycle_change_pct, 'percent', 'last_two_cycles', revision);
    addMetric(metrics, id, 'moment_cycle_change', row.moment_cycle_change_pct, 'percent', 'last_two_cycles', revision);
    addMetric(metrics, id, 'volume_drift', row.volume_drift_pct, 'percent', 'full_run', revision);
    addMetric(metrics, id, 'max_courant', row.max_courant, 'dimensionless', 'maximum', revision);
  }

  const fine = source.fine;
  if (fine.status !== 'completed' || fine.mesh !== 'fine' || fine.period_s !== 24 || fine.cycle_converged !== true) throw new Error('fine row not accepted');
  const fineId = 'forced-fine-t24';
  const fineCase = { case_id: fineId, evidence_type: 'cfd_forced_roll', status: 'accepted', study_axis: 'mesh_confirmation', loading_condition: 'forced_roll', mesh: 'fine', mesh_cells: source.mesh.fine_cells, period_s: 24, frequency_hz: 1 / 24, timestep_s: '', cycles: 10, geometry_basis: 'source_neutral_twin_tank', solver_class: 'vof_cfd' };
  cases.push({ ...fineCase, ...blankInputs(fineCase) });
  for (const [q, key, unit, stat] of [
    ['level_difference_amplitude', 'level_difference_amplitude_m', 'm', 'last_cycle_harmonic_amplitude'],
    ['exchange_amplitude', 'exchange_amplitude_m3', 'm3', 'last_cycle_harmonic_amplitude'],
    ['roll_moment_amplitude', 'roll_moment_amplitude_Nm', 'N_m', 'last_cycle_harmonic_amplitude'],
    ['exchange_cycle_change', 'exchange_cycle_change_pct', 'percent', 'last_two_cycles'],
    ['moment_cycle_change', 'moment_cycle_change_pct', 'percent', 'last_two_cycles'],
    ['volume_drift', 'volume_drift_pct', 'percent', 'full_run'],
    ['max_courant', 'max_courant', 'dimensionless', 'maximum'],
  ]) addMetric(metrics, fineId, q, fine[key], unit, stat, revision, q === 'max_courant' && fine[key] > 0.5 ? 'engineering_tolerance' : 'pass', SOURCE_HASHES.fine);

  const seenDecay = new Set();
  for (const row of [...convergenceRows].sort((a, b) => `${a.tag || a.sweep}:${a.cells_per_breadth}:${a.dt}`.localeCompare(`${b.tag || b.sweep}:${b.cells_per_breadth}:${b.dt}`))) {
    assertClosed(row, CONV_KEYS, 'convergence row');
    const tag = row.tag || row.sweep;
    if (!['mesh', 'dt'].includes(tag) || row.status !== 'completed') throw new Error('free-decay row not accepted');
    const id = tag === 'mesh' ? `decay-mesh-cpb${row.cells_per_breadth}` : `decay-dt-${publicIdNumber(row.dt.toFixed(3))}`;
    if (seenDecay.has(id)) throw new Error(`duplicate free-decay case ${id}`);
    seenDecay.add(id);
    const decayCase = { case_id: id, evidence_type: 'cfd_validation', status: 'accepted', study_axis: tag, loading_condition: 'free_decay', mesh: 'structured_2d', mesh_cells: assertFinite(row.cells, 'cells'), period_s: '', frequency_hz: assertFinite(row.freq_meas_hz, 'freq_meas_hz'), timestep_s: assertFinite(row.dt, 'dt'), cycles: '', geometry_basis: 'rectangular_free_surface_benchmark', solver_class: 'vof_cfd' };
    cases.push({ ...decayCase, ...blankInputs(decayCase) });
    addMetric(metrics, id, 'measured_frequency', row.freq_meas_hz, 'Hz', 'zero_crossing', revision, 'pass', SOURCE_HASHES.decay);
    addMetric(metrics, id, 'analytical_frequency', row.freq_analytical_hz, 'Hz', 'linear_wave_target', revision, 'pass', SOURCE_HASHES.decay);
    addMetric(metrics, id, 'relative_frequency_error', row.rel_error_pct, 'percent', 'versus_analytical', revision, 'pass', SOURCE_HASHES.decay);
  }

  cases.sort((a, b) => a.case_id.localeCompare(b.case_id));
  metrics.sort((a, b) => `${a.case_id}:${a.quantity}`.localeCompare(`${b.case_id}:${b.quantity}`));
  const studies = [
    { study_id: 'free-decay-convergence', study_type: 'mesh_and_timestep', quantity: 'measured_frequency', unit: 'Hz', case_count: 7, analytical_target: 0.758054, target_unit: 'Hz', qa_status: 'non_asymptotic_caution' },
    { study_id: 'forced-period-refinement', study_type: 'period_sweep', quantity: 'level_difference_amplitude', unit: 'm', case_count: 6, analytical_target: '', target_unit: '', qa_status: 'cycle_converged' },
    { study_id: 'forced-mesh-confirmation', study_type: 'mesh_confirmation', quantity: 'exchange_amplitude', unit: 'percent_change', case_count: 2, analytical_target: source.mesh.exchange_change_pct, target_unit: 'percent', qa_status: 'cycle_converged' },
  ];
  const dispositions = [
    { family_class: 'unsupported_claim_family', status: 'not_published', count: 1, reason_code: 'unsupported_model_claim' },
    { family_class: 'incomplete_run_family', status: 'not_published', count: 10, reason_code: 'incomplete_solver_run' },
    { family_class: 'verification_family', status: 'verification_only', count: 1, reason_code: 'verification_scope_only' },
  ];
  const output = { cases, metrics, studies, inputs: [], mesh_quality: [], qa_audit: [], series: [], samples: [], previews: [], dispositions };
  const serialized = stableJson(output);
  if (FORBIDDEN.test(serialized)) throw new Error('forbidden public value');
  return output;
}

function transformPressureEvidence({ input, mesh, audit }) {
  assertClosed(input, INPUT_KEYS, 'sanitized input summary');
  assertClosed(mesh, MESH_QUALITY_KEYS, 'mesh quality');
  assertClosed(audit, AUDIT_KEYS, 'audit summary');
  const caseId = 'forced-fine-co035-pressure-t24';
  if (input.evidence_type !== 'forced_roll_cfd_follow_on' || input.geometry_disclosure !== 'normalized_coordinates_only' || input.mesh_cells !== 69120) throw new Error('input evidence contract mismatch');
  if (mesh.mesh_check !== 'passed' || mesh.mesh_cells !== input.mesh_cells || mesh.mesh_regions !== 1) throw new Error('mesh evidence contract mismatch');
  if (!audit.completion_marker || !audit.cycle_converged || !audit.all_reduced_values_finite || !audit.courant_target_exceeded) throw new Error('audit evidence is not publishable with caveat');
  if (audit.observed_max_courant !== 0.47841479 || input.configured_max_courant !== 0.35 || input.configured_max_interface_courant !== 0.35) throw new Error('Courant caveat values mismatch');
  if (Math.abs(audit.exchange_change_from_prior_fine_pct) > 0.24 || Math.abs(audit.roll_moment_change_from_prior_fine_pct) > 0.24) throw new Error('prior fine agreement exceeds reviewed bound');
  const inputRow = { case_id: caseId };
  for (const column of COLUMNS.inputs.slice(1)) inputRow[column] = input[column];
  const meshRow = { case_id: caseId };
  for (const column of COLUMNS.mesh_quality.slice(1)) meshRow[column] = mesh[column];
  const qaRow = {
    case_id: caseId, completion_marker: audit.completion_marker, end_time_s: audit.end_time_s,
    configured_max_courant: input.configured_max_courant, observed_max_courant: audit.observed_max_courant,
    observed_max_courant_time_s: audit.observed_max_courant_time_s, courant_median: audit.courant_median,
    courant_p95: audit.courant_p95, courant_target_exceeded: audit.courant_target_exceeded,
    courant_steps_above_target: audit.courant_steps_above_0p35, courant_step_count: audit.courant_step_count,
    pressure_probe_count: audit.pressure_probe_count, pressure_times_per_probe: audit.pressure_times_per_probe,
    pressure_row_count: audit.pressure_row_count, aggregate_load_row_count: audit.aggregate_load_row_count,
    output_interval_s: audit.output_interval_s, all_reduced_values_finite: audit.all_reduced_values_finite,
    exchange_cycle_change_pct: audit.exchange_cycle_change_pct, moment_cycle_change_pct: audit.moment_cycle_change_pct,
    declared_exchange_limit_pct: audit.declared_exchange_limit_pct, declared_moment_limit_pct: audit.declared_moment_limit_pct,
    cycle_converged: audit.cycle_converged, exchange_change_from_prior_fine_pct: audit.exchange_change_from_prior_fine_pct,
    roll_moment_change_from_prior_fine_pct: audit.roll_moment_change_from_prior_fine_pct,
    max_courant_change_from_prior_fine_pct: audit.max_courant_change_from_prior_fine_pct,
    qa_status: 'publish_with_courant_caveat',
  };
  return { inputs: [inputRow], mesh_quality: [meshRow], qa_audit: [qaRow] };
}

function mergePressureEvidence(base, evidence) {
  for (const name of ['inputs', 'mesh_quality', 'qa_audit']) base[name].push(...evidence[name]);
  return base;
}

function transformPressureArtifacts(source, { revision, stride = 16 } = {}) {
  if (!/^[0-9a-f]{40}$/.test(revision || '')) throw new Error('revision must be 40 lowercase hex');
  if (!Number.isInteger(stride) || stride < 1 || stride > 100) throw new Error('invalid pressure stride');
  const qa = source.qa;
  assertClosed(qa, PRESSURE_QA_KEYS, 'pressure QA');
  if (qa.status !== 'completed' || qa.cycle_converged !== true || qa.period_s !== 24 || qa.cycles !== 10 || qa.pressure_probe_count !== 20) throw new Error('pressure follow-on is not accepted');
  if (source.pressureRows.length !== qa.pressure_sample_rows || source.loadRows.length !== qa.aggregate_load_rows) throw new Error('pressure/load row count mismatch');
  const byProbe = new Map(Object.keys(PROBE_MAP).map(id => [id, []]));
  for (const row of source.pressureRows) {
    assertClosed(row, PRESSURE_KEYS, 'pressure row');
    if (!PROBE_MAP[row.probe_id]) throw new Error(`unknown pressure probe ${row.probe_id}`);
    for (const key of ['time_s', 'z_over_height', 'pressure_Pa', 'water_fraction']) assertFinite(row[key], key);
    const mapped = PROBE_MAP[row.probe_id];
    if (Math.abs(row.z_over_height - mapped.height) > 1e-12 || row.water_fraction < -1e-6 || row.water_fraction > 1.000001) throw new Error('pressure probe metadata outside bounds');
    byProbe.get(row.probe_id).push(row);
  }
  for (const row of source.loadRows) {
    assertClosed(row, LOAD_KEYS, 'aggregate load row');
    for (const key of LOAD_KEYS) assertFinite(row[key], key);
  }
  function select(rows) {
    const sorted = [...rows].sort((a, b) => a.time_s - b.time_s);
    for (let i = 1; i < sorted.length; i++) if (sorted[i].time_s <= sorted[i - 1].time_s) throw new Error('series time must be strictly monotonic');
    const selected = sorted.filter((_, i) => i % stride === 0);
    if (selected[selected.length - 1] !== sorted[sorted.length - 1]) selected.push(sorted[sorted.length - 1]);
    return selected;
  }
  const caseId = 'forced-fine-co035-pressure-t24';
  const caseRow = {
    case_id: caseId, evidence_type: 'cfd_forced_roll', status: 'accepted', study_axis: 'pressure_load_follow_on',
    loading_condition: 'forced_roll', mesh: 'fine', mesh_cells: 69120, period_s: 24, frequency_hz: 1 / 24,
    timestep_s: '', cycles: 10, configured_max_courant: qa.configured_maxCo,
    configured_max_alpha_courant: qa.configured_maxAlphaCo, excitation: 'sinusoidal_roll_period',
    geometry_basis: 'source_neutral_twin_tank', solver_class: 'vof_cfd',
  };
  const metrics = [];
  for (const [q, key, unit, stat] of [
    ['level_difference_amplitude', 'level_difference_amplitude_m', 'm', 'last_cycle_harmonic_amplitude'],
    ['exchange_amplitude', 'exchange_amplitude_m3', 'm3', 'last_cycle_harmonic_amplitude'],
    ['roll_moment_amplitude', 'roll_moment_amplitude_Nm', 'N_m', 'last_cycle_harmonic_amplitude'],
    ['exchange_cycle_change', 'exchange_cycle_change_pct', 'percent', 'last_two_cycles'],
    ['moment_cycle_change', 'moment_cycle_change_pct', 'percent', 'last_two_cycles'],
    ['volume_drift', 'volume_drift_pct', 'percent', 'full_run'],
    ['max_courant', 'max_courant', 'dimensionless', 'maximum'],
  ]) addMetric(metrics, caseId, q, qa[key], unit, stat, revision, q === 'max_courant' && qa[key] > qa.configured_maxCo ? 'configured_limit_exceeded' : 'pass', QA_SOURCE_SHA);
  const series = [];
  const samples = [];
  function addSeries(meta, rows, valueKey, sourceHash) {
    const picked = select(rows);
    series.push({ ...meta, case_id: caseId, x_quantity: 'time', x_unit: 's', sample_count: picked.length,
      line_dash: 'solid', qa_status: qa.max_courant > qa.configured_maxCo ? 'configured_limit_exceeded' : 'pass',
      source_class: 'reviewed_time_history', source_sha256: sourceHash });
    picked.forEach((row, ordinal) => samples.push({ series_id: meta.series_id, ordinal, x: row.time_s, y: assertFinite(row[valueKey], valueKey) }));
  }
  for (const [sourceId, mapped] of Object.entries(PROBE_MAP)) addSeries({
    series_id: `pressure-${mapped.id}`, quantity: 'wall_pressure', unit: 'Pa', public_location: mapped.location,
    z_over_height: mapped.height, label: `Pressure: ${mapped.label}`,
  }, byProbe.get(sourceId), 'pressure_Pa', PRESSURE_SOURCE_SHA);
  for (const [key, quantity, unit, label] of [
    ['force_x_N', 'aggregate_force_x', 'N', 'Aggregate force X'], ['force_y_N', 'aggregate_force_y', 'N', 'Aggregate force Y'],
    ['force_z_N', 'aggregate_force_z', 'N', 'Aggregate force Z'], ['moment_x_Nm', 'aggregate_moment_x', 'N_m', 'Aggregate moment X'],
    ['moment_y_Nm', 'aggregate_moment_y', 'N_m', 'Aggregate moment Y'], ['moment_z_Nm', 'aggregate_moment_z', 'N_m', 'Aggregate moment Z'],
  ]) addSeries({ series_id: quantity.replace(/_/g, '-'), quantity, unit, public_location: 'aggregate_wall', z_over_height: '', label }, source.loadRows, key, LOAD_SOURCE_SHA);
  // A resultant load is deliberately not synthesized: only the six reviewed source components are published.
  series.sort((a, b) => a.series_id.localeCompare(b.series_id));
  samples.sort((a, b) => `${a.series_id}:${String(a.ordinal).padStart(6, '0')}`.localeCompare(`${b.series_id}:${String(b.ordinal).padStart(6, '0')}`));
  return { caseRow, metrics, series, samples };
}

function mergePressureRelease(base, pressure) {
  const out = Object.fromEntries(Object.entries(base).map(([key, rows]) => [key, [...rows]]));
  out.cases.push(pressure.caseRow); out.cases.sort((a, b) => a.case_id.localeCompare(b.case_id));
  out.metrics.push(...pressure.metrics); out.metrics.sort((a, b) => `${a.case_id}:${a.quantity}`.localeCompare(`${b.case_id}:${b.quantity}`));
  out.series.push(...pressure.series); out.samples.push(...pressure.samples);
  return out;
}

function csvCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('nonfinite CSV value');
    return Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(15)));
  }
  const s = String(value);
  if (s.length > 160 || FORBIDDEN.test(s)) throw new Error('forbidden or oversized CSV value');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function tableCsv(name, rows) {
  const columns = COLUMNS[name];
  for (const row of rows) {
    const keys = Object.keys(row).sort();
    if (keys.join('\0') !== [...columns].sort().join('\0')) throw new Error(`closed schema mismatch for ${name}`);
  }
  return `${columns.join(',')}\n${rows.map(row => columns.map(c => csvCell(row[c])).join(',')).join('\n')}\n`;
}
function digestIndex(manifest) {
  return `${stableJson({ schema_version: manifest.schema_version, transformer_version: manifest.transformer_version, tables: manifest.tables, assets: manifest.assets || [] })}\n`;
}
function buildRelease(tables, options = {}) {
  const files = {};
  const entries = [];
  for (const name of TABLE_ORDER) {
    const file = `${name}.csv`;
    const csv = tableCsv(name, tables[name]);
    files[file] = csv;
    entries.push({ name, file, sha256: sha256(csv), bytes: Buffer.byteLength(csv), rows: tables[name].length, columns: COLUMNS[name] });
  }
  const assetEntries = Object.entries(options.assets || {}).sort(([a], [b]) => a.localeCompare(b)).map(([file, body]) => ({
    file, sha256: sha256(body), bytes: Buffer.byteLength(body),
  }));
  for (const asset of assetEntries) files[asset.file] = options.assets[asset.file];
  const base = { schema_version: SCHEMA_VERSION, transformer_version: TRANSFORMER_VERSION, tables: entries, assets: assetEntries };
  const digest = sha256(digestIndex(base));
  const manifest = { ...base, release_digest: digest, counts: Object.fromEntries(entries.map(t => [t.name, t.rows])) };
  files['manifest.json'] = `${stableJson(manifest)}\n`;
  return { digest, manifest, files };
}

function verifyRelease(release) {
  const manifest = release.manifest;
  if (!manifest || manifest.release_digest !== release.digest) throw new Error('manifest digest mismatch');
  const recomputed = sha256(digestIndex(manifest));
  if (recomputed !== release.digest) throw new Error('release digest mismatch');
  for (const table of manifest.tables) {
    const body = release.files[table.file];
    if (typeof body !== 'string') throw new Error(`missing ${table.file}`);
    if (sha256(body) !== table.sha256) throw new Error(`${table.file} hash mismatch`);
    if (Buffer.byteLength(body) !== table.bytes) throw new Error(`${table.file} bytes mismatch`);
    if (body.trimEnd().split('\n').length - 1 !== table.rows) throw new Error(`${table.file} row mismatch`);
  }
  for (const asset of manifest.assets || []) {
    const body = release.files[asset.file];
    if (!Buffer.isBuffer(body)) throw new Error(`missing binary asset ${asset.file}`);
    if (sha256(body) !== asset.sha256) throw new Error(`${asset.file} asset hash mismatch`);
    if (body.length !== asset.bytes) throw new Error(`${asset.file} asset bytes mismatch`);
  }
  const previews = manifest.tables.find(t => t.name === 'previews');
  if ((manifest.assets || []).length && (!previews || previews.rows !== manifest.assets.length)) throw new Error('preview/asset count mismatch');
  if (previews) {
    const rows = parseCsvSimple(release.files[previews.file]);
    const byPath = new Map((manifest.assets || []).map(asset => [asset.file, asset]));
    for (const row of rows) {
      const asset = byPath.get(row.relative_path);
      if (!asset || asset.sha256 !== row.sha256 || asset.bytes !== Number(row.bytes)) throw new Error('preview asset metadata mismatch');
      if (!['image/png', 'image/gif', 'image/webp', 'video/mp4'].includes(row.media_type) || row.status !== 'published') throw new Error('preview media contract mismatch');
    }
  }
  return true;
}

function fsyncFile(file) { const fd = fs.openSync(file, 'r'); try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); } }
function publishRelease(release, options) {
  verifyRelease(release);
  const root = path.resolve(options.root);
  const dataRoot = path.join(root, 'assets', 'data', 'sloshing');
  const finalDir = path.join(dataRoot, release.digest);
  fs.mkdirSync(dataRoot, { recursive: true });
  if (!fs.existsSync(finalDir)) {
    const staging = fs.mkdtempSync(path.join(dataRoot, '.staging-'));
    try {
      for (const [file, body] of Object.entries(release.files)) {
        const target = path.join(staging, file);
        fs.writeFileSync(target, body, { mode: 0o644 });
        fsyncFile(target);
      }
      fs.renameSync(staging, finalDir);
    } catch (error) { fs.rmSync(staging, { recursive: true, force: true }); throw error; }
  }
  const pointerPath = path.resolve(options.pointerPath);
  fs.mkdirSync(path.dirname(pointerPath), { recursive: true });
  const old = fs.existsSync(pointerPath) ? fs.readFileSync(pointerPath) : null;
  const pointer = {
    schema_version: SCHEMA_VERSION, transformer_version: TRANSFORMER_VERSION,
    source: options.source, limits: { max_source_bytes: 6000000, max_public_rows: 10000, max_string_length: 160 },
    release: {
      digest: release.digest,
      directory: path.posix.join('assets/data/sloshing', release.digest),
      manifest: path.posix.join('assets/data/sloshing', release.digest, 'manifest.json'),
      tables: release.manifest.tables, counts: release.manifest.counts,
      assets: release.manifest.assets || [],
      public_case_ids: parseCsvSimple(release.files['cases.csv']).map(r => r.case_id),
    },
  };
  const tmp = `${pointerPath}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(tmp, `${stableJson(pointer)}\n`, { mode: 0o644 });
    fsyncFile(tmp);
    if (options.beforePointerRename) options.beforePointerRename();
    fs.renameSync(tmp, pointerPath);
  } catch (error) {
    fs.rmSync(tmp, { force: true });
    if (old && (!fs.existsSync(pointerPath) || !fs.readFileSync(pointerPath).equals(old))) fs.writeFileSync(pointerPath, old);
    throw error;
  }
  return { digest: release.digest, directory: finalDir, pointer };
}

function parseCsvSimple(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map(line => Object.fromEntries(line.split(',').map((v, i) => [headers[i], v])));
}

async function fetchPinnedFile({ dataset, revision, file, token, fetchImpl = fetch }) {
  if (!token) throw new Error('HF_TOKEN is required');
  const safePath = /^(?:mesh_dt_convergence\.parquet|review\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?)$/;
  if (dataset !== DATASET || !/^[0-9a-f]{40}$/.test(revision) || !safePath.test(file.path)) throw new Error('source URL is not allowlisted');
  const url = new URL(`https://huggingface.co/${dataset}/resolve/${revision}/${file.path}`);
  const response = await fetchImpl(url.toString(), { redirect: 'manual', headers: { authorization: `Bearer ${token}`, accept: 'application/octet-stream' } });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    const next = new URL(location, url);
    if (next.origin !== url.origin) throw new Error('cross-origin redirect rejected');
    throw new Error('redirect rejected unless exact allowlist contract is revised');
  }
  if (!response.ok) throw new Error(`HF request failed with status ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  if (body.length !== file.bytes || sha256(body) !== file.sha256) throw new Error('source hash/size mismatch');
  return body;
}

function validateCommittedRelease(repoRoot) {
  const pointerPath = path.join(repoRoot, 'config', 'sloshing-data-release.json');
  const pointer = JSON.parse(fs.readFileSync(pointerPath, 'utf8'));
  const dir = path.join(repoRoot, pointer.release.directory);
  if (path.basename(dir) !== pointer.release.digest) throw new Error('release directory/digest mismatch');
  const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, pointer.release.manifest), 'utf8'));
  const files = { 'manifest.json': `${stableJson(manifest)}\n` };
  for (const table of manifest.tables) files[table.file] = fs.readFileSync(path.join(dir, table.file), 'utf8');
  for (const asset of manifest.assets || []) files[asset.file] = fs.readFileSync(path.join(dir, asset.file));
  verifyRelease({ digest: pointer.release.digest, manifest, files });
  if (stableJson(pointer.release.tables) !== stableJson(manifest.tables)) throw new Error('pointer table index mismatch');
  if (stableJson(pointer.release.assets || []) !== stableJson(manifest.assets || [])) throw new Error('pointer asset index mismatch');
  return { pointer, manifest, digest: pointer.release.digest };
}

module.exports = {
  COLUMNS, SCHEMA_VERSION, TRANSFORMER_VERSION, sha256, stableJson,
  fetchPinnedFile, transformReviewed, transformPressureArtifacts, transformPressureEvidence, mergePressureRelease, mergePressureEvidence, buildRelease, verifyRelease,
  publishRelease, validateCommittedRelease,
};

if (require.main === module) {
  console.error('Use this module through the reviewed publication job; direct live publication requires an explicit source bundle.');
  process.exitCode = 2;
}
