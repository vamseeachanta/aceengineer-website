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
const SCOPE_LINKS = '.cta-section .scope-invitation a, .demo-cta-section .scope-invitation a';

async function readLinks(links) {
  return links.evaluateAll((anchors, scopeSelector) => anchors.map((a) => {
    const cs = getComputedStyle(a);
    let backgrounds = [], gradient = false, opacity = 1;
    for (let el = a; el; el = el.parentElement) {
      const s = getComputedStyle(el);
      opacity *= Number(s.opacity);
      if (backgrounds.length || gradient) continue;
      if (s.backgroundImage && s.backgroundImage !== 'none') {
        gradient = true;
        // Resolve these dark CTA gradients instead of skipping their links. Only
        // opaque linear-gradient stops are supported; other images stay unknown.
        const stops = s.backgroundImage.match(/rgba?\([^)]+\)/g) || [];
        if (a.matches(scopeSelector) && s.backgroundImage.startsWith('linear-gradient(')
            && stops.length >= 2 && stops.every((c) => c.startsWith('rgb('))) {
          backgrounds = stops;
        }
      } else if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent') {
        backgrounds = [s.backgroundColor];
      }
    }
    return { color: cs.color, backgrounds, gradient, opacity,
      border: cs.borderTopColor, text: (a.innerText || '').trim().slice(0, 30),
      size: parseFloat(cs.fontSize), weight: cs.fontWeight };
  }), SCOPE_LINKS);
}

function contrast(r, bg) {
  const background = parse(bg);
  const foreground = parse(r.color).map((v, i) => v * r.opacity + background[i] * (1 - r.opacity));
  return ratio(foreground, background);
}

for (const route of ['/about.html', '/engineering.html', '/demos/index.html']) {
  test(`scope invitation meets 4.5:1 on every gradient stop: ${route}`, async ({ page }) => {
    await page.goto(route);
    const links = page.locator(SCOPE_LINKS);
    await expect(links).toHaveCount(2); // Contact button and email link must both be covered.
    let minimum = Infinity;
    for (const link of await links.all()) {
      for (const state of ['default', 'hover', 'focus']) {
        await page.mouse.move(0, 0);
        await link.blur();
        if (state === 'hover') await link.hover();
        if (state === 'focus') await link.focus();
        const [r] = await readLinks(link);
        expect(r.gradient).toBe(true);
        expect(r.backgrounds.length).toBeGreaterThanOrEqual(2);
        for (const bg of r.backgrounds) {
          const cr = contrast(r, bg);
          minimum = Math.min(minimum, cr);
          expect(cr, `${route} ${state} ${r.color} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
        if (await link.evaluate((a) => a.classList.contains('btn-ghost'))) {
          expect(r.border).toBe('rgba(255, 255, 255, 0.6)');
        }
      }
    }
    console.log(`${route}: minimum CTA contrast ${minimum.toFixed(2)}:1 (requires 4.5:1)`);
  });
}

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
    if (p === '/newsletter/issue-001/index.html') {
      await expect(page).toHaveURL(/\/newsletter\/issue-001-energy-street\/$/);
    }
    const results = await readLinks(page.locator('main a'));
    for (const r of results) {
      if (!r.text) continue;
      if (r.gradient && !r.backgrounds.length) { indeterminate++; continue; }
      const large = r.size >= 24 || (r.size >= 18.66 && Number(r.weight) >= 700);
      const min = large ? 3 : 4.5;
      for (const bg of r.backgrounds.length ? r.backgrounds : ['rgb(255,255,255)']) {
        const cr = contrast(r, bg);
        if (cr < min) failures.push(`${p} "${r.text}" ${r.color} on ${bg} = ${cr.toFixed(2)}:1 (needs ${min})`);
      }
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
