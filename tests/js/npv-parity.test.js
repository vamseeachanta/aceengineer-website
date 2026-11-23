/**
 * Parity between the SHIPPED page and the TESTED engine (issue #124).
 *
 * Why this file exists: `content/calculators/npv-field-development.html`
 * carried its own copy of the economics and `assets/js/npv-calculator-engine.js`
 * carried another. Nothing anywhere asserted that the two agreed, so they
 * drifted — the page mixed dollars and $M for six orders of magnitude while
 * the engine stayed dollars-coherent, and no test noticed.
 *
 * The page now computes in $M via the engine's primitives. This suite checks
 * that against the engine's INDEPENDENT composite path (`buildYearlyCashflows`,
 * which works in dollars), converted at the unit boundary. Two different routes
 * through the engine must land on the same number.
 *
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const engine = require('../../assets/js/npv-calculator-engine');

const PAGE = path.join(
  __dirname,
  '..',
  '..',
  'content',
  'calculators',
  'npv-field-development.html'
);

// The unit boundary. 1e6 is the definition of "million", not a tuned constant.
const DOLLARS_PER_MILLION = 1e6;

// Agreement threshold. The two paths differ only by floating-point ordering,
// so this is far tighter than anything the page can display (toFixed(1) on $M).
const PARITY_TOLERANCE = 1e-9;

function calculatorScript() {
  const html = fs.readFileSync(PAGE, 'utf8');
  const blocks = [
    ...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1]);
  const src = blocks.find((b) => b.includes('function calculateNPV'));
  if (!src) {
    throw new Error('inline calculator script not found in ' + PAGE);
  }
  return src;
}

const FIELD_IDS = [
  'initial_rate',
  'decline_rate',
  'project_years',
  'oil_price',
  'price_escalation',
  'capex',
  'opex',
  'opex_escalation',
  'discount_rate',
  'tax_rate',
  'royalty_rate',
];

/**
 * Run the page exactly as a browser would: engine globals in scope, then the
 * page's own inline script, then a click on Calculate.
 */
function runPage(inputs) {
  document.body.innerHTML =
    FIELD_IDS.map(
      (id) => '<input type="number" id="' + id + '" value="' + inputs[id] + '">'
    ).join('') +
    '<div id="results-card" style="display: none;"><div id="result-content"></div></div>' +
    '<div id="cashflow-chart"></div>';

  window.gtag = function () {};
  window.Plotly = { newPlot: function () {} };
  // A classic <script src> exposes the engine's declarations as globals.
  Object.assign(window, engine);
  window.eval(calculatorScript());
  return window.calculateNPV();
}

/**
 * The engine's own composite route, in dollars, reduced to $M for comparison.
 */
function runEngine(inputs) {
  const capexM = parseFloat(inputs.capex);
  const capexDollars = capexM * DOLLARS_PER_MILLION;

  const cf = engine.buildYearlyCashflows({
    initialRate: parseFloat(inputs.initial_rate),
    declineRate: parseFloat(inputs.decline_rate) / 100,
    projectYears: parseInt(inputs.project_years, 10),
    oilPrice: parseFloat(inputs.oil_price),
    priceEscalation: parseFloat(inputs.price_escalation) / 100,
    opex: parseFloat(inputs.opex) * DOLLARS_PER_MILLION,
    opexEscalation: parseFloat(inputs.opex_escalation) / 100,
    taxRate: parseFloat(inputs.tax_rate) / 100,
    royaltyRate: parseFloat(inputs.royalty_rate) / 100,
    initialCumulative: -capexDollars,
  });

  const npvDollars = engine.calcNPV(
    capexDollars,
    cf.netCashflow,
    parseFloat(inputs.discount_rate) / 100
  );
  const irrResult = engine.calcIRRResult(capexDollars, cf.netCashflow);
  const totalProfit = cf.cumulativeCashflow[cf.cumulativeCashflow.length - 1];

  return {
    npv: npvDollars / DOLLARS_PER_MILLION,
    irr: irrResult.irr,
    irrStatus: irrResult.status,
    payback: engine.calcPayback(cf.cumulativeCashflow, cf.years),
    profitRatio: totalProfit / capexDollars,
  };
}

// Five named input sets. The defaults, plus sets chosen to reach the branches
// the issue reports as dead: NOT VIABLE, no-payback, and a viable project with
// a real IRR. None of these are page defaults; they are test inputs.
const CITED_DEFAULTS = {
  initial_rate: '5000',
  decline_rate: '12.5',
  project_years: '20',
  oil_price: '70',
  price_escalation: '2',
  capex: '500',
  opex: '16',
  opex_escalation: '3',
  discount_rate: '10',
  tax_rate: '21',
  royalty_rate: '18.75',
};

const INPUT_SETS = [
  ['the page defaults', CITED_DEFAULTS],
  [
    'a viable project',
    Object.assign({}, CITED_DEFAULTS, {
      initial_rate: '40000',
      capex: '2000',
      opex: '120',
    }),
  ],
  [
    'a loss-making project',
    Object.assign({}, CITED_DEFAULTS, { oil_price: '25', opex: '120' }),
  ],
  [
    'no royalty and no tax',
    Object.assign({}, CITED_DEFAULTS, { royalty_rate: '0', tax_rate: '0' }),
  ],
  [
    'a short-life, high-rate project',
    Object.assign({}, CITED_DEFAULTS, {
      initial_rate: '25000',
      project_years: '8',
      capex: '900',
      opex: '60',
    }),
  ],
];

describe('the page and the engine agree', () => {
  test.each(INPUT_SETS)('NPV agrees for %s', (_label, inputs) => {
    const page = runPage(inputs);
    const expected = runEngine(inputs);
    expect(Math.abs(page.npv - expected.npv)).toBeLessThan(PARITY_TOLERANCE);
  });

  test.each(INPUT_SETS)('the profit ratio agrees for %s', (_label, inputs) => {
    const page = runPage(inputs);
    const expected = runEngine(inputs);
    expect(Math.abs(page.profitRatio - expected.profitRatio)).toBeLessThan(
      PARITY_TOLERANCE
    );
  });

  test.each(INPUT_SETS)('the IRR outcome agrees for %s', (_label, inputs) => {
    const page = runPage(inputs);
    const expected = runEngine(inputs);
    expect(page.irrStatus).toBe(expected.irrStatus);
    if (expected.irr === null) {
      expect(page.irr).toBeNull();
    } else {
      expect(Math.abs(page.irr - expected.irr)).toBeLessThan(PARITY_TOLERANCE);
    }
  });

  test.each(INPUT_SETS)('payback agrees for %s', (_label, inputs) => {
    const page = runPage(inputs);
    const expected = runEngine(inputs);
    if (expected.payback === null) {
      expect(page.payback).toBeNull();
    } else {
      expect(Math.abs(page.payback - expected.payback)).toBeLessThan(
        PARITY_TOLERANCE
      );
    }
  });
});

describe('the unit conversion happens in exactly one place', () => {
  test('the inline script divides by the named constant exactly once', () => {
    const src = calculatorScript();
    const conversions = src.match(/\/\s*DOLLARS_PER_MILLION/g) || [];
    expect(conversions).toHaveLength(1);
  });

  test('the inline script contains no bare magnitude literal', () => {
    // The chart used to carry four separate `/ 1e6` conversions while the
    // headline carried none, which is how the two drifted apart. The unit is
    // defined once, in the engine, and the page names it.
    const literals = calculatorScript().match(/\b(1e6|1000000)\b/g) || [];
    expect(literals).toHaveLength(0);
  });

  test('the constant is defined once, in the engine', () => {
    const engineSrc = fs.readFileSync(
      path.join(__dirname, '..', '..', 'assets', 'js', 'npv-calculator-engine.js'),
      'utf8'
    );
    const definitions =
      engineSrc.match(/const\s+DOLLARS_PER_MILLION\s*=\s*1e6\s*;/g) || [];
    expect(definitions).toHaveLength(1);
    expect(engine.DOLLARS_PER_MILLION).toBe(1e6);
  });
});

describe('the page loads the tested engine rather than duplicating it', () => {
  const html = () => fs.readFileSync(PAGE, 'utf8');

  test('the engine is referenced as a script dependency', () => {
    expect(html()).toMatch(
      /<script src="\{\{ rootPath \}\}assets\/js\/npv-calculator-engine\.js"><\/script>/
    );
  });

  test('the engine is loaded BEFORE the inline script that calls it', () => {
    // The page's inline script resolves calcIRRResult and DOLLARS_PER_MILLION
    // as globals contributed by a separate classic <script>. If that tag ever
    // moves below the inline block, the page throws on the first click.
    //
    // Verified against the built artifact with real classic-script semantics:
    // the engine's top-level `const` lands in the global LEXICAL environment,
    // not on window. It resolves by identifier lookup, which is why this
    // ordering — not window assignment — is what the page actually depends on.
    const src = fs.readFileSync(PAGE, 'utf8');
    const enginePos = src.indexOf('npv-calculator-engine.js');
    const inlinePos = src.indexOf('function calculateNPV');
    expect(enginePos).toBeGreaterThan(-1);
    expect(inlinePos).toBeGreaterThan(-1);
    expect(enginePos).toBeLessThan(inlinePos);
  });

  test('the page no longer defines its own IRR routine', () => {
    expect(calculatorScript()).not.toMatch(/function\s+calculateIRR\b/);
  });

  test('the page no longer defines its own payback routine', () => {
    expect(calculatorScript()).not.toMatch(/function\s+calculatePayback\b/);
  });

  test('the page no longer defines its own formatMoney', () => {
    expect(calculatorScript()).not.toMatch(/function\s+formatMoney\b/);
  });
});
