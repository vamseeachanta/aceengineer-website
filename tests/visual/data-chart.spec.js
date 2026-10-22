'use strict';

const { test, expect } = require('@playwright/test');

test('real Plotly hover contains the published value, unit, year and source', async ({ page }) => {
  await page.goto('/data/_example/');
  const root = page.locator('[data-chart-bundle]');
  await expect(root).toHaveAttribute('data-chart-ready', 'true');
  await root.locator('.scatterlayer .point').last().hover();
  const label = root.locator('.hoverlayer');
  // BSEE Offshore Incident Statistics, 2024 CY, Injuries card: 223 injuries.
  await expect(label).toContainText('223 injuries');
  await expect(label).toContainText('2024');
  await expect(label).toContainText('BSEE Offshore Incident Statistics');
  await expect(root.locator('a[download]')).toHaveAttribute('href', '/assets/data/charts/bsee-injuries.csv');
});

test('keyboard access exposes point details and a visible focus indicator', async ({ page }) => {
  await page.goto('/data/_example/');
  const root = page.locator('[data-chart-bundle]');
  await expect(root).toHaveAttribute('data-chart-ready', 'true');
  const plot = root.locator('[data-chart-plot]');
  await plot.focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('status')).toContainText('223 injuries');
  await expect(root.getByRole('status')).toContainText('2024');
  await expect(root.getByRole('status')).toContainText('BSEE Offshore Incident Statistics');
  await expect(plot).toBeFocused();
  await expect(plot).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Home');
  // BSEE Offshore Incident Statistics, 2023 CY, Injuries card: 203 injuries.
  await expect(root.getByRole('status')).toContainText('203 injuries');
});

test('numbers and source remain readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/data/_example/');
  const root = page.locator('[data-chart-bundle]');
  await expect(root.getByRole('cell', { name: '203', exact: true })).toBeVisible();
  await expect(root.getByRole('cell', { name: '223', exact: true })).toBeVisible();
  await expect(root.getByRole('link', { name: 'BSEE Offshore Incident Statistics, Injuries cards' })).toBeVisible();
  await expect(root.getByRole('link', { name: 'Download CSV' })).toBeVisible();
  await expect(root.locator('[data-chart-next]')).toBeHidden();
  await context.close();
});
