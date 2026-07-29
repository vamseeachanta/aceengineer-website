# Built Website Quality Audit

## Summary

- Pages audited: **117** (`dist/**/*.html`).
- Pages with at least one definite finding: **117**.
- Pages with no definite finding: **0**.
- This was a static inspection of the built files already on disk. No build, package, test, or version-control command was run.
- The built bundle supplies a base `a { color:#e95420 }` at `dist/assets/css/styles.min.css:11`, not the stale `#aea79f` example described in the quality-bar commentary. The later rule at `assets/css/theme.css:86-93` overrides links inside `<main>`, and the shared nav/footer rules cover their regions. The three redirect pages load no stylesheet. No built page was therefore found actually inheriting the failing base link colour.

The five highest-impact themes are:

1. **Contrast / legibility — 82 pages.** This includes legacy Bootstrap button/tag pairs, muted text on dark heroes, and page-local status colours.
2. **Raw hex values duplicating or closely shadowing live tokens — 104 pages.** The live token values are at `assets/css/theme.css:13-24`.
3. **Numeric columns without tabular numerals — 52 pages.**
4. **Prose measure materially wider than the approximately 65-character bar — 47 confirmed pages.** Another 14 pages are listed under human judgement because their exact rendered measure depends on viewport and font metrics.
5. **Horizontal-overflow risk — 33 pages with uncontained tables.** Three of those pages also embed fixed-width 700–1100px Plotly elements.

Global clean checks: all 117 pages have a canonical URL; every actual `<img>` has an `alt` attribute; no literal empty-text link or button was found. The exceptions for `<main>`, skip links, heading order, accessible control names, and shared shell markup are reported below.

## Findings by severity

### High

#### H02

**HIGH | contrast / legibility | 19 pages listed below | Small or normal white text is placed on legacy `#428bca` or `#e95420` grounds, yielding only about 3.63–3.65:1. The affected content includes table headers, standard tags, maturity labels, and CTA prose. | Use a darker tokenized accent behind white text, or dark token text on a light accent wash.**

- `dist/blog/ai-native-structural-analysis.html:145`
- `dist/blog/cfd-offshore-engineering.html:173`
- `dist/blog/digital-twins-offshore-assets.html:274`
- `dist/blog/offshore-engineering-standards.html:145`
- `dist/blog/open-source-engineering-tools.html:163`
- `dist/blog/python-engineering-automation.html:157`
- `dist/blog/risk-based-inspection-planning.html:173`
- `dist/calculators/decline-curve.html:122`
- `dist/blog/energy-data-automation-pipelines.html:124`
- `dist/blog/gulf-of-mexico-production-data-access.html:124`
- `dist/blog/machine-learning-fatigue-prediction.html:124`
- `dist/blog/marine-safety-incident-analysis.html:124`
- `dist/blog/npv-analysis-deepwater-field-development.html:124`
- `dist/calculators/fatigue-life-calculator.html:154,205`
- `dist/calculators/fatigue-sn-curve.html:182,248`
- `dist/calculators/index.html:277,364`
- `dist/calculators/mooring-fatigue.html:132,188`
- `dist/calculators/on-bottom-stability.html:132,188`
- `dist/calculators/wall-thickness.html:132,188`

#### H03

**HIGH | contrast / legibility | 7 pages listed below | A page-level `.cta-section a { color:white }` rule overrides `.btn-default` text while retaining the Bootstrap `#aea79f` background, producing about 2.38:1. | Use one shared compliant button variant; do not override every CTA anchor foreground.**

- `dist/blog/ai-native-structural-analysis.html:177,435`
- `dist/blog/energy-data-automation-pipelines.html:148,766`
- `dist/blog/gulf-of-mexico-production-data-access.html:148,711`
- `dist/blog/machine-learning-fatigue-prediction.html:148,615`
- `dist/blog/marine-safety-incident-analysis.html:148,768`
- `dist/blog/npv-analysis-deepwater-field-development.html:148,750`
- `dist/blog/offshore-engineering-standards.html:183,432`

#### H04

**HIGH | contrast / legibility | `dist/404.html:83-90,141,157-163` | The home button uses white on `#DD4814` (about 4.19:1), while custom footer links use `#DD4814` on `#222` (about 3.80:1); both miss 4.5:1 at 16px. The helpful links inside `<main>` are protected by the later shared rule and are not included. | Use compliant shared button and footer-link colours.**

#### H05

**HIGH | contrast / legibility | `dist/about.html:246,453` | Small `0.9em` standards tags use white text on `#28a745`, about 3.13:1. | Use a darker success ground or dark text on a light success wash.**

#### H06

**HIGH | contrast / legibility | `dist/blog/cfd-offshore-engineering.html:204,394` | Green workflow headings use `#28a745` on `#f8f9fa`, about 2.97:1 and below even the 3:1 large-text threshold. | Use `--navy`, `--teal-deep`, or another verified token.**

#### H07

**HIGH | contrast / legibility | 8 pages listed below | Built `.btn-success` controls render white on `#38b44a`, about 2.69:1. The `btn-lg` text is 18px regular and still requires 4.5:1. | Use an accessible success token pair or dark foreground.**

- `dist/calculators/fatigue-life-calculator.html:410`
- `dist/calculators/index.html:538`
- `dist/calculators/mooring-fatigue.html:347`
- `dist/calculators/on-bottom-stability.html:400`
- `dist/calculators/wall-thickness.html:393`
- `dist/case-studies/index.html:497`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:462`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:469`

#### H08

**HIGH | contrast / legibility | 4 pages listed below | Large result values use `#5cb85c` on white, about 2.48:1, missing the 3:1 large-text threshold. | Use a darker success token while retaining textual status cues.**

- `dist/calculators/fatigue-life-calculator.html:101,128`
- `dist/calculators/mooring-fatigue.html:103,130`
- `dist/calculators/on-bottom-stability.html:103,130`
- `dist/calculators/wall-thickness.html:103,130`

#### H09

**HIGH | contrast / legibility | 5 pages listed below | Bootstrap alert pairs (`#3a87ad` on `#d9edf7`; `#c09853` on `#fcf8e3`) do not reach 4.5:1 for normal alert text. | Override the alert foregrounds with accessible semantic tokens.**

- `dist/calculators/fatigue-life-calculator.html:314,396`
- `dist/calculators/index.html:526`
- `dist/calculators/mooring-fatigue.html:281,287`
- `dist/calculators/on-bottom-stability.html:320`
- `dist/calculators/wall-thickness.html:304`

#### H10

**HIGH | contrast / legibility | `dist/calculators/fatigue-sn-curve.html:103-108,396` and `dist/calculators/npv-field-development.html:103-108,443` | Inline orange button rules force white on `#e95420`, about 3.65:1 at 1.1em. | Remove the inline override and use a compliant shared button pair.**

#### H11

**HIGH | contrast / legibility | `dist/calculators/fatigue-sn-curve.html:119,154-155,568,638` and `dist/calculators/npv-field-development.html:119,159-160,646,656,662,666-669` | Dynamic red result/status text `#d9534f` is only about 3.2:1 even at the darkest endpoint of the result-card gradient, and worse toward `#4a5568`. | Use a status colour tested to 4.5:1 across the whole gradient.**

#### H12

**HIGH | contrast / legibility | `dist/calculators/index.html:338,352,375,398,422,445,469` | “NEW” badges use white 0.6em text on `#5cb85c`, about 2.48:1. | Use dark text on a light success wash or a darker success ground.**

#### H13

**HIGH | contrast / legibility | 9 pages listed below | Case-study compliance badges use small white text on `#28a745`, about 3.13:1. | Use an accessible success token pair.**

- `dist/case-studies/bsee-field-economics.html:159-165,248`
- `dist/case-studies/index.html:109-115,192`
- `dist/case-studies/marine-safety-correlation.html:159-165,248`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:191-195,360`
- `dist/case-studies/offshore-platform-fatigue-optimization.html:159-165,241`
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:534-537`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:191-195,370`
- `dist/case-studies/subsea-fea-automation.html:159-165,254`
- `dist/case-studies/wind-turbine-foundation-analysis.html:159-165,261`

#### H14

**HIGH | contrast / legibility | `dist/case-studies/wind-turbine-foundation-analysis.html:100,108-112,146,149-152` | Large green metrics use `#27ae60` on `#f8f9fa`, about 2.73:1 and below 3:1. | Use a darker green token.**

#### H15

**HIGH | contrast / legibility | `dist/capabilities/dc-drilldown.html:13-30,36-37,60-62,68,82,90,97-103,111-112,120-121,128-137` and `dist/capabilities/dc-qaqc-hub.html:19-65,80-86,108,120-125,138,170,180-190,203-215` | The custom D&C faint/status palettes fail repeatedly: light-theme `#7c929c` is about 2.8–3.3:1, several warning/success/hold pairs are about 3.2–4.1:1, and dark-theme `#6b8290` on `#0e2732` is about 3.85:1. | Replace the foreground/background pairs with values verified to 4.5:1 in both themes.**

#### H16

**HIGH | contrast / legibility | 7 pages listed below | Small orange badge/callout text uses `#ed8936`, only about 2.55:1 on white and about 2.43:1 on the pale report ground. | Use a darker foreground or darker tokenized badge ground.**

- `dist/demos/freespan.html:40,93-100,245,306,445`
- `dist/demos/mooring.html:39,88-95,159,225,261`
- `dist/demos/mudmat.html:40,93-100,245,306,692`
- `dist/demos/pipelay.html:40,93-100,245,306,1136`
- `dist/demos/wall-thickness.html:40,93-100,245,306,543`
- `dist/outreach/fowt-mooring-screening.html:38,49,100`
- `dist/outreach/index.html:39,110-118,204`

#### H17

**HIGH | contrast / legibility | 5 pages listed below | Demo status text uses `#38a169`, `#e53e3e`, or `#d69e2e` on white/light grounds, yielding about 3.25:1, 4.13:1, and 2.39:1 respectively. | Use darker semantic status tokens; keep the existing text labels so colour is not the sole cue.**

- `dist/demos/freespan.html:182-184,356-361`
- `dist/demos/mooring.html:148-150,285-314`
- `dist/demos/mudmat.html:182-184,391`
- `dist/demos/pipelay.html:182-184,405,419,755`
- `dist/demos/wall-thickness.html:182-184,386`

#### H18

**HIGH | contrast / legibility | 11 pages listed below | Small muted text uses page-local colours that fall below 4.5:1 on their actual grounds: `#718096`, `#1f8a4c`, `#6b7785`, or `#777`. | Use the live `--muted` value or a darker role-specific token verified on the actual ground.**

- `dist/demos/index.html:116,158`
- `dist/demos/freespan.html:154,315`
- `dist/demos/mooring.html:181,321,372`
- `dist/demos/mudmat.html:154,315`
- `dist/demos/pipelay.html:154,315`
- `dist/demos/wall-thickness.html:154,315`
- `dist/outreach/fowt-mooring-screening.html:41,63,127`
- `dist/outreach/index.html:42,95-96,126,206`
- `dist/platform.html:51,53-54,125-127`
- `dist/proof.html:50-51,120-126`
- `dist/index.html:139`

#### H19

**HIGH | contrast / legibility | `dist/contact.html:143-149,157-175,353,364,369,375` | The submit button is white on `#e95420` (about 3.65:1), while orange headings are `#e95420` on `#2d3436` (about 3.47:1). | Use a compliant shared button pair and a light theme token for headings on the dark card.**

#### H20

**HIGH | contrast / legibility | `dist/demos/jumper-installation.html:44,114-115,150-153` | Small status badges use `#2e7d32` on `#c8e6c9`, about 3.81:1. | Darken the badge foreground to an AA-compliant semantic token.**

#### H21

**HIGH | contrast / legibility | `dist/pricing.html:274` | The bottom Bootstrap success button renders white on `#38b44a`, about 2.69:1. | Use dark text or a darker success ground.**

#### H22

**HIGH | contrast / legibility | 3 pages listed below | The page-level `.rpt a { color:#2980b9 }` rule overrides the standard skip-link foreground outside `<main>`. On focus, the skip link is `#2980b9` on white, about 4.30:1. Links inside `<main>` are protected by the more-specific site-wide rule at `assets/css/theme.css:86-93`. | Exempt `.skip-link` from the report-wide anchor rule or set its foreground explicitly to `--ink`/`--navy`.**

- `dist/reports/diffraction/analysis.html:86,91`
- `dist/reports/diffraction/comparison.html:85,90`
- `dist/reports/diffraction/index.html:51,56`

#### H23

**HIGH | contrast / legibility | 3 pages listed below | Diffraction live/loading/pending labels use white on `#27ae60`, `#f39c12`, or `#7f8c8d`, yielding about 2.87:1, 2.19:1, and 3.48:1 for normal text. | Use darker status grounds or dark text on light status washes.**

- `dist/reports/diffraction/analysis.html:45-48,101`
- `dist/reports/diffraction/comparison.html:45-48,99`
- `dist/reports/diffraction/index.html:47-48,70`

#### H24

**HIGH | contrast / legibility | 3 pages listed below | Small hint/footer text uses `#7f8c8d` on white, about 3.48:1. | Use `--muted` or a darker token.**

- `dist/reports/diffraction/analysis.html:55,79,85`
- `dist/reports/diffraction/comparison.html:62,84`
- `dist/reports/diffraction/index.html:52,103`

#### H25

**HIGH | contrast / legibility | `dist/reports/diffraction/comparison.html:55,58` | The small series-B tag uses `#e67e22` on `#fdf2e9`, about 2.58:1. | Use a darker text token or darker status ground.**

#### H26

**HIGH | contrast / legibility | 7 solution-detail pages listed below | The `.85em` breadcrumb and its link are inline `#6b7785` on the dark hero gradient (`#2d3436` to `#4a5568`), varying from about 2.78:1 down to 1.65:1. | Use a light hero metadata token tested against both gradient endpoints.**

- `dist/solutions/codes-standards-maritime-law.html:89`
- `dist/solutions/design-cad.html:89`
- `dist/solutions/floating-marine.html:109`
- `dist/solutions/manufacturing-fabrication.html:89`
- `dist/solutions/power-electrical-controls.html:89`
- `dist/solutions/subsea-pipelines-integrity.html:109`
- `dist/solutions/wells-subsurface.html:109`

#### H27

**HIGH | contrast / legibility | 22 standards-detail pages listed below | Hero breadcrumbs use `#6b7785` (about 2.78:1 to 1.65:1), and the 1.05em summary uses `#52606d` (about 1.96:1 to 1.17:1) on the dark gradient. | Use light hero metadata tokens verified against both endpoints.**

- `dist/standards/api-579-fitness-for-service.html:128,130`
- `dist/standards/arps-decline-curve.html:146,148`
- `dist/standards/bsee-gom-production-data.html:128,130`
- `dist/standards/catenary-riser.html:128,130`
- `dist/standards/dnv-rp-b401-cathodic-protection.html:128,130`
- `dist/standards/dnv-rp-c203-fatigue.html:154,156`
- `dist/standards/dnv-rp-f105-free-span-viv.html:128,130`
- `dist/standards/dnv-rp-f109-on-bottom-stability.html:154,156`
- `dist/standards/dnv-st-f101-wall-thickness.html:154,156`
- `dist/standards/dynacard-diagnostics.html:128,130`
- `dist/standards/field-economics-npv.html:146,148`
- `dist/standards/fpso-spread-mooring-api-rp-2sk.html:128,130`
- `dist/standards/hull-hydrodynamics-diffraction.html:128,130`
- `dist/standards/intact-stability-imo.html:128,130`
- `dist/standards/mooring-line-fatigue.html:146,148`
- `dist/standards/ocimf-meg4-mooring-loads.html:128,130`
- `dist/standards/pipeline-lateral-buckling.html:128,130`
- `dist/standards/pipeline-upheaval-buckling.html:128,130`
- `dist/standards/riser-combined-loading.html:128,130`
- `dist/standards/synthetic-rope-mooring.html:128,130`
- `dist/standards/vessel-seakeeping.html:128,130`
- `dist/standards/well-nodal-analysis.html:128,130`

#### H28

**HIGH | contrast / legibility | `dist/vision.html:48,90,95` | The hero lede uses `#3a4654` on the dark gradient, only about 1.3:1. The same class is acceptable on the later light section, so the defect is the hero context. | Add a hero-scoped light lede colour.**

#### H29

**HIGH | structure / a11y | `dist/reports/diffraction/aqwa-analysis.html:21-24`, `dist/reports/diffraction/orcawave-analysis.html:21-24`, and `dist/reports/diffraction/orcawave-aqwa-comparison.html:25-28` | The three redirect/fallback pages have neither `<main>` nor a skip link. Their canonical links are present, so this is specifically the missing landmark/skip structure. | Put the fallback link in `<main id="main">` and add the standard skip link.**

#### H30

**HIGH | horizontal overflow | 33 pages listed below | Each cited `<table>` lacks a local ancestor with `overflow-x:auto`; several have four or five columns, and the shared `.comparison-table` has a 500px minimum. `body{overflow-x:hidden}` clips content instead of making it accessible. | Wrap each table in the established responsive/overflow container.**

<details>
<summary>H30 affected pages (33)</summary>

- `dist/blog/cfd-offshore-engineering.html:336`
- `dist/blog/energy-data-automation-pipelines.html:229`
- `dist/blog/gulf-of-mexico-production-data-access.html:240`
- `dist/blog/machine-learning-fatigue-prediction.html:284`
- `dist/blog/marine-safety-incident-analysis.html:239`
- `dist/blog/npv-analysis-deepwater-field-development.html:268`
- `dist/blog/open-source-engineering-tools.html:349`
- `dist/blog/python-engineering-automation.html:462`
- `dist/blog/risk-based-inspection-planning.html:341`
- `dist/calculators/decline-curve.html:248`
- `dist/calculators/fatigue-life-calculator.html:282`
- `dist/calculators/mooring-fatigue.html:251`
- `dist/calculators/on-bottom-stability.html:290`
- `dist/calculators/wall-thickness.html:278`
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:292,380,513`
- `dist/deckhand-api.html:225`
- `dist/demos/freespan.html:372`
- `dist/demos/mooring.html:248,327,355`
- `dist/demos/mudmat.html:373`
- `dist/demos/pipelay.html:381`
- `dist/demos/wall-thickness.html:368`
- `dist/demos/jumper-installation.html:98,112,118,148`
- `dist/engineering.html:238,275,316,351`
- `dist/outreach/fowt-mooring-screening.html:116,133`
- `dist/reports/diffraction/analysis.html:130`
- `dist/reports/diffraction/comparison.html:130,138`
- `dist/reports/sloshing-cfd-analysis.html:95`
- `dist/reports/sloshing-cfd-case.html:99`
- `dist/reports/sloshing-tank-summary.html:94`
- `dist/reports/sloshing/analysis.html:77`
- `dist/reports/sloshing/comparison.html:76,77`
- `dist/reports/sloshing/study.html:89`
- `dist/reports/sloshing/validation.html:113`

</details>

#### H31

**HIGH | horizontal overflow | `dist/demos/mudmat.html:713,719,725,731,737`, `dist/demos/pipelay.html:1157,1163,1169,1175,1181`, and `dist/demos/wall-thickness.html:576,588` | Generated Plotly elements carry literal widths from 700px to 1100px. The global body clipping rule hides overflow rather than preserving access. | Make graph containers `width:100%` with a suitable `max-width`, or place each chart in its own scrollable wrapper.**

#### H32

**HIGH | structure / a11y | `dist/contact.html:399,405,411` | Three project selectors are click-only `<div onclick>` controls with no keyboard focus, role, or key activation. | Use native buttons/radio controls, or add correct semantics, focusability, and keyboard activation.**

#### H33

**HIGH | structure / a11y | `dist/capabilities/dc-drilldown.html:196-201` | The search input has no durable accessible name: its `<label>` contains only an `aria-hidden` icon, and a placeholder is not a label. | Add visible or visually hidden label text, or an explicit `aria-label`.**

### Medium

#### M01

**MEDIUM | contrast / legibility | `dist/calculators/drilling-rig-selector.html:99,228` | The dynamic PDF links use `#2a78d6` on white at 12.5px, about 4.42:1 and narrowly below AA. | Use `--navy` or another link token reaching at least 4.5:1.**

#### M02

**MEDIUM | contrast / legibility | `dist/capabilities/index.html:106` | Tiny limitations text uses inline `#777` on white, about 4.48:1 at 0.82rem. | Use `var(--muted)` (`#5a6b76`).**

#### M03

**MEDIUM | raw hex instead of tokens | `assets/css/theme.css:13-24` plus the 104 affected page citations below | Inline and page-level styles duplicate live token values or introduce close neutral/accent variants. Examples include exact `#fff`, `#5a6b76`, `#0b3d5c`, and `#0e7e88`, plus close values such as `#f8f9fa`, `#f5f5f5`, `#f0f7ff`, `#333`, and `#eef1f3`. | Replace matches with live tokens. If a distinction is intentional, define one semantic token in `theme.css` rather than retaining a page-local raw value.**

<details>
<summary>M03 affected pages (104); each citation is one verified example</summary>

- `dist/404.html:59` (`#333` / `--ink`)
- `dist/about.html:160` (`#2d3436` / `--ink`)
- `dist/api-catalog.html:48` (`#fff` / `--bg`)
- `dist/blog/ai-native-structural-analysis.html:110` (`#f9f9f9` / `--bg`)
- `dist/blog/cfd-offshore-engineering.html:128` (`#5a6b76` / `--muted`)
- `dist/blog/digital-twins-offshore-assets.html:111` (`#5a6b76` / `--muted`)
- `dist/blog/energy-data-automation-pipelines.html:108` (`#f8f9fa` / `--bg`)
- `dist/blog/gulf-of-mexico-production-data-access.html:108` (`#f8f9fa` / `--bg`)
- `dist/blog/index.html:101` (`#5a6b76` / `--muted`)
- `dist/blog/machine-learning-fatigue-prediction.html:108` (`#f8f9fa` / `--bg`)
- `dist/blog/marine-safety-incident-analysis.html:108` (`#f8f9fa` / `--bg`)
- `dist/blog/npv-analysis-deepwater-field-development.html:108` (`#f8f9fa` / `--bg`)
- `dist/blog/offshore-engineering-standards.html:110` (`#f9f9f9` / `--bg`)
- `dist/blog/open-source-engineering-tools.html:111` (`#5a6b76` / `--muted`)
- `dist/blog/python-engineering-automation.html:111` (`#5a6b76` / `--muted`)
- `dist/blog/risk-based-inspection-planning.html:128` (`#5a6b76` / `--muted`)
- `dist/calculators/decline-curve.html:104` (`#fff` / `--bg`)
- `dist/calculators/drilling-rig-selector.html:70` (`#ffffff` / `--bg`)
- `dist/calculators/fatigue-life-calculator.html:102` (`#fff` / `--bg`)
- `dist/calculators/fatigue-sn-curve.html:71` (`#fff` / `--bg`)
- `dist/calculators/index.html:258` (`#fff` / `--bg`)
- `dist/calculators/mooring-fatigue.html:104` (`#fff` / `--bg`)
- `dist/calculators/npv-field-development.html:71` (`#fff` / `--bg`)
- `dist/calculators/on-bottom-stability.html:104` (`#fff` / `--bg`)
- `dist/calculators/wall-thickness.html:104` (`#fff` / `--bg`)
- `dist/capabilities/atlas-explorer.html:100` (`#0b3d5c` / `--navy`)
- `dist/capabilities/corrosion-control.html:100` (`#0b3d5c` / `--navy`)
- `dist/capabilities/dc-days-qaqc.html:108` (`#0e7e88` / `--teal-deep`)
- `dist/capabilities/dc-drilldown.html:10` (`#fff` / `--bg`)
- `dist/capabilities/dc-qaqc-hub.html:11` (`#fff` / `--bg`)
- `dist/capabilities/field-economics-sensitivity.html:93` (`#0e7e88` / `--teal-deep`)
- `dist/capabilities/field-explorer.html:102` (`#0e7e88` / `--teal-deep`)
- `dist/capabilities/index.html:102` (`#fff` / `--bg`)
- `dist/capabilities/pipeline-wall-thickness.html:93` (`#0b3d5c` / `--navy`)
- `dist/case-studies/bsee-field-economics.html:521` (`#f5f5f5` / `--tint`)
- `dist/case-studies/index.html:69` (`#fff` / `--bg`)
- `dist/case-studies/marine-safety-correlation.html:537` (`#f5f5f5` / `--tint`)
- `dist/case-studies/multi-code-wall-thickness-comparison.html:153` (`#f0f7ff` / `--tint`)
- `dist/case-studies/offshore-platform-fatigue-optimization.html:271` (`#f0f7ff` / `--tint`)
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:214` (`#f0f7ff` / `--tint`)
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:153` (`#f0f7ff` / `--tint`)
- `dist/case-studies/subsea-fea-automation.html:100` (`#f8f9fa` / `--bg`)
- `dist/case-studies/wind-turbine-foundation-analysis.html:199` (`#ecf0f1` / `--tint`)
- `dist/contact.html:113` (`#fff` / `--bg`)
- `dist/deckhand-api.html:77` (`#fff` / `--bg`)
- `dist/deckhand.html:92` (`#fff` / `--bg`)
- `dist/demos/freespan.html:44` (`#f7fafc` / `--bg`)
- `dist/demos/index.html:116` (`#fff` / `--bg`)
- `dist/demos/jumper-installation.html:37` (`#fff` / `--bg`)
- `dist/demos/mooring.html:43` (`#f7fafc` / `--bg`)
- `dist/demos/mudmat.html:44` (`#f7fafc` / `--bg`)
- `dist/demos/pipelay.html:44` (`#f7fafc` / `--bg`)
- `dist/demos/wall-thickness.html:44` (`#f7fafc` / `--bg`)
- `dist/energy.html:224` (`#eef5f2` / `--tint`)
- `dist/faq.html:234` (`#5a6b76` / `--muted`)
- `dist/index.html:135` (`#fff` / `--bg`)
- `dist/methodology/compliance-dashboard/index.html:27` (`#fff` / `--bg`)
- `dist/methodology/compound-engineering/index.html:27` (`#fff` / `--bg`)
- `dist/methodology/cross-review/index.html:27` (`#fff` / `--bg`)
- `dist/methodology/enforcement/index.html:27` (`#fff` / `--bg`)
- `dist/methodology/multi-agent-parity/index.html:27` (`#fff` / `--bg`)
- `dist/methodology/orchestrator-worker/index.html:27` (`#fff` / `--bg`)
- `dist/outreach/fowt-mooring-screening.html:39` (`#f7fafc` / `--bg`)
- `dist/outreach/index.html:40` (`#f7fafc` / `--bg`)
- `dist/outreach/vessel-contractor-brochure.html:46` (`#fff` / `--bg`)
- `dist/platform.html:48` (`#fff` / `--bg`)
- `dist/pricing.html:118` (`#fff` / `--bg`)
- `dist/proof.html:48` (`#fff` / `--bg`)
- `dist/reports/diffraction/analysis.html:40` (`#fff` / `--bg`)
- `dist/reports/diffraction/comparison.html:40` (`#fff` / `--bg`)
- `dist/reports/diffraction/index.html:39` (`#fff` / `--bg`)
- `dist/reports/sloshing/validation.html:33` (`#fff` / `--bg`)
- `dist/solutions/codes-standards-maritime-law.html:101` (`#f8f9fa` / `--bg`)
- `dist/solutions/design-cad.html:101` (`#f8f9fa` / `--bg`)
- `dist/solutions/floating-marine.html:121` (`#f8f9fa` / `--bg`)
- `dist/solutions/index.html:48` (`#fff` / `--bg`)
- `dist/solutions/manufacturing-fabrication.html:101` (`#f8f9fa` / `--bg`)
- `dist/solutions/power-electrical-controls.html:101` (`#f8f9fa` / `--bg`)
- `dist/solutions/subsea-pipelines-integrity.html:121` (`#f8f9fa` / `--bg`)
- `dist/solutions/wells-subsurface.html:121` (`#f8f9fa` / `--bg`)
- `dist/standards/api-579-fitness-for-service.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/arps-decline-curve.html:159` (`#f8f9fa` / `--bg`)
- `dist/standards/bsee-gom-production-data.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/catenary-riser.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/dnv-rp-b401-cathodic-protection.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/dnv-rp-c203-fatigue.html:167` (`#f8f9fa` / `--bg`)
- `dist/standards/dnv-rp-f105-free-span-viv.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/dnv-rp-f109-on-bottom-stability.html:167` (`#f8f9fa` / `--bg`)
- `dist/standards/dnv-st-f101-wall-thickness.html:167` (`#f8f9fa` / `--bg`)
- `dist/standards/dynacard-diagnostics.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/field-economics-npv.html:159` (`#f8f9fa` / `--bg`)
- `dist/standards/fpso-spread-mooring-api-rp-2sk.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/hull-hydrodynamics-diffraction.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/index.html:48` (`#fff` / `--bg`)
- `dist/standards/intact-stability-imo.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/mooring-line-fatigue.html:159` (`#f8f9fa` / `--bg`)
- `dist/standards/ocimf-meg4-mooring-loads.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/pipeline-lateral-buckling.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/pipeline-upheaval-buckling.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/riser-combined-loading.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/synthetic-rope-mooring.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/vessel-seakeeping.html:141` (`#f8f9fa` / `--bg`)
- `dist/standards/well-nodal-analysis.html:141` (`#f8f9fa` / `--bg`)
- `dist/vision.html:50` (`#fff` / `--bg`)

</details>

#### M04

**MEDIUM | typography / measure | 47 pages listed below | The cited prose containers permit lines materially wider than the approximately 65-character quality bar: uncapped Bootstrap columns, 800px article bodies, 980–1400px report shells, or 1120–1180px sloshing shells. | Cap prose at about `65ch` independently of tables, plots, cards, and grids.**

<details>
<summary>M04 affected pages (47)</summary>

- `dist/about.html:334,336`
- `dist/api-catalog.html:117,119`
- `dist/blog/ai-native-structural-analysis.html:120,225`
- `dist/blog/digital-twins-offshore-assets.html:126,320`
- `dist/blog/index.html:144,154`
- `dist/blog/offshore-engineering-standards.html:120,242`
- `dist/blog/open-source-engineering-tools.html:126,235`
- `dist/blog/python-engineering-automation.html:126,214`
- `dist/calculators/decline-curve.html:171,282`
- `dist/calculators/drilling-rig-selector.html:133,135`
- `dist/blog/cfd-offshore-engineering.html:112`
- `dist/blog/energy-data-automation-pipelines.html:92`
- `dist/blog/gulf-of-mexico-production-data-access.html:92`
- `dist/blog/machine-learning-fatigue-prediction.html:92`
- `dist/blog/marine-safety-incident-analysis.html:92`
- `dist/blog/npv-analysis-deepwater-field-development.html:92`
- `dist/blog/risk-based-inspection-planning.html:112`
- `dist/deckhand-api.html:250,252`
- `dist/demos/freespan.html:110-132`
- `dist/demos/mooring.html:103-122`
- `dist/demos/mudmat.html:110-132`
- `dist/demos/pipelay.html:110-132`
- `dist/demos/wall-thickness.html:110-132`
- `dist/energy.html:219,231`
- `dist/faq.html:185,190`
- `dist/methodology/compliance-dashboard/index.html:28,52`
- `dist/methodology/compound-engineering/index.html:28,52`
- `dist/methodology/cross-review/index.html:28,52`
- `dist/methodology/enforcement/index.html:28,52`
- `dist/methodology/multi-agent-parity/index.html:28,52`
- `dist/methodology/orchestrator-worker/index.html:28,52`
- `dist/outreach/fowt-mooring-screening.html:51,55,115`
- `dist/outreach/index.html:85-88,220,267`
- `dist/outreach/vessel-contractor-brochure.html:76-81,187,243`
- `dist/reports/diffraction/analysis.html:39,120`
- `dist/reports/diffraction/comparison.html:39,151`
- `dist/reports/diffraction/index.html:38,70`
- `dist/reports/sloshing-cfd-analysis.html:79,80`
- `dist/reports/sloshing-cfd-case.html:79,80`
- `dist/reports/sloshing-tank-summary.html:79,80`
- `dist/reports/sloshing/analysis.html:73,75`
- `dist/reports/sloshing/browse.html:79,94`
- `dist/reports/sloshing/comparison.html:74,75`
- `dist/reports/sloshing/dual-connected-tanks.html:77`
- `dist/reports/sloshing/index.html:76`
- `dist/reports/sloshing/study.html:80,81`
- `dist/reports/sloshing/validation.html:84,87`

</details>

#### M05

**MEDIUM | typography / numeric alignment | 52 pages listed below | Engineering tables, KPI grids, and other aligned digit columns have no applicable `font-variant-numeric:tabular-nums`. The narrow declarations in `dist/assets/css/sloshing-reports.css:39,58` do not cover these cited columns. | Apply tabular numerals to numeric table cells and aligned metric values.**

<details>
<summary>M05 affected pages (52)</summary>

- `dist/blog/ai-native-structural-analysis.html:324`
- `dist/blog/cfd-offshore-engineering.html:350`
- `dist/blog/energy-data-automation-pipelines.html:237`
- `dist/blog/machine-learning-fatigue-prediction.html:445`
- `dist/blog/npv-analysis-deepwater-field-development.html:585`
- `dist/blog/offshore-engineering-standards.html:372`
- `dist/calculators/decline-curve.html:248`
- `dist/calculators/drilling-rig-selector.html:185,246`
- `dist/calculators/fatigue-life-calculator.html:282`
- `dist/calculators/mooring-fatigue.html:251`
- `dist/calculators/on-bottom-stability.html:290`
- `dist/calculators/wall-thickness.html:278`
- `dist/capabilities/atlas-explorer.html:100`
- `dist/capabilities/corrosion-control.html:100`
- `dist/capabilities/dc-days-qaqc.html:108`
- `dist/capabilities/field-economics-sensitivity.html:93`
- `dist/capabilities/field-explorer.html:102`
- `dist/capabilities/pipeline-wall-thickness.html:93`
- `dist/case-studies/bsee-field-economics.html:373`
- `dist/case-studies/marine-safety-correlation.html:362`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:308`
- `dist/case-studies/offshore-platform-fatigue-optimization.html:371`
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:292`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:310`
- `dist/case-studies/subsea-fea-automation.html:414`
- `dist/case-studies/wind-turbine-foundation-analysis.html:349`
- `dist/contact.html:425-435`
- `dist/demos/index.html:306-320`
- `dist/demos/freespan.html:372`
- `dist/demos/mooring.html:248,269,327`
- `dist/demos/mudmat.html:373`
- `dist/demos/pipelay.html:381`
- `dist/demos/wall-thickness.html:368`
- `dist/demos/jumper-installation.html:98,112,118,148`
- `dist/engineering.html:351-386`
- `dist/index.html:135-141`
- `dist/methodology/compound-engineering/index.html:114-120`
- `dist/methodology/enforcement/index.html:129-134`
- `dist/methodology/orchestrator-worker/index.html:96-102,178-184`
- `dist/outreach/fowt-mooring-screening.html:116-140`
- `dist/proof.html:100-102,120-126`
- `dist/reports/diffraction/analysis.html:130`
- `dist/reports/diffraction/comparison.html:130`
- `dist/reports/sloshing-cfd-analysis.html:95`
- `dist/reports/sloshing-cfd-case.html:99`
- `dist/reports/sloshing-tank-summary.html:94`
- `dist/reports/sloshing/analysis.html:77`
- `dist/reports/sloshing/comparison.html:76`
- `dist/reports/sloshing/dual-connected-tanks.html:79`
- `dist/reports/sloshing/index.html:83`
- `dist/reports/sloshing/study.html:89`
- `dist/reports/sloshing/validation.html:113`

</details>

#### M06

**MEDIUM | consistency | 12 pages listed below | These pages omit at least one shared shell partial. The 404 page uses a custom footer; drilling, energy, and FAQ omit the shared footer; both D&C pages use custom nav/footer shells; all six diffraction pages omit the shared nav/footer partials. | Render the shared nav/footer shell while retaining page-specific subnavigation or compact redirect content.**

- `dist/404.html:157`
- `dist/calculators/drilling-rig-selector.html:291`
- `dist/capabilities/dc-drilldown.html:144,156,218`
- `dist/capabilities/dc-qaqc-hub.html:227,237,438`
- `dist/energy.html:274-279`
- `dist/faq.html:238-240`
- `dist/reports/diffraction/analysis.html:90-92,202`
- `dist/reports/diffraction/aqwa-analysis.html:21-25`
- `dist/reports/diffraction/comparison.html:89-91,195`
- `dist/reports/diffraction/index.html:55-57,103`
- `dist/reports/diffraction/orcawave-analysis.html:21-25`
- `dist/reports/diffraction/orcawave-aqwa-comparison.html:25-29`

#### M07

**MEDIUM | consistency / duplicated `:root` | 9 pages listed below | These pages define overlapping page-local token systems. Five demo blocks are near-identical copies; the two outreach blocks closely repeat them; the two D&C pages repeat light/dark roots and define `#0e7c8b`, a near-duplicate of `--teal-deep:#0e7e88`. | Map shared roles to `theme.css`, retain one scoped dark override where needed, and keep only genuinely component-specific variables locally.**

- `dist/capabilities/dc-drilldown.html:12-30`
- `dist/capabilities/dc-qaqc-hub.html:13-65`
- `dist/demos/freespan.html:37-48`
- `dist/demos/mooring.html:36-47`
- `dist/demos/mudmat.html:37-48`
- `dist/demos/pipelay.html:37-48`
- `dist/demos/wall-thickness.html:37-48`
- `dist/outreach/fowt-mooring-screening.html:35-43`
- `dist/outreach/index.html:36-44`

#### M08

**MEDIUM | consistency / duplicated page styles | Six methodology pages repeat the same page-level style block at `:27-28`, including exact/near token values such as `#fff`, `#263238`, `#1a365d`, and multiple tint/border variants. | Move the shared block into one stylesheet and consume the live tokens.**

- `dist/methodology/compliance-dashboard/index.html:27-28`
- `dist/methodology/compound-engineering/index.html:27-28`
- `dist/methodology/cross-review/index.html:27-28`
- `dist/methodology/enforcement/index.html:27-28`
- `dist/methodology/multi-agent-parity/index.html:27-28`
- `dist/methodology/orchestrator-worker/index.html:27-28`

#### M09

**MEDIUM | consistency / local token system | `dist/calculators/drilling-rig-selector.html:70` | `.rig-root` defines a competing raw palette, including a conflicting local `--ink` and an exact duplicate of `--bg`. | Map shared roles to the live token set and reserve local variables for component-only roles.**

#### M10

**MEDIUM | structure / a11y | `dist/capabilities/dc-drilldown.html:173,266-267` and `dist/calculators/fatigue-sn-curve.html:328,549-553` | Dynamic rendering creates heading jumps: the D&C initial view goes from the page `<h1>` to card `<h3>` headings, and the calculator replaces a proper `<h3>` with `<h5>` after selection, yielding h2→h5. | Preserve an h2/h3 hierarchy and use size classes for appearance.**

#### M11

**MEDIUM | structure / a11y | `dist/capabilities/pipeline-wall-thickness.html:93` and `dist/capabilities/field-explorer.html:162` | SVGs declared with `role="img"` have no accessible name. | Add `<title>` plus `aria-labelledby`, or a meaningful `aria-label`.**

#### M12

**MEDIUM | structure / a11y | `dist/calculators/drilling-rig-selector.html:243,247` | Sortable `<th>` elements are pointer-only: they receive click handlers but no native control, focusability, keyboard handler, or `aria-sort`. | Put a keyboard-focusable button in each sortable header and maintain `aria-sort`.**

#### M13

**MEDIUM | structure / a11y | `dist/calculators/drilling-rig-selector.html:194,270,277` | The scatter plot differentiates rig type only by circle fill colour, while point details are exposed through mouse-only tooltip events. | Pair colour with marker shape and expose each point to keyboard/focus users.**

#### M14

**MEDIUM | consistency / layout | `dist/demos/jumper-installation.html:33,48,158` | A page-wide `body{max-width:900px;margin:0 auto;padding:2rem}` constrains the shared nav and footer along with the report. | Scope the report width and padding to `main` or a report wrapper.**

### Low

#### L01

**LOW | typography / shared footer | `dist/about.html:489` plus the 105 affected page citations below | The identical shared-footer fragment hard-codes `font-size:0.85em` inline on every page that renders that partial. This bypasses the type scale and duplicates presentation in 105 generated files. | Move the declaration to the shared footer stylesheet and use the existing type scale.**

<details>
<summary>L01 affected pages (105)</summary>

- `dist/about.html:489`
- `dist/api-catalog.html:387`
- `dist/blog/ai-native-structural-analysis.html:451`
- `dist/blog/cfd-offshore-engineering.html:545`
- `dist/blog/digital-twins-offshore-assets.html:513`
- `dist/blog/energy-data-automation-pipelines.html:791`
- `dist/blog/gulf-of-mexico-production-data-access.html:735`
- `dist/blog/index.html:419`
- `dist/blog/machine-learning-fatigue-prediction.html:637`
- `dist/blog/marine-safety-incident-analysis.html:792`
- `dist/blog/npv-analysis-deepwater-field-development.html:774`
- `dist/blog/offshore-engineering-standards.html:448`
- `dist/blog/open-source-engineering-tools.html:585`
- `dist/blog/python-engineering-automation.html:670`
- `dist/blog/risk-based-inspection-planning.html:421`
- `dist/calculators/decline-curve.html:341`
- `dist/calculators/fatigue-life-calculator.html:425`
- `dist/calculators/fatigue-sn-curve.html:414`
- `dist/calculators/index.html:551`
- `dist/calculators/mooring-fatigue.html:361`
- `dist/calculators/npv-field-development.html:461`
- `dist/calculators/on-bottom-stability.html:414`
- `dist/calculators/wall-thickness.html:407`
- `dist/capabilities/atlas-explorer.html:258`
- `dist/capabilities/corrosion-control.html:208`
- `dist/capabilities/dc-days-qaqc.html:227`
- `dist/capabilities/field-economics-sensitivity.html:131`
- `dist/capabilities/field-explorer.html:220`
- `dist/capabilities/index.html:132`
- `dist/capabilities/pipeline-wall-thickness.html:151`
- `dist/case-studies/bsee-field-economics.html:552`
- `dist/case-studies/index.html:511`
- `dist/case-studies/marine-safety-correlation.html:567`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:484`
- `dist/case-studies/offshore-platform-fatigue-optimization.html:523`
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:600`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:491`
- `dist/case-studies/subsea-fea-automation.html:625`
- `dist/case-studies/wind-turbine-foundation-analysis.html:705`
- `dist/contact.html:453`
- `dist/deckhand-api.html:281`
- `dist/deckhand.html:268`
- `dist/demos/freespan.html:512`
- `dist/demos/index.html:545`
- `dist/demos/jumper-installation.html:165`
- `dist/demos/mooring.html:395`
- `dist/demos/mudmat.html:759`
- `dist/demos/pipelay.html:1203`
- `dist/demos/wall-thickness.html:610`
- `dist/engineering.html:594`
- `dist/index.html:179`
- `dist/methodology/compliance-dashboard/index.html:125`
- `dist/methodology/compound-engineering/index.html:131`
- `dist/methodology/cross-review/index.html:156`
- `dist/methodology/enforcement/index.html:165`
- `dist/methodology/multi-agent-parity/index.html:203`
- `dist/methodology/orchestrator-worker/index.html:195`
- `dist/outreach/fowt-mooring-screening.html:190`
- `dist/outreach/index.html:285`
- `dist/outreach/vessel-contractor-brochure.html:266`
- `dist/platform.html:153`
- `dist/pricing.html:288`
- `dist/proof.html:183`
- `dist/reports/sloshing-cfd-analysis.html:104`
- `dist/reports/sloshing-cfd-case.html:108`
- `dist/reports/sloshing-tank-summary.html:103`
- `dist/reports/sloshing/analysis.html:86`
- `dist/reports/sloshing/browse.html:103`
- `dist/reports/sloshing/comparison.html:87`
- `dist/reports/sloshing/dual-connected-tanks.html:119`
- `dist/reports/sloshing/index.html:119`
- `dist/reports/sloshing/study.html:99`
- `dist/reports/sloshing/validation.html:139`
- `dist/solutions/codes-standards-maritime-law.html:141`
- `dist/solutions/design-cad.html:141`
- `dist/solutions/floating-marine.html:177`
- `dist/solutions/index.html:144`
- `dist/solutions/manufacturing-fabrication.html:141`
- `dist/solutions/power-electrical-controls.html:141`
- `dist/solutions/subsea-pipelines-integrity.html:181`
- `dist/solutions/wells-subsurface.html:175`
- `dist/standards/api-579-fitness-for-service.html:196`
- `dist/standards/arps-decline-curve.html:214`
- `dist/standards/bsee-gom-production-data.html:196`
- `dist/standards/catenary-riser.html:196`
- `dist/standards/dnv-rp-b401-cathodic-protection.html:196`
- `dist/standards/dnv-rp-c203-fatigue.html:223`
- `dist/standards/dnv-rp-f105-free-span-viv.html:195`
- `dist/standards/dnv-rp-f109-on-bottom-stability.html:222`
- `dist/standards/dnv-st-f101-wall-thickness.html:223`
- `dist/standards/dynacard-diagnostics.html:196`
- `dist/standards/field-economics-npv.html:214`
- `dist/standards/fpso-spread-mooring-api-rp-2sk.html:196`
- `dist/standards/hull-hydrodynamics-diffraction.html:196`
- `dist/standards/index.html:177`
- `dist/standards/intact-stability-imo.html:196`
- `dist/standards/mooring-line-fatigue.html:214`
- `dist/standards/ocimf-meg4-mooring-loads.html:196`
- `dist/standards/pipeline-lateral-buckling.html:196`
- `dist/standards/pipeline-upheaval-buckling.html:196`
- `dist/standards/riser-combined-loading.html:196`
- `dist/standards/synthetic-rope-mooring.html:196`
- `dist/standards/vessel-seakeeping.html:196`
- `dist/standards/well-nodal-analysis.html:196`
- `dist/vision.html:187`

</details>

#### L02

**LOW | typography / one-off sizes | 62 pages listed below | Additional inline or page-local one-off sizes (`12px`, `.8em`, `.85em`, `1.02em`, `1.05em`, and similar values) bypass the shared scale. | Replace them with existing type-scale/component classes.**

<details>
<summary>L02 affected pages (62)</summary>

- `dist/about.html:359,420`
- `dist/api-catalog.html:344`
- `dist/blog/index.html:382`
- `dist/calculators/fatigue-sn-curve.html:351`
- `dist/calculators/index.html:338`
- `dist/calculators/mooring-fatigue.html:310`
- `dist/calculators/npv-field-development.html:372`
- `dist/calculators/on-bottom-stability.html:367`
- `dist/calculators/wall-thickness.html:329`
- `dist/capabilities/atlas-explorer.html:100`
- `dist/capabilities/corrosion-control.html:100`
- `dist/capabilities/dc-days-qaqc.html:108`
- `dist/capabilities/dc-drilldown.html:339`
- `dist/capabilities/field-economics-sensitivity.html:93`
- `dist/capabilities/field-explorer.html:102`
- `dist/capabilities/index.html:87`
- `dist/capabilities/pipeline-wall-thickness.html:93`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:239`
- `dist/case-studies/offshore-platform-fatigue-optimization.html:272`
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:215`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:239`
- `dist/contact.html:371`
- `dist/demos/index.html:531`
- `dist/demos/jumper-installation.html:75,87,156`
- `dist/engineering.html:365,377,537-562`
- `dist/index.html:96-97,114,135-141,160,165`
- `dist/demos/freespan.html:315,320`
- `dist/demos/mooring.html:321,372,380`
- `dist/demos/mudmat.html:315,320`
- `dist/demos/pipelay.html:315,320`
- `dist/demos/wall-thickness.html:315,320`
- `dist/reports/diffraction/analysis.html:177`
- `dist/reports/diffraction/comparison.html:478`
- `dist/solutions/codes-standards-maritime-law.html:89`
- `dist/solutions/design-cad.html:89`
- `dist/solutions/floating-marine.html:109`
- `dist/solutions/manufacturing-fabrication.html:89`
- `dist/solutions/power-electrical-controls.html:89`
- `dist/solutions/subsea-pipelines-integrity.html:109`
- `dist/solutions/wells-subsurface.html:109`
- `dist/standards/api-579-fitness-for-service.html:128,130`
- `dist/standards/arps-decline-curve.html:146,148`
- `dist/standards/bsee-gom-production-data.html:128,130`
- `dist/standards/catenary-riser.html:128,130`
- `dist/standards/dnv-rp-b401-cathodic-protection.html:128,130`
- `dist/standards/dnv-rp-c203-fatigue.html:154,156`
- `dist/standards/dnv-rp-f105-free-span-viv.html:128,130`
- `dist/standards/dnv-rp-f109-on-bottom-stability.html:154,156`
- `dist/standards/dnv-st-f101-wall-thickness.html:154,156`
- `dist/standards/dynacard-diagnostics.html:128,130`
- `dist/standards/field-economics-npv.html:146,148`
- `dist/standards/fpso-spread-mooring-api-rp-2sk.html:128,130`
- `dist/standards/hull-hydrodynamics-diffraction.html:128,130`
- `dist/standards/intact-stability-imo.html:128,130`
- `dist/standards/mooring-line-fatigue.html:146,148`
- `dist/standards/ocimf-meg4-mooring-loads.html:128,130`
- `dist/standards/pipeline-lateral-buckling.html:128,130`
- `dist/standards/pipeline-upheaval-buckling.html:128,130`
- `dist/standards/riser-combined-loading.html:128,130`
- `dist/standards/synthetic-rope-mooring.html:128,130`
- `dist/standards/vessel-seakeeping.html:128,130`
- `dist/standards/well-nodal-analysis.html:128,130`

</details>

## NEEDS HUMAN JUDGEMENT

### J01 — gradient-backed case-study text

**NEEDS HUMAN JUDGEMENT | contrast | 7 pages listed below | White text can cross bright gradient endpoints: white on `#3498db` is about 3.15:1 for normal metadata, and white on `#2ecc71` is about 2.10:1. Static inspection cannot establish which pixels sit beneath every glyph at each viewport. | Sample desktop and 375px renders; if text crosses the bright region, darken the endpoint or add a stable text scrim.**

- `dist/case-studies/bsee-field-economics.html:81,241`
- `dist/case-studies/marine-safety-correlation.html:81,241`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:109,240`
- `dist/case-studies/offshore-platform-fatigue-optimization.html:81,234`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:109,240`
- `dist/case-studies/subsea-fea-automation.html:81,247`
- `dist/case-studies/wind-turbine-foundation-analysis.html:81,254`

### J02 — rendered paragraph measure

**NEEDS HUMAN JUDGEMENT | typography / measure | 14 pages listed below | These long paragraphs have no local `ch`-based cap and appear to sit in 780–1170px desktop columns. Exact line length depends on the rendered font and viewport. | Measure the rendered desktop line length; add a shared `max-width:65ch` prose wrapper if confirmed.**

- `dist/calculators/fatigue-life-calculator.html:323`
- `dist/calculators/index.html:343`
- `dist/calculators/mooring-fatigue.html:297`
- `dist/calculators/on-bottom-stability.html:332`
- `dist/calculators/wall-thickness.html:316`
- `dist/case-studies/bsee-field-economics.html:279`
- `dist/case-studies/index.html:170`
- `dist/case-studies/marine-safety-correlation.html:279`
- `dist/case-studies/multi-code-wall-thickness-comparison.html:274`
- `dist/case-studies/offshore-platform-fatigue-optimization.html:272`
- `dist/case-studies/orcaflex-riser-sensitivity-automation.html:213-215`
- `dist/case-studies/pipeline-on-bottom-stability-assessment.html:274`
- `dist/case-studies/subsea-fea-automation.html:285`
- `dist/case-studies/wind-turbine-foundation-analysis.html:292`

### J03 — generated Plotly label contrast and clipping

**NEEDS HUMAN JUDGEMENT | contrast / horizontal clipping | `dist/demos/freespan.html:466`, `dist/demos/mudmat.html:713`, `dist/demos/pipelay.html:1157`, and `dist/demos/wall-thickness.html:576` | Generated Plotly payloads contain chart-specific palettes and small labels. The fixed-width defects are asserted in H31, but text-on-mark contrast and label clipping require a rendered viewport. | Inspect the plots at 375px and 1280px with a contrast sampler before changing chart colours or margins.**

## Pages that are clean

- None.
