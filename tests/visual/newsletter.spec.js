'use strict';

const { test, expect } = require('@playwright/test');

test('the newsletter edition preserves headings, shared chrome and a mobile layout', async ({ page }) => {
  await page.goto('/newsletter/issue-001-energy-street/');
  await expect(page).toHaveTitle('The Deckhand Chronicles — Energy Street · Issue 1');
  await expect(page.locator('h1')).toHaveText('The Deckhand Chronicles');
  await expect(page.locator('nav.navbar')).toBeVisible();
  await expect(page.locator('body > footer.footer-section')).toBeVisible();
  await expect(page.locator('#newsletter-edition a')).toHaveCount(8);
  const structure = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
    return { uniqueIds: new Set(ids).size === ids.length,
      fits: document.documentElement.scrollWidth <= window.innerWidth };
  });
  expect(structure).toEqual({ uniqueIds: true, fits: true });
});

test('the superseded route redirects to the current edition', async ({ page }) => {
  await page.goto('/newsletter/issue-001/');
  await expect(page).toHaveURL(/\/newsletter\/issue-001-energy-street\/$/);
  await expect(page.locator('h1')).toHaveText('The Deckhand Chronicles');
});
