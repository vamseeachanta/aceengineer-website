/**
 * Mooring Line Fatigue Calculator Engine
 *
 * Pure calculation functions for mooring chain fatigue screening using the
 * T-N curve (tension range vs. cycles) approach per DNV-OS-E301.
 * No DOM dependencies — suitable for unit testing and browser use.
 *
 * Exports:
 *   nominalArea, nominalStressRange, cyclesToFailure, mooringFatigue
 *
 * References:
 *   DNV-OS-E301 "Position Mooring" — T-N fatigue curve N = a_D * S^(-m)
 *   Studless chain: m = 3.0, a_D = 6.0e10
 *   Studlink chain: m = 3.0, a_D = 1.2e11
 *   (Values per DNV-OS-E301; cited as the standard's curve parameters.)
 *
 * NOTE: This is a SINGLE-stress-range screen. It applies one representative
 * tension range to the whole cycle count. A real fatigue analysis sums
 * Miner's-rule damage over a full tension-range histogram (rainflow counted
 * from the mooring time-domain response). Treat outputs as a first-pass screen.
 */

'use strict';

/**
 * DNV-OS-E301 T-N curve parameters by chain type.
 * Slope m is dimensionless; intercept a_D corresponds to S expressed in MPa.
 */
var CHAIN_PROPS = {
  studless: { m: 3.0, a_D: 6.0e10, label: 'Studless chain' },
  studlink: { m: 3.0, a_D: 1.2e11, label: 'Studlink chain' },
};

/**
 * Nominal cross-section area of a mooring chain link.
 * A chain link is built from two parallel bars that together carry the load,
 * so the load-bearing area is two bar cross-sections:
 *   A = 2 * (pi/4 * d^2)
 * where d is the chain bar (nominal) diameter.
 *
 * @param {number} d_mm  Chain bar diameter (mm)
 * @returns {number} Nominal cross-section area (mm^2)
 */
function nominalArea(d_mm) {
  return 2 * (Math.PI / 4) * d_mm * d_mm;
}

/**
 * Nominal stress range from a tension range.
 * S = tension_range / nominal_area
 * Units: tension range in kN -> N (x1000), area in mm^2, result in MPa (N/mm^2).
 *
 * @param {number} tensionRange_kN  Tension range deltaT (kN)
 * @param {number} d_mm             Chain bar diameter (mm)
 * @returns {number} Nominal stress range (MPa)
 */
function nominalStressRange(tensionRange_kN, d_mm) {
  var area_mm2 = nominalArea(d_mm);          // mm^2
  var tension_N = tensionRange_kN * 1000;    // kN -> N
  return tension_N / area_mm2;               // N/mm^2 = MPa
}

/**
 * Cycles to failure from the DNV-OS-E301 T-N curve.
 *   N = a_D * S^(-m)
 *
 * @param {number} S         Nominal stress range (MPa)
 * @param {string} chainType 'studless' | 'studlink'
 * @returns {number} Cycles to failure N (cycles); Infinity if S <= 0
 */
function cyclesToFailure(S, chainType) {
  var props = CHAIN_PROPS[chainType] || CHAIN_PROPS.studless;
  if (S <= 0) {
    return Infinity;
  }
  return props.a_D * Math.pow(S, -props.m);
}

/**
 * Single-stress-range mooring chain fatigue screen.
 *
 * @param {object} params
 * @param {string} params.chainType        'studless' | 'studlink'
 * @param {number} params.d_mm             Chain bar diameter (mm)
 * @param {number} params.tensionRange_kN  Tension range deltaT (kN)
 * @param {number} params.cyclesPerYear    Number of stress cycles per year (cycles/yr)
 * @param {number} params.designLife_yr    Design life (years)
 * @param {number} [params.safetyFactor=1.0] Safety factor on damage (-)
 * @returns {object} {
 *   chainType, m, a_D, area_mm2, stressRange_MPa, N,
 *   annualDamage, fatigueLife_yr, designLife_yr, safetyFactor, is_passing, details
 * }
 */
function mooringFatigue(params) {
  var chainType = params.chainType === 'studlink' ? 'studlink' : 'studless';
  var props = CHAIN_PROPS[chainType];
  var sf = (params.safetyFactor === undefined || params.safetyFactor === null)
    ? 1.0
    : params.safetyFactor;

  var area_mm2 = nominalArea(params.d_mm);
  var S = nominalStressRange(params.tensionRange_kN, params.d_mm);
  var N = cyclesToFailure(S, chainType);

  // Annual damage = cycles applied per year / cycles to failure.
  var annualDamage = (N === Infinity || N === 0) ? 0 : params.cyclesPerYear / N;

  // Fatigue life = 1 / annual damage, reduced by the safety factor on damage.
  // Higher safety factor -> shorter allowable (reported) life.
  var fatigueLife_yr;
  if (annualDamage <= 0) {
    fatigueLife_yr = Infinity;
  } else {
    fatigueLife_yr = (1 / annualDamage) / sf;
  }

  var is_passing = fatigueLife_yr >= params.designLife_yr;

  return {
    chainType: chainType,
    chainLabel: props.label,
    m: props.m,
    a_D: props.a_D,
    area_mm2: area_mm2,
    stressRange_MPa: S,
    N: N,
    annualDamage: annualDamage,
    fatigueLife_yr: fatigueLife_yr,
    designLife_yr: params.designLife_yr,
    safetyFactor: sf,
    is_passing: is_passing,
    details: 'Fatigue life: ' +
      (fatigueLife_yr === Infinity ? 'infinite' : fatigueLife_yr.toFixed(1) + ' yr') +
      ' vs design life ' + params.designLife_yr + ' yr',
  };
}

// CommonJS export for Node.js/Jest; also exposed as browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHAIN_PROPS,
    nominalArea,
    nominalStressRange,
    cyclesToFailure,
    mooringFatigue,
  };
}
