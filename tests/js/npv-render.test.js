/**
 * Hardening + frozen-behaviour tests for the NPV field-development
 * calculator's INLINE page script (issue #16).
 *
 * Why a separate file: the page carries its own copy of calculateNPV /
 * displayResults / formatMoney and does NOT import
 * assets/js/npv-calculator-engine.js. tests/js/npv-calculator.test.js covers
 * the module; the inline page logic that actually ships was uncovered.
 *
 * These tests verify:
 *   - every parsed input is guarded, so no NaN can reach the DOM
 *   - results are built with DOM APIs / textContent, never innerHTML
 *   - the valid-input render is structurally unchanged (frozen behaviour)
 *
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const PAGE = path.join(
  __dirname,
  '..',
  '..',
  'content',
  'calculators',
  'npv-field-development.html'
);

const engine = require('../../assets/js/npv-calculator-engine');

// Default values mirror the `value="…"` attributes on the live inputs.
// decline_rate and opex changed under #124 to cited public figures — see the
// commit body. Everything else is as it shipped.
const FIELDS = {
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

// A named input set that reaches the VIABLE branch and produces a real IRR.
// Not a page default — a test input, used to prove those branches are live.
const VIABLE_FIELDS = Object.assign({}, FIELDS, {
  initial_rate: '40000',
  capex: '2000',
  opex: '120',
});

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

function boot(overrides) {
  const values = Object.assign({}, FIELDS, overrides || {});
  document.body.innerHTML =
    Object.keys(values)
      .map((id) => '<input type="number" id="' + id + '" value="' + values[id] + '">')
      .join('') +
    '<div id="results-card" style="display: none;"><div id="result-content"></div></div>' +
    '<div id="cashflow-chart"></div>';

  window.gtag = function () {};
  window.Plotly = { newPlot: function () {} };

  // A classic <script src> exposes the engine's declarations as globals; the
  // page depends on them the same way its sibling calculators do.
  Object.assign(window, engine);
  // Indirect eval → the script's function declarations land on `window`.
  window.eval(calculatorScript());
  window.calculateNPV();

  return document.getElementById('result-content');
}

describe('the shipped default values are valid against their own inputs', () => {
  // A default that violates its input's own step/min/max renders as :invalid
  // in the browser. Changing decline_rate to a cited 12.5 against step="1"
  // would have done exactly that.
  const inputAttrs = () => {
    const html = fs.readFileSync(PAGE, 'utf8');
    const found = {};
    for (const m of html.matchAll(/<input\b[^>]*id="([^"]+)"[^>]*>/g)) {
      const tag = m[0];
      const attr = (name) => {
        const a = tag.match(new RegExp(name + '="([^"]*)"'));
        return a ? a[1] : null;
      };
      found[m[1]] = {
        value: attr('value'),
        min: attr('min'),
        max: attr('max'),
        step: attr('step'),
      };
    }
    return found;
  };

  test.each(Object.keys(FIELDS))('%s default satisfies min, max and step', (id) => {
    const a = inputAttrs()[id];
    const value = parseFloat(a.value);
    const min = parseFloat(a.min);
    const step = parseFloat(a.step);
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(parseFloat(a.max));
    // Floating-point safe multiple check against the step base (min).
    const steps = (value - min) / step;
    expect(Math.abs(steps - Math.round(steps))).toBeLessThan(1e-9);
  });

  test('the form defaults match the values the tests assert against', () => {
    const attrs = inputAttrs();
    const fromPage = {};
    Object.keys(FIELDS).forEach((id) => {
      fromPage[id] = attrs[id].value;
    });
    expect(fromPage).toEqual(FIELDS);
  });
});

describe('NPV inline calculator — input guards', () => {
  test('a blank required field renders a validation message, not NaN', () => {
    const out = boot({ capex: '' });
    expect(out.textContent).not.toMatch(/NaN/);
    expect(out.textContent).toMatch(/valid number/i);
  });

  test.each(Object.keys(FIELDS))(
    'blanking %s produces no NaN in the results container',
    (field) => {
      const out = boot({ [field]: '' });
      expect(out.textContent).not.toMatch(/NaN/);
    }
  );

  test.each(Object.keys(FIELDS))(
    'non-numeric %s produces no NaN in the results container',
    (field) => {
      const out = boot({ [field]: 'abc' });
      expect(out.textContent).not.toMatch(/NaN/);
    }
  );

  test('a zero project life is rejected rather than producing an empty run', () => {
    const out = boot({ project_years: '0' });
    expect(out.textContent).not.toMatch(/NaN/);
    expect(out.textContent).toMatch(/valid number/i);
  });

  test('invalid input still reveals the results card so the user sees the message', () => {
    boot({ capex: '' });
    expect(document.getElementById('results-card').style.display).toBe('block');
  });

  test('invalid input does not draw the chart', () => {
    const spy = jest.fn();
    const values = Object.assign({}, FIELDS, { capex: '' });
    document.body.innerHTML =
      Object.keys(values)
        .map((id) => '<input type="number" id="' + id + '" value="' + values[id] + '">')
        .join('') +
      '<div id="results-card" style="display: none;"><div id="result-content"></div></div>' +
      '<div id="cashflow-chart"></div>';
    window.gtag = function () {};
    window.Plotly = { newPlot: spy };
    Object.assign(window, engine);
    window.eval(calculatorScript());
    window.calculateNPV();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('NPV inline calculator — DOM construction (no HTML sink)', () => {
  test('the inline script contains no innerHTML assignment', () => {
    expect(calculatorScript()).not.toMatch(/innerHTML/);
  });

  test('results are built as element nodes, not parsed markup', () => {
    const out = boot();
    // Every child is a real element created by the page, and the container
    // was cleared before the render (single result-value node).
    expect(out.querySelectorAll('.result-value')).toHaveLength(1);
    expect(out.children.length).toBeGreaterThan(0);
  });

  test('re-running the calculation replaces rather than appends results', () => {
    const out = boot();
    window.calculateNPV();
    expect(out.querySelectorAll('.result-value')).toHaveLength(1);
    expect(out.querySelectorAll('.result-label')).toHaveLength(1);
  });
});

describe('NPV inline calculator — frozen valid-input behaviour', () => {
  // CORRECTED under #124. The old pattern allowed an optional `B` before the
  // ` M` suffix, so it accepted the dimensionally incoherent `$348915.5B M`
  // that shipped. Billions-and-millions is not a unit; the headline is $M.
  test('renders the NPV headline with the money format and unit', () => {
    const out = boot();
    const headline = out.querySelector('.result-value');
    expect(headline).not.toBeNull();
    expect(headline.textContent).toMatch(/^\$-?\d+\.\d M$/);
  });

  test('no rendered result ever carries a "B M" unit string', () => {
    expect(boot().textContent).not.toMatch(/B M/);
    expect(boot(VIABLE_FIELDS).textContent).not.toMatch(/B M/);
  });

  test('the NPV label text is unchanged', () => {
    const out = boot();
    expect(out.querySelector('.result-label').textContent).toBe(
      'Net Present Value (NPV)'
    );
  });

  // CORRECTED under #124. This test used the PAGE DEFAULTS and asserted they
  // were profitable. With the units fixed they are not — the cited field loses
  // money — so the assertion is re-pointed at a named profitable input set and
  // the defaults get their own NOT VIABLE test below. The branch coverage this
  // test was providing is preserved; only the input that reaches it changed.
  test('a profitable case is classed positive and reported VIABLE', () => {
    const out = boot(VIABLE_FIELDS);
    const headline = out.querySelector('.result-value');
    expect(headline.classList.contains('positive')).toBe(true);
    expect(out.textContent).toMatch(/VIABLE/);
    expect(out.querySelector('.success-text')).not.toBeNull();
  });

  test('the NOT VIABLE branch is reached by the page defaults', () => {
    const out = boot();
    const headline = out.querySelector('.result-value');
    expect(headline.classList.contains('negative')).toBe(true);
    expect(out.textContent).toMatch(/NOT VIABLE/);
    expect(out.querySelector('.danger-text')).not.toBeNull();
  });

  test('a profitable case reports a real IRR', () => {
    // Two roots exist for this cashflow (-23.14% and +32.52% style shape);
    // the rate above which NPV stays negative is the one reported.
    const out = boot(VIABLE_FIELDS);
    expect(out.textContent).toMatch(/Internal Rate of Return: 11\.76%/);
  });

  test('a profitable case reports a payback period', () => {
    const out = boot(VIABLE_FIELDS);
    expect(out.textContent).toMatch(/Payback Period: 4\.5 years/);
  });

  test('an ambiguous IRR is disclosed to the visitor, not silently collapsed', () => {
    // This project's cashflow turns negative in its late years, so two rates
    // solve NPV = 0. Reporting one of them without saying so would present a
    // unique answer where none exists.
    const out = boot(VIABLE_FIELDS);
    expect(out.textContent).toMatch(
      /Cashflow changes sign more than once, so 2 rates solve NPV = 0/
    );
  });

  test('an unambiguous IRR carries no ambiguity note', () => {
    // Guards against the note becoming boilerplate that always renders.
    const out = boot(
      Object.assign({}, VIABLE_FIELDS, { project_years: '8', opex_escalation: '0' })
    );
    // Assert an IRR is actually REPORTED here, so the note's absence is
    // because this cashflow has exactly one root — not because the IRR was
    // refused, which would make this test pass for the wrong reason.
    expect(out.textContent).toMatch(/Internal Rate of Return: 11\.02%/);
    expect(out.textContent).not.toMatch(/changes sign more than once/);
  });

  // ENDORSED VALUES (#124), replacing the #16 characterisation block.
  //
  // The values below are no longer "whatever the page happens to emit". They
  // are computed from the model and the cited default inputs, and the page is
  // required to match them:
  //
  //   year-1 revenue after royalty = 5000 bbl/d x $70/bbl x 365 x (1-0.1875)
  //                                = $103.8M, against $16M OPEX
  //   NPV @ 10% over 20 years, 12.5%/yr decline, 3%/yr OPEX escalation
  //                                = -$245.166196... M  ->  "$-245.2 M"
  //   total undiscounted profit / CAPEX = -0.33553872...  ->  "-0.34x"
  //
  // The old expectations were $348915.5B M and 1162054.01x. Those were pinned
  // deliberately by PR #123 as CHARACTERISATION, NOT ENDORSEMENT, precisely so
  // this change would have to be made on purpose. They were wrong by a factor
  // of ~1e6 because revenue was computed in dollars and costs in $M.
  test('the default-input headline value is the corrected $M figure', () => {
    const out = boot();
    expect(out.querySelector('.result-value').textContent).toBe('$-245.2 M');
  });

  test('the default-input profit ratio is the corrected figure', () => {
    const out = boot();
    expect(out.textContent).toMatch(/Profit-to-Investment Ratio: -0\.34x/);
  });

  // CORRECTED under #124. This asserted `Payback Period: 1.0 years`, which was
  // an artefact of revenue being ~1e6 too large — the project "repaid" its
  // CAPEX in year one for any input at all. The cited defaults never repay.
  test('IRR and payback lines are both present', () => {
    const out = boot();
    expect(out.textContent).toMatch(/Internal Rate of Return:/);
    expect(out.textContent).toMatch(/Payback Period: No payback within project life/);
  });

  // RE-POINTED under #124, and this is the subtle one. The string
  // "Not calculable" survived the fix while its MEANING inverted: it used to
  // mean "bisection exhausted 100 iterations against an absolute tolerance it
  // could never meet", and now it would mean "no root exists". A test that
  // keeps passing for a changed reason is worse than one that fails, so the
  // page now distinguishes the two outcomes and this test pins the specific
  // one the defaults actually produce.
  test('the defaults report no IRR because no root exists, not a convergence failure', () => {
    const out = boot();
    expect(out.textContent).toMatch(/No IRR in the -50% to 200% range/);
    expect(out.textContent).not.toMatch(/did not converge/);
    const danger = [...out.querySelectorAll('.danger-text')].map((el) => el.textContent);
    expect(danger).toContain('No IRR in the -50% to 200% range');
  });

  test('"no root" and "did not converge" are different rendered strings', () => {
    // The engine is the authority on which outcome occurred; the page must not
    // collapse them into one message the way the shipped code collapsed every
    // failure into a bare null.
    boot(); // loads the page script, which exposes irrMessage
    const noRoot = engine.calcIRRResult(100, [-10, -10, -10]);
    const notConverged = engine.calcIRRResult(100, [40, 40, 40], {
      maxIterations: 1,
    });
    expect(noRoot.status).toBe('no-root');
    expect(notConverged.status).toBe('not-converged');
    expect(window.irrMessage(noRoot)).not.toBe(window.irrMessage(notConverged));
  });

  test('the results card is revealed on a successful calculation', () => {
    boot();
    expect(document.getElementById('results-card').style.display).toBe('block');
  });

  test('the chart is drawn for valid input', () => {
    const spy = jest.fn();
    const values = Object.assign({}, FIELDS);
    document.body.innerHTML =
      Object.keys(values)
        .map((id) => '<input type="number" id="' + id + '" value="' + values[id] + '">')
        .join('') +
      '<div id="results-card" style="display: none;"><div id="result-content"></div></div>' +
      '<div id="cashflow-chart"></div>';
    window.gtag = function () {};
    window.Plotly = { newPlot: spy };
    Object.assign(window, engine);
    window.eval(calculatorScript());
    window.calculateNPV();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
