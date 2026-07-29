---
name: website-quality
description: >-
  Professional-grade quality bar for aceengineer.com — the design system as it actually
  ships, plus the accessibility, typography, layout and consistency criteria every page is
  held to. Use when reviewing or changing any page under content/**, when adding a
  capability page, or when asked whether the site "looks professional".
---

# aceengineer.com quality bar

The site is a **technical credibility surface**: an engineer arrives to judge whether the
work is real. Every rule below serves that, and where a rule would trade credibility for
decoration, credibility wins.

## 1. Honour the system that ships

`assets/css/theme.css` is the live token set and the source of truth:

| token | value | role |
|---|---|---|
| `--navy` | `#0b3d5c` | structure, headings, links |
| `--teal` | `#2BB2A6` | signature accent |
| `--teal-deep` | `#0e7e88` | accent on light grounds, hover |
| `--ink` | `#26323a` | body text |
| `--muted` | `#5a6b76` | secondary text |
| `--tint` | `#eef4f8` | callout ground |

**Never introduce a raw hex where a token exists.** New colour needs a token first.

### Two known contradictions — do not build on either

1. **`brand/BRAND.md` is stale.** It locks a "plum/copper family" that "does not inherit
   digitalmodel's navy/teal". The shipped logo is `#0B3D91` + `#2BB2A6`, and no plum or
   copper appears anywhere in the repo. Treat `theme.css` + the shipped wordmark as truth
   and fix the contract, not the site.
2. **Seven files define `:root` tokens** — `theme.css`, `marketing.css`, `components.css`,
   `bootstrap-united.css`, `styles.min.css`, and both sloshing sheets. Issue #82 calls this
   "3-4 token systems"; it is seven. Any new rule goes in `theme.css`, which loads last.

## 2. Accessibility is a correctness property, not a polish item

- **Contrast:** body text ≥ 4.5:1, large text and UI ≥ 3:1. Two real regressions came from
  ignoring this: a navy `h1` on a near-black gradient (#109), and unscoped links falling
  through to Bootstrap United's `a { background-color:transparent; color:#e95420 }` —
  about **3.65:1 on white, so it fails AA for normal text** — on 66 pages.
  That orange is the *retired* brand colour. PR #105 removed it from the CTAs but not from
  the base link rule, so it was still the default link colour across the site.
  **Both are now fixed, and `tests/visual/contrast-check.spec.js` measures every link on
  all 117 pages in a real browser. `contrast-baseline.json` is EMPTY — there is no
  tolerated debt left, so any new contrast failure fails the build. Keep it empty.**
- **A visible focus state on every interactive element.** Keyboard operation is not
  optional on a site whose audience includes procurement and accessibility reviewers.
- Every page keeps its `<main>`, its skip link, and its canonical — already asserted by
  `tests/js/a11y-baseline.test.js`. Do not regress them.
- Colour never carries meaning alone; pair it with text or shape.

## 3. Typography

- Body measure near 65 characters. Wider reads as a wall and signals an unedited page.
- Stay on the existing scale; do not introduce one-off `font-size` values inline.
- Headings get `text-wrap: balance`. Uppercase labels get letter-spacing.
- `font-variant-numeric: tabular-nums` wherever digits align in a column — this site is
  full of engineering tables and ragged digits look amateur immediately.

## 4. Layout and spacing

- Space sibling groups with flex/grid `gap`, not per-element margins that collapse.
- Wide content — tables, code, diagrams — scrolls inside its own `overflow-x: auto`
  container. **The page body must never scroll sideways.** This is the most common mobile
  failure on technical sites.
- Test at 375px and 1280px. Both are covered by the visual suite.

## 5. Data presentation carries the credibility

The capability pages are the product. For them specifically:

- Show the summary before the detail; a reader decides in seconds whether to keep reading.
- State limits honestly and visibly. `data_limits` is a feature, not a disclaimer — an
  engineer trusts a page that says what it does not cover.
- Never a silent gap: missing or withheld data gets a visible placeholder with provenance.
- Numbers must trace to a source. Every capability links its dataset.

## 6. Copy

- Plain English. Name things as a reader recognises them, not as the system implements them.
- Active voice; a control says exactly what it does.
- No "revolutionary", no "cutting-edge AI" — enforced in `brand/copy.yaml`.
- One story across the site. The canonical positioning lives in `brand/copy.yaml` and is
  enforced by `npm run lint:copy`; the decisions behind it are recorded on #89.

## 7. Verification — claims about quality need evidence

```bash
npm run build && npm test          # 405 tests, 22 suites
npm run lint:copy                  # canonical copy + forbidden phrases, all pages
npm run validate:registry          # capability schema + live HF resolution
npm run test:visual                # screenshots, 7 pages x 2 viewports
```

**CI is the only authority on a visual diff.** Font metrics differ between a dev machine
and the container, so a local run reports differences on pages you never touched. Never
update a baseline from a local run.
