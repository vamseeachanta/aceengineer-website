/**
 * Wall Thickness Calculator Engine
 *
 * Pure calculation functions for pipeline wall thickness design checks.
 * No DOM dependencies — suitable for unit testing and browser use.
 *
 * Exports:
 *   burstCheck, collapseCheck, minWallThickness, wallThicknessPipeline
 *
 * References:
 *   ASME B31.4 S403.2.1 — Barlow formula for internal pressure (burst)
 *   Timoshenko — Elastic collapse of thin-walled cylinder
 */

'use strict';

/**
 * Burst pressure check per ASME B31.4 Barlow formula.
 * P_burst = 2 * SMYS * t_eff * design_factor / D_outer
 * Utilisation = (P_internal - P_external) / P_burst
 *
 * @param {number} D_outer             Pipe outer diameter (m)
 * @param {number} t_wall              Nominal wall thickness (m)
 * @param {number} SMYS                Specified minimum yield strength (MPa)
 * @param {number} P_internal          Internal pressure (MPa)
 * @param {number} P_external          External pressure (MPa)
 * @param {number} corrosion_allowance Corrosion allowance (m)
 * @param {number} design_factor       Design factor (-)
 * @returns {object} { utilisation, is_passing, P_burst, delta_P, t_eff, details }
 */
function burstCheck(D_outer, t_wall, SMYS, P_internal, P_external, corrosion_allowance, design_factor) {
  var t_eff = t_wall - corrosion_allowance;
  if (t_eff <= 0) {
    return {
      utilisation: Infinity,
      is_passing: false,
      P_burst: 0,
      delta_P: P_internal - P_external,
      t_eff: t_eff,
      details: 'Zero effective thickness',
    };
  }

  var P_burst = 2 * SMYS * t_eff * design_factor / D_outer;
  var delta_P = P_internal - P_external;
  var utilisation = delta_P / P_burst;

  return {
    utilisation: utilisation,
    is_passing: utilisation <= 1.0,
    P_burst: P_burst,
    delta_P: delta_P,
    t_eff: t_eff,
    details: 'Burst utilisation: ' + (utilisation * 100).toFixed(1) + '%',
  };
}

/**
 * Elastic collapse check per Timoshenko formula.
 * P_collapse = 2 * E * (t / D)^3 / (1 - nu^2)
 * Utilisation = P_external / P_collapse
 *
 * @param {number} D_outer    Pipe outer diameter (m)
 * @param {number} t_wall     Wall thickness (m) — no corrosion deduction (conservative)
 * @param {number} P_external External pressure (MPa)
 * @param {number} [SMYS]     Not used directly but included for API consistency
 * @param {number} [E=207000] Young's modulus (MPa), defaults to steel
 * @param {number} [nu=0.3]   Poisson's ratio (-), defaults to steel
 * @returns {object} { utilisation, is_passing, P_collapse, details }
 */
function collapseCheck(D_outer, t_wall, P_external, SMYS, E, nu) {
  if (E === undefined || E === null) { E = 207000; }
  if (nu === undefined || nu === null) { nu = 0.3; }

  if (t_wall <= 0) {
    return {
      utilisation: Infinity,
      is_passing: false,
      P_collapse: 0,
      details: 'Zero wall thickness',
    };
  }

  var ratio = t_wall / D_outer;
  var P_collapse = 2 * E * Math.pow(ratio, 3) / (1 - nu * nu);
  var utilisation = P_external / P_collapse;

  return {
    utilisation: utilisation,
    is_passing: utilisation <= 1.0,
    P_collapse: P_collapse,
    details: 'Collapse utilisation: ' + (utilisation * 100).toFixed(1) + '%',
  };
}

/**
 * Minimum wall thickness for burst resistance.
 * Solves Barlow formula for t: t_min_net = delta_P * D / (2 * SMYS * df)
 * t_min = t_min_net + corrosion_allowance
 *
 * @param {number} D_outer             Pipe outer diameter (m)
 * @param {number} SMYS                Specified minimum yield strength (MPa)
 * @param {number} P_internal          Internal pressure (MPa)
 * @param {number} P_external          External pressure (MPa)
 * @param {number} corrosion_allowance Corrosion allowance (m)
 * @param {number} design_factor       Design factor (-)
 * @returns {object} { t_min, t_min_net, details }
 */
function minWallThickness(D_outer, SMYS, P_internal, P_external, corrosion_allowance, design_factor) {
  var delta_P = P_internal - P_external;

  if (delta_P <= 0) {
    return {
      t_min: corrosion_allowance,
      t_min_net: 0,
      details: 'No burst pressure differential',
    };
  }

  var t_min_net = delta_P * D_outer / (2 * SMYS * design_factor);
  var t_min = t_min_net + corrosion_allowance;

  return {
    t_min: t_min,
    t_min_net: t_min_net,
    details: 'Min wall: ' + (t_min * 1000).toFixed(1) + ' mm',
  };
}

/**
 * Convenience pipeline function accepting a params object.
 * Runs burst check, collapse check, and minimum wall thickness calculation.
 *
 * @param {object} params
 * @param {number} params.D_outer             Pipe outer diameter (m)
 * @param {number} params.t_wall              Nominal wall thickness (m)
 * @param {number} params.SMYS                Specified minimum yield strength (MPa)
 * @param {number} params.P_internal          Internal pressure (MPa)
 * @param {number} params.P_external          External pressure (MPa)
 * @param {number} params.corrosion_allowance Corrosion allowance (m)
 * @param {number} params.design_factor       Design factor (-)
 * @param {number} [params.E]                 Young's modulus (MPa)
 * @param {number} [params.nu]                Poisson's ratio (-)
 * @returns {object} { burst, collapse, minWall }
 */
function wallThicknessPipeline(params) {
  var burst = burstCheck(
    params.D_outer, params.t_wall, params.SMYS,
    params.P_internal, params.P_external,
    params.corrosion_allowance, params.design_factor
  );

  var collapse = collapseCheck(
    params.D_outer, params.t_wall, params.P_external,
    params.SMYS, params.E, params.nu
  );

  var minWall = minWallThickness(
    params.D_outer, params.SMYS,
    params.P_internal, params.P_external,
    params.corrosion_allowance, params.design_factor
  );

  return {
    burst: burst,
    collapse: collapse,
    minWall: minWall,
  };
}

// CommonJS export for Node.js/Jest; also exposed as browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    burstCheck,
    collapseCheck,
    minWallThickness,
    wallThicknessPipeline,
  };
}
