# Plan for #72: Interactive tank-sloshing CFD and summary reports

> **Status:** plan-approved — user approved 2026-07-15
> **Complexity:** T3
> **Date:** 2026-07-15
> **Issue:** https://github.com/vamseeachanta/aceengineer-website/issues/72
> **Client:** N/A
> **Lane:** lane:codex
> **Review artifacts:** `scripts/review/results/2026-07-15-plan-72-engineering.md`; `2026-07-15-plan-72-frontend.md`; `2026-07-15-plan-72-security.md`

---

## Resource Intelligence Summary

### Existing repo code

- `content/` is the canonical HTML source and `build.js` renders it into `dist/`.
- `scripts/hf-fetch.js` and `scripts/refresh-hf-data.js` already separate live
  Hugging Face refresh from deterministic offline builds, but assume public
  datasets-server access and cannot read the private sloshing dataset.
- `docs/HTML_REPORTING_STANDARDS.md` requires interactive plots and relative-path
  CSV data loading.
- `assets/js/` contains tested reusable interaction engines; report selection and
  Plotly configuration belong there rather than in page-only inline scripts.
- There is no `content/reports/` sloshing report, sloshing snapshot, selector
  engine, or report-specific test today.

### Engineering/data sources

- Private dataset `aceengineer/digitalmodel-sloshing`, commit
  `183170d1655867cca267f700f41f229ed3399769`, contains reviewed free-decay,
  forced-roll period-sweep, fine-mesh, mesh-confirmation, and disposition data.
- `digitalmodel` issue #1528 is OPEN and `status:plan-approved`; its approved
  scope includes per-case and aggregate HTML reports, synchronized pressure and
  elevation histories, conservation checks, and de-identified publication.
- `digitalmodel` issue #642 is OPEN and scopes pressure-region extraction,
  frequency estimation, CSV/Parquet output, and comparison plots.
- The existing dataset withholds anti-roll phase/benefit results because the
  inertia-free reduced-order model cannot support that conclusion. The site
  must preserve this gate.

### Standards

| Standard | Status | Source |
|---|---|---|
| Interactive HTML/Plotly | required | `docs/HTML_REPORTING_STANDARDS.md` |
| Relative-path CSV | required | `docs/HTML_REPORTING_STANDARDS.md` |
| WCAG-friendly controls | required by site convention | semantic labels, keyboard controls, status regions |

### Gaps identified

- No authenticated source-neutral refresh path exists for a private HF dataset.
- No sanitized public release schema combines CFD cases, theory curves,
  convergence, provenance, and evidence disposition as relative CSV tables.
- No reusable report state engine supports case dropdowns, curve toggles,
  Plotly updates, URL state, reset, and print styling.
- No individual or summary report pages, tests, navigation, or sitemap entries exist.

### Evidence

- `gh issue view 72` → OPEN, interactive reports issue.
- `gh issue view 1528 -R vamseeachanta/digitalmodel` → OPEN with
  `status:plan-approved`.
- `gh issue view 642 -R vamseeachanta/digitalmodel` → OPEN pressure-load scope.
- `find content -iname '*sloshing*'` → no existing sloshing report.
- `hf datasets list aceengineer/digitalmodel-sloshing -R` → reviewed artifacts
  exist under `review/` at the cited commit.

Distinct sources: issue #72, issues digitalmodel#1528/#642, `AGENTS.md`,
`docs/HTML_REPORTING_STANDARDS.md`, `build.js`, `scripts/hf-fetch.js`, and the HF
dataset (7 sources).

## Artifact Map

| Artifact | Path |
|---|---|
| Plan | `docs/plans/2026-07-15-issue-72-sloshing-interactive-reports.md` |
| Individual report | `content/reports/sloshing-cfd-case.html` |
| Summary report | `content/reports/sloshing-tank-summary.html` |
| CFD QA analysis | `content/reports/sloshing-cfd-analysis.html` |
| Shared engine | `assets/js/sloshing-reports.js` |
| Shared report styles | `assets/css/sloshing-reports.css` |
| Release pin/allowlist | `config/sloshing-data-release.json` |
| Closed public schema | `config/sloshing-report-schema.json` |
| Sanitized tables | `assets/data/sloshing/<release-hash>/*.csv` |
| Sanitized manifest | `assets/data/sloshing/<release-hash>/manifest.json` |
| HF refresh | `scripts/refresh-sloshing-data.js` |
| Sanitizer tests | `tests/js/sloshing-refresh.test.js` |
| UI/build tests | `tests/js/sloshing-reports.test.js`, `tests/js/sloshing-build.test.js` |

## Deliverable

Three public, source-neutral, interactive Plotly reports on aceengineer.com backed
by a deterministic sanitized snapshot refreshed from the private Hugging Face
dataset without exposing credentials or withheld result families.

On 2026-07-16 the user extended the approved deliverable to three presentation
layers: normalized cross-case results in the summary, detailed histories in the
case report, and a dedicated CFD QA analysis report containing sanitized inputs,
mesh/quality evidence, convergence/conservation results, and a reviewed
same-origin animation preview or snapshot. Missing visual evidence must render as
not published, never as a synthetic substitute.

## Design

```text
explicit controlled publication job (never Vercel/browser)
  -> require least-privilege HF_TOKEN
  -> read config release pin: 40-hex revision + exact path/hash/size allowlist
  -> HTTPS GET only from huggingface.co allowlisted resolve URLs
  -> private temp dir with byte/row/depth/time limits; reject cross-origin redirect
  -> validate every input and closed output schema; sanitize allowed scalars only
  -> canonical CSV + manifest bytes in staging; reconcile source/published counts
  -> human-review publication diff; atomic directory rename to content hash
  -> build injects exact content-hashed relative CSV/manifest paths into HTML
  -> public browser loads only same-origin static assets and vendored Plotly
```

### Public release schema

`config/sloshing-report-schema.json` is a closed, versioned schema. Unknown
tables, columns, nested keys, evidence types, statuses, units, and schema
versions fail the whole release. It defines these normalized CSV entities:

- `cases`: stable opaque public case ID derived only from canonical sanitized
  fields, evidence type/status, loading condition, roll amplitude/period/frequency,
  mesh cells, timestep policy, fluid model, coordinate/sign/reference conventions,
  and input/output completeness flags. Per-type requirements include fill ratio;
  solver/version; dimensionality; actual or bounded timestep and CFL policy;
  density, kinematic viscosity, and surface tension with units; excitation
  definition; and a public geometry-basis enum plus the sanitized dimensional or
  nondimensional parameters needed to reproduce the published quantity.
- `metrics`: case FK, quantity enum, value, unit enum, statistic/basis, cycle window,
  QA status, public source-class enum, reviewed input SHA-256, pinned revision,
  and transform version. No upstream filename/path/record identifier is public.
- `series`: stable series ID, optional case FK, quantity/unit, evidence type/status,
  coordinate/sign/reference convention, sample count, and source provenance.
- `samples`: series FK, monotonic ordinal/x, x unit, finite y, y unit; uniqueness,
  array-length, row-count, and monotonic-x constraints reconcile with `series`.
- `curves` and `curve_samples`: analytical/reduced-order curve identity,
  equation/model basis, dimensional or nondimensional axes, parameter set,
  applicability, evidence label/style, provenance, and bounded samples.
- `studies`: mesh/timestep convergence metadata, analytical target basis,
  nullability rules, completeness count, and observed/extrapolated quantities.
- `comparisons` and `comparison_operands`: stable comparison ID, operand FKs,
  quantity/unit, basis, window/alignment, interpolation enum (`none` in v1),
  pass criterion/tolerance, result, approval status, and public provenance.
  Unapproved or absent comparisons cannot calculate/render validation error or
  combine evidence types.
- `dispositions`: family/status/count/reason-code only. Rejected/withheld raw
  numerical payloads, notes, identifiers, and filenames are never public.

Required evidence types are mutually exclusive: `cfd_validation`,
`cfd_forced_roll`, `analytical_target`, `reduced_order_methodology`, and
`verification`. Status is one of `accepted`, `methodology_only`, or
`verification_only`. Rejected and withheld families exist only as aggregate
dispositions. UI labels, badges, line dash/marker patterns, legend groups, and
accessible text distinguish every type without relying on color. No validation
error, interpolation, aggregate metric, or design claim may combine types unless
an approved allowlisted `comparisons` record identifies the operands, compatible
units, basis, criterion, and provenance. Free-decay `cfd_validation` is permitted
only through such records with the reviewed analytical equation/reference/version,
`h/L`, gravity basis, finite-amplitude perturbation, applicability predicate, and
explicit tolerance/pass result.

All public strings come from strict enums or bounded normalized labels; the
sanitizer never copies free-form source text. The closed allowlist excludes raw
geometry/dimensions designated private, project/client/case identifiers,
usernames, upstream/source IDs, machine/local paths, filenames, private URLs,
notes, headers/tokens, source row blobs, and anti-roll phase/benefit/roll-reduction
quantities or aliases. Private-to-public mapping exists only in refresh memory,
is never logged or persisted, and recognizable source-ID canaries must be absent
recursively from the public release and `dist/`.
Schema compatibility is exact-major: unknown major versions fail; minor additive
changes require schema, transformer, fixtures, tests, and a newly reviewed release.

The individual report exposes dependent dropdowns for accepted CFD family,
loading condition, period, and mesh where those dimensions exist. A single
immutable reducer validates dependent choices and commits inputs, provenance,
QA badges, output cards, accessible tables, and Plotly traces only after the
preloaded release validates. Busy state uses `aria-busy`; a failure retains the
prior valid render and displays an accessible error. Verification-only evidence
is audit-table-only and cannot enter accepted-result selectors.

The summary report renders CFD loading-condition curves, free-decay analytical
targets, mesh/time-step convergence, and explicitly methodology-only reduced-order
curves. Checkbox and Plotly-legend visibility are synchronized with feedback-loop
suppression. State URL contract is `v`, `case`, `curves`, `theme`, `lines`,
`markers`, `density`, and `sections`, serialized in that order with strict length
and enum limits. User actions use `pushState`, normalization uses `replaceState`,
`popstate` restores state, invalid state falls back visibly, and reset restores
the deterministic default. `uirevision` preserves zoom across style changes and
resets it on case changes.

Styling controls cover tested high-contrast themes, line weight, marker display,
chart density, and printable-section selection. Semantic fieldsets, keyboard
controls, focus-visible styling, reduced-motion behavior, accessible data tables,
non-color-only curve identity, and polite status announcements accompany Plotly.
Print lifecycle resizes plots before/after printing; print CSS hides controls,
navigation and modebars, enforces page breaks/chart sizes, and prints only chosen
sections. No JavaScript and data-error states retain methodology/provenance text.

### Source and release contract

`config/sloshing-data-release.json` is human reviewed and pins one exact 40-hex
HF revision, exact allowed paths, SHA-256, byte size, table/family counts, and
expected public release hash. Requests require `HF_TOKEN` in an Authorization
header, never a URL, and accept only HTTPS URLs under
`huggingface.co/aceengineer/digitalmodel-sloshing/resolve/<revision>/...`.
Fetch uses `redirect: manual`; every percent-decoded/canonicalized owner, repo,
revision, and path is compared with the allowlist before the first request and
before any redirect follow. Authorization is never forwarded across an origin
change. Non-HF redirects, branches/tags, 401/403, truncation, mixed revision, concurrent
refresh, archives, symlinks, path traversal, and resource-limit violations abort.
Cross-origin CDN redirects intentionally fail closed; no wildcard CDN origin and
no credential-free redirect exception is supported in v1. If HF delivery requires
one, the release job stops and the plan/auth contract must be separately revised.
Errors redact headers and source content. Raw private bytes stay only in a
process-private temp directory and are removed on success/failure; CI artifacts
and Vercel never retain or fetch them.

Canonical output uses UTF-8, LF, trailing newline, stable table/column/row order,
locale-independent finite numeric serialization, no timestamps, and per-table
hashes. Equivalent shuffled input must generate byte-identical output. Staging is
fully validated and fsynced before one atomic rename; any failure leaves the old
release byte-identical. Content-hashed paths avoid the repository's immutable
`/assets/*` cache hazard; generated HTML references the exact release hash.

The release digest is SHA-256 over a canonical UTF-8/LF ordered index containing
schema version, transformer version, and each relative CSV filename + SHA-256 +
byte size + row count. `manifest.json` records that digest but is excluded from
its own digest input. Tests mutate every CSV/index-covered field and require a
digest mismatch. Publication first creates the immutable hash directory, then
updates the reviewed release pin consumed by `build.js`; a clean build proves
all HTML references exactly that digest before commit. Old directories remain
for rollback until separately reviewed cleanup removes unreferenced releases.

The release-pin update itself uses temp file + fsync + atomic rename only after
the immutable directory is fully durable. Pointer write or post-update validation
failure retains/restores the prior pointer byte-for-byte; an unreferenced new
directory is harmless. `build.js` reads one pointer snapshot once and fails unless
its expected digest, directory name, manifest digest, recomputed canonical-index
digest, and complete file set all agree.

Browser preload fetches the exact manifest and complete CSV set, enforces the
embedded hashes plus byte/row/column/string/depth limits, validates all FKs/counts,
reconstructs the canonical ordered index, recomputes SHA-256, and requires
`HTML trusted pointer == release directory name == recomputed digest == manifest
declared digest` before the first render. Corrupt, oversized, partial, or mixed
sets produce the static accessible error shell without private/live fallback.

Public dispositions use only family-class counts and bounded reason codes
(`unsupported_model_claim`, `incomplete_solver_run`, `verification_scope_only`).
The private family name, upstream notes/IDs, and raw values are forbidden; the
public status label is `not_published`, not the upstream `withheld` literal.

V1 requires seven accepted free-decay CFD cases, six accepted ten-cycle forced-roll
medium cases, one governing fine-mesh case, mesh and timestep convergence studies,
approved analytical targets/comparisons, and sanitized dispositions. The release
pin enumerates every expected public ID and exact count for cases, metrics, series,
samples, studies, curves, curve samples, comparisons, operands, and dispositions;
acceptance reconciles each entity rather than relying on selector-only totals.
Pressure-tap/sectional series are
deferred until #1528/#642 publishes an accepted source table; the UI shows a
non-selectable `not published in this release` statement, never an empty result
or synthetic placeholder. Adding it requires a new pinned release and tests.

## Files to Change

| Action | Path | Reason |
|---|---|---|
| Create | `tests/js/sloshing-refresh.test.js` | RED auth/integrity/schema/sanitizer/transaction tests |
| Create | `tests/js/sloshing-reports.test.js` | RED interaction/accessibility/state tests |
| Create | `tests/js/sloshing-build.test.js` | RED build/output/link tests |
| Create | `config/sloshing-data-release.json` | exact source revision/path/hash/size/count pin |
| Create | `config/sloshing-report-schema.json` | closed public tables, enums, units, constraints |
| Create | `scripts/refresh-sloshing-data.js` | authenticated private-HF refresh and validation |
| Create | `assets/data/sloshing/<release-hash>/*.csv` | relative content-hashed public tables |
| Create | `assets/data/sloshing/<release-hash>/manifest.json` | schema/provenance/count/hash manifest |
| Create | `assets/js/sloshing-reports.js` | reusable selection/Plotly/report styling engine |
| Create | `assets/css/sloshing-reports.css` | responsive and print styling |
| Create | `content/reports/sloshing-cfd-case.html` | individual CFD report |
| Create | `content/reports/sloshing-tank-summary.html` | aggregate report |
| Create | `content/reports/sloshing-cfd-analysis.html` | input, mesh, visual and QA analysis report |
| Modify | `package.json` | refresh command and Jest projects |
| Modify | `content/case-studies/index.html` | report discovery link |
| Modify | `sitemap.xml` | production URLs |
| Modify | `build.js` | validate release hash, inject exact relative asset paths, preserve recursive asset copy |
| Update | `docs/DEPLOYMENT_GUIDE.md` | preview/promotion/rollback publication runbook |

## TDD Test List

| Test | Verification |
|---|---|
| rejects missing token on live refresh | no anonymous private-data fallback |
| rejects wrong origin/redirect/ref/hash/size | pinned source and token containment |
| rejects unknown schema/nonfinite/unitless/duplicate/FK rows | fail-closed release generation |
| preserves prior snapshot on refresh failure | outage cannot corrupt deploy data |
| shuffled equivalent input is byte-identical | canonical deterministic output |
| nested aliases/XSS/prototype/path/secret canaries fail | closed sanitizer/privacy gate |
| recognizable upstream IDs/filenames absent recursively | opaque public provenance only |
| source/published/disposition counts reconcile | completeness without rejected payloads |
| comparison requires approved operands/basis/tolerance | no cross-evidence claim leakage |
| every CSV/index mutation changes or rejects digest | non-self-referential release integrity |
| manifest filename/hash/count/digest or path pointer mutation fails | closed manifest trust loop |
| interrupted pointer update preserves prior pointer bytes | transactional release switch |
| case selector IDs/count match fixture manifest | complete individual-report coverage |
| dependent selectors regenerate valid options | no impossible mixed-case state |
| selection updates cards and traces atomically | no mixed-case rendering |
| rapid/stale/failing transitions retain prior render | async/race/error safety |
| URL round-trip/history/canonical order/limits | robust shareable state |
| curve controls and legend synchronize once | no Plotly feedback loop |
| reset restores deterministic defaults | reproducible report styling |
| keyboard/focus/ARIA/table/theme/reduced-motion | accessible equivalent |
| print lifecycle and computed print rules | custom printable report |
| clean offline build emits reports and hashed relative CSVs | deploy correctness |
| vendored Plotly hash/license/config verified | offline supply-chain integrity |
| intercepted report data/library requests are same-origin | no CDN/HF/runtime dependency |
| sitemap and discovery links resolve | navigation correctness |

## Acceptance Criteria

- [ ] Tests are written RED before implementation.
- [ ] Authenticated refresh uses environment credentials only and never writes a token.
- [ ] Release contains closed-schema relative CSVs with units, exact source hashes/revision, transform/schema versions, constraints, and reconciled counts.
- [ ] Recursive scan across release and `dist/` finds zero forbidden/private/withheld/canary values; rejected/withheld numerical payload count is zero.
- [ ] Individual selector IDs/count exactly equal accepted fixture IDs/count; every transition updates matching cards/table/traces in one commit.
- [ ] Summary exposes every manifest-approved curve ID and no other curve; evidence labels/styles and accessible text match enums exactly.
- [ ] Plotly uses vendored `assets/js/plotly-2.32.0.min.js`; accessible PNG and
  SVG export controls, responsive hover/zoom/legend configuration, and zero
  external report-data/library requests are browser-smoke tested offline. Report
  analytics are disabled for this smoke; shared production analytics is outside
  the report-data boundary.
- [ ] URL state round-trips through back/forward; invalid/oversized states normalize visibly; style/section controls pass theme/print assertions.
- [ ] Both pages retain a static evidence/methodology shell with JS disabled and an accessible no-partial-render error on 404/corrupt/schema/Plotly failure.
- [ ] Clean `npm ci && npm test && npm run build && npm run lint:copy` passes.
- [ ] `uv run pytest tests/docs -k routing_surfaces` passes.
- [ ] Recursive built-link check passes; report-relative CSV/manifest/JS/CSS assets exist and no absolute/local/CDN data paths occur.
- [ ] `sloshing-reports.css` is linked as a standalone relative built asset;
  Jest asserts stylesheet rules and mocked print lifecycle, while preview browser
  smoke tests real print media and request interception.
- [ ] Built reports exist at `dist/reports/sloshing-cfd-case.html` and
  `dist/reports/sloshing-tank-summary.html`.
- [ ] No raw geometry, local paths, credentials, rejected result claims, or withheld tables appear publicly.

## Risks and Open Questions

- Public browser and Vercel access to private HF are prohibited; freshness depends
  on controlled, reviewed release publication.
- Current data contains global response/load metrics. Pressure-tap curves are a
  declared deferred family until #1528/#642 supplies an accepted pinned table.
- Theoretical curves from generic reduced-order models must be labeled
  methodology-only and not presented as validation of the resolved tank.
- Release runbook: generate and human-review sanitized diff; commit; preview deploy;
  run offline/browser/privacy/CSP/header/cache smoke tests; promote production;
  record source/release hashes. Rollback uses a normal revert or prior Vercel
  deployment promotion, never force-push, followed by the same route/hash checks.

## Adversarial Review Summary

| Reviewer | Verdict | Resolution |
|---|---|---|
| Engineering/data | MAJOR | closed normalized CSV schema, evidence enums, v1/deferred boundary, count reconciliation |
| Frontend/accessibility | MAJOR | vendored offline Plotly, reducer/URL/race contract, accessible tables, print lifecycle |
| Security/deployment | MAJOR | pinned least-privilege HF contract, allowlist sanitizer, atomic hashed release, rollback |

R2 re-review: frontend MINOR; engineering/security MAJOR on upstream IDs,
comparison representation, release hashing, and reproducibility. R3 resolves
those items and the bounded frontend clarifications. Final r3 verdicts are
APPROVE from all three reviewers. Implementation remains blocked until user approval.

## Complexity: T3

Private-to-public data sanitization, two interactive reports, engineering claim
boundaries, custom browser state, print behavior, and deployment integration.
