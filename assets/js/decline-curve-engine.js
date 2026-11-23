/**
 * Decline Curve & EUR Calculator Engine (Arps)
 *
 * Pure calculation functions for production decline analysis using the Arps
 * equations (exponential / hyperbolic / harmonic) and closed-form cumulative
 * production (EUR) to an economic limit.
 * No DOM dependencies — suitable for unit testing and browser use.
 *
 * Exports:
 *   rateAtTime, timeToLimit, cumulativeProduction, forecastSeries, declineCurve
 *
 * Method (Arps, 1945):
 *   exponential (b=0):     q(t) = qi * exp(-Di*t)
 *   hyperbolic  (0<b<1):   q(t) = qi * (1 + b*Di*t)^(-1/b)
 *   harmonic    (b=1):     q(t) = qi / (1 + Di*t)
 *
 *   Cumulative to economic limit q_lim (closed form):
 *     exponential: Np = (qi - q_lim) / Di
 *     hyperbolic:  Np = qi^b / ((1-b)*Di) * (qi^(1-b) - q_lim^(1-b))
 *     harmonic:    Np = qi/Di * ln(qi/q_lim)
 *
 * UNIT HANDLING (explicit):
 *   Di is always entered as a NOMINAL ANNUAL decline (per year).
 *   t in the rate equations is therefore in YEARS.
 *   The rate units (qi, q_lim) are generic. If rate is a per-DAY rate
 *   (e.g. bbl/d), cumulative volume = (per-day formula result) but the
 *   closed forms above are in (rate-units * time-units). With Di per year,
 *   the raw cumulative is in (rate * year). To express EUR in the rate's
 *   own volume unit we multiply a per-day rate by 365 (days/year) so that
 *   Np comes out in (rate-per-day * day) = total volume in barrels/Mscf.
 *   Pass rateUnit:'per-year' to skip that conversion (cumulative in rate*year).
 */

'use strict';

/**
 * Days per year used to convert annual decline math to a per-day rate volume.
 */
var DAYS_PER_YEAR = 365;

/**
 * Arps rate at time t (years).
 *
 * @param {number} qi  Initial rate (rate units)
 * @param {number} Di  Nominal annual decline (per year, fraction e.g. 0.10)
 * @param {number} b   Arps b-exponent (0 = exponential, 0<b<1 hyperbolic, 1 = harmonic)
 * @param {number} t   Time (years)
 * @returns {number} Rate at time t (rate units)
 */
function rateAtTime(qi, Di, b, t) {
  if (b === 0) {
    return qi * Math.exp(-Di * t);
  }
  if (b === 1) {
    return qi / (1 + Di * t);
  }
  return qi * Math.pow(1 + b * Di * t, -1 / b);
}

/**
 * Time (years) for the rate to fall from qi to the economic limit q_lim.
 * Inverts the Arps rate equation for each regime.
 *
 * @param {number} qi    Initial rate (rate units)
 * @param {number} Di    Nominal annual decline (per year)
 * @param {number} b     Arps b-exponent
 * @param {number} qLim  Economic limit rate (rate units)
 * @returns {number} Time to economic limit (years); Infinity if unreachable
 */
function timeToLimit(qi, Di, b, qLim) {
  if (qLim <= 0 || qLim >= qi || Di <= 0) {
    return Infinity;
  }
  if (b === 0) {
    // q = qi*exp(-Di*t) -> t = ln(qi/qLim)/Di
    return Math.log(qi / qLim) / Di;
  }
  if (b === 1) {
    // q = qi/(1+Di*t) -> t = (qi/qLim - 1)/Di
    return (qi / qLim - 1) / Di;
  }
  // q = qi*(1+b*Di*t)^(-1/b) -> t = ((qi/qLim)^b - 1)/(b*Di)
  return (Math.pow(qi / qLim, b) - 1) / (b * Di);
}

/**
 * Closed-form cumulative production (EUR) from qi down to q_lim.
 * Result is in (rate * year). If rateUnit is 'per-day', the result is
 * multiplied by 365 to express EUR in the rate's volume unit (e.g. bbl).
 *
 * @param {number} qi        Initial rate (rate units)
 * @param {number} Di        Nominal annual decline (per year)
 * @param {number} b         Arps b-exponent
 * @param {number} qLim      Economic limit rate (rate units)
 * @param {string} [rateUnit='per-day'] 'per-day' or 'per-year'
 * @returns {number} Cumulative production (volume units), 0 if qLim >= qi
 */
function cumulativeProduction(qi, Di, b, qLim, rateUnit) {
  if (rateUnit === undefined || rateUnit === null) { rateUnit = 'per-day'; }
  if (qLim >= qi || Di <= 0) {
    return 0;
  }
  var npRateYear; // cumulative in (rate * year)
  if (b === 0) {
    // exponential: Np = (qi - q_lim)/Di
    npRateYear = (qi - qLim) / Di;
  } else if (b === 1) {
    // harmonic: Np = qi/Di * ln(qi/q_lim)
    npRateYear = (qi / Di) * Math.log(qi / qLim);
  } else {
    // hyperbolic: Np = qi^b/((1-b)*Di) * (qi^(1-b) - q_lim^(1-b))
    npRateYear = (Math.pow(qi, b) / ((1 - b) * Di)) *
      (Math.pow(qi, 1 - b) - Math.pow(qLim, 1 - b));
  }
  return rateUnit === 'per-day' ? npRateYear * DAYS_PER_YEAR : npRateYear;
}

/**
 * Build a rate-vs-time forecast series for charting.
 *
 * @param {number} qi      Initial rate (rate units)
 * @param {number} Di      Nominal annual decline (per year)
 * @param {number} b       Arps b-exponent
 * @param {number} tMax    Forecast horizon (years)
 * @param {number} [steps=50] Number of intervals
 * @returns {object} { t: number[], q: number[] }  (t in years, q in rate units)
 */
function forecastSeries(qi, Di, b, tMax, steps) {
  if (steps === undefined || steps === null) { steps = 50; }
  var t = [];
  var q = [];
  for (var i = 0; i <= steps; i++) {
    var ti = tMax * i / steps;
    t.push(ti);
    q.push(rateAtTime(qi, Di, b, ti));
  }
  return { t: t, q: q };
}

/**
 * Convenience pipeline. Either provide qLim (economic limit) or a forecast
 * horizon in years (tHorizon). If qLim is given it drives EUR & time-to-limit;
 * otherwise the horizon is used and EUR is the cumulative down to the rate at
 * tHorizon.
 *
 * @param {object} params
 * @param {number}  params.qi          Initial rate (rate units)
 * @param {number}  params.Di          Nominal annual decline (per year)
 * @param {number}  params.b           Arps b-exponent
 * @param {number} [params.qLim]       Economic limit rate (rate units)
 * @param {number} [params.tHorizon]   Forecast horizon (years) — used if no qLim
 * @param {string} [params.rateUnit='per-day'] 'per-day' or 'per-year'
 * @param {number} [params.steps=50]   Chart resolution
 * @returns {object} {
 *   regime, timeToLimit_yr, eur, qLimUsed, series, rateUnit
 * }
 */
function declineCurve(params) {
  var rateUnit = (params.rateUnit === undefined || params.rateUnit === null)
    ? 'per-day'
    : params.rateUnit;
  var qi = params.qi;
  var Di = params.Di;
  var b = params.b;

  var regime;
  if (b === 0) { regime = 'exponential'; }
  else if (b === 1) { regime = 'harmonic'; }
  else { regime = 'hyperbolic'; }

  var qLim;
  var tLimit;
  var horizon;

  var hasLimit = (params.qLim !== undefined && params.qLim !== null);

  if (hasLimit) {
    qLim = params.qLim;
    tLimit = timeToLimit(qi, Di, b, qLim);
    horizon = isFinite(tLimit) ? tLimit : (params.tHorizon || 30);
  } else {
    horizon = (params.tHorizon !== undefined && params.tHorizon !== null)
      ? params.tHorizon
      : 30;
    // economic limit implied by horizon = rate at horizon
    qLim = rateAtTime(qi, Di, b, horizon);
    tLimit = horizon;
  }

  var eur = cumulativeProduction(qi, Di, b, qLim, rateUnit);
  var series = forecastSeries(qi, Di, b, horizon, params.steps);

  return {
    regime: regime,
    timeToLimit_yr: tLimit,
    eur: eur,
    qLimUsed: qLim,
    rateUnit: rateUnit,
    series: series,
  };
}

// CommonJS export for Node.js/Jest; also exposed as browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DAYS_PER_YEAR,
    rateAtTime,
    timeToLimit,
    cumulativeProduction,
    forecastSeries,
    declineCurve,
  };
}
