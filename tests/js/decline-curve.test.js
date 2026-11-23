/**
 * TDD tests for Decline Curve & EUR (Arps) Calculator engine.
 *
 * Verifies:
 *   - Arps rate equations (exponential / hyperbolic / harmonic)
 *   - Time to economic limit (inverse of each regime)
 *   - Closed-form cumulative production (EUR) AGAINST numeric integration
 *   - Unit handling (per-day rate * 365 = annual volume)
 *   - Known hand-checkable values
 *
 * @jest-environment node
 */

const {
  DAYS_PER_YEAR,
  rateAtTime,
  timeToLimit,
  cumulativeProduction,
  forecastSeries,
  declineCurve,
} = require('../../assets/js/decline-curve-engine');

/**
 * Numeric integral of q(t) dt from 0 to T (trapezoidal, fine steps).
 * Returns cumulative in (rate * year) — i.e. rateUnit 'per-year' equivalent.
 */
function integrateRate(qi, Di, b, T, n) {
  n = n || 200000;
  const dt = T / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const t0 = i * dt;
    const t1 = (i + 1) * dt;
    sum += 0.5 * (rateAtTime(qi, Di, b, t0) + rateAtTime(qi, Di, b, t1)) * dt;
  }
  return sum;
}

// -------------------------------------------------------------------
// rateAtTime
// -------------------------------------------------------------------
describe('rateAtTime', () => {
  test('t=0 returns qi for all regimes', () => {
    expect(rateAtTime(1000, 0.1, 0, 0)).toBeCloseTo(1000, 6);
    expect(rateAtTime(1000, 0.1, 0.5, 0)).toBeCloseTo(1000, 6);
    expect(rateAtTime(1000, 0.1, 1, 0)).toBeCloseTo(1000, 6);
  });

  test('exponential q(t)=qi*exp(-Di*t)', () => {
    expect(rateAtTime(1000, 0.10, 0, 5)).toBeCloseTo(1000 * Math.exp(-0.5), 6);
  });

  test('harmonic q(t)=qi/(1+Di*t)', () => {
    expect(rateAtTime(1000, 0.10, 1, 10)).toBeCloseTo(1000 / (1 + 1.0), 6); // = 500
  });

  test('hyperbolic q(t)=qi*(1+b*Di*t)^(-1/b)', () => {
    const expected = 1000 * Math.pow(1 + 0.5 * 0.10 * 10, -1 / 0.5);
    expect(rateAtTime(1000, 0.10, 0.5, 10)).toBeCloseTo(expected, 6);
  });
});

// -------------------------------------------------------------------
// timeToLimit
// -------------------------------------------------------------------
describe('timeToLimit', () => {
  test('exponential t = ln(qi/qLim)/Di', () => {
    // qi=1000, Di=0.10, qLim=100 -> ln(10)/0.10 = 23.0259
    expect(timeToLimit(1000, 0.10, 0, 100)).toBeCloseTo(Math.log(10) / 0.10, 6);
  });

  test('harmonic t = (qi/qLim - 1)/Di', () => {
    // qi=1000, Di=0.10, qLim=100 -> (10-1)/0.10 = 90
    expect(timeToLimit(1000, 0.10, 1, 100)).toBeCloseTo(90, 6);
  });

  test('rate at timeToLimit equals qLim (hyperbolic round-trip)', () => {
    const t = timeToLimit(1000, 0.10, 0.5, 100);
    expect(rateAtTime(1000, 0.10, 0.5, t)).toBeCloseTo(100, 4);
  });

  test('qLim >= qi returns Infinity', () => {
    expect(timeToLimit(1000, 0.10, 0, 1000)).toBe(Infinity);
  });
});

// -------------------------------------------------------------------
// cumulativeProduction — hand checks + integral verification
// -------------------------------------------------------------------
describe('cumulativeProduction (closed form)', () => {
  test('EXPONENTIAL hand check: qi=1000, Di=0.10, qLim=100 -> Np=9000 (rate*year)', () => {
    // Np = (qi - qLim)/Di = (1000-100)/0.10 = 9000
    expect(cumulativeProduction(1000, 0.10, 0, 100, 'per-year')).toBeCloseTo(9000, 6);
  });

  test('HARMONIC hand check: qi=1000, Di=0.10, qLim=100 -> Np=qi/Di*ln(10)=23025.85', () => {
    // Np = 1000/0.10 * ln(10) = 10000 * 2.302585 = 23025.85
    expect(cumulativeProduction(1000, 0.10, 1, 100, 'per-year')).toBeCloseTo(10000 * Math.log(10), 4);
  });

  test('HYPERBOLIC hand check b=0.5: qi=1000, Di=0.10, qLim=100', () => {
    // Np = qi^b/((1-b)Di) * (qi^(1-b) - qLim^(1-b))
    //    = 1000^0.5/(0.5*0.10) * (1000^0.5 - 100^0.5)
    //    = 31.62278/0.05 * (31.62278 - 10) = 632.4555 * 21.62278 = 13675.44
    const expected = (Math.pow(1000, 0.5) / (0.5 * 0.10)) *
      (Math.pow(1000, 0.5) - Math.pow(100, 0.5));
    expect(cumulativeProduction(1000, 0.10, 0.5, 100, 'per-year')).toBeCloseTo(expected, 4);
    expect(expected).toBeCloseTo(13675.44, 1);
  });

  test('exponential closed form matches numeric integral to economic limit', () => {
    const t = timeToLimit(1000, 0.10, 0, 100);
    const numeric = integrateRate(1000, 0.10, 0, t);
    expect(cumulativeProduction(1000, 0.10, 0, 100, 'per-year')).toBeCloseTo(numeric, 0);
  });

  test('hyperbolic closed form matches numeric integral to economic limit', () => {
    const t = timeToLimit(1000, 0.10, 0.5, 100);
    const numeric = integrateRate(1000, 0.10, 0.5, t);
    expect(cumulativeProduction(1000, 0.10, 0.5, 100, 'per-year')).toBeCloseTo(numeric, 0);
  });

  test('harmonic closed form matches numeric integral to economic limit', () => {
    const t = timeToLimit(1000, 0.10, 1, 100);
    const numeric = integrateRate(1000, 0.10, 1, t);
    expect(cumulativeProduction(1000, 0.10, 1, 100, 'per-year')).toBeCloseTo(numeric, 0);
  });

  test('per-day unit multiplies cumulative by 365 vs per-year', () => {
    const perYear = cumulativeProduction(1000, 0.10, 0, 100, 'per-year');
    const perDay = cumulativeProduction(1000, 0.10, 0, 100, 'per-day');
    expect(perDay).toBeCloseTo(perYear * DAYS_PER_YEAR, 2);
    // 9000 rate*year * 365 = 3,285,000 bbl
    expect(perDay).toBeCloseTo(3285000, 0);
  });

  test('qLim >= qi returns 0', () => {
    expect(cumulativeProduction(1000, 0.10, 0, 1000, 'per-year')).toBe(0);
  });
});

// -------------------------------------------------------------------
// forecastSeries
// -------------------------------------------------------------------
describe('forecastSeries', () => {
  test('returns steps+1 monotonically-decreasing points starting at qi', () => {
    const s = forecastSeries(1000, 0.10, 0, 20, 20);
    expect(s.t.length).toBe(21);
    expect(s.q.length).toBe(21);
    expect(s.q[0]).toBeCloseTo(1000, 6);
    expect(s.q[20]).toBeLessThan(s.q[0]);
    expect(s.t[20]).toBeCloseTo(20, 6);
  });
});

// -------------------------------------------------------------------
// declineCurve (pipeline)
// -------------------------------------------------------------------
describe('declineCurve', () => {
  test('economic-limit path: regime, time-to-limit, EUR (per-year units)', () => {
    const r = declineCurve({ qi: 1000, Di: 0.10, b: 0, qLim: 100, rateUnit: 'per-year' });
    expect(r.regime).toBe('exponential');
    expect(r.timeToLimit_yr).toBeCloseTo(Math.log(10) / 0.10, 6);
    expect(r.eur).toBeCloseTo(9000, 4);
    expect(r.qLimUsed).toBeCloseTo(100, 6);
  });

  test('horizon path: implied qLim = rate at horizon, finite EUR', () => {
    const r = declineCurve({ qi: 1000, Di: 0.10, b: 0, tHorizon: 10, rateUnit: 'per-year' });
    expect(r.timeToLimit_yr).toBeCloseTo(10, 6);
    expect(r.qLimUsed).toBeCloseTo(1000 * Math.exp(-1.0), 6);
    // EUR to that implied limit = (qi - qLim)/Di
    expect(r.eur).toBeCloseTo((1000 - 1000 * Math.exp(-1.0)) / 0.10, 4);
  });

  test('harmonic regime label', () => {
    const r = declineCurve({ qi: 500, Di: 0.2, b: 1, qLim: 50, rateUnit: 'per-year' });
    expect(r.regime).toBe('harmonic');
  });
});
