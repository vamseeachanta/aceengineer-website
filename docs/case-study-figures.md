# Case-study figure register

## Summary

The register records each visible numeric occurrence in the source pages under
`content/case-studies/`. It exposes evidence gaps without changing page text.
The generated [report](../reports/case-study-figures.md) lists every page,
including pages with no quantities, and every occurrence by evidence status.

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| 1 | 2026-10-22 | Document extraction, evidence status and a reproducible worked example. |

## Run the checks

```bash
uv run python scripts/case_study_figures.py extract
uv run python scripts/case_study_figures.py check
uv run python scripts/case_study_figures.py report
uv run pytest tests/python/test_case_study_figures.py
```

`extract` prints JSON without changing the register. `check` returns a failing
exit status for missing, stale, duplicate or mismatched entries, invalid status,
missing evidence locations, or invalid illustrative labels. `report` validates
first and then writes `reports/case-study-figures.md`. It accepts `--output` for
another destination. `--pages` and `--register` support independent fixtures.
The existing Python CI test discovery includes the new test module.

When a page changes, inspect the new extraction, update only the affected
register entries after checking their evidence, and regenerate the report.
Do not automatically assign a source or reset an established status from a
number match. Review source names and locations as evidence claims.

## Extraction and ignore rules

These are editorial rules for issue #164, not engineering acceptance criteria.
Their basis is the source-page syntax, the correction guards in
`tests/python/test_case_study_corrections.py`, and the independent synthetic
fixture in `tests/python/test_case_study_figures.py`. There are no physical
limits or engineering equations in the extractor.

- Parse HTML with the standard-library `HTMLParser`; inspect body text only.
  Decode character references and collapse whitespace. Keep inline markup in
  one text run, so a percent sign in an inline element belongs to its number.
  Keep paragraphs, headings, list items, code blocks and table rows separate.
- Exclude comments, metadata, scripts, styles, templates, the HTML `hidden`
  attribute, and inline `display: none` or `visibility: hidden` subtrees.
  Shared template includes are not expanded. These checks inventory authored
  source-page text rather than a browser's final computed layout.
- Recognize signed decimals, comma-grouped numbers, scientific notation,
  ordinals and trailing plus signs. Each endpoint of a range and each member
  of a numeric list is a separate occurrence. Repeated figures each need an
  entry, even when their values are equal.
- Capture percent signs, currency symbols and the unit spellings listed in
  `UNIT` in the script. Currency magnitudes stay explicit: `$3.5 billion`
  has value `3.5` and unit `$ billion`; no magnitude conversion is performed.
  Commas are removed from `value`, and the Unicode minus becomes ASCII minus.
- A shared unit can follow a numeric list or range within the same sentence.
  Table row labels such as `NPV (million USD)` supply the unit for bare values.
  Explicit ratio labels supply `ratio`; other bare figures use `count`.
  `count` is a conservative inventory category, not proof of a measured total.
- Ignore calendar date forms (year-month-day, slash dates, written day-month-year)
  and year ranges. Ignore unqualified four-digit year labels and years following
  calendar words, while retaining explicit quantities and table counts. The
  supported forms and counterexamples are tested independently.
- Ignore section, equation, table, figure, phase and division identifiers;
  numbered heading prefixes; and the existing `step-number` labels.
- Ignore standard designations, file identifiers, solution-sequence identifiers
  and software versions. Examples already on the pages include `ASME B31.4`,
  `API 1111`, `DNV-ST-F101`, `IEC 61400-3-1`, `S403.2.1`, `SOL 101, 103, 106`,
  `.f06`, `.op2` and `Python 3.10+`. No licensed standard values are used.
  Visible numeric code parameters, such as a concurrency argument, remain
  quantities and require register entries.

The parser behavior is based on the [Python 3 HTMLParser documentation](https://docs.python.org/3/library/html.parser.html),
accessed in 2026. That document defines callbacks and character-reference
handling; the quantity and ignore rules above are this register's editorial
contract. They are not rules attributed to Python or an engineering standard.

## Entry contract and statuses

`content/case-studies/figures.json` is an array. Each entry contains:

| Field | Meaning |
| --- | --- |
| `id` | Page, visible block ordinal and numeric character offset; identifies one occurrence. |
| `page` | HTML path relative to `content/case-studies/`. |
| `figure_text` | Exact quantity text after visible-text whitespace normalization. |
| `value` | Numeric string, preserving precision and explicit magnitude notation. |
| `unit` | Page unit spelling, currency with magnitude, `ratio` or `count`. |
| `source_name` | Evidence name; empty when no evidence is established. |
| `source_location` | Repository file with symbol, key or line; may locate the pinned external citation already linked from the page. |
| `status` | One of the statuses below. |

| Status | Meaning |
| --- | --- |
| SOURCED | The cited artifact states the figure. A synthetic input remains an assumption even when its script is a source. |
| DERIVED | Arithmetic from cited inputs; the source location records the method. |
| ILLUSTRATIVE | The figure's own sentence or applicable table-column label explicitly says `illustrative`. |
| NOT_EVALUATED | Evidence has not been established. Empty source fields are intentional. |

SOURCED and DERIVED require nonempty source name and location. The validator
checks these fields exist; it does not establish the truth, accessibility or
sufficiency of the source. It also compares page, text, value and unit against
the extractor, so merely retaining an old ID cannot hide an edited quantity.

ILLUSTRATIVE requires a case-insensitive text match in the figure's sentence or
its table-column header. A heading elsewhere on the page, a different sentence
or a different column does not qualify. Negated labels such as `not illustrative`
and `non-illustrative` do not qualify. A source may still be recorded for an
illustrative figure. These statuses are exclusive; source name and location
retain the evidence when the status is ILLUSTRATIVE.

## Evidence used

The economics page links the synthetic generator and saved metrics. The input
figures are SOURCED to `scripts/generate_field_economics_data.py`, with the source
name explicitly describing assumed inputs. Saved output figures are linked to
keys in `assets/data/field_economics_metrics.json`. The table's illustrative
column label applies to its value column. The repeated payback index in the
basis column is SOURCED; the ordinal modeled month is DERIVED by adding one to
the zero-based index. Neither is silently relabelled illustrative.

The marine page links the import completion record dated 2025-10-08 at an
immutable revision. The register locates that link at
`content/case-studies/marine-safety-correlation.html:31`, rather than duplicating
its external address. The record was opened for this change. The relevant
locations in that record are **Import Results → Canadian Transportation Safety
Board → Successfully Imported** and **Import Results → UK Marine Accident
Investigation Branch → Successfully Imported**. Repeated table counts point
to the same evidence. Its other headline totals and identity claims are not
used to substantiate this register.

The multi-code sweep, riser model and concurrency counts, and pipeline ratio
thresholds have no qualified evidence established here. Merely naming a
standard or repeating a scenario in marketing notes does not substantiate a
study input or result. They remain NOT_EVALUATED. Pages with no numeric
quantities are included in the report and need no register entries.

## Worked example: a derived import-count total

**Inputs.** The marine page's Recorded Import Coverage paragraph states
`47,385 incidents` for the Canadian source and `5,876` for the UK source. The
pinned 2025 import record's two Successfully Imported lines state those same
counts. Its immutable revision is retained in the page's existing hyperlink.

**Method.** Add the two agency import counts, without deduplication or identity
matching:

```text
47,385 + 5,876 = 53,261 incidents
```

**Answer.** The page's `53,261` occurrence is registered as follows:

```json
{
  "id": "marine-safety-correlation.html:b6:n221",
  "page": "marine-safety-correlation.html",
  "figure_text": "53,261",
  "value": "53261",
  "unit": "count",
  "source_name": "Pinned marine safety import record",
  "source_location": "content/case-studies/marine-safety-correlation.html:31 (pinned import-record link); agency import counts; sum of the two cited agency counts",
  "status": "DERIVED"
}
```

The ID distinguishes this occurrence from the two agency counts. The test
checks the independent sum against the page and register. The result describes
a sum at the cited revision; it does not establish a current database count,
a deduplicated total or cross-source matching performance.

## Test basis and known limits

The synthetic page has a hand-counted expected list, written out in its test
docstring. Additional fixtures check ignored tokens one at a time, quantities
that resemble years, nested wrappers, table boundaries, repeated values,
mutation failures, illustrative-label scope, and CLI failure and success paths.
Repository tests check extraction and report freshness as well as the worked
example and cited synthetic artifacts. Report rows include explicit zeros.

This is a static, digit-based text inventory. It does not read numbers spelled
as words, image pixels, canvas output, dynamically loaded data or computed CSS.
It does not infer physical units absent from supported page labels. Source
accuracy and engineering adequacy remain for review. Future unit spellings,
calendar forms and identifier conventions need fixtures before being added.
No case-study text, retired claim, solver output or engineering criterion is
introduced by this module.
