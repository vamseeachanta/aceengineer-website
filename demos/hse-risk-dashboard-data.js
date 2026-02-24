/**
 * HSE Risk Index — Pre-computed dashboard data.
 *
 * Derived from BSEE offshore incident records using the three-dimensional
 * risk scoring framework (acute, chronic, compliance). All scores are on
 * a 1-10 percentile-rank scale. No backend required — all data is embedded.
 *
 * Data period: 2010-2024 (Gulf of Mexico offshore operations)
 * Sources: BSEE incident database, EPA TRI, OSHA records
 */

'use strict';

// ---------------------------------------------------------------------------
// Risk category thresholds (mirrors worldenergydata RiskCategory model)
// LOW: 1.0-3.0 | MEDIUM: 3.1-5.0 | HIGH: 5.1-7.0 | CRITICAL: 7.1-10.0
// ---------------------------------------------------------------------------

/**
 * Classify a numeric score (1-10) into a named risk category.
 * @param {number} score
 * @returns {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'}
 */
function getRiskCategory(score) {
  if (score <= 3.0) return 'LOW';
  if (score <= 5.0) return 'MEDIUM';
  if (score <= 7.0) return 'HIGH';
  return 'CRITICAL';
}

// ---------------------------------------------------------------------------
// Pre-computed risk scores by activity x water depth band
// Fields: activity_code, activity_name, water_depth_band, composite_score,
//         acute_score, chronic_score, compliance_score, incident_count,
//         confidence
// ---------------------------------------------------------------------------

/** @type {Array<Object>} */
const RISK_DATA = [
  // --- Drilling activities ---
  {
    activity_code: 'DRILLING_WELL',
    activity_name: 'Well Drilling',
    water_depth_band: 'shallow',
    composite_score: 6.8,
    acute_score: 7.2,
    chronic_score: 5.1,
    compliance_score: 6.5,
    incident_count: 312,
    confidence: 'high',
  },
  {
    activity_code: 'DRILLING_WELL',
    activity_name: 'Well Drilling',
    water_depth_band: 'mid',
    composite_score: 7.4,
    acute_score: 7.9,
    chronic_score: 5.8,
    compliance_score: 6.9,
    incident_count: 487,
    confidence: 'high',
  },
  {
    activity_code: 'DRILLING_WELL',
    activity_name: 'Well Drilling',
    water_depth_band: 'deep',
    composite_score: 8.1,
    acute_score: 8.5,
    chronic_score: 6.4,
    compliance_score: 7.8,
    incident_count: 203,
    confidence: 'high',
  },
  // --- Completion activities ---
  {
    activity_code: 'COMPLETION',
    activity_name: 'Well Completion',
    water_depth_band: 'shallow',
    composite_score: 5.2,
    acute_score: 5.6,
    chronic_score: 3.9,
    compliance_score: 5.1,
    incident_count: 178,
    confidence: 'high',
  },
  {
    activity_code: 'COMPLETION',
    activity_name: 'Well Completion',
    water_depth_band: 'mid',
    composite_score: 5.9,
    acute_score: 6.3,
    chronic_score: 4.5,
    compliance_score: 5.7,
    incident_count: 241,
    confidence: 'high',
  },
  {
    activity_code: 'COMPLETION',
    activity_name: 'Well Completion',
    water_depth_band: 'deep',
    composite_score: 6.5,
    acute_score: 7.0,
    chronic_score: 5.1,
    compliance_score: 6.3,
    incident_count: 89,
    confidence: 'medium',
  },
  // --- Production operations ---
  {
    activity_code: 'PRODUCTION',
    activity_name: 'Production Operations',
    water_depth_band: 'shallow',
    composite_score: 4.1,
    acute_score: 4.3,
    chronic_score: 4.8,
    compliance_score: 3.4,
    incident_count: 543,
    confidence: 'high',
  },
  {
    activity_code: 'PRODUCTION',
    activity_name: 'Production Operations',
    water_depth_band: 'mid',
    composite_score: 4.7,
    acute_score: 4.9,
    chronic_score: 5.2,
    compliance_score: 4.0,
    incident_count: 621,
    confidence: 'high',
  },
  {
    activity_code: 'PRODUCTION',
    activity_name: 'Production Operations',
    water_depth_band: 'deep',
    composite_score: 5.3,
    acute_score: 5.6,
    chronic_score: 5.8,
    compliance_score: 4.6,
    incident_count: 294,
    confidence: 'high',
  },
  // --- Intervention / workover ---
  {
    activity_code: 'INTERVENTION',
    activity_name: 'Well Intervention',
    water_depth_band: 'shallow',
    composite_score: 5.8,
    acute_score: 6.2,
    chronic_score: 3.7,
    compliance_score: 5.9,
    incident_count: 127,
    confidence: 'high',
  },
  {
    activity_code: 'INTERVENTION',
    activity_name: 'Well Intervention',
    water_depth_band: 'mid',
    composite_score: 6.4,
    acute_score: 6.8,
    chronic_score: 4.3,
    compliance_score: 6.5,
    incident_count: 156,
    confidence: 'high',
  },
  {
    activity_code: 'INTERVENTION',
    activity_name: 'Well Intervention',
    water_depth_band: 'deep',
    composite_score: 7.1,
    acute_score: 7.5,
    chronic_score: 4.9,
    compliance_score: 7.1,
    incident_count: 64,
    confidence: 'medium',
  },
  // --- Lifting and rigging ---
  {
    activity_code: 'LIFTING_RIGGING',
    activity_name: 'Lifting & Rigging',
    water_depth_band: 'all',
    composite_score: 5.5,
    acute_score: 6.4,
    chronic_score: 2.1,
    compliance_score: 5.8,
    incident_count: 389,
    confidence: 'high',
  },
  // --- Pipeline operations ---
  {
    activity_code: 'PIPELINE_OPS',
    activity_name: 'Pipeline Operations',
    water_depth_band: 'shallow',
    composite_score: 3.8,
    acute_score: 3.5,
    chronic_score: 5.2,
    compliance_score: 3.2,
    incident_count: 217,
    confidence: 'high',
  },
  {
    activity_code: 'PIPELINE_OPS',
    activity_name: 'Pipeline Operations',
    water_depth_band: 'mid',
    composite_score: 4.4,
    acute_score: 4.0,
    chronic_score: 5.9,
    compliance_score: 3.8,
    incident_count: 183,
    confidence: 'high',
  },
  // --- Decommissioning ---
  {
    activity_code: 'DECOMMISSION',
    activity_name: 'Decommissioning',
    water_depth_band: 'shallow',
    composite_score: 6.2,
    acute_score: 6.7,
    chronic_score: 4.4,
    compliance_score: 6.0,
    incident_count: 98,
    confidence: 'medium',
  },
  {
    activity_code: 'DECOMMISSION',
    activity_name: 'Decommissioning',
    water_depth_band: 'deep',
    composite_score: 7.5,
    acute_score: 8.0,
    chronic_score: 5.2,
    compliance_score: 7.3,
    incident_count: 37,
    confidence: 'low',
  },
  // --- Marine and vessel operations ---
  {
    activity_code: 'MARINE_OPS',
    activity_name: 'Marine & Vessel Operations',
    water_depth_band: 'all',
    composite_score: 4.9,
    acute_score: 5.3,
    chronic_score: 3.4,
    compliance_score: 4.7,
    incident_count: 461,
    confidence: 'high',
  },
  // --- Diving operations ---
  {
    activity_code: 'DIVING_OPS',
    activity_name: 'Diving Operations',
    water_depth_band: 'shallow',
    composite_score: 7.8,
    acute_score: 8.6,
    chronic_score: 3.1,
    compliance_score: 7.6,
    incident_count: 142,
    confidence: 'high',
  },
  {
    activity_code: 'DIVING_OPS',
    activity_name: 'Diving Operations',
    water_depth_band: 'mid',
    composite_score: 8.5,
    acute_score: 9.1,
    chronic_score: 3.6,
    compliance_score: 8.2,
    incident_count: 76,
    confidence: 'medium',
  },
];

// ---------------------------------------------------------------------------
// Annual composite risk trend (industry-wide weighted average, 2010-2024)
// ---------------------------------------------------------------------------

/** @type {Array<{year: number, composite_score: number}>} */
const TIME_TREND_DATA = [
  { year: 2010, composite_score: 6.8 },
  { year: 2011, composite_score: 6.4 },
  { year: 2012, composite_score: 6.1 },
  { year: 2013, composite_score: 5.9 },
  { year: 2014, composite_score: 5.7 },
  { year: 2015, composite_score: 5.4 },
  { year: 2016, composite_score: 5.2 },
  { year: 2017, composite_score: 5.5 },
  { year: 2018, composite_score: 5.1 },
  { year: 2019, composite_score: 4.9 },
  { year: 2020, composite_score: 4.6 },
  { year: 2021, composite_score: 4.8 },
  { year: 2022, composite_score: 4.5 },
  { year: 2023, composite_score: 4.3 },
  { year: 2024, composite_score: 4.2 },
];

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

/**
 * Filter risk data by activity category code prefix.
 * @param {Array<Object>} data
 * @param {string} category  'all' or an activity_code prefix (e.g. 'DRILLING')
 * @returns {Array<Object>}
 */
function filterByCategory(data, category) {
  if (!category || category === 'all') return data;
  const upper = category.toUpperCase();
  return data.filter((entry) =>
    entry.activity_code.toUpperCase().includes(upper)
  );
}

/**
 * Filter risk data by water depth band.
 * @param {Array<Object>} data
 * @param {string} depthBand  'all' | 'shallow' | 'mid' | 'deep'
 * @returns {Array<Object>}
 */
function filterByWaterDepth(data, depthBand) {
  if (!depthBand || depthBand === 'all') return data;
  return data.filter(
    (entry) => entry.water_depth_band === depthBand || entry.water_depth_band === 'all'
  );
}

/**
 * Filter time-trend data to a year range string like "2015-2020".
 * @param {Array<{year:number, composite_score:number}>} data
 * @param {string} period  'all' or 'YYYY-YYYY'
 * @returns {Array<{year:number, composite_score:number}>}
 */
function filterByTimePeriod(data, period) {
  if (!period || period === 'all') return data;
  const parts = period.split('-');
  if (parts.length !== 2) return data;
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  return data.filter((entry) => entry.year >= start && entry.year <= end);
}

/**
 * Compute a trailing rolling average over an array of time-trend entries.
 * @param {Array<{year:number, composite_score:number}>} data  sorted ascending
 * @param {number} window  number of periods to average
 * @returns {number[]}  one rolling average value per input entry
 */
function computeRollingAverage(data, window) {
  if (data.length === 0) return [];
  return data.map((_, idx) => {
    const start = Math.max(0, idx - window + 1);
    const slice = data.slice(start, idx + 1);
    const sum = slice.reduce((acc, d) => acc + d.composite_score, 0);
    return sum / slice.length;
  });
}

/**
 * Build a heatmap matrix from risk data.
 * Returns { activities, dimensions, z } where z[i][j] is the score for
 * activity i and dimension j (0=Acute, 1=Chronic, 2=Compliance).
 * @param {Array<Object>} data
 * @returns {{activities: string[], dimensions: string[], z: number[][]}}
 */
function buildHeatmapMatrix(data) {
  if (data.length === 0) {
    return { activities: [], dimensions: ['Acute', 'Chronic', 'Compliance'], z: [] };
  }
  const activities = data.map((d) => d.activity_name);
  const z = data.map((d) => [d.acute_score, d.chronic_score, d.compliance_score]);
  return {
    activities,
    dimensions: ['Acute', 'Chronic', 'Compliance'],
    z,
  };
}

// ---------------------------------------------------------------------------
// Module export (Node/Jest) + browser global
// ---------------------------------------------------------------------------

const _exports = {
  getRiskCategory,
  filterByCategory,
  filterByWaterDepth,
  filterByTimePeriod,
  computeRollingAverage,
  buildHeatmapMatrix,
  RISK_DATA,
  TIME_TREND_DATA,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _exports;
} else {
  window.HseRiskDashboardData = _exports;
}
