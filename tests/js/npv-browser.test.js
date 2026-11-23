/**
 * Executes the calculator page with REAL classic-script semantics (#124).
 *
 * Why this exists, and why the other suites are not enough:
 *
 * tests/js/npv-render.test.js and npv-parity.test.js reconstruct the browser
 * environment with `Object.assign(window, engine)` followed by
 * `window.eval(inlineScript)`. That is more permissive than a browser in two
 * ways that matter:
 *
 *   1. The engine's top-level `const DOLLARS_PER_MILLION` becomes a global
 *      LEXICAL binding in a browser, NOT a property of window. Assigning it to
 *      window makes `window.DOLLARS_PER_MILLION` work in the test when it is
 *      undefined on the real page.
 *   2. A top-level `const`/`var` redeclaration in the page's inline script
 *      would be a SyntaxError in a browser -- killing the whole calculator --
 *      but is legal inside `window.eval`, because eval gets its own scope.
 *
 * So this suite loads the page as a document, lets jsdom fetch and run the
 * engine as a separate <script src> in document order, and clicks the actual
 * button. It reads from content/ and assets/, never dist/, so it does not
 * depend on a build having run.
 *
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..', '..');
const PAGE = path.join(ROOT, 'content', 'calculators', 'npv-field-development.html');

// Only the engine is served. Plotly is 3MB of third-party code irrelevant to
// the arithmetic, and the analytics tags are external.
function load(overrides) {
  let html = fs.readFileSync(PAGE, 'utf8');
  html = html.replace(/\{\{ rootPath \}\}/g, '');

  if (overrides) {
    Object.keys(overrides).forEach((id) => {
      const re = new RegExp('(<input[^>]*id="' + id + '"[^>]*value=")[^"]*(")');
      html = html.replace(re, '$1' + overrides[id] + '$2');
    });
  }

  const served = [];
  class EngineOnly extends ResourceLoader {
    fetch(url) {
      if (url.indexOf('npv-calculator-engine.js') !== -1) {
        const p = decodeURIComponent(url.replace('file://', '').split('?')[0]);
        served.push(path.basename(p));
        return Promise.resolve(fs.readFileSync(p));
      }
      return Promise.resolve(Buffer.from(''));
    }
  }

  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on('jsdomError', (e) => errors.push(e.message));

  const dom = new JSDOM(html, {
    url: 'file://' + ROOT + '/',
    runScripts: 'dangerously',
    resources: new EngineOnly(),
    virtualConsole: virtualConsole,
    // The analytics and Plotly tags are deliberately not served, so stand in
    // for them before any page script runs. Anything else reaching `errors`
    // is a genuine defect in the page.
    beforeParse: function (w) {
      w.gtag = function () {};
      w.Plotly = { newPlot: function () {} };
    },
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ window: dom.window, errors: errors, served: served });
    }, 150);
  });
}

function calculate(ctx) {
  const w = ctx.window;
  const button = w.document.querySelector('button.btn-calculate');
  button.dispatchEvent(new w.Event('click', { bubbles: true }));
  return w.document.getElementById('result-content');
}

describe('the page runs as a real document, not a reconstructed scope', () => {
  test('the engine is fetched and executed as a separate script', async () => {
    const ctx = await load();
    expect(ctx.served).toContain('npv-calculator-engine.js');
  });

  test('the engine contributes its functions as globals the page can call', async () => {
    const ctx = await load();
    expect(ctx.window.eval('typeof calcIRRResult')).toBe('function');
    expect(ctx.window.eval('typeof calcNPV')).toBe('function');
  });

  test('the unit constant resolves lexically, as a browser provides it', async () => {
    const ctx = await load();
    // Resolves by identifier lookup...
    expect(ctx.window.eval('DOLLARS_PER_MILLION')).toBe(1e6);
    // ...but is NOT a window property. Pinning this stops anyone "fixing" the
    // page by reaching for window.DOLLARS_PER_MILLION, which is undefined.
    expect(ctx.window.DOLLARS_PER_MILLION).toBeUndefined();
  });

  test('the page script parses without a redeclaration error', async () => {
    const ctx = await load();
    // A duplicate top-level const/var between the two scripts is a SyntaxError
    // in a browser and would leave calculateNPV undefined.
    expect(ctx.window.eval('typeof calculateNPV')).toBe('function');
    expect(ctx.errors).toEqual([]);
  });
});

describe('clicking Calculate on the real document', () => {
  test('renders the corrected headline for the shipped defaults', async () => {
    const out = calculate(await load());
    expect(out.querySelector('.result-value').textContent).toBe('$-245.2 M');
  });

  test('reports the defaults as NOT VIABLE', async () => {
    const out = calculate(await load());
    expect(out.querySelector('.result-value').className).toContain('negative');
    expect(out.textContent).toContain('NOT VIABLE');
  });

  test('refuses the IRR with the no-root reason', async () => {
    const out = calculate(await load());
    expect(out.textContent).toContain('No IRR in the -50% to 200% range');
  });

  test('reports no payback for the defaults', async () => {
    const out = calculate(await load());
    expect(out.textContent).toContain('No payback within project life');
  });

  test('renders a real IRR for a profitable field', async () => {
    const out = calculate(
      await load({ initial_rate: '40000', capex: '2000', opex: '120' })
    );
    expect(out.textContent).toContain('Internal Rate of Return: 11.76%');
  });

  test('never emits the incoherent B M unit', async () => {
    const out = calculate(await load());
    expect(out.textContent).not.toMatch(/B M/);
  });
});
