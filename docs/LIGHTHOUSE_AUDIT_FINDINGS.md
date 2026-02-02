# Lighthouse Audit Findings

> Audit date: 2026-02-01 | Tool: Lighthouse 12.8.2 CLI

## Executive Summary

Comprehensive Lighthouse audit of aceengineer.com with two rounds of optimization achieving perfect scores in Accessibility, Best Practices, and SEO, plus a 12-point Performance gain.

| Category | Before | Round 1 | Final | Target |
|----------|--------|---------|-------|--------|
| Performance (mobile) | 77 | 82 | **89** | 90+ |
| Performance (desktop) | 98 | — | — | 95+ |
| Accessibility | 81 | 95 | **100** | 95+ |
| Best Practices | 96 | 100 | **100** | 95+ |
| SEO | 90 | 100 | **100** | 95+ |

Performance measured on localhost (no CDN/HTTP2/Brotli). Live site on Vercel CDN expected to score 90+.

## Core Web Vitals

### Mobile — Before (Baseline)

| Metric | Value | Rating |
|--------|-------|--------|
| FCP (First Contentful Paint) | 3.0s | Needs Improvement |
| LCP (Largest Contentful Paint) | 3.0s | Needs Improvement |
| TBT (Total Blocking Time) | 440ms | Needs Improvement |
| CLS (Cumulative Layout Shift) | 0 | Good |
| Speed Index | 3.0s | Good |
| TTI (Time to Interactive) | 4.2s | Needs Improvement |

### Mobile — After (Final)

| Metric | Value | Rating | Change |
|--------|-------|--------|--------|
| FCP | 1.6s | Good | -1.4s |
| LCP | 1.6s | Good | -1.4s |
| TBT | 420ms | Needs Improvement | -20ms |
| CLS | 0.002 | Good | — |
| Speed Index | 2.3s | Good | -0.7s |
| TTI | 3.2s | Good | -1.0s |

### Desktop — Before (Baseline)

| Metric | Value | Rating |
|--------|-------|--------|
| FCP | 0.8s | Good |
| LCP | 1.0s | Good |
| TBT | 10ms | Good |
| CLS | 0 | Good |
| Speed Index | 0.8s | Good |
| TTI | 1.0s | Good |

## Round 1: Accessibility, Best Practices, SEO Fixes

### Critical — Broken Resource (Best Practices)

**Issue:** `bootstrap.min.united.css` returned 404/MIME type error. The file never existed locally.

**Fix:** Replaced broken local path with Bootswatch CDN (later self-hosted in Round 2).

**Impact:** Eliminated console error, fixed Best Practices score.

---

### Performance — Render-Blocking JavaScript

**Issue:** jQuery and Bootstrap JS loaded synchronously, blocking rendering (~990ms on mobile).

**Fix:** Added `defer` attribute to both scripts (later replaced entirely in Round 2).

**Impact:** Eliminated JS render-blocking (~990ms savings on mobile).

---

### Performance — Preconnect Hints

**Issue:** No early connection hints for external CDN domains.

**Fix:** Added `rel="preconnect"` for external domains (later removed when CDN dependencies were eliminated in Round 2).

---

### Performance — Google Fonts Display

**Issue:** Bootswatch United theme loads Ubuntu font via @import. Font files lacked `font-display: swap`, causing invisible text during load (~813ms render-blocking).

**Fix:** Added preload with async loading pattern (later replaced with self-hosted fonts in Round 2).

---

### Performance — Redirect Chain

**Issue:** `aceengineer.com` redirected to `www.aceengineer.com` adding ~880ms on mobile.

**Fix:** Added Vercel edge redirect in `vercel.json`:
```json
{
  "redirects": [{
    "source": "/:path(.*)",
    "has": [{ "type": "host", "value": "aceengineer.com" }],
    "destination": "https://www.aceengineer.com/:path",
    "permanent": true
  }]
}
```

Also added aggressive cache headers for static assets:
```json
{
  "source": "/assets/(.*)",
  "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
}
```

---

### Performance — Missing Favicon

**Issue:** Missing favicon caused 404 console error on every page load.

**Fix:** Created SVG favicon (`assets/favicon.svg`) with brand-consistent design (orange rounded square with white "A").

---

### Accessibility — Navbar Toggle (score impact: +3-5pts)

**Issue:** Mobile hamburger menu button had no accessible name for screen readers.

**Fix:**
```html
<!-- Before -->
<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
<!-- After -->
<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar" aria-expanded="false" aria-label="Toggle navigation">
```

---

### Accessibility — Color Contrast (score impact: +5-8pts)

**Issue:** Multiple elements failed WCAG AA contrast ratio (4.5:1 minimum):

| Element | Before | After | Ratio |
|---------|--------|-------|-------|
| `.btn-nav-cta` (white on orange) | `#e95420` | `#b84315` | 3.1:1 → 5.0:1 |
| `.btn-primary` (white on orange) | `#e95420` | `#b84315` | 3.1:1 → 5.0:1 |
| `.btn-info` (white on blue) | `#5bc0de` | `#2a7d9b` | 2.4:1 → 5.5:1 |
| `.case-metric strong` (green on white) | `#5cb85c` | `#217821` | 2.7:1 → 5.8:1 |
| `.feature-result` (green on light bg) | `#3c763d` | `#2d5a2d` | 4.2:1 → 5.5:1 |

---

### Accessibility — Heading Hierarchy (score impact: +2-3pts)

**Issue:** Headings skipped levels — `<h4>` used without preceding `<h3>`.

**Fix:**
- Blog preview section: `<h4>` → `<h3>` (3 elements)
- Footer: `<h4>` → `<h3>` (3 elements)
- Updated corresponding CSS selectors

---

### Accessibility — Touch Targets (score impact: +1-2pts)

**Issue:** Navigation links below 48px minimum touch target size.

**Fix:** Increased `.navbar-nav > li > a` from `min-height: 44px` to `min-height: 48px`.

---

### SEO — Non-Descriptive Link Text (score impact: +10pts)

**Issue:** Generic "Learn More", "Read Case Study", "Read Article", "Read More" link text across multiple pages.

**Fix (22 links across 5 files):**
- Added `aria-label` attributes with descriptive context
- Added `<span class="sr-only">` text to "Learn More" links for visible text uniqueness

| File | Links Fixed |
|------|------------|
| `src/index.html` | 5 (3 Learn More + 2 Read Case Study) |
| `src/engineering.html` | 2 (Read Case Study) |
| `src/blog/index.html` | 8 (Read Article) |
| `src/case-studies/index.html` | 4 (Read Full Case Study) |
| `src/case-studies/orcaflex-riser-sensitivity-automation.html` | 3 (Read More) |

---

## Round 2: Self-Hosting & Performance Optimization

### Self-Hosted Ubuntu Font

**Issue:** Google Fonts CDN loaded Ubuntu font via @import inside Bootswatch CSS, adding ~813ms render-blocking and an external DNS lookup + TLS handshake.

**Fix:**
- Downloaded Ubuntu 400 (34KB) and 700 (29KB) woff2 files
- Created `assets/css/fonts.css` with `@font-face` declarations and `font-display: swap`
- Removed Google Fonts @import from self-hosted Bootstrap CSS

**Impact:** Eliminated external font dependency, text visible immediately during load.

---

### Self-Hosted + PurgeCSS Bootstrap CSS

**Issue:** Bootswatch United CSS from CDN was 136KB with 95.6% unused rules. Required external CDN round-trip.

**Fix:**
- Downloaded full Bootswatch United Bootstrap 3.4.0 CSS (6,660 lines)
- Integrated PurgeCSS into `build.js` with safelisted Bootstrap dynamic classes
- PurgeCSS runs against all dist HTML files after build

**Result:** 136.8KB → 70.6KB (48% reduction). Served from same origin.

---

### jQuery + Bootstrap JS → Vanilla Navbar Toggle

**Issue:** jQuery (31KB) + Bootstrap JS (37KB) = 68KB loaded for a single feature: mobile navbar collapse toggle.

**Audit findings:** Searched all 24 HTML source files. Only Bootstrap JS feature used was `data-toggle="collapse"` on the navbar. All custom JavaScript (calculators, forms) was already vanilla JS with zero jQuery dependency.

**Fix:** Created `assets/js/navbar-toggle.js` (0.8KB):
- Vanilla JS IIFE with `'use strict'`
- Toggles `.in` class (Bootstrap 3 open state)
- Animates via `.collapsing` class (same 350ms transition as Bootstrap)
- Updates `aria-expanded` for accessibility
- Uses existing `data-toggle` and `data-target` attributes (no HTML changes needed)

**Impact:** 68KB → 0.8KB (99% reduction in JavaScript).

---

### CSS Concatenation + Minification

**Issue:** 4 separate CSS files (fonts, bootstrap, responsive, marketing) = 4 render-blocking HTTP requests.

**Fix:**
- Added `clean-css` to build pipeline
- Build step concatenates all 4 CSS files and minifies into single `styles.min.css`
- Level 2 optimization with IE9 compatibility

**Result:** 4 HTTP requests → 1. Combined 90.8KB → 67.6KB (26% minification).

---

### Deferred Google Analytics

**Issue:** `gtag.js` loaded via `<script async>`, blocking the main thread for ~300ms during page load.

**Fix:** Replaced `<script async>` with deferred loading:
```javascript
// Defer loading gtag.js until after page is interactive
if ('requestIdleCallback' in window) {
    requestIdleCallback(loadGtag);
} else {
    window.addEventListener('load', loadGtag);
}
```

**Impact:** gtag.js no longer blocks initial render. Loads during browser idle time.

---

## Files Modified (All Rounds)

### Round 1 — Accessibility, Best Practices, SEO

| File | Changes |
|------|---------|
| `src/partials/head-common.html` | CDN CSS fix, preconnect, defer JS, font preload, favicon |
| `src/partials/nav.html` | aria-label, aria-expanded |
| `src/partials/footer.html` | h4 → h3 |
| `src/index.html` | h4 → h3, aria-labels, sr-only text |
| `src/engineering.html` | aria-labels |
| `src/blog/index.html` | aria-labels |
| `src/case-studies/index.html` | aria-labels |
| `src/case-studies/orcaflex-riser-sensitivity-automation.html` | aria-labels |
| `assets/css/marketing.css` | Contrast colors, heading selectors, button overrides |
| `assets/css/responsive.css` | Touch target sizes |
| `assets/favicon.svg` | New file |
| `vercel.json` | Edge redirect, cache headers |

### Round 2 — Self-Hosting & Performance

| File | Changes |
|------|---------|
| `src/partials/head-common.html` | Single CSS bundle, vanilla JS, deferred gtag |
| `assets/css/bootstrap-united.css` | New — self-hosted Bootswatch United (Google Fonts @import removed) |
| `assets/css/fonts.css` | New — @font-face with font-display: swap |
| `assets/fonts/ubuntu-400.woff2` | New — self-hosted Ubuntu Regular |
| `assets/fonts/ubuntu-700.woff2` | New — self-hosted Ubuntu Bold |
| `assets/js/navbar-toggle.js` | New — vanilla JS collapse toggle (0.8KB) |
| `build.js` | Added PurgeCSS + clean-css bundling pipeline |
| `package.json` | Added purgecss, clean-css dev dependencies |

## Resource Budget (Final)

| Resource | Size | % of Total |
|----------|------|------------|
| Google Analytics (gtag.js) | 144.7 KB | 63% |
| Ubuntu Regular (woff2) | 34.3 KB | 15% |
| Ubuntu Bold (woff2) | 29.3 KB | 13% |
| styles.min.css | 13.1 KB | 6% |
| HTML document | 5.2 KB | 2% |
| navbar-toggle.js | 0.8 KB | <1% |
| favicon.svg | 0.5 KB | <1% |
| **Total** | **228 KB** | **100%** |

First-party resources: 83KB (36%). Third-party (gtag only): 145KB (64%).

## Remaining Work (Future)

### Performance — Reaching 90+ on Mobile

The sole remaining bottleneck is Google Analytics (gtag.js), which contributes ~420ms TBT and accounts for 63% of total page weight. Options:

| Option | Impact | Trade-off |
|--------|--------|-----------|
| Replace gtag with lighter analytics (Plausible, Fathom) | -130KB, -400ms TBT | Reduced analytics features, monthly cost |
| Load gtag only on user interaction (scroll/click) | -400ms TBT | Misses bounce analytics |
| Critical CSS inlining | -220ms render-blocking | 13KB added to every HTML page, hurts caching |
| Remove analytics entirely | -145KB, -420ms TBT | No usage data |

### Other Optimization Opportunities

| Item | Current | Potential |
|------|---------|-----------|
| Image optimization | No WebP, no lazy loading | Add responsive srcset, WebP, lazy loading |
| Per-page CSS purging | One purged bundle for all pages | Page-specific bundles (~11KB further savings) |
| Service worker | None | Offline support, precaching |
| Bootstrap 3 → 5 migration | Bootstrap 3.4.0 (EOL 2019) | Modern CSS, smaller footprint, no jQuery needed |
| HTTP/3 | Vercel HTTP/2 | Faster multiplexing (Vercel-dependent) |

## Commits

| Hash | Message |
|------|---------|
| `01536be` | `fix(lighthouse): achieve 100 scores in accessibility, best practices, and SEO` |
| `720ce4b` | `docs: add Lighthouse audit findings and recommendations` |
| `5c79af4` | `perf: self-host all assets and eliminate CDN dependencies` |
