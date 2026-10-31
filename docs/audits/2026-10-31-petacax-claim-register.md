# Claim register: PetaCAX-review website additions (N05)

Date: 2026-10-31. Scope: the eight additions proposed in the 30 Oct 2026 market review (section 8). This register follows the N05 claim-register fields (page, claim, evidence, verdict, checker). Evidence is public and pinned to a revision; one private record is named by an opaque ID. Website base: `ffeef6a`. Evidence revisions: digitalmodel `63584454b62a`, worldenergydata `2398dd7f7c80`, workspace-hub `5fcee75ddff6`.

Verdicts: keep (evidence supports the exact wording), qualify (wording narrowed to what the evidence supports), held (not published until the evidence exists). The checker for every row is to be assigned by the maintainer; Claude review is due before merge.

| ID | Page | Claim (short) | Evidence | Verdict |
| --- | --- | --- | --- | --- |
| P01 | `/how-results-are-checked/` | Three kinds of check: analytical value, second solver, standard edition and clause | Sloshing report (`content/reports/sloshing/index.html`); diffraction reports index; digitalmodel `src/digitalmodel/citations/`, `tests/citations/` | keep |
| P02 | `/how-results-are-checked/` | Analytical first-mode frequency 0.758054 Hz; difference 0.2964 % to 0.3264 % over seven free-decay cases; finest mesh 25,600 cells gives 0.755807 Hz | `content/reports/sloshing/index.html` (same values; asserted by `tests/js/petacax-additions.test.js`) | keep |
| P03 | `/how-results-are-checked/` | OrcaWave and AQWA compared case by case; numerical results under source review | `content/reports/diffraction/index.html` ("results withheld pending source review"); digitalmodel `src/digitalmodel/hydrodynamics/diffraction/` | qualify (method only, no numbers) |
| P04 | `/how-results-are-checked/` | Modules with citation records store standard, edition and clause; calculation stops when the reference cannot be found | digitalmodel `src/digitalmodel/citations/resolver.py`, `tests/citations/` (7 files); workspace-hub `.claude/rules/calc-citation-contract.md` | qualify ("modules that carry citation records", not all modules) |
| P05 | `/how-results-are-checked/` | 35 of 196 modules pass their cited checks (catalogue run 2026-10-17) | `assets/data/module-catalogue-summary.json` (already on the About page) | keep |
| P06 | checks page, About, AI automation | Engineer sets the criteria, reviews governing cases and signs each deliverable (Vamsee Achanta, P.E.) | Existing About and home contact copy; document control rule (private record PR-TW-07) | keep |
| P07 | checks page, solver page, engineering page | Results are checked against an independent reference before they are signed | Process rule (private record PR-TW-27/73); published examples P02 to P05 | qualify (stated as practice; see decision D4) |
| P08 | `/solver-automation/` | OrcaFlex batch from one YAML file; statics and dynamics without the GUI; FAIL verdict and non-zero exit on failed or incomplete case sets; unlicensed run reported as skipped | digitalmodel `src/digitalmodel/solvers/orcaflex/`, `tests/workflows/test_orcaflex_batch_contract.py`, `docs/reports/orcaflex-batch-reliability.html` (OrcaFlex 11.6c native run, 9 Sep 2026) | keep |
| P09 | `/solver-automation/` | OrcaWave: diffraction input from vessel YAML, geometry checks, conversion to OrcaFlex vessel data | digitalmodel `src/digitalmodel/solvers/orcawave/diffraction/` (`orchestrator.py`, `scripts/validate_geometry.py`, `scripts/convert_to_orcaflex.py`) | keep |
| P10 | `/solver-automation/` | AQWA: input preparation, listing-file reading, RAO and damping post-processing | digitalmodel `src/digitalmodel/hydrodynamics/aqwa/` (`aqwa_pre_process.py`, `aqwa_lis_files.py`, `aqwa_analysis_raos.py`, `aqwa_analysis_damping.py`) | keep |
| P11 | `/solver-automation/` | OpenFOAM: case set-up, meshing, parametric batch runs, grid convergence, post-processing; 21 accepted sloshing cases published | digitalmodel `src/digitalmodel/solvers/openfoam/` (`case_builder.py`, `block_mesh.py`, `parametric.py`, `grid_convergence.py`, `post_processing.py`); `content/reports/sloshing/` | keep |
| P12 | `/solver-automation/` | ANSYS: APDL input generated from Python, batch script, result files read back | digitalmodel `src/digitalmodel/ansys/apdl_generator.py`, `batch_runner.py`, `apdl_reader.py`; ANSYS Stage A report (13 Sep 2026: no engineering-qualified responses) | qualify (input generation only; no checked ANSYS results claimed; see decision D3) |
| P13 | `/reproducible-studies/` | Sloshing data tables for 21 accepted cases with a SHA-256 manifest | `config/sloshing-data-release.json` and the committed release manifest (asserted by test) | keep |
| P14 | `/reproducible-studies/` | Marine safety study uses public TSB Canada and MAIB UK records | `content/case-studies/marine-safety-correlation.html` | keep |
| P15 | `/reproducible-studies/` | Field economics uses a synthetic production profile and assumed costs | `content/case-studies/bsee-field-economics.html` | keep |
| P16 | `/reproducible-studies/` | Method pages report no project results | The six method case studies and the diffraction index | keep |
| P17 | `/ai-automation/` | Agents plan, prepare inputs, run solvers, draft reports; independent reviewers check plans and results | workspace-hub `docs/standards/engineering-issue-workflow-skill.md`, `scripts/review/`; writer charter (private record PR-TW-01) | keep |
| P18 | `/services/offshore-energy-data.html` | BSEE well, lease, production and well activity filings collected, joined by API well number and lease; drilling and completion days per well | worldenergydata `packages/worldenergydata-bsee/` (`bsee/analysis/well_api12.py`, `production_api12.py`, `war_rig_days.py`, `annual_duration_summary.py`; 349 test files on BSEE paths) | keep |
| P19 | every service page | Link to "How results are checked" | P01 to P07 | keep |
| P20 | `/about.html#team` | Five specialist roles named by profession, each marked "(agent)", with the signing engineer | Team roster and writer family files (private record PR-ROSTER) | keep (presentation is decision D1) |
| P21 | `/newsletter/` | Series line "Is engineering cooked? ..." and Energy Street description | Approved newsletter series line (private record PR-TW-67); `content/newsletter/issue-001-energy-street/` links the full reports | keep |
| H01 | none | Public rerun prompts ("How to repeat this analysis") | No published study carries one yet | held (decision D2) |
| H02 | none | "Reproduced" for any study | No fresh-agent rerun record | held |
| H03 | none | Main Street newsletter wording | No Main Street issue published | held |
| H04 | none | Data regions other than the Gulf of Mexico | worldenergydata sources outside BSEE have 1 to 4 tests | held |

Table 1: Claims added by this change, with evidence and verdict.

Kept off the site, as the review requires: expert counts, logos, CAD package automation, solvers without code (SACS, MOSES, WAMIT runs, Code_Aster, OpenFAST), untested modules (mooring fatigue, synthetic rope, seakeeping, spectral fatigue), and "verified", "validated" or "reproduced" without a record. `tests/js/petacax-additions.test.js` fails if any of these appears on a touched page.
