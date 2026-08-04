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

// Default values mirror the `value="…"` attributes on the live inputs.
const FIELDS = {
  initial_rate: '5000',
  decline_rate: '15',
  project_years: '20',
  oil_price: '70',
  price_escalation: '2',
  capex: '500',
  opex: '50',
  opex_escalation: '3',
  discount_rate: '10',
  tax_rate: '21',
  royalty_rate: '18.75',
};

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

  // Indirect eval → the script's function declarations land on `window`.
  window.eval(calculatorScript());
  window.calculateNPV();

  return document.getElementById('result-content');
}

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
  test('renders the NPV headline with the money format and unit', () => {
    const out = boot();
    const headline = out.querySelector('.result-value');
    expect(headline).not.toBeNull();
    expect(headline.textContent).toMatch(/^\$-?[\d.]+B? M$/);
  });

  test('the NPV label text is unchanged', () => {
    const out = boot();
    expect(out.querySelector('.result-label').textContent).toBe(
      'Net Present Value (NPV)'
    );
  });

  test('a profitable case is classed positive and reported VIABLE', () => {
    const out = boot();
    const headline = out.querySelector('.result-value');
    expect(headline.classList.contains('positive')).toBe(true);
    expect(out.textContent).toMatch(/VIABLE/);
    expect(out.querySelector('.success-text')).not.toBeNull();
  });

  // CHARACTERISATION, NOT ENDORSEMENT.
  //
  // The shipped inline maths mixes units: annual revenue is computed in
  // DOLLARS (rate * price * 365) while capex/opex are entered in $M, so the
  // headline is ~6 orders of magnitude too large and the IRR bisection never
  // converges (hence "Not calculable" on every run). That is a correctness
  // defect in its own right and is explicitly OUT OF SCOPE for #16, which is a
  // security/hardening issue.
  //
  // These tests pin the CURRENT numbers precisely so the innerHTML -> DOM
  // refactor is provably behaviour-preserving. When the units defect is fixed
  // under its own issue, these expectations must be updated deliberately.
  test('the default-input headline value is unchanged by the refactor', () => {
    const out = boot();
    expect(out.querySelector('.result-value').textContent).toBe('$348915.5B M');
  });

  test('the default-input profit ratio is unchanged by the refactor', () => {
    const out = boot();
    expect(out.textContent).toMatch(/Profit-to-Investment Ratio: 1162054\.01x/);
  });

  test('IRR and payback lines are both present', () => {
    const out = boot();
    expect(out.textContent).toMatch(/Internal Rate of Return:/);
    expect(out.textContent).toMatch(/Payback Period: 1\.0 years/);
  });

  test('the non-converging IRR is reported as Not calculable, in the danger style', () => {
    const out = boot();
    expect(out.textContent).toMatch(/Not calculable/);
    const danger = [...out.querySelectorAll('.danger-text')].map((el) => el.textContent);
    expect(danger).toContain('Not calculable');
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
    window.eval(calculatorScript());
    window.calculateNPV();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
