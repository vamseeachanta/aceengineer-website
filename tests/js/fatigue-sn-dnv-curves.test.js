/**
 * DNV-RP-C203 S-N curves used by the public fatigue calculators.
 *
 * The comparator is the standard's tables, not the calculators themselves.
 * Reference edition: DNV-RP-C203, October 2011, Table 2-1 (in air),
 * Table 2-2 (seawater with cathodic protection) and Table 2-3 (seawater,
 * free corrosion). For the air and cathodic-protection curves of the classes
 * checked here the values are the same in the 2021 edition the calculators
 * are labelled with. Only the classes the calculators already list are
 * checked; no class is added.
 *
 * What is checked:
 *   - air and CP curves are bilinear: m1, log a1 up to the knee, then
 *     m2 = 5 and log a2; the knee is 1e7 cycles in air and 1e6 with CP;
 *   - free-corrosion curves are single slope, m = 3, with their own
 *     intercepts (not the CP intercept minus 0.3);
 *   - computed lives on both segments at representative stress ranges;
 *   - the low-cycle cap: below 1e5 cycles the allowable curve is capped at
 *     the B1 curve of the same environment (air: section 2.4.4; CP: 2.4.5);
 *     no cap is stated for free corrosion.
 *
 * The same engine is loaded by both calculators and both tracked copies of
 * each page (content/calculators/ is the build source; calculators/ is the
 * legacy copy). The page tests run each page's own script against the engine.
 *
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..', '..');
const ENGINE_PATH = path.join(ROOT, 'assets/js/dnv-c203-sn-engine.js');
const engine = require(ENGINE_PATH);

const SN_PAGES = [
  'content/calculators/fatigue-sn-curve.html',
  'calculators/fatigue-sn-curve.html',
];
const LIFE_PAGES = [
  'content/calculators/fatigue-life-calculator.html',
  'calculators/fatigue-life-calculator.html',
];

// Reference values, 2011 edition. Air and CP: [m1, log a1, m2, log a2].
// Free corrosion: log a (m = 3, single slope).
const AIR = {
  B1: [4.0, 15.117, 5.0, 17.146],
  B2: [4.0, 14.885, 5.0, 16.856],
  C: [3.0, 12.592, 5.0, 16.320],
  C1: [3.0, 12.449, 5.0, 16.081],
  C2: [3.0, 12.301, 5.0, 15.835],
  D: [3.0, 12.164, 5.0, 15.606],
  E: [3.0, 12.010, 5.0, 15.350],
  F: [3.0, 11.855, 5.0, 15.091],
  F1: [3.0, 11.699, 5.0, 14.832],
  F3: [3.0, 11.546, 5.0, 14.576],
  G: [3.0, 11.398, 5.0, 14.330],
  W1: [3.0, 11.261, 5.0, 14.101],
  W2: [3.0, 11.107, 5.0, 13.845],
  W3: [3.0, 10.970, 5.0, 13.617],
  T: [3.0, 12.164, 5.0, 15.606],
};
const CP = {
  B1: [4.0, 14.917, 5.0, 17.146],
  B2: [4.0, 14.685, 5.0, 16.856],
  C: [3.0, 12.192, 5.0, 16.320],
  C1: [3.0, 12.049, 5.0, 16.081],
  C2: [3.0, 11.901, 5.0, 15.835],
  D: [3.0, 11.764, 5.0, 15.606],
  E: [3.0, 11.610, 5.0, 15.350],
  F: [3.0, 11.455, 5.0, 15.091],
  F1: [3.0, 11.299, 5.0, 14.832],
  F3: [3.0, 11.146, 5.0, 14.576],
  G: [3.0, 10.998, 5.0, 14.330],
  W1: [3.0, 10.861, 5.0, 14.101],
  W2: [3.0, 10.707, 5.0, 13.845],
  W3: [3.0, 10.570, 5.0, 13.617],
  T: [3.0, 11.764, 5.0, 15.606],
};
const FC = {
  B1: 12.436,
  B2: 12.262,
  C: 12.115,
  C1: 11.972,
  C2: 11.824,
  D: 11.687,
  E: 11.533,
  F: 11.378,
  F1: 11.222,
  F3: 11.068,
  G: 10.921,
  W1: 10.784,
  W2: 10.630,
  W3: 10.493,
  T: 11.687,
};
const KNEE = { air: 1e7, seawater_cp: 1e6 };
const CLASSES = Object.keys(AIR);

// Independent reference implementation of the curve, used for grid checks.
function refLogN(cls, env, S) {
  const logS = Math.log10(S);
  if (env === 'free_corrosion') return FC[cls] - 3.0 * logS;
  const [m1, a1, m2, a2] = (env === 'air' ? AIR : CP)[cls];
  const logN1 = a1 - m1 * logS;
  const logN = logN1 <= Math.log10(KNEE[env]) ? logN1 : a2 - m2 * logS;
  if (logN < 5) {
    const [bm1, ba1] = (env === 'air' ? AIR : CP).B1;
    return Math.min(logN, ba1 - bm1 * logS);
  }
  return logN;
}

describe('engine: curve parameters', () => {
  test('lists exactly the classes the calculators list, and no others', () => {
    expect(Object.keys(engine.CURVES).sort()).toEqual([...CLASSES].sort());
  });

  test('names the reference edition', () => {
    expect(engine.REFERENCE).toMatch(/DNV-RP-C203/);
    expect(engine.REFERENCE).toMatch(/2011/);
  });

  describe.each([
    ['air', AIR],
    ['seawater_cp', CP],
  ])('%s: bilinear curves', (env, table) => {
    test.each(CLASSES)('class %s: m1, log a1, m2, log a2 and knee', (cls) => {
      const p = engine.curveParams(cls, env);
      const [m1, a1, m2, a2] = table[cls];
      expect(p.m1).toBe(m1);
      expect(p.log_a1).toBeCloseTo(a1, 3);
      expect(p.m2).toBe(m2);
      expect(p.log_a2).toBeCloseTo(a2, 3);
      expect(p.knee_cycles).toBe(KNEE[env]);
    });

    test.each(CLASSES)('class %s: the two segments meet at the knee', (cls) => {
      const p = engine.curveParams(cls, env);
      const logKnee = Math.log10(p.knee_cycles);
      const logS1 = (p.log_a1 - logKnee) / p.m1;
      const logS2 = (p.log_a2 - logKnee) / p.m2;
      expect(Math.abs(logS1 - logS2)).toBeLessThan(0.002);
    });
  });

  describe('free corrosion: single slope (Table 2-3)', () => {
    test.each(CLASSES)('class %s: m = 3 and its own log a, no second segment', (cls) => {
      const p = engine.curveParams(cls, 'free_corrosion');
      expect(p.m1).toBe(3.0);
      expect(p.log_a1).toBeCloseTo(FC[cls], 3);
      expect(p.m2).toBeNull();
      expect(p.log_a2).toBeNull();
      expect(p.knee_cycles).toBeNull();
    });

    test.each(CLASSES)('class %s: not derived as CP log a minus 0.3', (cls) => {
      const p = engine.curveParams(cls, 'free_corrosion');
      expect(p.log_a1).not.toBeCloseTo(CP[cls][1] - 0.3, 3);
    });

    test('page environment names map to free corrosion', () => {
      expect(engine.curveParams('D', 'seawater_fc')).toEqual(engine.curveParams('D', 'free_corrosion'));
      expect(engine.curveParams('D', 'seawater_free')).toEqual(engine.curveParams('D', 'free_corrosion'));
    });
  });

  test('rejects an unknown class or environment', () => {
    expect(() => engine.curveParams('X', 'air')).toThrow();
    expect(() => engine.curveParams('D', 'fresh_water')).toThrow();
  });
});

describe('engine: computed lives', () => {
  // Expected values are hand-computed from the reference table:
  // N = 10^(log a - m log S) on the governing segment.
  test.each([
    // class, environment, S (MPa), expected N, segment
    ['D', 'air', 100, 10 ** (12.164 - 3 * 2), 1],
    ['D', 'air', 30, 10 ** (15.606 - 5 * Math.log10(30)), 2],
    ['B1', 'air', 150, 10 ** (15.117 - 4 * Math.log10(150)), 1],
    ['B1', 'air', 80, 10 ** (17.146 - 5 * Math.log10(80)), 2],
    ['T', 'seawater_cp', 100, 10 ** (11.764 - 3 * 2), 1],
    ['T', 'seawater_cp', 40, 10 ** (15.606 - 5 * Math.log10(40)), 2],
    ['F3', 'seawater_cp', 20, 10 ** (14.576 - 5 * Math.log10(20)), 2],
    ['D', 'free_corrosion', 100, 10 ** (11.687 - 3 * 2), 1],
    ['D', 'free_corrosion', 20, 10 ** (11.687 - 3 * Math.log10(20)), 1],
    ['B1', 'free_corrosion', 200, 10 ** (12.436 - 3 * Math.log10(200)), 1],
  ])('%s %s at %d MPa', (cls, env, S, expected, segment) => {
    const r = engine.allowableCycles(cls, env, S);
    expect(r.N / expected).toBeCloseTo(1, 9);
    expect(r.segment).toBe(segment);
    expect(r.capped).toBe(false);
  });

  test('T curve with CP at 40 MPa is about 39.4e6 cycles, not 9.1e6 single-slope', () => {
    const r = engine.allowableCycles('T', 'seawater_cp', 40);
    expect(r.N).toBeGreaterThan(39.0e6);
    expect(r.N).toBeLessThan(39.8e6);
  });

  test('D curve free corrosion at 100 MPa uses log a 11.687, not 11.464', () => {
    const r = engine.allowableCycles('D', 'free_corrosion', 100);
    expect(r.logN).toBeCloseTo(5.687, 6);
  });

  test.each(['air', 'seawater_cp', 'free_corrosion'])(
    '%s: every class matches the reference over 5 to 1000 MPa',
    (env) => {
      for (const cls of CLASSES) {
        for (let S = 5; S <= 1000; S *= 1.07) {
          expect(engine.allowableCycles(cls, env, S).logN).toBeCloseTo(refLogN(cls, env, S), 9);
        }
      }
    },
  );

  test('rejects a non-positive or non-finite stress range', () => {
    expect(() => engine.allowableCycles('D', 'air', 0)).toThrow();
    expect(() => engine.allowableCycles('D', 'air', -5)).toThrow();
    expect(() => engine.allowableCycles('D', 'air', NaN)).toThrow();
  });
});

describe('engine: low-cycle cap at the B1 curve below 1e5 cycles', () => {
  test('air: C at 400 MPa is capped at the air B1 curve (2.4.4)', () => {
    const r = engine.allowableCycles('C', 'air', 400);
    const b1 = 10 ** (15.117 - 4 * Math.log10(400));
    expect(r.capped).toBe(true);
    expect(r.N / b1).toBeCloseTo(1, 9);
    expect(r.N).toBeLessThan(10 ** (12.592 - 3 * Math.log10(400)));
  });

  test('CP: C at 600 MPa is capped at the CP B1 curve (2.4.5), not the air B1 curve', () => {
    const r = engine.allowableCycles('C', 'seawater_cp', 600);
    const b1cp = 10 ** (14.917 - 4 * Math.log10(600));
    expect(r.capped).toBe(true);
    expect(r.N / b1cp).toBeCloseTo(1, 9);
  });

  test('CP: C at 400 MPa is below its own curve cap; B1 gives more cycles, so no cap', () => {
    const r = engine.allowableCycles('C', 'seawater_cp', 400);
    expect(r.capped).toBe(false);
    expect(r.N / 10 ** (12.192 - 3 * Math.log10(400))).toBeCloseTo(1, 9);
  });

  test('air: no cap at or above 1e5 cycles, even where B1 is marginally lower', () => {
    // C in air at 335 MPa: own curve about 1.04e5 cycles, B1 marginally fewer.
    const r = engine.allowableCycles('C', 'air', 335);
    expect(r.N).toBeGreaterThanOrEqual(1e5);
    expect(r.capped).toBe(false);
    expect(r.N / 10 ** (12.592 - 3 * Math.log10(335))).toBeCloseTo(1, 9);
  });

  test('free corrosion: no cap is stated, so none is applied', () => {
    expect(engine.lowCycleCapCurve('free_corrosion')).toBeNull();
    expect(engine.lowCycleCapCurve('air')).toBe('B1');
    expect(engine.lowCycleCapCurve('seawater_cp')).toBe('B1');
    const r = engine.allowableCycles('C', 'free_corrosion', 800);
    expect(r.capped).toBe(false);
    expect(r.N / 10 ** (12.115 - 3 * Math.log10(800))).toBeCloseTo(1, 9);
  });

  test('the cap never raises a life', () => {
    for (const env of ['air', 'seawater_cp']) {
      for (const cls of CLASSES) {
        for (let S = 100; S <= 2000; S *= 1.1) {
          const r = engine.allowableCycles(cls, env, S);
          const [m1, a1, m2, a2] = (env === 'air' ? AIR : CP)[cls];
          const logS = Math.log10(S);
          const logN1 = a1 - m1 * logS;
          const own = logN1 <= Math.log10(KNEE[env]) ? logN1 : a2 - m2 * logS;
          expect(r.logN).toBeLessThanOrEqual(own + 1e-12);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Pages: each copy loads the engine and computes with it.
// ---------------------------------------------------------------------------

const ENGINE_SRC = fs.readFileSync(ENGINE_PATH, 'utf8');

function inlineScripts(html) {
  const out = [];
  const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/.test(attrs) || /application\/ld\+json/.test(attrs)) continue;
    if (/gtag\('config'/.test(m[2])) continue; // analytics bootstrap
    out.push(m[2]);
  }
  return out;
}

function loadPage(relPath) {
  const html = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/gi, ''), {
    runScripts: 'outside-only',
  });
  const w = dom.window;
  w.gtag = () => {};
  w.Plotly = { newPlot: (id, traces) => { w.__traces = traces; } };
  w.alert = () => {};
  w.eval(ENGINE_SRC);
  // One evaluation, so the page's top-level const bindings are visible to the export line.
  w.eval(`${inlineScripts(html).join('\n;\n')}\n;window.__snCurves = typeof snCurves === 'undefined' ? undefined : snCurves;`);
  return { w, html };
}

describe.each([...SN_PAGES, ...LIFE_PAGES])('%s', (relPath) => {
  const html = fs.readFileSync(path.join(ROOT, relPath), 'utf8');

  test('loads the shared DNV-RP-C203 engine', () => {
    expect(html).toMatch(/<script[^>]+src="[^"]*assets\/js\/dnv-c203-sn-engine\.js"/);
  });

  test('carries no DNV curve parameters of its own (the engine is the single source)', () => {
    expect(html).not.toMatch(/seawater_free:\s*\{\s*loga1/);
    if (SN_PAGES.includes(relPath)) {
      const { w } = loadPage(relPath);
      for (const entry of Object.values(w.__snCurves.dnv.curves)) {
        expect(Object.keys(entry)).toEqual(['desc']);
      }
    }
  });

  test('lists only engine classes for DNV', () => {
    const { w } = loadPage(relPath);
    const listed = SN_PAGES.includes(relPath)
      ? Object.keys(w.__snCurves.dnv.curves)
      : Array.from(w.document.querySelectorAll('#snCurve option')).map((o) => o.value);
    expect(listed.sort()).toEqual([...CLASSES].sort());
  });
});

describe.each(SN_PAGES)('%s computes DNV lives with the engine', (relPath) => {
  function run(cls, env, S) {
    const { w } = loadPage(relPath);
    w.document.getElementById('standard').value = 'dnv';
    w.updateCurveOptions();
    w.document.getElementById('curve').value = cls;
    w.document.getElementById('environment').value = env;
    w.document.getElementById('stress_range').value = String(S);
    w.document.getElementById('scf').value = '1.0';
    w.document.getElementById('cycles').value = '1000000';
    w.calculateFatigue();
    return w;
  }

  test.each([
    ['T', 'seawater_cp', 40],
    ['D', 'air', 30],
    ['D', 'seawater_fc', 100],
    ['C', 'air', 400],
  ])('%s %s at %d MPa: damage uses the engine life', (cls, env, S) => {
    const w = run(cls, env, S);
    const expected = engine.allowableCycles(cls, env, S).N;
    const text = w.document.getElementById('result-content').textContent;
    const d = /Fatigue Damage \(D\):\s*([0-9.]+)/.exec(text);
    expect(d).not.toBeNull();
    expect(parseFloat(d[1])).toBeCloseTo(1e6 / expected, 4);
  });

  test('plotted DNV curve follows the engine on both segments', () => {
    const w = run('T', 'seawater_cp', 40);
    const trace = w.__traces[0];
    expect(trace.x.length).toBeGreaterThan(10);
    trace.x.forEach((N, i) => {
      expect(Math.log10(N)).toBeCloseTo(engine.allowableCycles('T', 'seawater_cp', trace.y[i]).logN, 9);
    });
  });
});

describe.each(LIFE_PAGES)('%s computes DNV lives with the engine', (relPath) => {
  test.each([
    ['T', 'seawater_cp', 40],
    ['D', 'air', 30],
    ['D', 'seawater_free', 100],
    ['B1', 'seawater_free', 200],
    ['C', 'air', 400],
  ])('%s %s at %d MPa (t = 25 mm)', (cls, env, S) => {
    const { w } = loadPage(relPath);
    w.document.getElementById('snCurve').value = cls;
    w.document.getElementById('environment').value = env;
    w.document.getElementById('stressRange').value = String(S);
    w.document.getElementById('thickness').value = '25';
    w.calculateFatigue();
    const logN = parseFloat(w.document.getElementById('logN').textContent);
    expect(logN).toBeCloseTo(engine.allowableCycles(cls, env, S).logN, 3);
  });
});
