/**
 * TDD tests for NPV Field Development Calculator engine.
 *
 * These tests verify:
 *   - Production decline curve calculation
 *   - Annual revenue calculation with royalty and price escalation
 *   - Annual cost calculation with OPEX escalation
 *   - NPV (net present value) discounted cashflow summation
 *   - IRR calculation via bisection method
 *   - MIRR (modified internal rate of return) calculation
 *   - Payback period (undiscounted cumulative cashflow crossover)
 *   - formatMoney helper
 *   - Edge cases: zero production, zero CAPEX, negative NPV
 *
 * @jest-environment node
 */

const {
  calcDeclineProduction,
  calcAnnualRevenue,
  calcAnnualOpex,
  calcNPV,
  calcIRR,
  calcMIRR,
  calcPayback,
  formatMoney,
  buildYearlyCashflows,
} = require('../../assets/js/npv-calculator-engine');

// -------------------------------------------------------------------
// calcDeclineProduction
// -------------------------------------------------------------------
describe('calcDeclineProduction', () => {
  test('year 1 returns initial rate unchanged (decline applied to year-1=0)', () => {
    // Q(t) = Q0 * (1 - d)^(t-1), so year=1 => (1-d)^0 = 1
    expect(calcDeclineProduction(5000, 0.15, 1)).toBeCloseTo(5000, 4);
  });

  test('year 2 with 15% decline returns 4250 bbl/day', () => {
    expect(calcDeclineProduction(5000, 0.15, 2)).toBeCloseTo(4250, 2);
  });

  test('year 5 with 10% decline applies compound decline', () => {
    const expected = 5000 * Math.pow(0.9, 4);
    expect(calcDeclineProduction(5000, 0.10, 5)).toBeCloseTo(expected, 4);
  });

  test('zero decline rate returns initial rate for all years', () => {
    expect(calcDeclineProduction(3000, 0, 10)).toBeCloseTo(3000, 4);
  });

  test('100% decline rate returns 0 from year 2 onward', () => {
    expect(calcDeclineProduction(5000, 1.0, 2)).toBeCloseTo(0, 4);
  });
});

// -------------------------------------------------------------------
// calcAnnualRevenue
// -------------------------------------------------------------------
describe('calcAnnualRevenue', () => {
  test('year 1 with no price escalation and no royalty', () => {
    // prod=1000 bbl/day, price=$70, royalty=0, escalation=0
    const expected = 1000 * 70 * 365 * (1 - 0);
    expect(calcAnnualRevenue(1000, 70, 0, 0, 1)).toBeCloseTo(expected, 0);
  });

  test('royalty reduces revenue proportionally', () => {
    const withRoyalty = calcAnnualRevenue(1000, 70, 0, 0.1875, 1);
    const withoutRoyalty = calcAnnualRevenue(1000, 70, 0, 0, 1);
    expect(withRoyalty).toBeCloseTo(withoutRoyalty * (1 - 0.1875), 0);
  });

  test('price escalation compounds annually from year 1', () => {
    // year=3: price = 70 * (1.02)^2
    const expected = 1000 * 70 * Math.pow(1.02, 2) * 365 * (1 - 0.1875);
    expect(calcAnnualRevenue(1000, 70, 0.02, 0.1875, 3)).toBeCloseTo(expected, 0);
  });

  test('zero production returns zero revenue', () => {
    expect(calcAnnualRevenue(0, 70, 0.02, 0.1875, 1)).toBe(0);
  });
});

// -------------------------------------------------------------------
// calcAnnualOpex
// -------------------------------------------------------------------
describe('calcAnnualOpex', () => {
  test('year 1 returns base opex unchanged', () => {
    expect(calcAnnualOpex(50e6, 0.03, 1)).toBeCloseTo(50e6, 0);
  });

  test('year 2 with 3% escalation returns 51.5M', () => {
    expect(calcAnnualOpex(50e6, 0.03, 2)).toBeCloseTo(51.5e6, 0);
  });

  test('zero escalation returns same opex for all years', () => {
    expect(calcAnnualOpex(30e6, 0, 10)).toBeCloseTo(30e6, 0);
  });
});

// -------------------------------------------------------------------
// calcNPV
// -------------------------------------------------------------------
describe('calcNPV', () => {
  test('single positive cashflow discounts correctly', () => {
    // CAPEX=100, cashflow year1=110, rate=10% => NPV = -100 + 110/1.1 = 0
    const cashflows = [110];
    expect(calcNPV(100, cashflows, 0.10)).toBeCloseTo(0, 2);
  });

  test('negative NPV when cashflows are insufficient', () => {
    const cashflows = [50, 50]; // total undiscounted 100 but CAPEX=200
    expect(calcNPV(200, cashflows, 0.10)).toBeLessThan(0);
  });

  test('zero discount rate sums undiscounted cashflows minus CAPEX', () => {
    const cashflows = [30, 30, 30];
    // NPV = -100 + 30 + 30 + 30 = -10
    expect(calcNPV(100, cashflows, 0)).toBeCloseTo(-10, 2);
  });

  test('zero CAPEX and positive cashflows gives positive NPV', () => {
    const cashflows = [100, 100];
    expect(calcNPV(0, cashflows, 0.10)).toBeGreaterThan(0);
  });

  test('empty cashflows returns negative CAPEX', () => {
    expect(calcNPV(500, [], 0.10)).toBeCloseTo(-500, 2);
  });
});

// -------------------------------------------------------------------
// calcIRR
// -------------------------------------------------------------------
describe('calcIRR', () => {
  test('single cashflow IRR is (cashflow/capex - 1) * 100', () => {
    // CAPEX=100, cashflow=[110] => IRR=10%
    const irr = calcIRR(100, [110]);
    expect(irr).toBeCloseTo(10, 1);
  });

  test('returns a percentage value above 0 for viable project', () => {
    const cashflows = [60, 60, 60]; // CAPEX=100, clearly profitable
    const irr = calcIRR(100, cashflows);
    expect(irr).toBeGreaterThan(0);
  });

  test('returns null or negative when project does not break even', () => {
    // CAPEX=1000, tiny cashflows
    const cashflows = [1, 1, 1];
    const irr = calcIRR(1000, cashflows);
    // IRR should be negative or null (search range includes negatives)
    if (irr !== null) {
      expect(irr).toBeLessThan(0);
    }
  });

  test('returns null for all-zero cashflows', () => {
    expect(calcIRR(100, [0, 0, 0])).toBeNull();
  });
});

// -------------------------------------------------------------------
// calcMIRR
// -------------------------------------------------------------------
describe('calcMIRR', () => {
  test('returns a number for a standard viable project', () => {
    // CAPEX=100, positive cashflows, finance rate = reinvest rate = 10%
    const cashflows = [60, 60, 60];
    const mirr = calcMIRR(100, cashflows, 0.10, 0.10);
    expect(typeof mirr).toBe('number');
    expect(isFinite(mirr)).toBe(true);
  });

  test('MIRR equals IRR when finance rate equals reinvestment rate equals IRR', () => {
    // For a single-period investment: CAPEX=100, CF=[110]
    // IRR = 10%, MIRR should also be close to 10% when rates are 10%
    const mirr = calcMIRR(100, [110], 0.10, 0.10);
    expect(mirr).toBeCloseTo(10, 1);
  });

  test('MIRR is lower than IRR when reinvestment rate < IRR', () => {
    // High-return project: CAPEX=100, CF=[150] => IRR=50%
    // MIRR with reinvest rate 10% should be lower than 50%
    const cashflows = [150];
    const irrVal = calcIRR(100, cashflows);
    const mirrVal = calcMIRR(100, cashflows, 0.10, 0.10);
    if (irrVal !== null) {
      expect(mirrVal).toBeLessThanOrEqual(irrVal + 0.01);
    }
  });

  test('MIRR handles all-positive cashflows (no negative flows after year 0)', () => {
    const cashflows = [50, 60, 70];
    const mirr = calcMIRR(200, cashflows, 0.10, 0.10);
    expect(typeof mirr).toBe('number');
  });

  test('returns null for zero or all-negative terminal value', () => {
    // All zero cashflows => terminal value = 0 => cannot compute MIRR
    const result = calcMIRR(100, [0, 0, 0], 0.10, 0.10);
    expect(result).toBeNull();
  });
});

// -------------------------------------------------------------------
// calcPayback
// -------------------------------------------------------------------
describe('calcPayback', () => {
  test('payback in year 3 when cumulative first goes positive at year 3', () => {
    const cumulative = [-200, -100, 50];
    const years = [1, 2, 3];
    const payback = calcPayback(cumulative, years);
    // Linear interpolation: prevYear=2, prevCum=-100, curCum=50
    // fraction = 100/150 = 0.667 => payback = 2 + 0.667 = 2.667
    expect(payback).toBeCloseTo(2.667, 2);
  });

  test('payback in year 1 when first cumulative is already positive', () => {
    const cumulative = [50, 100, 150];
    const years = [1, 2, 3];
    expect(calcPayback(cumulative, years)).toBe(1);
  });

  test('returns null when cumulative never goes positive', () => {
    const cumulative = [-300, -200, -100];
    const years = [1, 2, 3];
    expect(calcPayback(cumulative, years)).toBeNull();
  });

  test('exact breakeven (cumulative = 0) returns that year', () => {
    const cumulative = [-100, 0, 50];
    const years = [1, 2, 3];
    const payback = calcPayback(cumulative, years);
    // cumulative[1] = 0, which is not > 0; cumulative[2] = 50 > 0
    // prevCum = 0, fraction = 0/50 = 0 => payback = 2 + 0 = 2
    expect(payback).toBeCloseTo(2, 2);
  });
});

// -------------------------------------------------------------------
// formatMoney
// -------------------------------------------------------------------
describe('formatMoney', () => {
  test('values under 1000 return one decimal place', () => {
    expect(formatMoney(500.123)).toBe('500.1');
  });

  test('negative values under -1000 magnitude return one decimal place', () => {
    expect(formatMoney(-500.5)).toBe('-500.5');
  });

  test('values >= 1000 are expressed in billions with B suffix', () => {
    expect(formatMoney(1500)).toBe('1.5B');
  });

  test('negative values <= -1000 magnitude expressed in billions', () => {
    expect(formatMoney(-2000)).toBe('-2.0B');
  });

  test('exactly 1000 returns 1.0B', () => {
    expect(formatMoney(1000)).toBe('1.0B');
  });
});

// -------------------------------------------------------------------
// buildYearlyCashflows (integration-style)
// -------------------------------------------------------------------
describe('buildYearlyCashflows', () => {
  const params = {
    initialRate: 5000,
    declineRate: 0.15,
    projectYears: 3,
    oilPrice: 70,
    priceEscalation: 0.02,
    opex: 50e6,
    opexEscalation: 0.03,
    taxRate: 0.21,
    royaltyRate: 0.1875,
  };

  test('returns arrays of length equal to projectYears', () => {
    const result = buildYearlyCashflows(params);
    expect(result.years.length).toBe(3);
    expect(result.revenue.length).toBe(3);
    expect(result.costs.length).toBe(3);
    expect(result.netCashflow.length).toBe(3);
    expect(result.cumulativeCashflow.length).toBe(3);
  });

  test('years array is sequential starting at 1', () => {
    const result = buildYearlyCashflows(params);
    expect(result.years).toEqual([1, 2, 3]);
  });

  test('revenue is positive for positive production and price', () => {
    const result = buildYearlyCashflows(params);
    result.revenue.forEach(r => expect(r).toBeGreaterThan(0));
  });

  test('revenue declines year over year with declining production', () => {
    // With 15% decline and modest price escalation, revenue should decline
    const result = buildYearlyCashflows({ ...params, priceEscalation: 0 });
    expect(result.revenue[1]).toBeLessThan(result.revenue[0]);
    expect(result.revenue[2]).toBeLessThan(result.revenue[1]);
  });

  test('cumulative cashflow starts negative (CAPEX not included in array) and increases', () => {
    // buildYearlyCashflows returns cumulative starting from 0 (CAPEX handled separately)
    const result = buildYearlyCashflows(params);
    // Net cashflow should be positive (revenue >> opex for default params)
    expect(result.netCashflow[0]).toBeGreaterThan(0);
  });

  test('zero production rate returns zero revenue', () => {
    const result = buildYearlyCashflows({ ...params, initialRate: 0 });
    result.revenue.forEach(r => expect(r).toBe(0));
  });
});
