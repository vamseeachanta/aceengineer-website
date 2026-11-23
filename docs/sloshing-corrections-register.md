# Sloshing Corrections Register

Audit date: 2026-07-29  
Website audit base: `capability/sloshing-damping-and-sizing` at `94c25df`  
Correction branch: `audit/sloshing-superseded-claims-20260729`

## Scope and method

This register checks the six measurement-backed corrections supplied for the audit against:

- every requested AceEngineer source surface in `content/reports/sloshing/*.html`,
  `content/reports/sloshing-*.html`,
  `content/partials/sloshing-capability-nav.html`, and
  `config/capabilities.yaml`;
- the requested digitalmodel public trees:
  `docs/api/cfd/*.html`, `docs/api/cfd/*.json`,
  `docs/api/structural/*.json`, sloshing-related material under
  `docs/domains/**`, and capability/report candidates found by searches for
  sloshing, connected tanks, twin/dual tanks, U-tubes, exchange modes,
  exchange periods, conduit areas, inter-tank mass shift, and `dm1528`.

The audit used literal and variant searches for the superseded numbers and
phrases, followed by reading the matching passages in context. No CFD or
OpenFOAM command was run.

The digitalmodel search found sloshing pages and JSON artifacts, but none of
the specified public surfaces contains connected-tank, U-tube, exchange-mode,
inter-tank, conduit-area, or `dm1528` claims. Therefore digitalmodel has no
finding against the six supplied corrections. Its pre-existing modified
`uv.lock` was not touched.

## Severity definition

- **Critical** — a superseded number or physical result is presented as valid.
- **High** — a superseded causal interpretation or validation claim is
  presented as valid.
- **Medium** — the measured number remains valid, but its framing implies a
  universal governing, natural, or tuning period.

## Critical findings

### C-01 — Superseded effective-length calibration remains in the corrected reference page

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > `<tr><td>10.0 m</td><td>geometric (centroid-to-centroid)</td><td>19.4 s</td><td>lower bound</td></tr>`
  >
  > `<tr class="highlight"><td>14.3 m</td><td>calibrated to CFD peak</td><td>23.0 s</td><td>+4.3 m entrance / added-mass</td></tr>`
- Violates: **1 — Exchange period** and **2 — Effective conduit length**.
- Replacement applied:
  > `<tr><td>10.0 m</td><td>geometric (centroid-to-centroid)</td><td>19.4 s</td><td>uncorrected geometric-path comparison</td></tr>`
  >
  > `<tr class="highlight"><td>5.20 m</td><td>calibrated to the measured natural period</td><td>14.31 s</td><td>0.520× geometric; 90° phase crossing</td></tr>`

### C-02 — The amplitude peak is still called the exchange resonance

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “The twin-tank CFD response plateaus/peaks at 22–24 s. This is the
  > connected exchange resonance … The closed-form exchange mode lands in the
  > same band, so analytical and CFD agree on why the response peaks where it
  > does.”
- Violates: **1 — Exchange period**.
- Replacement applied:
  > “The connected exchange natural period is 14.31 s, identified by the 90°
  > phase crossing. The 22–24 s plateau in the 5° forced-roll sweep is the
  > loss-controlled amplitude peak, not the exchange resonance or tuning
  > period; it shifts from 20 s to 40 s across the measured 2.5°–10°
  > roll-amplitude range.”

### C-03 — Validation summary still reports a 22–24 s exchange period

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “Connected exchange period agrees analytical ↔ CFD (22–24 s)”
- Violates: **1 — Exchange period**.
- Replacement applied:
  > “Connected exchange natural period is 14.31 s from the 90° phase
  > crossing”

## High findings

### H-01 — Total moment is described as dynamically amplified near resonance

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “At the governing 24 s case, the CFD level-difference amplitude
  > (1.1037 m) fixes the volume exchanged between legs; the analytical
  > hydrostatic redistribution about the leg centroids gives the roll moment,
  > which the CFD then amplifies dynamically near resonance.”
- Violates: **3 — The ×1.45 moment residual** and **6 — Amplification**.
- Replacement applied:
  > “For the published 24 s, 5° forcing case, the CFD level-difference
  > amplitude (1.1037 m) fixes the volume exchanged between legs. The
  > 6.66 MN·m redistribution estimate omits two static contributions to the
  > total roll moment: the weight moment of the whole fluid mass about the roll
  > axis and the within-leg free surface.”

### H-02 — The result table labels ×1.45 as dynamic amplification

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “Roll moment — total | 6.66 MN·m | 9.67 MN·m | ×1.45 dynamic amplification”
- Violates: **3 — The ×1.45 moment residual**.
- Replacement applied:
  > “Roll moment — total | 6.66 MN·m redistribution-only estimate |
  > 9.67 MN·m | ×1.45 static-term residual; resolved in closed form”

### H-03 — ×1.34 is presented as the same resonant dynamic effect

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “A single ×1.34 dynamic-amplification factor reconciles absolute magnitude
  > — the same resonant amplification seen in the roll moment (×1.45).”
- Violates: **3 — The ×1.45 moment residual** and **6 — Amplification**.
- Replacement applied:
  > “The previously applied ×1.34 absolute-magnitude factor must not be
  > interpreted as resonant dynamic amplification; the basis for reconciling
  > absolute exchange magnitude remains unverified — needs owner.”
- Owner decision: determine the correct physical basis, if any, for the
  exchange-amplitude magnitude reconciliation. The supplied six corrections
  disprove the published explanation but do not establish a replacement for
  that separate exchange-amplitude factor.

### H-04 — Established list retains the dynamic-residual interpretation

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “Inter-tank mass shift & roll moment derived from the CFD level difference
  > (×1.45 dynamic-amplification residual)”
- Violates: **3 — The ×1.45 moment residual**.
- Replacement applied:
  > “Inter-tank mass shift derived from the CFD level difference; the former
  > ×1.45 roll-moment residual is resolved as two omitted static terms”

### H-05 — Boundary list retains a universal ×1.34–1.45 resonant factor

- File: `content/reports/sloshing/dual-connected-tanks.html`
- Exact published text:
  > “Absolute magnitude carries one ×1.34–1.45 dynamic factor (resonant
  > amplification)”
- Violates: **3 — The ×1.45 moment residual** and **6 — Amplification**.
- Replacement applied:
  > “The ×1.34 reconciliation of absolute exchange magnitude is unverified and
  > needs owner review; it is not established as dynamic amplification”

## Medium findings

### M-01 — Correct 5° peak values are framed as a governing region

- File: `content/reports/sloshing/index.html`
- Exact published text:
  > “Use: treat 22–24 seconds as a broad governing region; 23 seconds is the
  > sampled medium-mesh maximum, not a universal tank optimum.”
- Violates: **1 — Exchange period**, framing only; the reported 5° sweep
  values remain valid.
- Replacement applied:
  > “Use: treat 22–24 seconds as the broad amplitude-peak region for this 5°
  > sweep, not as the natural or tuning period. The exchange natural period is
  > 14.31 s, and the amplitude peak moves with roll amplitude.”

### M-02 — Recommended work assumes a fixed governing 22–24 s band

- File: `content/reports/sloshing/index.html`
- Exact published text:
  > “Extend the governing 22–24 second region across fill level and roll
  > amplitude …”
- Violates: **1 — Exchange period** and **4 — Damping is not a constant**,
  framing only.
- Replacement applied:
  > “The 22–24 s region is the amplitude peak for the published 5° sweep, not
  > the exchange natural period. The measured natural period is 14.31 s, while
  > the amplitude peak moves from 20 s to 40 s across the 2.5°–10°
  > roll-amplitude grid.”

### M-03 — Interactive study repeats the fixed governing-band next step

- File: `content/reports/sloshing/study.html`
- Exact published text:
  > “Extend the governing 22–24 second region across fill level and roll
  > amplitude.”
- Violates: **1 — Exchange period** and **4 — Damping is not a constant**,
  framing only.
- Replacement applied:
  > “The 22–24 s region is the amplitude peak for the published 5° sweep, not
  > the natural or tuning period; phase places the exchange natural period at
  > 14.31 s, and the amplitude peak moves with roll amplitude.”

### M-04 — Tank summary repeats the fixed governing-band next step

- File: `content/reports/sloshing-tank-summary.html`
- Exact published text:
  > “Extend the governing 22–24 second region across fill level and roll
  > amplitude …”
- Violates: **1 — Exchange period** and **4 — Damping is not a constant**,
  framing only.
- Replacement applied:
  > “The 22–24 s region is the amplitude peak for the published 5° sweep, not
  > the natural or tuning period. Phase puts the exchange natural period at
  > 14.31 s; the measured amplitude peak moves from 20 s to 40 s across
  > 2.5°–10° roll.”

## Surfaces reviewed with no correction required

The remaining requested AceEngineer surfaces did not present a claim that
conflicts with the six supplied corrections:

- `content/reports/sloshing/analysis.html`
- `content/reports/sloshing/browse.html`
- `content/reports/sloshing/comparison.html`
- `content/reports/sloshing/damping-and-sizing.html`
- `content/reports/sloshing/validation.html`
- `content/reports/sloshing-cfd-analysis.html`
- `content/reports/sloshing-cfd-case.html`
- `content/partials/sloshing-capability-nav.html`
- `config/capabilities.yaml`

The valid 22–24 s and 24–26 s measured response values retained on the index,
validation, study, and summary surfaces are forced-response observations.
They are not wrong when explicitly framed as results for the published 5°
sweep rather than as the connected-tank natural or tuning period.

## Summary

- Findings by severity: **3 critical, 5 high, 4 medium**.
- AceEngineer source files corrected:
  `content/reports/sloshing/dual-connected-tanks.html`,
  `content/reports/sloshing/index.html`,
  `content/reports/sloshing/study.html`, and
  `content/reports/sloshing-tank-summary.html`.
- Register added: `docs/sloshing-corrections-register.md`.
- Digitalmodel changes: **none** (report-only audit).
- Owner decision: the physical basis, if any, for the old ×1.34 absolute
  exchange-amplitude reconciliation is unverified.
- Branch: `audit/sloshing-superseded-claims-20260729`.
