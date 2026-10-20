'use strict';

const { test, expect } = require('@playwright/test');

const widths = [375, 768, 1024, 1100, 1210, 1219, 1220, 1279, 1280, 1440];
const qualityTargets = ['engineering.html', 'solutions/', 'case-studies/', 'calculators/', 'platform.html', 'proof.html'];

for (const width of widths) {
  test(`navigation stays compact and every quality target is reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/index.html');
    await page.evaluate(() => document.fonts.ready);
    const nav = page.locator('nav.navbar');
    const toggle = nav.getByRole('button', { name: 'Toggle navigation' });
    const measure = () => nav.evaluate(node => {
      const box = node.getBoundingClientRect();
      const links = [...node.querySelectorAll('ul a')].filter(a => a.getClientRects().length);
      return { height: box.height, rows: new Set(links.map(a => a.getBoundingClientRect().top)).size,
        fits: links.every(a => { const r = a.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }) };
    });
    const closed = await measure();
    console.log(JSON.stringify({ width, ...closed }));
    expect(closed.height).toBeGreaterThanOrEqual(50);
    expect(closed.height).toBeLessThanOrEqual(57);
    expect(closed.rows).toBeLessThanOrEqual(1);
    expect(closed.fits).toBe(true);
    if (width < 1280) {
      await expect(toggle).toBeVisible();
      await expect(nav.locator('ul a').first()).toBeHidden();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    } else {
      await expect(toggle).toBeHidden();
    }
    for (const target of qualityTargets) {
      const link = nav.locator(`a[href="${target}"]`);
      await expect(link).toBeVisible();
      const footer = page.locator(`footer .footer-links a[href="${target}"]`);
      await expect(link).toHaveText(await footer.textContent());
    }
    expect((await measure()).fits).toBe(true);
    if (width < 1280) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(nav.locator('ul a').first()).toBeHidden();
      expect((await measure()).height).toBeLessThanOrEqual(57);
    }
  });
}
