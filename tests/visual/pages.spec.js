// ABOUTME: Visual-regression baselines for the representative page set (issue #101).
// ABOUTME: Viewport-height page shots plus targeted element shots — deliberately not
// ABOUTME: full-page, to bound committed PNG weight and localise failures.
'use strict';

const { test, expect } = require('@playwright/test');

// Shared-chrome element shots. A broken nav or footer partial then fails once per page
// with a small readable diff, instead of showing up as a shifted full-page image.
//
// These are declared PER PAGE rather than assumed everywhere, because the site is not
// currently consistent and this suite's job is to detect *change*, not to assert that
// today's state is tidy. Captured 2026-07-28 against `main`:
//   - dc-drilldown.html has NO nav at all, and uses `footer.site` not the shared partial
//   - 404.html uses an inline-styled footer, not the shared partial
//   - energy.html has NO <footer> element whatsoever
// `body > footer` is deliberately generic so it covers all three footer implementations
// — the question being asked is "does this page's footer still look right", not "is it
// the shared one". The inconsistency itself is reported on #81/#82, not enforced here.
const NAV = { name: 'nav', selector: 'nav.navbar' };
const FOOTER = { name: 'footer', selector: 'body > footer' };

// Seven pages, chosen in #101 for structural variety rather than coverage count.
const PAGES = [
  {
    id: 'home',
    path: '/index.html',
    why: 'the reposition target',
    elements: [NAV, FOOTER, { name: 'hero', selector: 'main section:first-of-type' }],
  },
  {
    id: 'capabilities-index',
    path: '/capabilities/index.html',
    why: 'the browse surface #99 takes 5 -> 57',
    elements: [
      NAV,
      FOOTER,
      // Was `main section.hero-section` until #109 replaced the dark marketing hero
      // with a light theme hero matching the homepage. Positional now, like `home`.
      { name: 'hero', selector: 'main section:first-of-type' },
      // The capability card grid is an inline-styled flex container with no stable
      // class, so it is addressed by position. If #99 restructures this section the
      // shot changes — which is the point.
      { name: 'card-grid', selector: 'main section:nth-of-type(2)' },
    ],
  },
  {
    id: 'capability-detail',
    path: '/capabilities/field-explorer.html',
    why: 'HF-hydrated detail page; catches #83 regressions',
    elements: [NAV, FOOTER],
  },
  {
    id: 'capability-drilldown',
    path: '/capabilities/dc-drilldown.html',
    why: 'drilldown layout, structurally unlike the detail page',
    // No nav on this page today — see the note above NAV/FOOTER.
    elements: [FOOTER],
  },
  {
    id: 'report',
    path: '/reports/sloshing/validation.html',
    why: 'report page; the one backing: release capability',
    elements: [NAV, FOOTER],
  },
  {
    id: 'not-found',
    // A missing URL, not /404.html directly — this is what a visitor actually hits,
    // and it proves the 404 page is served with a 404 rather than just existing.
    path: '/no-such-page-visual-regression',
    why: 'minimal chrome; isolates nav/footer partial breakage',
    elements: [NAV, FOOTER],
  },
  {
    id: 'no-footer-page',
    path: '/energy.html',
    why: 'has a nav but no <footer> at all; <main> placement here was gotten wrong once',
    elements: [NAV],
  },
];

// Kill the two things that make screenshots flaky without telling you why.
async function settle(page) {
  // 1. Web fonts: a shot taken mid-swap catches fallback metrics.
  await page.evaluate(() => document.fonts && document.fonts.ready);
  // 2. Lazy images below the fold never resolve if we never scroll, but scrolling
  //    changes the viewport shot — so force eager loading in place instead.
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.loading = 'eager';
    });
  });
  await page.waitForLoadState('networkidle');
}

for (const p of PAGES) {
  test.describe(`${p.id} — ${p.why}`, () => {
    test.beforeEach(async ({ page }) => {
      const res = await page.goto(p.path);
      // 404.html is expected to be served with a 404; everything else must be 200.
      const expected = p.id === 'not-found' ? 404 : 200;
      expect(res.status(), `${p.path} should return ${expected}`).toBe(expected);
      await settle(page);
    });

    test('viewport', async ({ page }) => {
      // Viewport-height, not fullPage: bounded PNG weight (#101 decision B).
      await expect(page).toHaveScreenshot(`${p.id}.png`);
    });

    for (const el of p.elements) {
      test(`element: ${el.name}`, async ({ page }) => {
        const locator = page.locator(el.selector).first();
        await expect(
          locator,
          `${p.path} is missing ${el.name} (${el.selector}) — that is itself the regression`
        ).toBeVisible();
        await expect(locator).toHaveScreenshot(`${p.id}-${el.name}.png`);
      });
    }
  });
}
