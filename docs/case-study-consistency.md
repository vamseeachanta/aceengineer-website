# Case-study consistency harness

The harness discovers every HTML page below `content/case-studies/`, including
directory indexes and nested pages. Each page receives the same declared check
list. It changes no page content. The current source inventory contains nine
pages: eight method pages and their index (a hand count of the source files).

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| 1 | 2026-10-22 | Add a shared audit, exact section deviations, regression fixtures and a reproducible report to expose inconsistent checks. |

## Run and read the report

Build the site with the repository's existing dependencies, then run:

```bash
npm run build
uv run python tests/python/case_study_harness.py --require-built
uv run pytest tests/python/test_case_study_harness.py
```

The command writes `reports/case-study-consistency.json`. Every result has a
repo-relative `page`, a stable `check`, a `status` and diagnostic `details`.
`PASS` means that the declared rule was satisfied. `FAIL` identifies the page
and check and makes the command exit unsuccessfully. `NOT_EVALUATED` means the
required evidence or tooling is unavailable; it is never counted as a pass.
`--require-built` also exits unsuccessfully when a check requiring built output
cannot run. Without that flag, missing build evidence is reported without
preventing the source checks from running. An empty discovery set is an error.

Use `--root`, `--built-root`, `--contract` and `--report` to run against a fixture
or send the report elsewhere. Output is deterministic for the same inputs. It
contains no timestamps, absolute paths, copied page text or matched deny-list
values. A failure can be located by page, check and element or rule index.

The checked-in report was generated without built output: 99 source checks
passed and 54 checks were not evaluated. These are independent counts: the
declared list has 17 checks, of which 11 can pass on source evidence and six
need unavailable evidence; multiplied by the nine discovered pages, these give
153 results. This is a source audit, not a completed deployment audit.

## Rules and evidence

| Check | Rule | Evidence and limits |
| --- | --- | --- |
| `h1` | Exactly one `h1`. | Local structure policy supporting WCAG 2.2 SC 1.3.1 and 2.4.6; WCAG does not require this exact count. |
| `heading_order` | Start at `h1`; an increase in rank cannot skip a level. Returning to a lower rank is allowed. | WAI Page Structure Tutorial, “Heading ranks”. |
| `title`, `description` | One nonempty value each, unique among the discovered pages after whitespace and case normalization. | Local metadata policy; WCAG 2.2 SC 2.4.2 supports descriptive titles. No character-length threshold is assumed. |
| `canonical_sitemap` | The built canonical equals the unique sitemap location for the page route. Index pages use directory URLs, as in `build.js` `canonicalUrlFor`. | RFC 6596 section 3 and sitemaps.org XML tag definitions. Exact equality is local policy; no external canonical fetch occurs. |
| `json_ld` | Every JSON-LD block parses; WebPage and BreadcrumbList nodes exist, including arrays, nested nodes and graphs. | schema.org definitions. CollectionPage is accepted because it is a WebPage subtype. This is not complete vocabulary validation. |
| `sections` | Main-content `h2` text and order equal the declared template or an exact page-specific override. | Local contract in `tests/python/case_study_contract.json`; current deviations were hand-inventoried from the source pages. |
| `href_format` | Hrefs are nonempty and contain no bracket placeholders or local placeholder tokens (`TODO`, `TBD`, `placeholder`). External web links explicitly use HTTPS. | Local copy policy and RFC 3986 sections 3–4. Named anchors may omit href. Nonempty mail and telephone links are allowed. |
| `internal_links`, `report_links` | Every internal href, including stylesheet and feed links, resolves inside the built tree. Directory links resolve to index files; decoded HTML fragments match an `id` or named anchor. | RFC 3986 sections 5.2 and 3.5; built-file existence is local policy. Queries do not affect file selection. Report targets receive their own result as well. |
| `image_alt` | Every image has an alt attribute. Empty alt is allowed for decoration. | WCAG 2.2 SC 1.1.1. The check does not judge whether a description is meaningful. |
| `landmark_skip` | One main landmark and a shared navigation include; the partial's skip link targets main. The built skip link is checked when available. | WCAG 2.2 SC 2.4.1. No keyboard or focus behavior is asserted. |
| `link_text` | Link text is not “click here”, ignoring case and whitespace. | Local text policy supporting WCAG 2.2 SC 2.4.4; surrounding context is not evaluated. |
| `table_headers` | Each table has a nonempty header cell. | Structural screening for WCAG 2.2 SC 1.3.1; complex header associations are not evaluated. |
| `copy_deny_list` | Page text contains none of the existing configured forbidden phrases. | Reads `brand/copy.yaml` `forbidden_phrases`, the source used by `scripts/lint-copy.js`. It does not turn brand names into private-name rules. |
| `private_names` | Apply an existing private-name deny-list when configured. | `NOT_EVALUATED`: no such list was found in the existing legal/copy-lint configuration. No names are embedded in the harness. |
| `browser_accessibility` | Browser accessibility analysis requires an existing axe dependency. | `NOT_EVALUATED`: `package.json` declares Playwright but no axe dependency. No dependency or browser test is added. |

Structure, metadata, JSON-LD and section checks use source pages. Image, link-text,
table and configured phrase checks inspect source markup and built markup when
available. Built link checks include shared markup. Without a build, shared
image, table and phrase coverage is incomplete. The parser collects HTML tags
and attributes; it does not reproduce browser error recovery, CSS visibility,
accessible-name computation or the accessibility tree. A non-HTML fragment
requires format-specific tooling and is reported as `NOT_EVALUATED`.

## Template and deviations

The default main-section sequence is “The challenge”, “Solution Approach”,
“Related methods”, “Summary”. This matches the current comparison and stability
method pages. It is a local consistency template, not a requirement from WCAG
or a demand to restore the historical claims-oriented template.

The contract lists exact alternatives and reasons for the economics example,
import-coverage page, fatigue method, foundation method, automation methods and
collection index. An override replaces the whole expected sequence for that
page; it does not permit arbitrary insertions, deletions or reordering. A new
page uses the default. A new deviation requires an explicit contract edit.
Whitespace and case changes do not count as section drift.

## Add a check

1. Write a synthetic failing fixture or mutation in
   `tests/python/test_case_study_harness.py`. State the independently counted
   expectation or the source clause in its docstring. Run it before implementing
   the new rule.
2. Add a function in `tests/python/case_study_harness.py` returning `evaluated`
   with errors or `unavailable` with a reason. Keep diagnostics free of page text
   and deny-list values. Cite its basis in a comment; arbitrary thresholds need
   configuration or an explicit unevaluated result.
3. Add a `Check` to `CHECKS`, including its source and whether it needs built
   output. The shared discovery loop and report automatically include it on
   every page. Run the fixtures, build, full suites and Ruff, then regenerate
   the report and inspect changed statuses.

To consume a future existing private-name list, set `name_deny_list` to an
object with `path` and `key` pointing to that legal/copy-lint YAML configuration.
Do not copy names into this contract or test. Missing or empty lists remain
unevaluated. The synthetic fixture exercises a configured list and verifies
that only its rule index appears in diagnostics.

## Worked example: heading drift, then correction

Inputs are synthetic markup, not an engineering result:

```html
<h1>Example</h1>
<h2>Scope</h2>
<h2>Method</h2>
<h4>Detail</h4>
<h2>Summary</h2>
```

Method: read the heading ranks in document order, giving `[1, 2, 2, 4, 2]` by
hand. Compare adjacent ranks using the WAI heading-ranks rule: an increase is
allowed only to the next rank. The `h2` to `h4` transition skips `h3`, so the
answer is `FAIL` for `heading_order`. The return from `h4` to `h2` closes the
subsection and is allowed.

Correction: replace `<h4>Detail</h4>` with `<h3>Detail</h3>`. The hand-read ranks
become `[1, 2, 2, 3, 2]`; no increase skips a rank, so the answer is `PASS`.
`test_worked_heading_example_fails_then_passes_after_fix` executes both inputs
and asserts these independently derived outcomes. This demonstrates how a
newly introduced defect is detected without changing any existing page.

## Sources

- [WCAG 2.2, W3C Recommendation (2023)](https://www.w3.org/TR/WCAG22/), SC 1.1.1, 1.3.1, 2.4.1, 2.4.2, 2.4.4 and 2.4.6.
- [WAI Page Structure Tutorial: Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/), “Heading ranks”, accessed 2026-10-22.
- [RFC 3986 (2005)](https://www.rfc-editor.org/rfc/rfc3986), sections 3–5: URI syntax, fragments and relative resolution.
- [RFC 6596 (2012)](https://www.rfc-editor.org/rfc/rfc6596), section 3: canonical link relation.
- [Sitemaps XML protocol](https://www.sitemaps.org/protocol.html), XML tag definitions, accessed 2026-10-22.
- schema.org [WebPage](https://schema.org/WebPage), [CollectionPage](https://schema.org/CollectionPage) and [BreadcrumbList](https://schema.org/BreadcrumbList), accessed 2026-10-22.
- Repository policy inputs: `build.js`, `content/partials/nav.html`, `scripts/lint-copy.js`, `brand/copy.yaml` and the declared section contract.

## Later slices

Supply an existing approved private-name configuration before claiming name
coverage. Add a browser integration through the existing visual setup if axe
becomes a repository dependency. Neither lexical markup checks nor an axe run
would establish complete WCAG conformance. Rebuild and regenerate the report
where Node dependencies are available before evaluating deployment links.
