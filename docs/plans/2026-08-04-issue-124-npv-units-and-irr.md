# Plan for #124: make the NPV field-development calculator arithmetically honest

> **Status:** plan-review (awaiting owner approval — never self-approved)
> **Complexity:** T2
> **Date:** 2026-08-04
> **Issue:** https://github.com/vamseeachanta/aceengineer-website/issues/124
> **Client:** N/A
> **Branch:** `plan/124-npv-units` (worktree off `origin/main` @ `10190ff`)
> **Review artifacts:** r1 Claude — inline, main session (see Adversarial Review Summary)

---

## Premise verification (2026-08-04, against `origin/main` @ `10190ff`)

`origin/main` is exactly [PR #123](https://github.com/vamseeachanta/aceengineer-website/pull/123) (the [#16](https://github.com/vamseeachanta/aceengineer-website/issues/16) XSS hardening), so the tree is as that PR left it.

Every claim in the issue and every repo trap named in the briefing was re-checked.
**Two were refuted.**

| Claim | Verdict | Evidence |
|---|---|---|
| Page renders `$348915.5B M`, IRR `Not calculable`, payback `1.0 years`, ratio `1162054.01x` for its own defaults | **CONFIRMED — all four reproduced exactly** | Transcribed the inline logic (`content/calculators/npv-field-development.html:455-548`) with the form defaults (`:217-283`) and executed it. Output matched to the last digit |
| Revenue is in dollars, CAPEX/OPEX in `$M` | **CONFIRMED** | `:469` `prod * price * 365 * (1 - royaltyRate)` against `:251` `capex` `($M)` = 500 and `:257` `opex` `($M)` = 50 |
| IRR never renders — the page has never shown one | **CONFIRMED as an observation** | `:547` returns `null` after the loop; `:617` renders `Not calculable` |
| **…because the absolute `0.0001` tolerance is unreachable on cashflows of order 1e11** | **REFUTED — this is the wrong cause** | Measured: with the shipped (broken-unit) defaults, NPV at rate `−0.5` is `1.35e13` and at rate `2.0` is `3.84e7` — **both positive**. There is no root in the search bracket at all, because the 1e6 revenue inflation pushes the true IRR far above 200 %. Bisection walks `low` up to `2.0` and never crosses zero. An infinitely tight tolerance would not help. Separately measured: the absolute tolerance **is** reachable at 1e8 magnitude and only starts failing at **≥1e10** — so it is a real latent defect, but it is **not** why the page shows `Not calculable`. Fixing only the tolerance would leave the symptom exactly as it is |
| `assets/js/npv-calculator-engine.js` is a separately-tested parallel implementation the page does not import | **CONFIRMED** | No `npv-calculator-engine` reference anywhere in the page; engine exports via CommonJS + globals (`:207-220` of the export block) |
| PR #123's tests pin the wrong values, marked characterisation-not-endorsement | **CONFIRMED** | `tests/js/npv-render.test.js:171-182` carries the explicit `CHARACTERISATION, NOT ENDORSEMENT` block |
| Homepage source is `content/index.html`; root `index.html` is stale and unserved | **CONFIRMED** | `content/index.html` 6,210 bytes; root `index.html` 32,206 bytes with 4 occurrences of `AI-Native` |
| **The brand rule forbids the literal string "AI" in user-facing copy** | **REFUTED** | `brand/copy.yaml:84-86` states in terms: *"'AI' itself is permitted (the theme.css comment banning it was deleted; this file's firm_lede says 'AI-native' and is asserted on About). What #21 actually rules out is the breathless register."* The canonical `firm_lede` **contains** "AI-native" and `lint:copy` fails when it is *absent* from `content/about.html`. The forbidden list is `consultancy`, `consulting practice`, `Open Deck`, `t.me/`, `custom work is currently unavailable`, `revolutionary`, `cutting-edge AI`. Writing to the stated rule would have broken the copy lint |
| `theme.css` stays last in `build.js` `cssFiles`, outside the bootstrap purge | **CONFIRMED** | `build.js:66` — last entry of the bundle input list; the purge at `:546-548` targets `bootstrap-united.css` only |
| Jest suite is cold-state dependent | **CONFIRMED structurally; [#125](https://github.com/vamseeachanta/aceengineer-website/issues/125)'s numbers are stale** | Measured today in this worktree — **cold: 8 failed / 458 passed / 466 total, 5 suites failed. Warm: 494 passed / 494 total, 26 suites.** [#125](https://github.com/vamseeachanta/aceengineer-website/issues/125) records 370/8/378 cold and 406/406 warm. The **28-test cold shortfall is exactly preserved** (494 − 466 = 28), so the structural claim holds while every absolute count in that issue is now wrong |
| The engine may have correct unit handling; adopting it may be the real fix | **PARTLY — and it carries its own seam** | See below |

### The engine is dollars-coherent, but has a unit seam at its own presentation boundary

`buildYearlyCashflows` documents `opex` as **dollars** (`:216`), `calcAnnualRevenue`
returns **dollars** (`:42`), and `tests/js/npv-calculator.test.js:89` feeds
`calcAnnualOpex(50e6, ...)`. So the engine's **arithmetic is internally consistent
in dollars** — it does not have the page's defect.

But two seams exist and both must be closed deliberately, or adopting the engine
reproduces this same bug class one layer over:

1. **`formatMoney` documents its input as "Dollar amount in millions"** (`:196`) and
   divides by 1000 to append `B`. The engine therefore computes in dollars and
   formats in millions. Nothing in the module converts between them.
2. **`buildYearlyCashflows` starts `cumulative` at `0`, not `-capex`** (`:241`),
   while the page starts at `-capex` (`:460`). Payback semantics differ between
   the two implementations; swapping one for the other silently changes what
   "payback" means.

`calcIRR` is genuinely more robust than the page's copy: it has a sign-change
bracket guard (`:97-100`) returning `null` when no root exists, and a defined
post-loop return (`:116`). The page has neither.

### The finding that reshapes this issue: correcting units makes the default project non-viable

Running the corrected arithmetic on the page's own defaults:

| quantity, corrected to `$M` | value |
|---|---|
| Year-1 revenue after royalty | **$103.8 M** |
| Undiscounted total profit over 20 years | **−$1,135.9 M** (against $500 M CAPEX) |
| NPV @ 10% | **−$603.9 M** |
| NPV at the IRR bracket ends (−0.5 and 2.0) | −1.6e8 and −481.6 — **same sign** |

The cause is structural, not a residual bug: production declines 15 %/yr while
OPEX escalates 3 %/yr from a $50 M base, so OPEX overtakes revenue partway
through the project and the field never repays its CAPEX.

Three consequences, all of which change the acceptance criteria:

1. **No IRR exists for the default inputs** — NPV is negative across the whole
   search bracket, so there is no root to find. This is `null` for a *correct*
   reason, where today it is `null` for a wrong one.
2. **An acceptance criterion of the form "IRR renders a number for the default
   inputs" is unsatisfiable** without also changing the defaults. The issue's
   "Done when" list is worded loosely enough to invite exactly that criterion.
3. **The "NOT VIABLE" branch becomes reachable by default** — which the issue
   wanted, but it means the live page would greet every visitor with a
   NOT VIABLE verdict on load. That is a product decision, not a maths one, and
   it belongs to the owner (D4).

---

## Deliverable

A calculator whose headline is dimensionally coherent, whose IRR is reported when
one exists and refused when one does not — with the two reported for different
and distinguishable reasons — and a default input set the owner has consciously
chosen.

---

## Resource Intelligence Summary

### Existing repo code

- `content/calculators/npv-field-development.html` — the served page. Inline
  `calculateNPV:423-518`, `calculateIRR:522-548`, `calculatePayback:551-566`,
  `displayResults:569+`, `formatMoney:707-713`. IRR rendered at `:608` as
  `irr.toFixed(2) + '%'`; the refusal branch at `:617`.
- `assets/js/npv-calculator-engine.js` — tested, unimported. `calcAnnualRevenue:40-43`,
  `calcIRR:87-117` (bracket guard `:97-100`, fallback return `:116`),
  `formatMoney:199-205`, `buildYearlyCashflows:222-264`.
- `tests/js/npv-calculator.test.js` — engine unit tests, dollars convention.
- `tests/js/npv-render.test.js` — the characterisation suite from PR #123.
- `brand/copy.yaml:72-88` — `forbidden_phrases`; `scripts/lint-copy.js:100-108`
  enforces them.
- `build.js:65-66` — CSS bundle inputs, `theme.css` last.

### Gaps identified

No shared unit convention between the page and the engine, and no test anywhere
asserts that the page and the engine agree. The two implementations have drifted
without any signal.

### Evidence

**Issue states** (2026-08-04): `#124` OPEN (`priority:high`) · `#125` OPEN ·
`#16` referenced by merged PR #123.

**Environment**: `npm ci` → 380 packages, clean. `npm run build` rc=0. Cold and
warm suites measured as tabulated above.

---

## Design decisions

**D1 — `$M` is the canonical unit, and the conversion happens exactly once.**
The form labels CAPEX and OPEX in `$M` (`:250`, `:256`) and the headline appends
`' M'` (`:576`), so `$M` is what the page already claims to speak. Revenue is
converted from dollars to `$M` at the single point where it is produced. One
conversion, named, with a test asserting there is only one.

**D2 — Delete the inline duplicate; the page consumes the engine.**
The issue floats this and it is right, but only after the two seams above are
closed. Keeping two implementations is what allowed this drift to persist
untested. The engine stays in **dollars** internally (converting it wholesale
would churn its ~40 passing unit tests for no correctness gain); the page applies
one dollars→`$M` conversion at the presentation boundary, and `formatMoney`'s
documented `$M` contract becomes an asserted one rather than a comment.
`buildYearlyCashflows`'s `cumulative` origin is made explicit so payback means
the same thing on both sides.

**D3 — IRR has two independent defects, and the issue names only the secondary one.**
Measurement (premise table) shows the observed `Not calculable` comes from **no
root in the `[-0.5, 2.0]` bracket**, not from the tolerance. Both are real and
both are fixed, but they must not be confused — a PR that fixed only the
tolerance would close this issue with the symptom untouched.

- *(a) **Primary** — the bracket.* The unit bug pushes the true IRR above 200 %,
  outside the search range. **Fixing the units (D1) fixes this**, and no IRR-side
  change is needed for it. What *is* needed is a **sign-change guard** so "no
  root in range" is returned as a distinct outcome rather than falling through
  100 pointless iterations to a bare `null`.
- *(b) **Secondary, latent** — terminate on bracket width, not `|NPV|`.* `|NPV|`
  scales with the cashflows; the bracket width is in **rate** units and does not.
  Measured: the current absolute bound survives to 1e8 magnitude and fails at
  ≥1e10. It is not biting today, and it would bite on a large field.
- *(c) Define the post-loop return.* The page discards a converged answer at
  `:547`; the engine already returns the midpoint at `:116`.

Adopting the engine (D2) delivers the (a) guard and (c) for free. Only (b) is new
work.

**D4 — The default inputs are an owner decision this plan surfaces, not one it
resolves.** With units fixed the defaults describe a field that loses $1.1 bn.
Ranked options:

1. **Re-pick the defaults from a cited public source** (recommended) — e.g. a
   published decline rate and OPEX profile for a conventional development. The
   page then opens on a viable project *because the cited field is viable*, not
   because anyone tuned it.
2. **Keep the defaults and let the page open on NOT VIABLE** — honest, exercises
   the branch, and defensible for an engineering audience; a poor first
   impression on a public marketing site.
3. **Open with no result until the visitor presses Calculate** — sidesteps the
   question; loses the at-a-glance demo.

**Whichever is chosen, no default may be adjusted until the NPV turns positive.**
That is fitting a constant to a desired output, and it is forbidden by an
acceptance criterion below. If option 1's cited source yields a non-viable field,
the answer is option 2, not a nudged parameter.

**D5 — Every threshold derives from a named input.**
- The IRR convergence bound derives from the page's **own display precision**:
  IRR renders as `toFixed(2)` on a percentage (`:608`), i.e. 0.01 percentage
  points = `1e-4` in rate-fraction terms. The bracket bound is `1e-6` — two
  orders finer than what is displayed, reached in ~22 bisections of the
  `[-0.5, 2.0]` bracket, comfortably inside the existing 100-iteration budget.
  It is derived from the rendering contract, contains no cashflow magnitude, and
  is therefore scale-free by construction.
- The dollars→`$M` divisor is `1e6` by definition of the unit.
- **No number in this PR is taken from an observed output.**

**D6 — The characterisation tests are rewritten, not deleted — and six are
affected, not the two the issue names.**
PR #123 named `$348915.5B M` and `1162054.01x`. Enumerating
`tests/js/npv-render.test.js`, the corrected behaviour also flips:

| line | test | why it changes |
|---|---|---|
| `:163` | `a profitable case is classed positive and reported VIABLE` | NPV goes negative → `negative` class, `NOT VIABLE`, `.danger-text` |
| `:183` | `the default-input headline value is unchanged by the refactor` | `$348915.5B M` → a `$X M` value |
| `:188` | `the default-input profit ratio is unchanged by the refactor` | `1162054.01x` → a plausible ratio |
| `:193` | `IRR and payback lines are both present` | asserts `Payback Period: 1.0 years`; there is no payback after the fix |
| `:199` | `the non-converging IRR is reported as Not calculable` | still `Not calculable`, but for the **opposite reason** — must be re-pointed at the no-root case, or it passes for the wrong cause |
| `:149` | `renders the NPV headline with the money format and unit` | verify — may survive if it asserts shape rather than value |

`:199` is the subtle one: it stays green through the fix while its meaning
inverts. A test that passes for a changed reason is worse than one that fails.

**D7 — Repo traps.** Edit `content/calculators/...`, never `dist/`. The homepage
is `content/index.html`; root `index.html` is stale and out of scope. `theme.css`
stays last in `build.js:66`. Capability card links stay absolute. "AI" is
**permitted** (premise refuted) — do not scrub it, and do not touch
`brand/copy.yaml`'s `firm_lede`.

**D8 — Any criterion citing a test count states cold or warm and is re-measured.**
[#125](https://github.com/vamseeachanta/aceengineer-website/issues/125)'s counts are already stale by 88 tests. Criteria below use **warm** counts,
measured at the branch point, and compare **node IDs**, not totals.

---

## Files to Change

| Action | Path | Reason |
|---|---|---|
| Modify | `content/calculators/npv-field-development.html` | D1/D2: delete the inline duplicate, load and call the engine, one dollars→`$M` conversion, wire the IRR refusal branch |
| Modify | `assets/js/npv-calculator-engine.js` | D3(a) bracket-width termination; D2 seams — assert `formatMoney`'s `$M` contract, make `buildYearlyCashflows`'s `cumulative` origin explicit |
| Modify | `tests/js/npv-render.test.js` | D6: rewrite the six affected tests with new values justified in the commit body |
| Modify | `tests/js/npv-calculator.test.js` | D3(a) tests: known-IRR cashflow at two very different scales |
| Create | `tests/js/npv-parity.test.js` | the missing signal — page and engine must agree on the same inputs |
| Modify | `content/calculators/npv-field-development.html` (defaults `:217-283`) | **only if the owner picks D4 option 1**, with the source cited in the commit body |

**Not touched:** root `index.html`, `brand/copy.yaml`, `build.js`, `dist/`,
anything under `content/` other than the calculator.

---

## TDD Test List

Every row states the expected value and why it is red on `origin/main` @ `10190ff`.

| Test | Input | Expected | Red today because |
|---|---|---|---|
| `test_headline_unit_is_coherent` | page defaults | headline matches `/^\$-?\d+\.\d M$/` — **no `B M`** | today `$348915.5B M` |
| `test_revenue_is_in_millions` | 5000 bopd, $70, no royalty | year-1 revenue ≈ `127.75` (`$M`), not `1.2775e8` | engine returns dollars and the page never converts |
| `test_irr_of_known_cashflow_small_scale` | capex `100`, 10 flows of `16.2745` | IRR `10.00 % ± 0.01` | passes today — **characterisation, marked as such**. Measured green at scales 1, 1e6 and 1e8, so it is honestly not evidence of the fix |
| `test_irr_of_known_cashflow_at_1e10` | the same cashflow × **`1e10`** | IRR `10.00 % ± 0.01` — **identical to the row above** | **measured red**: the absolute `1e-4` bound on `\|NPV\|` first fails at 1e10 (green at 1e8, so an earlier draft's 1e8 row was **vacuous**). Same IRR, 1e10× the magnitude — the scale-invariance the fix must deliver |
| `test_irr_returns_no_root_when_true_irr_exceeds_bracket` | the page's **shipped, broken-unit** default cashflows | a distinct **no-root** outcome, and the reason recorded is "NPV positive at both bracket ends" — NPV at `−0.5` is `1.35e13`, at `2.0` is `3.84e7` | **this is the actual live defect**; today it falls through 100 iterations to a bare `null` indistinguishable from a convergence failure |
| `test_irr_returns_no_root_when_npv_never_crosses_zero` | all-negative cashflows | a distinct **no-root** outcome, not a converge-failure | page has no bracket guard; `:547` returns bare `null` for every reason |
| `test_irr_no_root_and_convergence_failure_are_distinguishable` | one of each | the two produce different internal outcomes even if both render `Not calculable` | today there is exactly one `null` and one reason for it |
| `test_default_inputs_have_no_irr` | page defaults, corrected units | no-root — because NPV @ −0.5 and @ 2.0 are both negative | **pins the D4 finding**; asserts the *reason*, so it cannot be satisfied by the current accidental `null` |
| `test_not_viable_branch_is_reachable` | any loss-making input | `NOT VIABLE`, `negative` class, `.danger-text` present | the issue reports this branch as dead code today |
| `test_no_payback_branch_is_reachable` | never-positive cumulative | renders the no-payback message | today payback is always `1.0` |
| `test_page_and_engine_agree` | 5 input sets incl. defaults **and** one loss-making | NPV, IRR, payback, ratio equal within `1e-9` | the page does not import the engine; **nothing asserts agreement** |
| `test_conversion_happens_exactly_once` | source scan | exactly one `1e6` conversion site in the calculator | the seam is unguarded; two conversions is the natural regression |
| `test_no_default_yields_a_tuned_positive_npv` | defaults | if the owner picks D4 option 1, the defaults match the cited source **verbatim** | guards D5; no such assertion exists |

**Not included, deliberately:** no test pinning an IRR value for the page's
default inputs (D4 — none exists, and a test demanding one would force a fitted
default); no test asserting the absence of "AI" (premise refuted — it would fail
the copy lint).

---

## Acceptance Criteria

- [ ] **Every test above fails on `origin/main` @ `10190ff` and passes after**, except the two rows explicitly marked characterisation. The failure list is captured against a clean `origin/main` worktree and recorded in the PR body.
- [ ] **Warm** suite (`npm run build` first, then `npx jest`) compared **node-ID by node-ID** against a warm baseline captured in the same worktree at the branch point. Baseline measured 2026-08-04: **494 passed / 494 total / 26 suites**. No new failure node IDs. Raw totals are not the criterion — the node-ID diff is.
- [ ] **Cold** behaviour is unchanged relative to its own baseline (8 failed / 458 passed / 466 total). This plan does **not** fix [#125](https://github.com/vamseeachanta/aceengineer-website/issues/125), and must not make cold worse.
- [ ] The headline for the page's default inputs matches `/^\$-?\d+\.\d M$/` — **the string `B M` appears nowhere in any rendered result**.
- [ ] **The same cashflow scaled by `1e10` yields the same IRR to two decimals.** This is the scale-invariance criterion, and it cannot be satisfied by any absolute tolerance. `1e10` is the **measured** first-failing scale — `1e8` is green today and a criterion citing it would be vacuous.
- [ ] **The page's shipped broken-unit defaults are refused with "no root in bracket", not "failed to converge".** This pins the *actual* live cause, which the issue mis-attributes to the tolerance.
- [ ] "No IRR exists" and "IRR failed to converge" are **distinguishable outcomes** in the code, even where both render the same string to the visitor.
- [ ] `NOT VIABLE` and the no-payback branch are each reached by at least one test with a **named input set** — not by mocking the branch condition.
- [ ] The page and the engine agree to `1e-9` on five input sets, at least one of which is loss-making.
- [ ] **No numeric default or threshold in this PR was chosen by observing its output.** The IRR bound traces to the page's `toFixed(2)` render precision; any changed default traces to a source cited in the commit body. Reviewer instruction: for each changed number, ask *"what named input produces this?"* — if the answer is "it made the result look right", reject.
- [ ] `npx jest tests/js/copy-lint.test.js` passes **warm** — confirms nothing touched the brand copy, including the permitted "AI".
- [ ] `dist/` contains no hand-edited file; the page is rebuilt from `content/`.
- [ ] r1 review artifact recorded.

---

## Out of scope

- **[#125](https://github.com/vamseeachanta/aceengineer-website/issues/125), the cold-state test dependency.** Real, separately filed, and fixing it inside a behaviour change would make the behaviour change unverifiable — the same reasoning that correctly kept this issue out of PR #123.
- **Root `index.html`.** Stale, unserved, 4× "AI-Native". Its staleness deserves its own issue; deleting or refreshing it here would blur this PR's diff.
- **The other calculators.** `decline-curve`, `wall-thickness`, `mooring-fatigue`, `obs-calculator` may share the inline-duplicate pattern. **This plan does not audit them**, and finding the same defect elsewhere should become its own issue rather than widening this one.
- **`calcMIRR`.** Present in the engine, unused by the page, untouched.
- **Visual/layout changes.** None.

---

## Adversarial Review Summary

| Round | Provider | Verdict |
|---|---|---|
| r1 | Claude — inline, main session | **MAJOR** — 7 findings, all folded in |

1. **An early draft carried the briefing's "brand rule forbids the literal string
   AI" and proposed scrubbing it.** `brand/copy.yaml:84-86` says the opposite in
   terms, and the canonical `firm_lede` *contains* "AI-native". Acting on it
   would have **broken `lint:copy`** — the very check that is already red on a
   cold tree, so the breakage would have looked like the known [#125](https://github.com/vamseeachanta/aceengineer-website/issues/125) flake.
   → premise table; D7; a TDD exclusion.
2. **"Fix the units and IRR renders" is false.** Correcting units leaves the
   default project with no IRR at all, because NPV is negative across the entire
   search bracket. A criterion of the form "IRR renders a number for the default
   inputs" — which the issue's "Done when" invites — is **unsatisfiable without
   fitting the defaults**. → D3(b), D4, `test_default_inputs_have_no_irr`.
3. **The draft accepted the issue's "make the tolerance relative".** Relative to
   *what* is the question, and every scale-bearing answer reintroduces the
   problem. Terminating on **bracket width** removes cashflow magnitude from the
   criterion entirely, and the bound then derives from the page's own render
   precision. → D5.
4. **The blast radius was under-counted at two tests.** Enumeration found six,
   and `:199` is the dangerous one — it stays green while its meaning inverts.
   → D6.
5. **The draft asserted the engine "has the same defect".** Checking the engine's
   tests (`npv-calculator.test.js:89` feeds `50e6`) showed its arithmetic is
   dollars-coherent; the seam is between its arithmetic and its `formatMoney`,
   which documents `$M`. Shipping the wrong diagnosis would have produced the
   wrong fix. → the engine section; D2.

6. **The issue's IRR root cause is wrong, and the draft repeated it.** The issue
   attributes `Not calculable` to the absolute `0.0001` tolerance being
   unreachable at 1e11. Measured: with the shipped defaults NPV is **positive at
   both ends** of `[-0.5, 2.0]` (1.35e13 and 3.84e7) — there is no root to find,
   and tolerance is irrelevant. Fixing only the tolerance would have closed this
   issue with the visible symptom unchanged. → premise table, D3, and a new TDD
   row pinning the real cause.
7. **The draft's own scale-invariance test was vacuous.** It used `1e8`, which
   measurement shows is **green today** — the absolute bound survives to 1e8 and
   first fails at 1e10. A red-before/green-after claim on that row would have
   been false. → the row now uses `1e10`, the measured failure point. This is the
   same defect class as finding 6: a plausible number asserted rather than run.

One criterion was **withdrawn as vacuous**: "the NOT VIABLE branch is covered by
a test" — satisfiable by forcing the branch condition directly, which proves
nothing about reachability from real inputs. Replaced with reachability from a
**named input set**.

**Verdict: ready for owner review.** One decision required (D4).

---

## Risks and Open Questions

- **DECISION REQUIRED (D4) — the defaults.** With units fixed, the page's own
  defaults describe a field losing $1.1 bn. Recommended: option 1, re-pick from a
  cited public source. This plan will not choose the numbers, because choosing
  them to produce a positive NPV is exactly the fitted-constant failure D5
  forbids.
- **Risk — this is live on `www.aceengineer.com`.** Every visitor currently sees
  `$348915.5B M`. That argues for landing the unit fix quickly; it argues against
  bundling it with a defaults debate. If D4 stalls, **split**: ship units + IRR
  under this issue and move defaults to a follow-on. The plan is written so that
  split is clean — only the last Files-to-Change row is conditional on D4.
- **Risk — deleting the inline duplicate changes the page's loading contract.**
  It gains a script dependency it did not have. The engine must be in the built
  output and referenced with an absolute path, per the repo's link rule. If that
  proves awkward, the fallback is to fix the inline maths in place and add the
  parity test anyway — worse, but not blocked.
- **Unverified — how the live page is deployed from `dist/`.** This plan assumes
  the standard build path. It does not touch deployment, but "the fix is live" is
  not something these criteria can prove.

---

## Complexity: T2

One page, one module, three test files. No new dependency, no build change, no
cross-repo coordination. Not T1: the defaults question is a genuine product
decision and the characterisation rewrite has a six-test blast radius.
