/**
 * TDD tests for Wall Thickness Calculator engine.
 *
 * These tests verify:
 *   - Burst check per ASME B31.4 S403.2.1 (Barlow formula)
 *   - Collapse check per elastic collapse (Timoshenko formula)
 *   - Minimum wall thickness calculation (Barlow inverse)
 *   - Pipeline convenience function (wallThicknessPipeline)
 *   - Edge cases: zero effective thickness, zero wall, no pressure differential
 *
 * @jest-environment node
 */

const {
  burstCheck,
  collapseCheck,
  minWallThickness,
  wallThicknessPipeline,
} = require('../../assets/js/wall-thickness-engine');

// -------------------------------------------------------------------
// burstCheck
// -------------------------------------------------------------------
describe('burstCheck', () => {
  test('manifest defaults return utilisation ~0.515, is_passing=true', () => {
    // D=0.3238, t=0.0127, SMYS=450, Pi=15, Pe=5, ca=0.003, df=0.72
    // t_eff = 0.0127 - 0.003 = 0.0097
    // P_burst = 2 * 450 * 0.0097 * 0.72 / 0.3238 = 19.42 MPa
    // delta_P = 15 - 5 = 10 MPa
    // utilisation = 10 / 19.42 = 0.515
    const result = burstCheck(0.3238, 0.0127, 450, 15, 5, 0.003, 0.72);
    expect(result.utilisation).toBeCloseTo(0.515, 2);
    expect(result.is_passing).toBe(true);
    expect(result.details).toContain('Burst utilisation');
    expect(result.P_burst).toBeCloseTo(19.42, 1);
    expect(result.delta_P).toBeCloseTo(10, 1);
    expect(result.t_eff).toBeCloseTo(0.0097, 4);
  });

  test('corrosion_allowance >= t_wall returns Infinity utilisation', () => {
    // ca=0.015 >= t=0.0127 => t_eff <= 0
    const result = burstCheck(0.3238, 0.0127, 450, 15, 5, 0.015, 0.72);
    expect(result.utilisation).toBe(Infinity);
    expect(result.is_passing).toBe(false);
    expect(result.details).toContain('Zero effective thickness');
  });

  test('P_internal < P_external returns negative utilisation (no burst risk)', () => {
    // Pi=3, Pe=5 => delta_P = -2 => negative utilisation
    const result = burstCheck(0.3238, 0.0127, 450, 3, 5, 0.003, 0.72);
    expect(result.utilisation).toBeLessThan(0);
    expect(result.is_passing).toBe(true);
  });
});

// -------------------------------------------------------------------
// collapseCheck
// -------------------------------------------------------------------
describe('collapseCheck', () => {
  test('manifest defaults return finite utilisation', () => {
    // D=0.3238, t=0.0127, Pe=5, SMYS=450, E=207000, nu=0.3
    // P_collapse = 2 * 207000 * (0.0127/0.3238)^3 / (1 - 0.09) = 2 * 207000 * 6.026e-5 / 0.91
    // = 414000 * 6.026e-5 / 0.91 = 24.95 / 0.91 = 27.41 MPa
    // utilisation = 5 / 27.41 = 0.182
    const result = collapseCheck(0.3238, 0.0127, 5);
    expect(result.utilisation).toBeCloseTo(0.182, 1);
    expect(result.is_passing).toBe(true);
    expect(result.P_collapse).toBeGreaterThan(0);
    expect(result.details).toContain('Collapse utilisation');
  });

  test('zero wall thickness returns Infinity utilisation', () => {
    const result = collapseCheck(0.3238, 0, 5);
    expect(result.utilisation).toBe(Infinity);
    expect(result.is_passing).toBe(false);
    expect(result.details).toContain('Zero wall thickness');
  });
});

// -------------------------------------------------------------------
// minWallThickness
// -------------------------------------------------------------------
describe('minWallThickness', () => {
  test('manifest defaults return minimum wall thickness', () => {
    // D=0.3238, SMYS=450, Pi=15, Pe=5, ca=0.003, df=0.72
    // delta_P = 10
    // t_min_net = 10 * 0.3238 / (2 * 450 * 0.72) = 3.238 / 648 = 0.004997
    // t_min = 0.004997 + 0.003 = 0.007997
    const result = minWallThickness(0.3238, 450, 15, 5, 0.003, 0.72);
    expect(result.t_min).toBeCloseTo(0.008, 3);
    expect(result.t_min_net).toBeCloseTo(0.005, 3);
    expect(result.details).toContain('Min wall');
  });

  test('no pressure differential returns corrosion allowance only', () => {
    // Pi=5, Pe=5 => delta_P = 0
    const result = minWallThickness(0.3238, 450, 5, 5, 0.003, 0.72);
    expect(result.t_min).toBeCloseTo(0.003, 4);
    expect(result.details).toContain('No burst pressure differential');
  });
});

// -------------------------------------------------------------------
// wallThicknessPipeline (convenience function)
// -------------------------------------------------------------------
describe('wallThicknessPipeline', () => {
  test('accepts params object and returns combined burst/collapse/minwall result', () => {
    const params = {
      D_outer: 0.3238,
      t_wall: 0.0127,
      SMYS: 450,
      P_internal: 15,
      P_external: 5,
      corrosion_allowance: 0.003,
      design_factor: 0.72,
    };
    const result = wallThicknessPipeline(params);

    // Should have burst, collapse, and minWall sub-results
    expect(result).toHaveProperty('burst');
    expect(result).toHaveProperty('collapse');
    expect(result).toHaveProperty('minWall');

    // Burst check should pass
    expect(result.burst.is_passing).toBe(true);
    expect(result.burst.utilisation).toBeCloseTo(0.515, 2);

    // Collapse check should pass
    expect(result.collapse.is_passing).toBe(true);

    // Min wall should be less than actual wall
    expect(result.minWall.t_min).toBeLessThan(params.t_wall);
  });
});
