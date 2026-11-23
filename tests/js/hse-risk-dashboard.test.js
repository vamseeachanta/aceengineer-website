/**
 * TDD tests for HSE Risk Dashboard data module and filter logic.
 *
 * These tests verify:
 *   - Pre-computed risk data structure validity
 *   - Filter functions (category, water depth, time period)
 *   - Risk score heatmap data integrity
 *   - Time-trend rolling average calculation
 *   - Risk category classification thresholds
 *
 * @jest-environment jsdom
 */

const {
  getRiskCategory,
  filterByCategory,
  filterByWaterDepth,
  filterByTimePeriod,
  computeRollingAverage,
  buildHeatmapMatrix,
  RISK_DATA,
  TIME_TREND_DATA,
} = require('../../demos/hse-risk-dashboard-data');

// -------------------------------------------------------------------
// getRiskCategory
// -------------------------------------------------------------------
describe('getRiskCategory', () => {
  test('score 1.0 returns LOW', () => {
    expect(getRiskCategory(1.0)).toBe('LOW');
  });

  test('score 3.0 returns LOW', () => {
    expect(getRiskCategory(3.0)).toBe('LOW');
  });

  test('score 3.1 returns MEDIUM', () => {
    expect(getRiskCategory(3.1)).toBe('MEDIUM');
  });

  test('score 5.0 returns MEDIUM', () => {
    expect(getRiskCategory(5.0)).toBe('MEDIUM');
  });

  test('score 5.1 returns HIGH', () => {
    expect(getRiskCategory(5.1)).toBe('HIGH');
  });

  test('score 7.0 returns HIGH', () => {
    expect(getRiskCategory(7.0)).toBe('HIGH');
  });

  test('score 7.1 returns CRITICAL', () => {
    expect(getRiskCategory(7.1)).toBe('CRITICAL');
  });

  test('score 10.0 returns CRITICAL', () => {
    expect(getRiskCategory(10.0)).toBe('CRITICAL');
  });
});

// -------------------------------------------------------------------
// RISK_DATA structure
// -------------------------------------------------------------------
describe('RISK_DATA structure', () => {
  test('RISK_DATA is a non-empty array', () => {
    expect(Array.isArray(RISK_DATA)).toBe(true);
    expect(RISK_DATA.length).toBeGreaterThan(0);
  });

  test('each entry has required fields', () => {
    RISK_DATA.forEach((entry) => {
      expect(typeof entry.activity_code).toBe('string');
      expect(typeof entry.activity_name).toBe('string');
      expect(typeof entry.water_depth_band).toBe('string');
      expect(typeof entry.composite_score).toBe('number');
      expect(typeof entry.acute_score).toBe('number');
      expect(typeof entry.chronic_score).toBe('number');
      expect(typeof entry.compliance_score).toBe('number');
      expect(typeof entry.incident_count).toBe('number');
      expect(typeof entry.confidence).toBe('string');
    });
  });

  test('all composite scores are within 1-10 range', () => {
    RISK_DATA.forEach((entry) => {
      expect(entry.composite_score).toBeGreaterThanOrEqual(1.0);
      expect(entry.composite_score).toBeLessThanOrEqual(10.0);
    });
  });

  test('water_depth_band values are valid', () => {
    const validBands = new Set(['shallow', 'mid', 'deep', 'all']);
    RISK_DATA.forEach((entry) => {
      expect(validBands.has(entry.water_depth_band)).toBe(true);
    });
  });

  test('confidence values are valid', () => {
    const validConf = new Set(['high', 'medium', 'low']);
    RISK_DATA.forEach((entry) => {
      expect(validConf.has(entry.confidence)).toBe(true);
    });
  });
});

// -------------------------------------------------------------------
// filterByCategory
// -------------------------------------------------------------------
describe('filterByCategory', () => {
  test('returns all entries when category is "all"', () => {
    const result = filterByCategory(RISK_DATA, 'all');
    expect(result.length).toBe(RISK_DATA.length);
  });

  test('filters to only matching activity_code prefix', () => {
    const result = filterByCategory(RISK_DATA, 'DRILLING');
    result.forEach((entry) => {
      expect(entry.activity_code.toUpperCase()).toContain('DRILL');
    });
  });

  test('returns empty array when no entries match', () => {
    const result = filterByCategory(RISK_DATA, 'NONEXISTENT_CATEGORY_XYZ');
    expect(result).toEqual([]);
  });
});

// -------------------------------------------------------------------
// filterByWaterDepth
// -------------------------------------------------------------------
describe('filterByWaterDepth', () => {
  test('returns all entries when depth is "all"', () => {
    const result = filterByWaterDepth(RISK_DATA, 'all');
    expect(result.length).toBe(RISK_DATA.length);
  });

  test('filters to only "shallow" entries', () => {
    const result = filterByWaterDepth(RISK_DATA, 'shallow');
    result.forEach((entry) => {
      expect(['shallow', 'all']).toContain(entry.water_depth_band);
    });
  });

  test('filters to only "deep" entries', () => {
    const result = filterByWaterDepth(RISK_DATA, 'deep');
    result.forEach((entry) => {
      expect(['deep', 'all']).toContain(entry.water_depth_band);
    });
  });
});

// -------------------------------------------------------------------
// filterByTimePeriod
// -------------------------------------------------------------------
describe('filterByTimePeriod', () => {
  test('returns all time-trend entries when period is "all"', () => {
    const result = filterByTimePeriod(TIME_TREND_DATA, 'all');
    expect(result.length).toBe(TIME_TREND_DATA.length);
  });

  test('returns only entries within the specified year range', () => {
    const result = filterByTimePeriod(TIME_TREND_DATA, '2015-2020');
    result.forEach((entry) => {
      expect(entry.year).toBeGreaterThanOrEqual(2015);
      expect(entry.year).toBeLessThanOrEqual(2020);
    });
  });

  test('TIME_TREND_DATA has year and composite_score fields', () => {
    TIME_TREND_DATA.forEach((entry) => {
      expect(typeof entry.year).toBe('number');
      expect(typeof entry.composite_score).toBe('number');
      expect(entry.composite_score).toBeGreaterThanOrEqual(1.0);
      expect(entry.composite_score).toBeLessThanOrEqual(10.0);
    });
  });

  test('TIME_TREND_DATA years are sorted ascending', () => {
    for (let i = 1; i < TIME_TREND_DATA.length; i++) {
      expect(TIME_TREND_DATA[i].year).toBeGreaterThan(TIME_TREND_DATA[i - 1].year);
    }
  });
});

// -------------------------------------------------------------------
// computeRollingAverage
// -------------------------------------------------------------------
describe('computeRollingAverage', () => {
  test('returns same length as input', () => {
    const data = [
      { year: 2018, composite_score: 4.0 },
      { year: 2019, composite_score: 5.0 },
      { year: 2020, composite_score: 6.0 },
      { year: 2021, composite_score: 7.0 },
    ];
    const result = computeRollingAverage(data, 3);
    expect(result.length).toBe(data.length);
  });

  test('computes correct 3-year rolling average', () => {
    const data = [
      { year: 2018, composite_score: 3.0 },
      { year: 2019, composite_score: 6.0 },
      { year: 2020, composite_score: 9.0 },
      { year: 2021, composite_score: 3.0 },
    ];
    const result = computeRollingAverage(data, 3);
    // Window of [3,6,9] = 6.0
    expect(result[2]).toBeCloseTo(6.0, 2);
  });

  test('uses partial window for early entries', () => {
    const data = [
      { year: 2018, composite_score: 4.0 },
      { year: 2019, composite_score: 6.0 },
    ];
    const result = computeRollingAverage(data, 3);
    // First entry: window = [4] -> 4.0
    expect(result[0]).toBeCloseTo(4.0, 2);
    // Second entry: window = [4, 6] -> 5.0
    expect(result[1]).toBeCloseTo(5.0, 2);
  });

  test('returns empty array for empty input', () => {
    expect(computeRollingAverage([], 3)).toEqual([]);
  });
});

// -------------------------------------------------------------------
// buildHeatmapMatrix
// -------------------------------------------------------------------
describe('buildHeatmapMatrix', () => {
  test('returns object with activities, dimensions, and z arrays', () => {
    const result = buildHeatmapMatrix(RISK_DATA);
    expect(Array.isArray(result.activities)).toBe(true);
    expect(Array.isArray(result.dimensions)).toBe(true);
    expect(Array.isArray(result.z)).toBe(true);
  });

  test('dimensions are Acute, Chronic, Compliance', () => {
    const result = buildHeatmapMatrix(RISK_DATA);
    expect(result.dimensions).toEqual(['Acute', 'Chronic', 'Compliance']);
  });

  test('z rows length matches activities length', () => {
    const result = buildHeatmapMatrix(RISK_DATA);
    expect(result.z.length).toBe(result.activities.length);
  });

  test('each z row has 3 values (one per dimension)', () => {
    const result = buildHeatmapMatrix(RISK_DATA);
    result.z.forEach((row) => {
      expect(row.length).toBe(3);
    });
  });

  test('all z values are within 1-10 range', () => {
    const result = buildHeatmapMatrix(RISK_DATA);
    result.z.forEach((row) => {
      row.forEach((val) => {
        expect(val).toBeGreaterThanOrEqual(1.0);
        expect(val).toBeLessThanOrEqual(10.0);
      });
    });
  });

  test('returns empty arrays for empty input', () => {
    const result = buildHeatmapMatrix([]);
    expect(result.activities).toEqual([]);
    expect(result.z).toEqual([]);
  });
});
