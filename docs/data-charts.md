# Public data charts

The shared component displays one quantity against one variable from a committed
JSON bundle and its paired CSV. The build checks provenance and CSV agreement,
then writes the source, dates, text alternative and data table into the HTML.
The vendored Plotly asset adds interaction. The numbers remain readable when
JavaScript, a bundle fetch or Plotly is unavailable.

## Revision history

| Revision | Date | Change and reason |
|---|---|---|
| 1 | 2026-10-22 | Add the component contract, sourced example and validation method so public-data pages can share one renderer. |

## Bundle contract

The public chart-bundle contract in upstream issue #1679 (2026) specifies the
required information but has no published typed schema in the inspected source
tree. This consumer implements the following provisional spelling. Adapt the
upstream writer at the boundary when its schema is published; do not silently
guess aliases or fill missing provenance. HSE issue #1671 and drilling issue
#1672 supply the future analysis exports. No production GoM page is added here.

Put bundles in `assets/data/charts/`. Every JSON file in that directory is
validated by `npm run build`, even if no page uses it. Missing paired files,
invalid values and missing metadata fail the build before page rendering.

| Field | Meaning and rule |
|---|---|
| `id` | Unique lower-case HTML identifier, starting with a letter; letters, digits and hyphens only. |
| `headline` | Plain-English description of the chart. |
| `quantity`, `unit` | A single measured quantity and its explicit unit; no implicit dimensionless value. |
| `x.variable`, `x.unit` | One independent variable and unit, including `year` for calendar years. |
| `series` | Nonempty ordered rows of `{x, value, year}`. Values are finite numbers, years are integers, x values are unique numbers or nonempty categories of one consistent type. Order is preserved. |
| `source.name`, `source.url` | Source title and public HTTPS address without embedded credentials. |
| `source.date` | Valid calendar date, with its meaning stated by `date_kind`. |
| `source.date_kind` | `publication` or `reporting-period-end`; a reporting date is never described as a publication date. |
| `source.retrieved_at` | Valid RFC 3339 UTC timestamp ending in `Z`, at or after the source date. |
| `source.input_sha256` | Lower-case SHA-256 of the input bytes. The build validates digest syntax; it cannot recheck an off-repository input. |
| `limits` | An array of horizontal references in the quantity's unit: `{value, label, citation}`. Supply an empty array when no cited limit exists. No default engineering limit is assumed. |
| `csv` | Paired CSV basename in the same directory; lower-case letters, digits and hyphens, ending in `.csv`. |
| `text_alternative` | A supplied readable description of values, trend and limits. |

CSV columns are exactly `x,value,year,unit`. The build checks row order, x text,
numeric values, years and units against the JSON, with no numeric tolerance.
Quoted fields and doubled quotes follow RFC 4180 (2005), section 2. CRLF and LF
record endings are accepted. Numeric spelling may differ if the finite numeric
value is identical. No conversion, aggregation, sorting or interpolation occurs.
One bundle creates one trace; multiple quantities require separate charts.

## Page integration

Edit `content/` first. A page opts in with this placeholder:

```html
<data-chart src="/assets/data/charts/bsee-injuries.json"></data-chart>
```

Include `assets/css/data-chart.css`, then deferred scripts for
`assets/js/plotly-2.32.0.min.js` and `assets/js/data-chart.js`, in that order.
Use same-origin paths. No inline executable script, CDN or external data fetch
is needed. The build rejects unknown bundle addresses and duplicate charts on
one page. Keep the shared heading, source line, alternative and table together.

The worked page is `content/data/_example/index.html`, rendered to
`dist/data/_example/index.html`. It has `noindex` and is excluded from both the
sitemap and `llms.txt`. Its numbers are public observations, not synthetic data.
Synthetic contract and limit cases live only under `tests/js/fixtures/` and are
never copied into the built assets or page.

## Worked example: inputs, method and answer

Source: [BSEE Offshore Incident Statistics](https://www.bsee.gov/stats-facts/offshore-incident-statistics),
calendar-year Injuries cards for 2023 and 2024, retrieved 2026-10-22T17:01:13Z.
The observed cards list 203 and 223 injuries respectively. These are OCS-wide
totals; no GoM-only filtering is represented. The sample JSON records the input
HTML SHA-256, and the raw response is retained outside the repository. The
source date is the end of the last reporting year, 2024-12-31. Publication date
is not supplied by the cards.

The method is literal transcription to CSV and JSON and direct rendering.
The independent hand calculation is `223 - 203 = 20.0 injuries`. The answer is an
increase in the reported count; no inference about exposure-adjusted risk is
supported. The renderer does not compute that difference. Acceptance is
`NOT_EVALUATED`: the source supplies no acceptance limit or exposure denominator.

## Interaction and accessibility

Hover details give the value, unit, year and source through Plotly
`hovertemplate` and `customdata`, following the
[Plotly JavaScript documentation](https://plotly.com/javascript/hover-text-and-formatting/)
(read 2026). Bundle strings are escaped before entering either HTML or Plotly's
formatted-text parser. Limits have dashed lines and cited labels, plus a text
list outside the chart so long citations remain readable.

The chart can receive keyboard focus. Left and Right select adjacent points;
Home and End select endpoints. Previous and Next buttons provide the same
operation. A live status exposes point details, and the static table is always
available. The supplied alternative is associated with the chart by
`aria-describedby`. Buttons become available only after Plotly succeeds.

The palette inherits `--blue`, `--navy`, `--ink` and `--bg` from
`assets/css/theme.css`. A single blue series, square markers and dashed navy
references do not require red/green discrimination. Tests calculate contrast
against the theme background. The acceptance rules and luminance formula come
from [WCAG 2.2](https://www.w3.org/TR/WCAG22/) (2024), sections 1.4.3 (normal text
contrast), 1.4.11 (non-text contrast), 1.4.1 (use of colour), 2.1.1 (keyboard),
2.4.7 (focus visible), and the relative-luminance and contrast-ratio definitions.
Automated checks do not establish full assistive-technology conformance.

## Validation and known limits

- `npm run build`: validates all bundles and paired CSV, expands page furniture,
  checks vendored asset integrity and generates discovery files.
- `npm test -- --runInBand`: includes the chart unit and build-integration tests.
- `npm run test:visual -- tests/visual/data-chart.spec.js --workers=1`: real
  Plotly hover, keyboard details and JavaScript-disabled fallback on the example.

Unit fixtures are synthetic by definition: the two values are 2 and 5 events,
with a reference value of 4. Independent subtraction is `5 - 2 = 3.0`; the reference
lies between the rows. These numbers test transport and presentation only.
The real sample test instead uses the cited BSEE counts. No engineering formula,
coefficient, acceptance threshold or claimed risk improvement is introduced.

The consumer does not authenticate source rights, retrieve source data, verify
off-repository source bytes, assess statistical significance or infer engineering
acceptance. Upstream collection, QA and the final typed schema remain required
before dedicated HSE and drilling pages are published.
