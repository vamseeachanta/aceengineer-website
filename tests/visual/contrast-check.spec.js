const { test, expect } = require('@playwright/test');

// Contrast ratio per WCAG 2.x
function lum(rgb) {
  const c = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(fg, bg) {
  const a = lum(fg) + 0.05, b = lum(bg) + 0.05;
  return (Math.max(a, b) / Math.min(a, b));
}
const parse = (s) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);

// Every built page, enumerated from dist/ so a new page is covered the day it lands.
const fs = require('fs');
const path = require('path');
const DIST = path.resolve(__dirname, '..', '..', 'dist');
function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (e.name.endsWith('.html')) acc.push('/' + path.relative(DIST, f));
  }
  return acc;
}
const PAGES = walk(DIST);

test.setTimeout(180_000);

test('content links meet WCAG AA on every built page', async ({ page }) => {
  const failures = [];
  let indeterminate = 0;
  for (const p of PAGES) {
    await page.goto(p);
    const results = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('main a').forEach((a) => {
        // innerText, not textContent: textContent includes <style> content from
        // inline SVGs, which surfaced CSS source as though it were link text.
        const label = (a.innerText || '').trim();
        if (!label) return;
        const cs = getComputedStyle(a);
        // walk up for the effective background
        let el = a, bg = 'rgba(0, 0, 0, 0)', gradient = false;
        while (el && el !== document.documentElement) {
          const s = getComputedStyle(el);
          // A gradient is background-IMAGE, so backgroundColor reads transparent and a
          // naive walk-up sails past it onto a white ancestor — reporting white-on-white
          // for text that actually sits on a dark gradient. Flag and skip instead of lying.
          if (s.backgroundImage && s.backgroundImage !== 'none') { gradient = true; break; }
          const b = s.backgroundColor;
          if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; }
          el = el.parentElement;
        }
        out.push({ color: cs.color, bg, gradient, text: label.slice(0, 30),
                   size: parseFloat(cs.fontSize), weight: cs.fontWeight });
      });
      return out;
    });
    for (const r of results) {
      if (r.gradient) { indeterminate++; continue; }
      const fg = parse(r.color), bg = parse(r.bg.includes('rgba(0, 0, 0, 0)') ? 'rgb(255,255,255)' : r.bg);
      if (fg.length < 3 || bg.length < 3) continue;
      const cr = ratio(fg, bg);
      const large = r.size >= 24 || (r.size >= 18.66 && Number(r.weight) >= 700);
      const min = large ? 3 : 4.5;
      if (cr < min) failures.push(`${p} "${r.text}" ${r.color} on ${r.bg} = ${cr.toFixed(2)}:1 (needs ${min})`);
    }
  }
  console.log(`checked ${PAGES.length} pages; ${indeterminate} link(s) skipped as indeterminate (gradient ground)`);

  // RATCHET, not a cliff. The site carries pre-existing contrast debt; a gate that fails
  // on all of it on day one gets muted, and a muted gate protects nothing. So: known
  // failures are recorded in contrast-baseline.json and tolerated; anything NOT in that
  // file fails the build. Fix a page, delete its lines from the baseline, and it can
  // never regress. The baseline may only ever shrink.
  const BASELINE = path.join(__dirname, 'contrast-baseline.json');
  const known = new Set(JSON.parse(fs.readFileSync(BASELINE, 'utf8')));
  const fresh = failures.filter((f) => !known.has(f));
  const fixed = [...known].filter((k) => !failures.includes(k));

  console.log(`contrast: ${failures.length} known-or-new below AA, ${fresh.length} NEW, ${fixed.length} now fixed`);
  if (fresh.length) console.log('NEW FAILURES:\n' + fresh.join('\n'));
  if (fixed.length) console.log(`${fixed.length} baseline entries no longer fail — remove them from contrast-baseline.json`);

  expect(fresh, `${fresh.length} NEW contrast failure(s) below WCAG AA`).toEqual([]);
});
