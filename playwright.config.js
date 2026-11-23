// ABOUTME: Playwright config for the visual-regression suite (issue #101).
// ABOUTME: Baselines are generated in CI's Playwright container, never locally —
// ABOUTME: font rendering differs between a dev machine and the runner.
'use strict';

const { defineConfig, devices } = require('@playwright/test');

const PORT = Number(process.env.VISUAL_SERVER_PORT || 4173);

module.exports = defineConfig({
  testDir: './tests/visual',

  // Baselines live under one directory per project (viewport), so a mobile and a
  // desktop shot of the same page never collide.
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',

  // A visual suite that is flaky on its own baseline is worse than no suite, so
  // retries are OFF deliberately: a retry would mask exactly the instability we
  // most need to see while the suite is earning trust.
  retries: 0,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Structural breakage is the target; sub-pixel font diffs are the explicit
    // non-goal (#101). Chasing those makes the suite noise and it gets muted.
    screenshot: 'only-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      // ~0.2% of pixels may differ before we call it a regression. A collapsed
      // layout, a vanished section or unstyled text moves far more than this.
      maxDiffPixelRatio: 0.002,
      // Per-pixel tolerance for antialiasing noise.
      threshold: 0.25,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'mobile',
      // The navbar collapse and the 100px logo are both viewport-dependent.
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
  ],

  webServer: {
    command: 'node scripts/static-server.js',
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
