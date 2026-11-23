/**
 * On-Bottom Stability Calculator Engine
 *
 * Pure calculation functions for subsea pipeline on-bottom stability
 * per DNV-RP-F109 (absolute stability method).
 * No DOM dependencies — suitable for unit testing and browser use.
 *
 * Exports:
 *   hydrodynamicForcePerMeter, liftForcePerMeter, submergedWeightPerMeter,
 *   absoluteStabilityCheck, obsPipeline
 *
 * References:
 *   DNV-RP-F109 — On-Bottom Stability Design of Submarine Pipelines
 *   Eq 3.1: Hydrodynamic force (drag + inertia)
 *   Eq 3.2: Lift force
 *   Eq 4.1: Absolute stability criterion
 */

'use strict';

/**
 * Hydrodynamic (inline) force per unit length.
 * F_H = 0.5 * rho_w * D * C_D * U * |U| + (pi/4) * rho_w * D^2 * C_M * a
 *
 * @param {number} rho_w  Seawater density (kg/m^3)
 * @param {number} D      Outer diameter including coating (m)
 * @param {number} U      Near-seabed flow velocity (m/s)
 * @param {number} a      Near-seabed flow acceleration (m/s^2)
 * @param {number} C_D    Drag coefficient (-)
 * @param {number} C_M    Inertia coefficient (-)
 * @returns {number} Hydrodynamic force per meter (N/m)
 */
function hydrodynamicForcePerMeter(rho_w, D, U, a, C_D, C_M) {
  var drag = 0.5 * rho_w * D * C_D * U * Math.abs(U);
  var inertia = (Math.PI / 4) * rho_w * D * D * C_M * a;
  return drag + inertia;
}

/**
 * Lift force per unit length.
 * F_L = 0.5 * rho_w * D * C_L * U^2
 *
 * @param {number} rho_w  Seawater density (kg/m^3)
 * @param {number} D      Outer diameter including coating (m)
 * @param {number} U      Near-seabed flow velocity (m/s)
 * @param {number} C_L    Lift coefficient (-)
 * @returns {number} Lift force per meter (N/m)
 */
function liftForcePerMeter(rho_w, D, U, C_L) {
  return 0.5 * rho_w * D * C_L * U * U;
}

/**
 * Submerged weight per unit length.
 * Accounts for steel pipe, coating, contents, and displaced seawater.
 *
 * @param {number} D_outer       Pipe outer diameter (m)
 * @param {number} t_wall        Pipe wall thickness (m)
 * @param {number} rho_steel     Steel density (kg/m^3)
 * @param {number} rho_coat      Coating density (kg/m^3)
 * @param {number} t_coat        Coating thickness (m)
 * @param {number} rho_contents  Contents density (kg/m^3)
 * @param {number} rho_w         Seawater density (kg/m^3)
 * @returns {number} Submerged weight per meter (N/m), positive = sinks
 */
function submergedWeightPerMeter(D_outer, t_wall, rho_steel, rho_coat, t_coat, rho_contents, rho_w) {
  var D_inner = D_outer - 2 * t_wall;
  var A_steel = (Math.PI / 4) * (D_outer * D_outer - D_inner * D_inner);
  var D_coated = D_outer + 2 * t_coat;
  var A_coat = (Math.PI / 4) * (D_coated * D_coated - D_outer * D_outer);
  var A_contents = (Math.PI / 4) * D_inner * D_inner;
  var A_displaced = (Math.PI / 4) * D_coated * D_coated;

  var W_dry = (A_steel * rho_steel + A_coat * rho_coat + A_contents * rho_contents) * 9.81;
  var buoyancy = A_displaced * rho_w * 9.81;
  return W_dry - buoyancy;
}

/**
 * Absolute stability check per DNV-RP-F109 Eq 4.1.
 * Criterion: F_H <= mu * (W_s - F_L)
 * Utilisation = F_H / (mu * (W_s - F_L))
 *
 * @param {number} W_s   Submerged weight per meter (N/m)
 * @param {number} F_H   Hydrodynamic force per meter (N/m)
 * @param {number} F_L   Lift force per meter (N/m)
 * @param {number} mu    Soil friction coefficient (-)
 * @returns {object} { utilisation, is_stable, details }
 */
function absoluteStabilityCheck(W_s, F_H, F_L, mu) {
  if (W_s <= 0) {
    return { utilisation: Infinity, is_stable: false, details: 'Negative/zero submerged weight' };
  }
  var resistance = mu * (W_s - F_L);
  if (resistance <= 0) {
    return { utilisation: Infinity, is_stable: false, details: 'Insufficient weight for stability' };
  }
  var utilisation = F_H / resistance;
  return {
    utilisation: utilisation,
    is_stable: utilisation <= 1.0,
    details: 'Utilisation: ' + (utilisation * 100).toFixed(1) + '%',
  };
}

/**
 * Convenience pipeline function accepting all 13 manifest inputs.
 * Computes intermediate forces and returns full stability result.
 *
 * @param {object} params
 * @param {number} params.rho_w         Seawater density (kg/m^3)
 * @param {number} params.D_outer       Pipe outer diameter (m)
 * @param {number} params.t_wall        Pipe wall thickness (m)
 * @param {number} params.rho_steel     Steel density (kg/m^3)
 * @param {number} params.rho_coat      Coating density (kg/m^3)
 * @param {number} params.t_coat        Coating thickness (m)
 * @param {number} params.rho_contents  Contents density (kg/m^3)
 * @param {number} params.U             Flow velocity (m/s)
 * @param {number} params.a             Flow acceleration (m/s^2)
 * @param {number} params.C_D           Drag coefficient (-)
 * @param {number} params.C_M           Inertia coefficient (-)
 * @param {number} params.C_L           Lift coefficient (-)
 * @param {number} params.mu            Soil friction coefficient (-)
 * @returns {object} { utilisation, is_stable, details, F_H, F_L, W_s }
 */
function obsPipeline(params) {
  var F_H = hydrodynamicForcePerMeter(
    params.rho_w, params.D_outer, params.U, params.a, params.C_D, params.C_M
  );
  var F_L = liftForcePerMeter(params.rho_w, params.D_outer, params.U, params.C_L);
  var W_s = submergedWeightPerMeter(
    params.D_outer, params.t_wall, params.rho_steel, params.rho_coat,
    params.t_coat, params.rho_contents, params.rho_w
  );
  var stability = absoluteStabilityCheck(W_s, F_H, F_L, params.mu);

  return {
    utilisation: stability.utilisation,
    is_stable: stability.is_stable,
    details: stability.details,
    F_H: F_H,
    F_L: F_L,
    W_s: W_s,
  };
}

// CommonJS export for Node.js/Jest; also exposed as browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hydrodynamicForcePerMeter,
    liftForcePerMeter,
    submergedWeightPerMeter,
    absoluteStabilityCheck,
    obsPipeline,
  };
}
