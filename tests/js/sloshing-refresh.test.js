const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const refresh = require('../../scripts/refresh-sloshing-data');

const REVISION = '183170d1655867cca267f700f41f229ed3399769';

function sourceFixture() {
  return {
    convergenceRows: [
      ['mesh', 40, 1600, 0.002, 0.755580, 0.3264],
      ['mesh', 60, 3600, 0.002, 0.755651, 0.3170],
      ['mesh', 80, 6400, 0.002, 0.755701, 0.3104],
      ['mesh', 120, 14400, 0.002, 0.755763, 0.3022],
      ['mesh', 160, 25600, 0.002, 0.755807, 0.2964],
      ['dt', 80, 6400, 0.004, 0.755702, 0.3103],
      ['dt', 80, 6400, 0.001, 0.755717, 0.3083],
    ].map(([tag, cells_per_breadth, cells, dt, freq_meas_hz, rel_error_pct]) => ({
      tag, cells_per_breadth, cells, dt, status: 'completed',
      freq_meas_hz, freq_analytical_hz: 0.758054, rel_error_pct,
    })),
    periodRows: [16, 18, 20, 22, 24, 26].map((period, i) => ({
      period_s: period,
      mesh: 'medium',
      status: 'completed',
      cycles: 10,
      level_difference_amplitude_m: 0.95 + i * 0.025,
      exchange_amplitude_m3: 114 + i * 3,
      roll_moment_amplitude_Nm: 7.4e6 + i * 4e5,
      exchange_cycle_change_pct: 0.1,
      moment_cycle_change_pct: 0.2,
      volume_drift_pct: -0.002,
      max_courant: 0.4,
      cycle_converged: true,
    })),
    fine: {
      period_s: 24, mesh: 'fine', status: 'completed', cycles: 10,
      level_difference_amplitude_m: 1.11, exchange_amplitude_m3: 133.4,
      roll_moment_amplitude_Nm: 9.81e6, exchange_cycle_change_pct: 0.01,
      moment_cycle_change_pct: 0.04, volume_drift_pct: -0.0014,
      max_courant: 0.549, cycle_converged: true,
    },
    mesh: {
      period_s: 24, medium_cells: 20480, fine_cells: 69120,
      exchange_change_pct: 0.784, roll_moment_change_pct: 1.46,
      medium_cycle_converged: true, fine_cycle_converged: true,
    },
  };
}

describe('private source contract', () => {
  test('requires a token before issuing a request', async () => {
    const fetchImpl = jest.fn();
    await expect(refresh.fetchPinnedFile({
      dataset: 'aceengineer/digitalmodel-sloshing', revision: REVISION,
      file: { path: 'review/fine_T24.json', sha256: '0'.repeat(64), bytes: 1 },
      token: '', fetchImpl,
    })).rejects.toThrow(/HF_TOKEN/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  test('uses manual redirects and never follows a cross-origin location', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      status: 302, ok: false,
      headers: { get: () => 'https://cdn.example.invalid/private' },
    });
    await expect(refresh.fetchPinnedFile({
      dataset: 'aceengineer/digitalmodel-sloshing', revision: REVISION,
      file: { path: 'review/fine_T24.json', sha256: '0'.repeat(64), bytes: 1 },
      token: 'secret-canary', fetchImpl,
    })).rejects.toThrow(/cross-origin/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][1].redirect).toBe('manual');
    expect(fetchImpl.mock.calls[0][0]).not.toContain('secret-canary');
  });
});

describe('closed deterministic public release', () => {
  test('produces opaque IDs, closed columns, finite values, and no private aliases', () => {
    const out = refresh.transformReviewed(sourceFixture(), { revision: REVISION });
    expect(out.cases).toHaveLength(14);
    expect(out.cases.map(r => r.case_id)).toEqual([
      'decay-dt-0p001', 'decay-dt-0p004', 'decay-mesh-cpb120',
      'decay-mesh-cpb160', 'decay-mesh-cpb40', 'decay-mesh-cpb60',
      'decay-mesh-cpb80', 'forced-fine-t24',
      'forced-medium-t16', 'forced-medium-t18', 'forced-medium-t20',
      'forced-medium-t22', 'forced-medium-t24', 'forced-medium-t26',
    ]);
    const serialized = JSON.stringify(out).toLowerCase();
    expect(serialized).not.toMatch(/anti.?roll|source.?id|secret-canary|withheld/);
    for (const rows of Object.values(out)) {
      for (const row of rows) for (const value of Object.values(row)) {
        if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
      }
    }
  });

  test('rejects unknown source keys and withheld/HTML canaries recursively', () => {
    const bad = sourceFixture();
    bad.fine.anti_roll_phase = '<script>secret-canary</script>';
    expect(() => refresh.transformReviewed(bad, { revision: REVISION }))
      .toThrow(/unknown|forbidden/i);
  });

  test('canonical output and digest are independent of source row order', () => {
    const a = refresh.buildRelease(refresh.transformReviewed(sourceFixture(), { revision: REVISION }));
    const shuffled = sourceFixture();
    shuffled.periodRows.reverse();
    const b = refresh.buildRelease(refresh.transformReviewed(shuffled, { revision: REVISION }));
    expect(b.digest).toBe(a.digest);
    expect(b.files).toEqual(a.files);
    expect(refresh.verifyRelease(a)).toBe(true);
  });

  test('manifest or CSV mutation breaks the non-self-referential trust loop', () => {
    const release = refresh.buildRelease(refresh.transformReviewed(sourceFixture(), { revision: REVISION }));
    const changed = structuredClone(release);
    changed.files['metrics.csv'] += 'tamper\n';
    expect(() => refresh.verifyRelease(changed)).toThrow(/hash|bytes|digest/);
    const changedManifest = structuredClone(release);
    changedManifest.manifest.tables[0].rows += 1;
    expect(() => refresh.verifyRelease(changedManifest)).toThrow(/digest|manifest/);
  });
});

describe('sanitized pressure and aggregate-load publication', () => {
  function pressureFixture() {
    const probeIds = [
      'L_outer_z10', 'L_outer_z30', 'L_outer_z50', 'L_outer_z70', 'L_outer_z90',
      'L_inner_z10', 'L_inner_z30', 'L_inner_z50', 'L_inner_z70', 'L_inner_z90',
      'R_inner_z10', 'R_inner_z30', 'R_inner_z50', 'R_inner_z70', 'R_inner_z90',
      'R_outer_z10', 'R_outer_z30', 'R_outer_z50', 'R_outer_z70', 'R_outer_z90',
    ];
    const pressureRows = [];
    const loadRows = [];
    for (let i = 0; i < 32; i++) {
      const time_s = (i + 1) * 0.05;
      for (const probe_id of probeIds) pressureRows.push({
        time_s, probe_id, z_over_height: Number(probe_id.slice(-2)) / 100,
        pressure_Pa: 1000 + i, water_fraction: 0.5,
      });
      loadRows.push({ time_s, force_x_N: i, force_y_N: i + 1, force_z_N: i + 2,
        moment_x_Nm: i + 3, moment_y_Nm: i + 4, moment_z_Nm: i + 5 });
    }
    return { pressureRows, loadRows, qa: {
      period_s: 24, mesh: 'fine_Co035_pressure', status: 'completed', cycles: 10,
      end_time_s: 240, exchange_amplitude_m3: 133.2,
      level_difference_amplitude_m: 1.11, exchange_cycle_change_pct: 0.14,
      exchange_residual_fraction: 0.02, roll_moment_amplitude_Nm: 9.79e6,
      moment_cycle_change_pct: 0.04, moment_residual_fraction: 0.013,
      volume_drift_pct: -0.0017, alpha_min: -0.0000026, alpha_max: 1.00000004,
      max_courant: 0.47841479, cycle_converged: true, configured_maxCo: 0.35,
      configured_maxAlphaCo: 0.35, pressure_probe_count: 20,
      pressure_sample_rows: 640, aggregate_load_rows: 32,
      sectional_load_status: 'not_extracted_single_aggregate_wall_patch',
    } };
  }

  test('maps reviewed probe IDs to public enums and deterministically bounds samples', () => {
    const out = refresh.transformPressureArtifacts(pressureFixture(), { revision: REVISION, stride: 16 });
    expect(out.caseRow.case_id).toBe('forced-fine-co035-pressure-t24');
    expect(out.series).toHaveLength(26);
    expect(out.samples).toHaveLength(26 * 3); // first, stride point, final
    expect(out.series.every(s => !/[LR]_(?:inner|outer)_z/.test(JSON.stringify(s)))).toBe(true);
    expect(out.samples.filter(s => s.series_id === 'pressure-left-outer-h10').map(s => Number(s.x.toFixed(2))))
      .toEqual([0.05, 0.85, 1.6]);
  });

  test('preserves configured Courant exceedance as a public QA warning', () => {
    const out = refresh.transformPressureArtifacts(pressureFixture(), { revision: REVISION, stride: 16 });
    const courant = out.metrics.find(m => m.quantity === 'max_courant');
    expect(courant.value).toBe(0.47841479);
    expect(courant.qa_status).toBe('configured_limit_exceeded');
  });

  test('fails closed on an unknown probe or source column', () => {
    const unknownProbe = pressureFixture();
    unknownProbe.pressureRows[0].probe_id = 'private_probe_01';
    expect(() => refresh.transformPressureArtifacts(unknownProbe, { revision: REVISION }))
      .toThrow(/probe/i);
    const unknownColumn = pressureFixture();
    unknownColumn.loadRows[0].private_path = '/home/secret';
    expect(() => refresh.transformPressureArtifacts(unknownColumn, { revision: REVISION }))
      .toThrow(/unknown|forbidden/i);
  });
});

describe('closed analysis evidence and preview assets', () => {
  const evidence = {
    input: {
      evidence_type: 'forced_roll_cfd_follow_on', solver_family: 'incompressible_two_phase_vof',
      solver_version: 'OpenFOAM_2312_patch_260127', simulation_dimensionality: 'three_dimensional',
      forcing_period_s: 24, forcing_amplitude_deg: 5, simulated_cycles: 10, end_time_s: 240,
      initial_fill_fraction: 0.5, liquid_density_kg_m3: 1025,
      liquid_kinematic_viscosity_m2_s: 1e-6, gas_density_kg_m3: 1.225,
      gas_kinematic_viscosity_m2_s: 1.48e-5, surface_tension_N_m: 0.07,
      gravity_m_s2: 9.81, mesh_cells: 69120, time_integration: 'adaptive_first_order_euler',
      configured_max_courant: 0.35, configured_max_interface_courant: 0.35,
      maximum_timestep_s: 0.02, pressure_probe_count: 20,
      pressure_and_load_output_interval_s: 0.05, qa_output_interval_s: 0.1,
      geometry_disclosure: 'normalized_coordinates_only',
      sectional_load_extraction: 'not_available_single_aggregate_wall_patch',
    },
    mesh: {
      mesh_cells: 69120, mesh_points: 76975, mesh_regions: 1, mesh_check: 'passed',
      evaluated_state: 'final_deformed_mesh', max_aspect_ratio: 14.705896,
      max_non_orthogonality_deg: 0, average_non_orthogonality_deg: 0,
      max_skewness: 3.9128547e-12, minimum_cell_determinant: 0.0010890681,
      minimum_face_interpolation_weight: 0.29694324, minimum_face_volume_ratio: 0.42236026,
      minimum_cell_volume_m3: 0.015740731, maximum_cell_volume_m3: 0.037268565,
      total_domain_volume_m3: 2427.2, sectional_face_zones_available: false,
    },
    audit: {
      completion_marker: true, end_time_s: 240, observed_max_courant: 0.47841479,
      observed_max_courant_time_s: 17.45, courant_median: 0.33655049, courant_p95: 0.40386495,
      courant_target_exceeded: true, courant_steps_above_0p35: 4951, courant_step_count: 17969,
      pressure_probe_count: 20, pressure_times_per_probe: 4800, pressure_row_count: 96000,
      aggregate_load_row_count: 4800, output_interval_s: 0.05, all_reduced_values_finite: true,
      exchange_cycle_change_pct: 0.1370551929826666, moment_cycle_change_pct: 0.040569367604101784,
      declared_exchange_limit_pct: 2, declared_moment_limit_pct: 5, cycle_converged: true,
      exchange_change_from_prior_fine_pct: -0.18415530393379165,
      roll_moment_change_from_prior_fine_pct: -0.23775862656881933,
      max_courant_change_from_prior_fine_pct: -12.842116681085958,
      qa_label: 'publishable_follow_on_courant_target_exceeded',
      recommendation: 'publish_with_explicit_courant_caveat',
    },
  };

  test('publishes only closed reproducibility and mesh/QA fields with required caveat', () => {
    const out = refresh.transformPressureEvidence(evidence);
    expect(out.inputs).toHaveLength(1);
    expect(out.mesh_quality[0].mesh_check).toBe('passed');
    expect(out.qa_audit[0]).toMatchObject({ configured_max_courant: 0.35,
      observed_max_courant: 0.47841479, completion_marker: true, cycle_converged: true,
      qa_status: 'publish_with_courant_caveat' });
    expect(Math.max(Math.abs(out.qa_audit[0].exchange_change_from_prior_fine_pct),
      Math.abs(out.qa_audit[0].roll_moment_change_from_prior_fine_pct))).toBeLessThanOrEqual(0.24);
  });

  test('binary preview bytes participate in the release trust loop', () => {
    const base = refresh.transformReviewed(sourceFixture(), { revision: REVISION });
    const preview = Buffer.from('safe-preview');
    base.previews = [{ preview_id: 'alpha-final', case_id: 'forced-fine-t24',
      media_type: 'image/png', relative_path: 'alpha_snapshot_t240.png',
      sha256: refresh.sha256(preview), bytes: preview.length, status: 'published',
      alt_text: 'Normalized liquid fraction at the final simulation time.' }];
    const release = refresh.buildRelease(base, { assets: { 'alpha_snapshot_t240.png': preview } });
    expect(refresh.verifyRelease(release)).toBe(true);
    const changed = structuredClone(release);
    changed.files['alpha_snapshot_t240.png'] = Buffer.from('tampered');
    expect(() => refresh.verifyRelease(changed)).toThrow(/asset hash|bytes/);
  });
});

describe('transactional publication', () => {
  let root;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sloshing-release-')); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });

  test('publishes an immutable digest directory and an agreeing pointer', () => {
    const release = refresh.buildRelease(refresh.transformReviewed(sourceFixture(), { revision: REVISION }));
    const pointerPath = path.join(root, 'config', 'release.json');
    const published = refresh.publishRelease(release, { root, pointerPath, source: {
      dataset: 'aceengineer/digitalmodel-sloshing', revision: REVISION, files: [],
    } });
    const pointer = JSON.parse(fs.readFileSync(pointerPath, 'utf8'));
    expect(pointer.release.digest).toBe(release.digest);
    expect(path.basename(pointer.release.directory)).toBe(release.digest);
    expect(fs.existsSync(path.join(root, pointer.release.manifest))).toBe(true);
    expect(published.digest).toBe(release.digest);
  });

  test('failed pointer replacement preserves prior pointer bytes', () => {
    const pointerPath = path.join(root, 'config', 'release.json');
    fs.mkdirSync(path.dirname(pointerPath), { recursive: true });
    fs.writeFileSync(pointerPath, '{"old":true}\n');
    const before = fs.readFileSync(pointerPath);
    const release = refresh.buildRelease(refresh.transformReviewed(sourceFixture(), { revision: REVISION }));
    expect(() => refresh.publishRelease(release, {
      root, pointerPath, source: { dataset: 'x/y', revision: REVISION, files: [] },
      beforePointerRename: () => { throw new Error('interrupted'); },
    })).toThrow('interrupted');
    expect(fs.readFileSync(pointerPath).equals(before)).toBe(true);
  });
});

describe('committed pressure release', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');

  test('pins the uploaded pressure artifacts at the exact immutable revision', () => {
    const pointer = JSON.parse(fs.readFileSync(path.join(repoRoot, 'config', 'sloshing-data-release.json')));
    expect(pointer.source.revision).toBe('d9ff6967021755156c3daa35f93e6385f672b257');
    expect(pointer.source.files.filter(f => f.path.startsWith('review/fine_T24_Co035_pressure/')))
      .toHaveLength(9);
    expect(pointer.source.files.every(f => /^[0-9a-f]{64}$/.test(f.sha256) && f.bytes > 0)).toBe(true);
  });

  test('passes the complete pointer/manifest/table trust loop and retains Courant warning', () => {
    const validated = refresh.validateCommittedRelease(repoRoot);
    expect(validated.manifest.counts).toMatchObject({ cases: 15, inputs: 1, mesh_quality: 1,
      qa_audit: 1, series: 26, samples: 7826, previews: 10 });
    expect(validated.manifest.assets).toHaveLength(10);
    const metrics = fs.readFileSync(path.join(repoRoot, validated.pointer.release.directory, 'metrics.csv'), 'utf8');
    expect(metrics).toContain('forced-fine-co035-pressure-t24,max_courant,0.47841479,dimensionless,maximum,configured_limit_exceeded');
  });
});

describe('committed report enrichment release', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');

  test('pins representative videos and derived tables at the reviewed HF revision', () => {
    const pointer = JSON.parse(fs.readFileSync(path.join(repoRoot, 'config', 'sloshing-data-release.json')));
    expect(pointer.source.revision).toBe('d9ff6967021755156c3daa35f93e6385f672b257');
    expect(pointer.source.files.filter(f => f.path.startsWith('review/representative_videos/'))).toHaveLength(9);
    expect(pointer.source.files.filter(f => f.path.startsWith('review/report_enrichment/'))).toHaveLength(3);
  });

  test('publishes bounded envelopes, derived metrics, and ten hash-covered media assets', () => {
    const validated = refresh.validateCommittedRelease(repoRoot);
    expect(validated.manifest.counts).toMatchObject({ derived_metrics: 77, pressure_envelopes: 60, previews: 10 });
    expect(validated.manifest.assets).toHaveLength(10);
    const directory = path.join(repoRoot, validated.pointer.release.directory);
    const envelopes = fs.readFileSync(path.join(directory, 'pressure_envelopes.csv'), 'utf8');
    expect(envelopes).toContain('harmonic_amplitude_Pa');
    expect(envelopes).toContain('pressure-left-inner-h10');
    expect(validated.manifest.assets.filter(a => a.file.endsWith('.mp4'))).toHaveLength(4);
  });
});
