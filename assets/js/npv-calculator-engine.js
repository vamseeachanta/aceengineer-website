/**
 * NPV Field Development Calculator Engine
 *
 * Pure calculation functions for oil and gas field development economics.
 * No DOM dependencies — suitable for unit testing and browser use.
 *
 * Exports:
 *   calcDeclineProduction, calcAnnualRevenue, calcAnnualOpex,
 *   calcNPV, calcIRR, calcIRRResult, calcMIRR, calcPayback, formatMoney,
 *   buildYearlyCashflows,
 *   DOLLARS_PER_MILLION, IRR_BRACKET_LOW, IRR_BRACKET_HIGH,
 *   IRR_RATE_TOLERANCE
 *
 * UNITS: this module computes in DOLLARS throughout. The calculator page's
 * form is denominated in $M, so exactly one conversion sits between them —
 * see DOLLARS_PER_MILLION. The one exception is formatMoney, which takes $M
 * because it is a presentation helper; that contract is asserted by test.
 */

'use strict';

/**
 * Dollars per million dollars. This is the definition of the unit, not a
 * tuned constant. The engine computes in DOLLARS; the calculator page's form
 * is denominated in $M, so exactly one conversion sits between them.
 */
const DOLLARS_PER_MILLION = 1e6;

/** IRR search bracket: -50% to +200%. */
const IRR_BRACKET_LOW = -0.5;
const IRR_BRACKET_HIGH = 2.0;

/**
 * Convergence bound, expressed as the WIDTH OF THE RATE BRACKET.
 *
 * The page renders IRR as toFixed(2) on a percentage, so 0.01 percentage
 * points -- 1e-4 as a rate fraction -- is everything it can display. This
 * bound is 1e-6, two orders finer than that. Roots arrive already bracketed to
 * IRR_SCAN_STEP, so about 7 bisections reach it, well inside the budget.
 *
 * It is stated in RATE units and therefore carries no cashflow magnitude,
 * which is the whole point: a bound on |NPV| is scale-dependent, too loose on
 * small cashflows and unreachable on large ones.
 */
const IRR_RATE_TOLERANCE = 1e-6;

/**
 * Resolution of the sign-change scan across the bracket, in rate units.
 * Set to the page's display resolution (0.01pp = 1e-4) so that no root the
 * page could distinguish on screen can be stepped over.
 */
const IRR_SCAN_STEP = 1e-4;

const IRR_MAX_ITERATIONS = 100;

/**
 * Exponential decline production for a given year.
 * Q(t) = Q0 * (1 - declineRate)^(year - 1)
 *
 * @param {number} initialRate  Initial production rate (bbl/day)
 * @param {number} declineRate  Annual fractional decline (0.15 = 15%)
 * @param {number} year         Project year (1-indexed)
 * @returns {number} Production rate in bbl/day
 */
function calcDeclineProduction(initialRate, declineRate, year) {
  return initialRate * Math.pow(1 - declineRate, year - 1);
}

/**
 * Annual gross revenue after royalty deduction.
 * R(t) = Q(t) * P(t) * 365 * (1 - royaltyRate)
 * P(t) = basePrice * (1 + priceEscalation)^(year - 1)
 *
 * @param {number} production       Production rate in bbl/day
 * @param {number} basePrice        Oil price in $/bbl (year-1 base)
 * @param {number} priceEscalation  Annual fractional price escalation
 * @param {number} royaltyRate      Government royalty fraction
 * @param {number} year             Project year (1-indexed)
 * @returns {number} Annual revenue in dollars
 */
function calcAnnualRevenue(production, basePrice, priceEscalation, royaltyRate, year) {
  const price = basePrice * Math.pow(1 + priceEscalation, year - 1);
  return production * price * 365 * (1 - royaltyRate);
}

/**
 * Annual OPEX with cost escalation.
 * OPEX(t) = baseOpex * (1 + escalation)^(year - 1)
 *
 * @param {number} baseOpex      Base annual OPEX in dollars (year-1)
 * @param {number} escalation    Annual fractional OPEX escalation
 * @param {number} year          Project year (1-indexed)
 * @returns {number} Annual OPEX in dollars
 */
function calcAnnualOpex(baseOpex, escalation, year) {
  return baseOpex * Math.pow(1 + escalation, year - 1);
}

/**
 * Net Present Value via discounted cashflow summation.
 * NPV = -CAPEX + sum(CF_t / (1+r)^t) for t=1..n
 *
 * @param {number}   capex       Initial capital expenditure (dollars, positive)
 * @param {number[]} cashflows   Array of annual net cashflows (after-tax) in dollars
 * @param {number}   rate        Fractional discount rate (0.10 = 10%)
 * @returns {number} NPV in dollars
 */
function calcNPV(capex, cashflows, rate) {
  let npv = -capex;
  for (let i = 0; i < cashflows.length; i++) {
    const year = i + 1;
    const discountFactor = rate === 0 ? 1 : Math.pow(1 + rate, year);
    npv += cashflows[i] / discountFactor;
  }
  return npv;
}

/**
 * Internal Rate of Return via bisection method.
 * IRR is the rate r where NPV(capex, cashflows, r) = 0.
 * Returns rate as a percentage (10.0 = 10%).
 * Returns null if IRR cannot be found in [-50%, 200%].
 *
 * @param {number}   capex      Initial CAPEX (dollars, positive)
 * @param {number[]} cashflows  Annual net cashflows in dollars
 * @returns {number|null} IRR as a percentage, or null
 */
function calcIRR(capex, cashflows) {
  return calcIRRResult(capex, cashflows).irr;
}

/**
 * Internal Rate of Return, reported with the REASON when none is available.
 *
 * "No IRR exists for this project" and "the search failed to pin one down"
 * are different facts, and a bare null conflates them. This returns which
 * happened.
 *
 * Roots are located by scanning the bracket for sign changes rather than by
 * testing only the sign at its two ends. A field whose production declines
 * while its OPEX escalates has negative cashflows in its late years, so the
 * cashflow changes sign more than once and NPV can be negative at BOTH ends
 * of the bracket while being positive in between. An endpoint test calls that
 * "no root" even when two exist.
 *
 * Only a DOWNWARD crossing -- NPV positive below the rate, negative above it --
 * is an IRR you can compare against a cost of capital. A cashflow can have a
 * root that goes the other way, and reporting one as "the IRR" puts a green
 * "IRR > discount rate" next to a NOT VIABLE headline. Where no downward
 * crossing exists the status is 'no-decision-rate' and irr is null, with the
 * roots still returned so the shape stays inspectable. For a conventional
 * cashflow there is exactly one crossing and this reduces to the usual IRR.
 *
 * Statuses: 'ok', 'no-root', 'no-decision-rate', 'not-converged', 'invalid'.
 *
 * @param {number}   capex      Initial CAPEX (positive, same unit as cashflows)
 * @param {number[]} cashflows  Annual net cashflows
 * @param {object}   [options]
 * @param {number}   [options.rateTolerance]  Bracket width to converge to
 * @param {number}   [options.maxIterations]  Bisection budget per root
 * @returns {{status: string, irr: number|null, roots: number[],
 *           multipleRoots: boolean, npvAtLow: number, npvAtHigh: number}}
 *          status is 'ok', 'no-root' or 'not-converged'
 */
function calcIRRResult(capex, cashflows, options) {
  const opts = options || {};
  const rateTolerance =
    opts.rateTolerance === undefined ? IRR_RATE_TOLERANCE : opts.rateTolerance;
  const maxIterations =
    opts.maxIterations === undefined ? IRR_MAX_ITERATIONS : opts.maxIterations;

  const npvAtLow = calcNPV(capex, cashflows, IRR_BRACKET_LOW);
  const npvAtHigh = calcNPV(capex, cashflows, IRR_BRACKET_HIGH);

  const result = (status, irr, roots) => ({
    status: status,
    irr: irr,
    roots: roots || [],
    multipleRoots: (roots || []).length > 1,
    npvAtLow: npvAtLow,
    npvAtHigh: npvAtHigh,
  });

  // Non-finite input cannot be reasoned about: Math.sign(NaN) !== Math.sign(NaN)
  // is true, so every scan step would look like a sign change and the bisection
  // would return a confident number for nonsense.
  const finite = (x) => typeof x === 'number' && isFinite(x);
  if (!finite(capex) || !Array.isArray(cashflows) || !cashflows.every(finite)) {
    return result('invalid', null, []);
  }
  if (!finite(npvAtLow) || !finite(npvAtHigh)) {
    return result('invalid', null, []);
  }

  // Scan the bracket for sign changes. Testing only the two ENDS is unsound
  // here: production declines while OPEX escalates, so late-year cashflows turn
  // negative, the cashflow changes sign more than once, and NPV can be negative
  // at both ends while positive in between.
  const crossings = [];
  const steps = Math.ceil((IRR_BRACKET_HIGH - IRR_BRACKET_LOW) / IRR_SCAN_STEP);
  let prevRate = IRR_BRACKET_LOW;
  let prevNpv = npvAtLow;
  let anyNonZero = npvAtLow !== 0;

  // A root sitting exactly on the low endpoint would otherwise be stepped over.
  if (npvAtLow === 0) {
    crossings.push({ low: IRR_BRACKET_LOW, high: IRR_BRACKET_LOW, loSign: 0 });
  }

  for (let i = 1; i <= steps; i++) {
    const rate = Math.min(IRR_BRACKET_LOW + i * IRR_SCAN_STEP, IRR_BRACKET_HIGH);
    const npv = calcNPV(capex, cashflows, rate);
    if (!finite(npv)) {
      return result('invalid', null, []);
    }
    if (npv !== 0) {
      anyNonZero = true;
    }
    if (npv === 0) {
      if (prevNpv !== 0) {
        crossings.push({ low: rate, high: rate, loSign: Math.sign(prevNpv) });
      }
    } else if (prevNpv !== 0 && Math.sign(npv) !== Math.sign(prevNpv)) {
      crossings.push({ low: prevRate, high: rate, loSign: Math.sign(prevNpv) });
    }
    prevRate = rate;
    prevNpv = npv;
  }

  // NPV identically zero across the whole bracket: every rate solves it, which
  // is a degenerate cashflow, not an IRR.
  if (!anyNonZero || crossings.length === 0) {
    return result('no-root', null, []);
  }

  // Bisect each bracketed root. The direction is known from the bracket's own
  // endpoint sign, so no probe offset outside the bracket is needed.
  const roots = [];
  const downward = [];
  for (let c = 0; c < crossings.length; c++) {
    let low = crossings[c].low;
    let high = crossings[c].high;
    const loSign = crossings[c].loSign;
    let converged = high - low <= rateTolerance;

    for (let i = 0; i < maxIterations && !converged; i++) {
      const mid = (low + high) / 2;
      const npvMid = calcNPV(capex, cashflows, mid);
      if (npvMid === 0) {
        low = mid;
        high = mid;
      } else if (Math.sign(npvMid) === loSign) {
        low = mid;
      } else {
        high = mid;
      }
      converged = high - low <= rateTolerance;
    }

    if (!converged) {
      return result('not-converged', null, []);
    }

    const root = (low + high) / 2;
    // Skip a duplicate of the previous root (adjacent degenerate zeros).
    if (roots.length && Math.abs(root - roots[roots.length - 1]) <= rateTolerance) {
      continue;
    }
    roots.push(root);
    // Positive below, negative above: the only orientation you can compare to
    // a cost of capital.
    if (loSign > 0) {
      downward.push(root);
    }
  }

  if (downward.length === 0) {
    // Roots exist, but NPV never falls through zero. There is no rate here
    // that behaves like an IRR, and reporting one would print a green
    // "IRR > discount rate" beside a NOT VIABLE headline.
    return result('no-decision-rate', null, roots);
  }

  return result('ok', downward[downward.length - 1] * 100, roots);
}

/**
 * Modified Internal Rate of Return.
 * MIRR accounts for different financing and reinvestment rates.
 *
 * Formula:
 *   MIRR = (FV_positive / PV_negative)^(1/n) - 1
 *
 * Where:
 *   FV_positive = future value of positive cashflows at reinvestment rate
 *   PV_negative = present value of negative cashflows (initial CAPEX) at finance rate
 *   n = number of periods
 *
 * Returns percentage (10.0 = 10%). Returns null if terminal value <= 0.
 *
 * @param {number}   capex            Initial CAPEX (positive dollars)
 * @param {number[]} cashflows        Annual net cashflows (after-tax) in dollars
 * @param {number}   financeRate      Fractional rate for negative flows (0.10 = 10%)
 * @param {number}   reinvestmentRate Fractional rate for reinvesting positive flows
 * @returns {number|null} MIRR as a percentage, or null
 */
function calcMIRR(capex, cashflows, financeRate, reinvestmentRate) {
  const n = cashflows.length;
  if (n === 0) return null;

  // PV of all negative cashflows discounted at financeRate
  // Year 0 CAPEX is already at present value
  let pvNegative = capex;
  for (let i = 0; i < n; i++) {
    if (cashflows[i] < 0) {
      pvNegative += Math.abs(cashflows[i]) / Math.pow(1 + financeRate, i + 1);
    }
  }

  // FV of all positive cashflows compounded to end at reinvestmentRate
  let fvPositive = 0;
  for (let i = 0; i < n; i++) {
    if (cashflows[i] > 0) {
      fvPositive += cashflows[i] * Math.pow(1 + reinvestmentRate, n - i - 1);
    }
  }

  if (fvPositive <= 0 || pvNegative <= 0) {
    return null;
  }

  return (Math.pow(fvPositive / pvNegative, 1 / n) - 1) * 100;
}

/**
 * Payback period: first year where cumulative undiscounted cashflow turns positive.
 * Uses linear interpolation for fractional year.
 *
 * @param {number[]} cumulative  Cumulative net cashflow array (including CAPEX impact)
 * @param {number[]} years       Corresponding year labels (e.g. [1, 2, 3, ...])
 * @returns {number|null} Payback period in years, or null if no payback within project life
 */
function calcPayback(cumulative, years) {
  for (let i = 0; i < cumulative.length; i++) {
    if (cumulative[i] > 0) {
      if (i === 0) {
        return years[0];
      }
      const prevYear = years[i - 1];
      const prevCum = cumulative[i - 1];
      const fraction = -prevCum / (cumulative[i] - prevCum);
      return prevYear + fraction;
    }
  }
  return null;
}

/**
 * Format a dollar value in millions to a display string.
 * Values >= 1000 are shown in billions with "B" suffix.
 * Returns one decimal place.
 *
 * @param {number} value  Dollar amount in millions
 * @returns {string} Formatted string (e.g. "123.4" or "1.5B" or "-2.0B")
 */
function formatMoney(value) {
  const absValue = Math.abs(value);
  if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + 'B';
  }
  return value.toFixed(1);
}

/**
 * Build year-by-year cashflow arrays for a field development project.
 *
 * @param {object} params
 * @param {number} params.initialRate       Initial production rate (bbl/day)
 * @param {number} params.declineRate       Annual decline fraction
 * @param {number} params.projectYears      Number of production years
 * @param {number} params.oilPrice          Base oil price ($/bbl)
 * @param {number} params.priceEscalation   Annual price escalation fraction
 * @param {number} params.opex              Base annual OPEX (dollars)
 * @param {number} params.opexEscalation    Annual OPEX escalation fraction
 * @param {number} params.taxRate           Income tax fraction
 * @param {number} params.royaltyRate       Royalty fraction
 * @param {number} [params.initialCumulative=0]
 *        Where the cumulative cashflow series STARTS. Defaults to 0, i.e. the
 *        series counts operating cashflow only. Pass -capex to make it a
 *        project-level series that begins in the hole, which is what a payback
 *        period is normally measured against. Stated explicitly because the
 *        calculator page and this module previously disagreed about it in
 *        silence, and the two meanings of "payback" are not interchangeable.
 * @returns {object} { years, revenue, costs, netCashflow, cumulativeCashflow }
 */
function buildYearlyCashflows(params) {
  const {
    initialRate,
    declineRate,
    projectYears,
    oilPrice,
    priceEscalation,
    opex,
    opexEscalation,
    taxRate,
    royaltyRate,
    initialCumulative,
  } = params;

  const years = [];
  const revenue = [];
  const costs = [];
  const netCashflow = [];
  const cumulativeCashflow = [];

  let cumulative = initialCumulative === undefined ? 0 : initialCumulative;

  for (let year = 1; year <= projectYears; year++) {
    const prod = calcDeclineProduction(initialRate, declineRate, year);
    const annualRevenue = calcAnnualRevenue(
      prod, oilPrice, priceEscalation, royaltyRate, year
    );
    const annualOpex = calcAnnualOpex(opex, opexEscalation, year);

    const beforeTax = annualRevenue - annualOpex;
    const tax = beforeTax > 0 ? beforeTax * taxRate : 0;
    const afterTax = beforeTax - tax;

    cumulative += afterTax;

    years.push(year);
    revenue.push(annualRevenue);
    costs.push(annualOpex);
    netCashflow.push(afterTax);
    cumulativeCashflow.push(cumulative);
  }

  return { years, revenue, costs, netCashflow, cumulativeCashflow };
}

// CommonJS export for Node.js/Jest. In the browser this file is loaded as a
// classic <script>, so the declarations above are already globals.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOLLARS_PER_MILLION,
    IRR_BRACKET_LOW,
    IRR_BRACKET_HIGH,
    IRR_RATE_TOLERANCE,
    calcDeclineProduction,
    calcAnnualRevenue,
    calcAnnualOpex,
    calcNPV,
    calcIRR,
    calcIRRResult,
    calcMIRR,
    calcPayback,
    formatMoney,
    buildYearlyCashflows,
  };
}
