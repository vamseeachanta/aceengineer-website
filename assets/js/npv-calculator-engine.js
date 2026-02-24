/**
 * NPV Field Development Calculator Engine
 *
 * Pure calculation functions for oil and gas field development economics.
 * No DOM dependencies — suitable for unit testing and browser use.
 *
 * Exports:
 *   calcDeclineProduction, calcAnnualRevenue, calcAnnualOpex,
 *   calcNPV, calcIRR, calcMIRR, calcPayback, formatMoney,
 *   buildYearlyCashflows
 */

'use strict';

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
  const tolerance = 0.0001;
  const maxIterations = 100;

  let low = -0.5;
  let high = 2.0;

  const npvAtLow = calcNPV(capex, cashflows, low);
  const npvAtHigh = calcNPV(capex, cashflows, high);

  // IRR requires NPV to change sign across the search range
  if (npvAtLow * npvAtHigh > 0) {
    return null;
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = calcNPV(capex, cashflows, mid);

    if (Math.abs(npvMid) < tolerance) {
      return mid * 100;
    }

    if (npvMid > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return ((low + high) / 2) * 100;
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
  } = params;

  const years = [];
  const revenue = [];
  const costs = [];
  const netCashflow = [];
  const cumulativeCashflow = [];

  let cumulative = 0;

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

// CommonJS export for Node.js/Jest; also exposed as browser globals
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calcDeclineProduction,
    calcAnnualRevenue,
    calcAnnualOpex,
    calcNPV,
    calcIRR,
    calcMIRR,
    calcPayback,
    formatMoney,
    buildYearlyCashflows,
  };
}
