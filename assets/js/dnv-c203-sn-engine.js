/**
 * DNV-RP-C203 S-N curve engine for the fatigue calculators.
 *
 * Pure functions, no DOM. Loaded by fatigue-sn-curve.html and
 * fatigue-life-calculator.html (browser global `DnvC203Sn`) and by the Jest
 * tests (CommonJS).
 *
 * Reference: DNV-RP-C203, October 2011, Table 2-1 (in air), Table 2-2
 * (seawater with cathodic protection) and Table 2-3 (seawater, free
 * corrosion). For the air and cathodic-protection curves of the classes
 * listed here the values are the same in the 2021 edition. Only the classes
 * the calculators list are included.
 *
 * Curve form, N cycles at stress range S (MPa):
 *   air and CP:      log N = log a1 - m1 log S   for N <= knee
 *                    log N = log a2 - m2 log S   for N >  knee
 *                    knee = 1e7 cycles in air, 1e6 cycles with CP
 *   free corrosion:  log N = log a - 3 log S     (single slope, all N)
 *
 * Low-cycle cap: below 1e5 cycles the allowable curve is capped at the B1
 * curve of the same environment (air: section 2.4.4; CP: section 2.4.5).
 * No cap is stated for free corrosion. Where the detail curve gives fewer
 * than 1e5 cycles, N is taken from B1 if B1 gives fewer cycles.
 *
 * Not applied here: thickness correction, the section 2.11 fatigue-limit
 * conditions, and design fatigue factors.
 */

// 'use strict' sits inside the function so that the top-level `var` stays a
// global however the file is evaluated.
var DnvC203Sn = (function () {
  'use strict';

  var REFERENCE = 'DNV-RP-C203 (October 2011), Tables 2-1, 2-2 and 2-3';
  var KNEE = { air: 1e7, seawater_cp: 1e6 };
  var LOW_CYCLE_CAP_N = 1e5;

  // [m1, log a1, m2, log a2] for air and CP; log a (m = 3) for free corrosion.
  var TABLE = {
    B1: { air: [4.0, 15.117, 5.0, 17.146], seawater_cp: [4.0, 14.917, 5.0, 17.146], free_corrosion: 12.436 },
    B2: { air: [4.0, 14.885, 5.0, 16.856], seawater_cp: [4.0, 14.685, 5.0, 16.856], free_corrosion: 12.262 },
    C: { air: [3.0, 12.592, 5.0, 16.320], seawater_cp: [3.0, 12.192, 5.0, 16.320], free_corrosion: 12.115 },
    C1: { air: [3.0, 12.449, 5.0, 16.081], seawater_cp: [3.0, 12.049, 5.0, 16.081], free_corrosion: 11.972 },
    C2: { air: [3.0, 12.301, 5.0, 15.835], seawater_cp: [3.0, 11.901, 5.0, 15.835], free_corrosion: 11.824 },
    D: { air: [3.0, 12.164, 5.0, 15.606], seawater_cp: [3.0, 11.764, 5.0, 15.606], free_corrosion: 11.687 },
    E: { air: [3.0, 12.010, 5.0, 15.350], seawater_cp: [3.0, 11.610, 5.0, 15.350], free_corrosion: 11.533 },
    F: { air: [3.0, 11.855, 5.0, 15.091], seawater_cp: [3.0, 11.455, 5.0, 15.091], free_corrosion: 11.378 },
    F1: { air: [3.0, 11.699, 5.0, 14.832], seawater_cp: [3.0, 11.299, 5.0, 14.832], free_corrosion: 11.222 },
    F3: { air: [3.0, 11.546, 5.0, 14.576], seawater_cp: [3.0, 11.146, 5.0, 14.576], free_corrosion: 11.068 },
    G: { air: [3.0, 11.398, 5.0, 14.330], seawater_cp: [3.0, 10.998, 5.0, 14.330], free_corrosion: 10.921 },
    W1: { air: [3.0, 11.261, 5.0, 14.101], seawater_cp: [3.0, 10.861, 5.0, 14.101], free_corrosion: 10.784 },
    W2: { air: [3.0, 11.107, 5.0, 13.845], seawater_cp: [3.0, 10.707, 5.0, 13.845], free_corrosion: 10.630 },
    W3: { air: [3.0, 10.970, 5.0, 13.617], seawater_cp: [3.0, 10.570, 5.0, 13.617], free_corrosion: 10.493 },
    T: { air: [3.0, 12.164, 5.0, 15.606], seawater_cp: [3.0, 11.764, 5.0, 15.606], free_corrosion: 11.687 }
  };

  // Page environment values -> table environment.
  var ENV_ALIASES = {
    air: 'air',
    seawater_cp: 'seawater_cp',
    free_corrosion: 'free_corrosion',
    seawater_fc: 'free_corrosion',
    seawater_free: 'free_corrosion'
  };

  function normaliseEnvironment(env) {
    var e = ENV_ALIASES[env];
    if (!e) throw new Error('Unknown environment: ' + env);
    return e;
  }

  function curveParams(cls, env) {
    var row = Object.prototype.hasOwnProperty.call(TABLE, cls) ? TABLE[cls] : null;
    if (!row) throw new Error('Unknown DNV-RP-C203 curve class: ' + cls);
    var e = normaliseEnvironment(env);
    if (e === 'free_corrosion') {
      return { m1: 3.0, log_a1: row.free_corrosion, m2: null, log_a2: null, knee_cycles: null };
    }
    var p = row[e];
    return { m1: p[0], log_a1: p[1], m2: p[2], log_a2: p[3], knee_cycles: KNEE[e] };
  }

  function lowCycleCapCurve(env) {
    return normaliseEnvironment(env) === 'free_corrosion' ? null : 'B1';
  }

  // Detail curve only (no cap): { logN, segment, m, log_a }.
  function detailLogN(p, logS) {
    var logN1 = p.log_a1 - p.m1 * logS;
    if (p.knee_cycles === null || logN1 <= Math.log10(p.knee_cycles)) {
      return { logN: logN1, segment: 1, m: p.m1, log_a: p.log_a1 };
    }
    return { logN: p.log_a2 - p.m2 * logS, segment: 2, m: p.m2, log_a: p.log_a2 };
  }

  /**
   * Allowable cycles at stress range S (MPa).
   * Returns { N, logN, segment, m, log_a, capped }.
   */
  function allowableCycles(cls, env, S) {
    if (typeof S !== 'number' || !isFinite(S) || S <= 0) {
      throw new Error('Stress range must be a positive number');
    }
    var p = curveParams(cls, env);
    var logS = Math.log10(S);
    var r = detailLogN(p, logS);
    var capped = false;
    var capCls = lowCycleCapCurve(env);
    if (capCls && r.logN < Math.log10(LOW_CYCLE_CAP_N)) {
      var b = detailLogN(curveParams(capCls, env), logS);
      if (b.logN < r.logN) {
        r = b;
        capped = true;
      }
    }
    return { N: Math.pow(10, r.logN), logN: r.logN, segment: r.segment, m: r.m, log_a: r.log_a, capped: capped };
  }

  var CURVES = {};
  Object.keys(TABLE).forEach(function (cls) {
    CURVES[cls] = {
      air: curveParams(cls, 'air'),
      seawater_cp: curveParams(cls, 'seawater_cp'),
      free_corrosion: curveParams(cls, 'free_corrosion')
    };
  });

  return {
    REFERENCE: REFERENCE,
    LOW_CYCLE_CAP_N: LOW_CYCLE_CAP_N,
    CURVES: CURVES,
    normaliseEnvironment: normaliseEnvironment,
    curveParams: curveParams,
    lowCycleCapCurve: lowCycleCapCurve,
    allowableCycles: allowableCycles
  };
})();

// CommonJS export for Node.js/Jest; `DnvC203Sn` is the browser global.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DnvC203Sn;
}
