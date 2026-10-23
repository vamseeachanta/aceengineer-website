# Case-study summary template

The build adds a summary, a full-report state and a repeat-workflow state to
each registered case study. Existing page content remains in place. The index
adds a summary link to each registered card without changing its text or links.

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| Initial | 2026-10-22 | Document the additive template and its evidence requirements. |

## Data and rendering

Edit `content/data/case-study-summaries.json`. Each key is the HTML filename in
`content/case-studies/`. The shared partial is
`content/partials/case-study-summary.html`; its renderer is
`scripts/case-study-summary.js`. The build calls the renderer before resolving
the normal page includes. No browser script, remote asset or stylesheet is added.

The fields are:

| Field | Meaning |
| --- | --- |
| `summary.what` | What the page describes or what the cited work did. |
| `summary.inputs` | Inputs stated on the existing page. |
| `summary.result` | The stated result, or the explicit absence of a result. |
| `summary.basis` | Whether the basis is measured, synthetic, assumed or method only. |
| `evidence` | Public source paths and section names supporting the wording. |
| `report` | A confirmed public report, or `null`. |
| `workflow` | A documented public workflow, or `null`. |

The summary uses a sentence for each summary field. This implements the
two-to-four-sentence summary requirement of issue #165 (2026), using four
sentences with visible labels. Current summaries introduce no figures. A method
description remains a method description; it does not become a completed design
or an observed outcome.

The renderer inserts the partial immediately after the page heading, in this
order: summary, full report, how to repeat. Missing summary data, missing source
sections and duplicate insertion fail the build. The index must have a card for
each registered study. The renderer changes no original page bytes and only adds
summary links inside registered index cards. Its tests remove these additions
and compare the complete original and resulting strings.

## Full reports

All current report entries are `null`. These pages show
**No public full report yet**. An import record, an illustrative metrics file,
a calculator and a related tutorial are not full reports for these studies.

A site report uses a record such as `{ "url": "/reports/example.html" }`.
Replace the example URL with an existing published file before use. The renderer
checks the destination in `content/` or `assets/`, excluding partials, traversal
and non-file paths. Unresolved URLs render the unavailable state without a link.

A public repository file must use an HTTPS GitHub file URL pinned to a commit.
Its `verification` record must contain the same `url`, a `checkedAt` date and
`publicFile: true`. Before adding that record, open the public file without
authentication and retain the response and request details for review. The
verification record attests to that check; the offline build cannot establish
ongoing remote availability. Branch URLs and unconfirmed repository URLs render
the unavailable state. No remote report is currently registered.

## Repeat workflows

A workflow contains `inputs` as a list, followed by `method`, `toolLabel`,
`toolUrl`, `action`, `output` and `limitation` as text. The tool URL must resolve
to a published local page. The text must come from the case study, the linked
tool or public documentation. An incomplete workflow or missing tool renders
**Not yet available as a public workflow**.

The wall-thickness and stability pages link to educational calculators. Their
repeat blocks state the inputs, button action and expected output shown by the
calculator, and state that the demonstration does not repeat the full sweep.
Other studies retain the unavailable state. A code excerpt or a named parser
does not by itself establish a public executable workflow.

The source sections are the wall-thickness page's **Tools** section, the
stability page's **Tools** section, and the input labels, calculation buttons,
result panels and disclaimers in the corresponding `content/calculators/`
pages. No engineering equation or acceptance threshold is added by this template.

## Worked example: illustrative field economics

The example entry is `bsee-field-economics.html` in the data file. Its public
page already describes the synthetic generator and links to the saved outputs.
The summary restates that description without adding a new economic result.

**Inputs:** The production profile is synthetic. Oil price, operating cost,
capital cost, royalty and discount rate are assumed inputs. The existing page's
**Production and Financial Basis** section records their values; the generator
does not import BSEE production records.

**Method:** `scripts/generate_field_economics_data.py` constructs the profile,
calculates revenue, royalty, operating cost and capital cost, and discounts the
monthly cash flows. These are the calculation steps in the public script's
`create_production_profile` and `calculate_economics` functions. The script and
saved files describe an illustrative deterministic example, not a calibrated
investment analysis. No generator or financial solver was run for this change.

**Answer:** The saved page table states NPV of **6,078.1 million USD** and total
production of **373.5 million bbl**. Sources:
`content/case-studies/bsee-field-economics.html`, **Saved Deterministic Outputs**,
and `assets/data/field_economics_metrics.json`, fields `npv_mm` and
`total_production_mmbbls`. These existing values are restated to one decimal
place, as on the page. The IRR is a placeholder; its correction and a calibrated
rebuild remain pending. The example establishes neither investment viability
nor an observed field outcome.

**Template states:** `report` and `workflow` remain `null`. The page links to a
public generator and saved outputs, but supplies no complete public repeat
procedure. Its blocks therefore show the explicit unavailable states rather
than inventing a command or labelling the metrics as a full report.

## Add a case study

1. Add the HTML page under `content/case-studies/`, retaining the existing shared
   head, navigation and footer includes. Document the inputs, method, answer and
   limitations with public source evidence.
2. Add a matching card to `content/case-studies/index.html`.
3. Add a data entry using the worked example's field structure. Write the summary
   from the page's evidence. Keep `report` and `workflow` null until their public
   availability is established.
4. Add source paths and exact section names to `evidence`. For a workflow, include
   the calculator or public procedure that documents each input and output.
5. Run `node --test tests/js/case-study-summary.test.js`, `npm run build`,
   `npm test -- --runInBand` and the relevant Python checks. The build tests compare
   original and built main content after removing only the additive blocks.

## Verification and limits

`tests/js/case-study-summary.test.js` checks the partial, report states, public
repository confirmation, workflow states, escaping, ordering, source coverage,
content preservation and saved worked-example answers. It runs with either
Jest or Node's built-in test runner. `tests/js/case-study-build.test.js` checks
the built pages against the source pages, including original text and figures.

Expected values come from issue #165's explicit state strings and order, an
independent inventory of the case-study filenames in the test, existing public
page destinations and the saved economics outputs. The synthetic repository URL
fixture tests confirmation rules only; it is never published as a report link.
The shared structure harness in issue #163 is not present on the base revision;
these checks can be incorporated when it becomes available.
