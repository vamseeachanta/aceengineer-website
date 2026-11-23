/**
 * TDD tests for On-Bottom Stability Calculator engine.
 *
 * These tests verify:
 *   - Hydrodynamic force per DNV-RP-F109 Eq 3.1 (drag + inertia)
 *   - Lift force per DNV-RP-F109 Eq 3.2
 *   - Submerged weight per meter (steel + coating + contents - buoyancy)
 *   - Absolute stability check per DNV-RP-F109 Eq 4.1
 *   - Pipeline convenience function (obsPipeline)
 *   - Edge cases: zero velocity, zero weight, negative submerged weight
 *
 * @jest-environment node
 */

const {
  hydrodynamicForcePerMeter,
  liftForcePerMeter,
  submergedWeightPerMeter,
  absoluteStabilityCheck,
  obsPipeline,
} = require('../../assets/js/obs-calculator-engine');

// -------------------------------------------------------------------
// hydrodynamicForcePerMeter
// -------------------------------------------------------------------
describe('hydrodynamicForcePerMeter', () => {
  test('manifest defaults return expected drag + inertia value', () => {
    // rho_w=1025, D=0.3238, U=0.5, a=0.3, C_D=0.9, C_M=3.29
    // drag = 0.5 * 1025 * 0.3238 * 0.9 * 0.5 * |0.5| = 0.5 * 1025 * 0.3238 * 0.9 * 0.25 = 37.37
    // inertia = (pi/4) * 1025 * 0.3238^2 * 3.29 * 0.3 = 0.7854 * 1025 * 0.10485 * 3.29 * 0.3 = 83.67
    // total = ~121.04
    const result = hydrodynamicForcePerMeter(1025, 0.3238, 0.5, 0.3, 0.9, 3.29);
    expect(result).toBeCloseTo(37.37 + 83.67, 0);
  });

  test('zero velocity and zero acceleration returns 0', () => {
    const result = hydrodynamicForcePerMeter(1025, 0.3238, 0, 0, 0.9, 3.29);
    expect(result).toBe(0);
  });

  test('negative velocity produces correct sign for drag component', () => {
    // drag = 0.5 * rho * D * C_D * U * |U| — when U is negative, drag is negative
    // inertia remains positive if a > 0
    const pos = hydrodynamicForcePerMeter(1025, 0.3238, 0.5, 0.3, 0.9, 3.29);
    const neg = hydrodynamicForcePerMeter(1025, 0.3238, -0.5, 0.3, 0.9, 3.29);
    // Drag component should flip sign, inertia stays same
    // So neg should differ from pos by 2x the drag component
    expect(neg).not.toBeCloseTo(pos, 0);
  });
});

// -------------------------------------------------------------------
// liftForcePerMeter
// -------------------------------------------------------------------
describe('liftForcePerMeter', () => {
  test('manifest defaults return expected lift force', () => {
    // rho_w=1025, D=0.3238, U=0.5, C_L=0.9
    // F_L = 0.5 * 1025 * 0.3238 * 0.9 * 0.5^2 = 0.5 * 1025 * 0.3238 * 0.9 * 0.25 = 37.37
    const result = liftForcePerMeter(1025, 0.3238, 0.5, 0.9);
    expect(result).toBeCloseTo(37.37, 0);
  });

  test('zero velocity returns 0', () => {
    const result = liftForcePerMeter(1025, 0.3238, 0, 0.9);
    expect(result).toBe(0);
  });
});

// -------------------------------------------------------------------
// submergedWeightPerMeter
// -------------------------------------------------------------------
describe('submergedWeightPerMeter', () => {
  test('manifest defaults return positive submerged weight (pipe sinks)', () => {
    // D_outer=0.3238, t_wall=0.0127, rho_steel=7850, rho_coat=900, t_coat=0.003,
    // rho_contents=800, rho_w=1025
    const W_s = submergedWeightPerMeter(0.3238, 0.0127, 7850, 900, 0.003, 800, 1025);
    expect(W_s).toBeGreaterThan(0);
  });

  test('very light contents with large coating returns negative (pipe floats)', () => {
    // Light pipe: thin wall, thick lightweight coating, gas contents (rho=1.2), in water
    // D_outer=0.3238, t_wall=0.002, rho_steel=7850, rho_coat=300, t_coat=0.1,
    // rho_contents=1.2, rho_w=1025
    const W_s = submergedWeightPerMeter(0.3238, 0.002, 7850, 300, 0.1, 1.2, 1025);
    expect(W_s).toBeLessThan(0);
  });
});

// -------------------------------------------------------------------
// absoluteStabilityCheck
// -------------------------------------------------------------------
describe('absoluteStabilityCheck', () => {
  test('stable pipe: W_s=500, F_H=100, F_L=50, mu=0.6 returns utilisation=0.370, is_stable=true', () => {
    // resistance = 0.6 * (500 - 50) = 270
    // utilisation = 100 / 270 = 0.3704
    const result = absoluteStabilityCheck(500, 100, 50, 0.6);
    expect(result.utilisation).toBeCloseTo(0.370, 2);
    expect(result.is_stable).toBe(true);
    expect(result.details).toContain('37.0');
  });

  test('zero submerged weight returns Infinity utilisation, is_stable=false', () => {
    const result = absoluteStabilityCheck(0, 100, 50, 0.6);
    expect(result.utilisation).toBe(Infinity);
    expect(result.is_stable).toBe(false);
    expect(result.details).toContain('Negative/zero');
  });

  test('submerged weight less than lift force returns Infinity, is_stable=false', () => {
    // W_s=40, F_L=50, mu=0.6 => resistance = 0.6 * (40 - 50) = -6 <= 0
    const result = absoluteStabilityCheck(40, 100, 50, 0.6);
    expect(result.utilisation).toBe(Infinity);
    expect(result.is_stable).toBe(false);
    expect(result.details).toContain('Insufficient');
  });
});

// -------------------------------------------------------------------
// obsPipeline (convenience function)
// -------------------------------------------------------------------
describe('obsPipeline', () => {
  test('accepts all 13 manifest inputs and returns full result', () => {
    const params = {
      rho_w: 1025,
      D_outer: 0.3238,
      t_wall: 0.0127,
      rho_steel: 7850,
      rho_coat: 900,
      t_coat: 0.003,
      rho_contents: 800,
      U: 0.5,
      a: 0.3,
      C_D: 0.9,
      C_M: 3.29,
      C_L: 0.9,
      mu: 0.6,
    };
    const result = obsPipeline(params);

    // Result should have all expected fields
    expect(result).toHaveProperty('utilisation');
    expect(result).toHaveProperty('is_stable');
    expect(result).toHaveProperty('details');
    expect(result).toHaveProperty('F_H');
    expect(result).toHaveProperty('F_L');
    expect(result).toHaveProperty('W_s');

    // F_H, F_L should be positive numbers
    expect(result.F_H).toBeGreaterThan(0);
    expect(result.F_L).toBeGreaterThan(0);
    // W_s should be positive (pipe sinks with these defaults)
    expect(result.W_s).toBeGreaterThan(0);
    // Utilisation should be a finite number for these inputs
    expect(isFinite(result.utilisation)).toBe(true);
    expect(typeof result.is_stable).toBe('boolean');
  });
});
