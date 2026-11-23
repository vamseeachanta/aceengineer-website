/**
 * @jest-environment jsdom
 */

describe('cta-tracking', () => {
  const scriptPath = require.resolve('../../assets/js/cta-tracking.js');

  function load() {
    delete require.cache[scriptPath];
    const mod = require('../../assets/js/cta-tracking.js');
    // jsdom has already fired DOMContentLoaded; the module inits immediately
    // when readyState !== 'loading', so listeners are attached on require.
    return mod;
  }

  beforeEach(() => {
    document.body.innerHTML = `
      <a id="cta" href="https://t.me/+ABC" data-cta="open-deck"
         data-src="src_web_std_dnv-st-f101-wall-thickness">Try Open Deck</a>
      <a id="plain" href="/about.html">About</a>
    `;
    delete window.gtag;
    window.dataLayer = [];
  });

  test('fires a gtag cta_click event with the source tag on click', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    load();

    document.getElementById('cta').click();

    expect(calls).toHaveLength(1);
    const [eventType, name, params] = calls[0];
    expect(eventType).toBe('event');
    expect(name).toBe('cta_click');
    expect(params.cta_type).toBe('open-deck');
    expect(params.cta_source).toBe('src_web_std_dnv-st-f101-wall-thickness');
    expect(params.destination).toBe('https://t.me/+ABC');
  });

  test('does not attach tracking to links without data-cta', () => {
    const calls = [];
    window.gtag = (...args) => calls.push(args);
    load();

    document.getElementById('plain').click();
    expect(calls).toHaveLength(0);
  });

  test('falls back to dataLayer.push when gtag is unavailable', () => {
    const mod = load();
    const ok = mod.send('cta_click', { cta_source: 'src_web_nav' });
    expect(ok).toBe(true);
    expect(window.dataLayer).toContainEqual({ event: 'cta_click', cta_source: 'src_web_nav' });
  });

  test('send is a no-op (returns false) when no analytics sink exists', () => {
    const mod = load();
    delete window.gtag;
    delete window.dataLayer;
    expect(mod.send('cta_click', {})).toBe(false);
  });
});
