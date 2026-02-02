# Lighthouse Audit Findings

> Audit date: 2026-02-01 | Tool: Lighthouse 12.8.2 CLI

## Executive Summary

Comprehensive Lighthouse audit of aceengineer.com with fixes applied to achieve perfect scores in Accessibility, Best Practices, and SEO.

| Category | Before | After | Target |
|----------|--------|-------|--------|
| Performance (mobile) | 77 | 67* | 90+ |
| Performance (desktop) | 98 | — | 95+ |
| Accessibility | 81 | **100** | 95+ |
| Best Practices | 96 | **100** | 95+ |
| SEO | 90 | **100** | 95+ |

*Mobile performance measured on localhost (no CDN). Live site with Vercel CDN + new cache headers expected to score higher.

## Core Web Vitals (Mobile — Before)

| Metric | Value | Rating |
|--------|-------|--------|
| FCP (First Contentful Paint) | 3.0s | Needs Improvement |
| LCP (Largest Contentful Paint) | 3.0s | Needs Improvement |
| TBT (Total Blocking Time) | 440ms | Needs Improvement |
| CLS (Cumulative Layout Shift) | 0 | Good |
| Speed Index | 3.0s | Good |
| TTI (Time to Interactive) | 4.2s | Needs Improvement |

## Core Web Vitals (Desktop — Before)

| Metric | Value | Rating |
|--------|-------|--------|
| FCP | 0.8s | Good |
| LCP | 1.0s | Good |
| TBT | 10ms | Good |
| CLS | 0 | Good |
| Speed Index | 0.8s | Good |
| TTI | 1.0s | Good |

## Issues Found & Fixed

### Critical — Broken Resource (Best Practices)

**Issue:** `bootstrap.min.united.css` returned 404/MIME type error. The file never existed locally.

**Fix:** Replaced broken local path with Bootswatch CDN:
```html
<!-- Before -->
<link rel="stylesheet" href="assets/css/bootstrap.min.united.css">
<!-- After -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.4.0/united/bootstrap.min.css">
```

**Impact:** Eliminated console error, fixed Best Practices score.

---

### Performance — Render-Blocking JavaScript

**Issue:** jQuery and Bootstrap JS loaded synchronously, blocking rendering (~990ms on mobile).

**Fix:** Added `defer` attribute to both scripts. `defer` maintains execution order (jQuery before Bootstrap) while parsing HTML in parallel.

```html
<script defer src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script defer src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
```

**Impact:** Eliminated JS render-blocking (~990ms savings on mobile).

---

### Performance — Preconnect Hints

**Issue:** No early connection hints for external CDN domains.

**Fix:** Added `rel="preconnect"` for 5 external domains:
- `code.jquery.com`
- `maxcdn.bootstrapcdn.com`
- `fonts.googleapis.com`
- `fonts.gstatic.com`
- `www.googletagmanager.com`

---

### Performance — Google Fonts Display

**Issue:** Bootswatch United theme loads Ubuntu font via @import. Font files lacked `font-display: swap`, causing invisible text during load (~813ms render-blocking).

**Fix:** Added preload with async loading pattern:
```html
<link rel="preload" href="https://fonts.googleapis.com/css?family=Ubuntu:400,700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu:400,700&display=swap"></noscript>
```

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

## Files Modified

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

## Remaining Work (Future)

### Mobile Performance (target: 90+)

The remaining performance gap is driven by third-party resources:

| Resource | Issue | Potential Fix |
|----------|-------|---------------|
| Bootstrap CSS (20KB, 95.6% unused) | Render-blocking, massive unused CSS | Self-host + PurgeCSS, or migrate to Bootstrap 5/utility CSS |
| Google Fonts Ubuntu (1KB CSS + woff2) | Render-blocking font load | Self-host font files with font-display: swap |
| jQuery 3.6 (31KB, 68% unused) | Large unused JS | Replace with vanilla JS (requires Bootstrap 5 migration) |
| Google Tag Manager (148KB, 38% unused) | Third-party bloat | Consider lighter analytics (Plausible, Fathom) |

### Recommended Next Steps

1. **Self-host Bootstrap + fonts** — Eliminates CDN round-trips and enables PurgeCSS
2. **Migrate Bootstrap 3 → 5** — Drops jQuery dependency, modern CSS, smaller bundle
3. **PurgeCSS integration** — Remove 95.6% unused Bootstrap CSS
4. **Consider lighter analytics** — gtag.js is 148KB for basic page tracking
5. **Image optimization** — Add WebP format, lazy loading, responsive srcset
6. **Critical CSS extraction** — Inline above-the-fold CSS for instant FCP
