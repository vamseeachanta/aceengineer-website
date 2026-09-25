/**
 * DNV-RP-C203 curve parameters in the fatigue S-N calculator.
 *
 * The comparator is the standard's tables, not the calculator itself:
 * log a1 and m1 (N <= 1e7 in air, N <= 1e6 in seawater with cathodic
 * protection) are checked against Table 2-1 (air) and Table 2-2
 * (seawater with cathodic protection) of the 2011 edition. For these
 * classes the values are the same in the 2021 edition the calculator is
 * labelled with. Only the classes the calculator already lists are
 * checked; no class is added.
 *
 * Both tracked copies of the page are checked: content/calculators/ (the
 * source the build renders into dist/) and the legacy calculators/ copy.
 *
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const PAGES = [
  'content/calculators/fatigue-sn-curve.html',
  'calculators/fatigue-sn-curve.html',
];

// [m1, log a1 in air, log a1 in seawater with cathodic protection]
const DNV_C203 = {
  B1: [4.0, 15.117, 14.917],
  B2: [4.0, 14.885, 14.685],
  C: [3.0, 12.592, 12.192],
  C1: [3.0, 12.449, 12.049],
  C2: [3.0, 12.301, 11.901],
  D: [3.0, 12.164, 11.764],
  E: [3.0, 12.010, 11.610],
  F: [3.0, 11.855, 11.455],
  F1: [3.0, 11.699, 11.299],
  F3: [3.0, 11.546, 11.146],
  G: [3.0, 11.398, 10.998],
  W1: [3.0, 11.261, 10.861],
  W2: [3.0, 11.107, 10.707],
  W3: [3.0, 10.970, 10.570],
  T: [3.0, 12.164, 11.764],
};

function loadSnCurves(relPath) {
  const html = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const marker = 'const snCurves = ';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`snCurves not found in ${relPath}`);
  let i = start + marker.length;
  let depth = 0;
  let end = -1;
  for (; i < html.length; i += 1) {
    if (html[i] === '{') depth += 1;
    if (html[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error(`unbalanced snCurves object in ${relPath}`);
  return vm.runInNewContext(`(${html.slice(start + marker.length, end)})`);
}

describe.each(PAGES)('%s', (relPath) => {
  const dnv = loadSnCurves(relPath).dnv.curves;

  test('lists no DNV class outside the verified table set', () => {
    for (const key of Object.keys(dnv)) {
      expect(Object.keys(DNV_C203)).toContain(key);
    }
  });

  test.each(Object.keys(DNV_C203))('class %s matches Tables 2-1 and 2-2', (key) => {
    const curve = dnv[key];
    if (curve === undefined) return; // absent classes are not added
    const [m1, logAir, logCp] = DNV_C203[key];
    expect(curve.m1).toBe(m1);
    expect(curve.m_sw).toBe(m1);
    expect(curve.log_a_air).toBeCloseTo(logAir, 3);
    expect(curve.log_a_sw).toBeCloseTo(logCp, 3);
  });
});
