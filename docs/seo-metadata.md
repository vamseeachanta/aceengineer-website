# Built-page SEO metadata contract

The audit reads built HTML and `sitemap.xml`, records the requested metadata,
and reports every deviation, including accepted existing deviations. It does
not fetch pages or execute scripts. Its output is `reports/seo-audit.json`,
which is regenerated from the build on every run and is not committed: a
committed copy would carry page digests that change with every page edit.

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| Initial | 2026-10-22 | Add a reproducible metadata audit, sourced rules and an authoring example so new pages can be checked. |
| 1 | 2026-11-16 | Order pages by path string, strip only a whole `index.html` component, match uniqueness exceptions on page and rule, refresh the allow-list against current main and stop committing the generated report, after review. |

## Run and interpret the audit

```bash
npm run build
uv run --no-project python scripts/seo/audit.py
uv run --no-project python scripts/seo/audit.py --check
npm test -- --selectProjects metadata --runInBand
uv run --no-project --with pytest python -m pytest tests/python/test_seo_audit.py
```

`--built-root`, `--config` and `--output` accept alternate inputs and destinations.
The default built root is `dist/`. The report contains per-file content digests,
the sitemap digest, decoded title and description arrays, canonical URLs,
Open Graph fields, Twitter fields, JSON-LD types, heading counts, robots
directives, indexability and sitemap membership. Arrays preserve duplicate
tags. Lengths count decoded Unicode code points, including spaces.

`--check` returns a failure for unapproved violations, stale exceptions or
absent HTML. `PASS` means that the checks actually evaluated have no unapproved
deviations. It does not mean that every advertised structured-data feature has
been fully validated. Read `not_evaluated` alongside `violations`.

The JavaScript metadata suite runs the Python audit through uv and verifies
that every built page has a report row and a matching digest. Set `UV_BIN` if
uv requires an explicit executable location. CI runs the audit after its build.
Temporary test output uses the normal test temporary directory.

## Rules and sources

Every policy input and source is in [the configuration](../config/seo-audit.json).
The public guidance below was retrieved on 2026-10-22; the cited year is the
retrieval year for documentation that changes over time.

| Rule | Basis and scope |
| --- | --- |
| Exactly one nonempty title and description; unique normalized values across all pages | Issue #167 acceptance contract (2026); [Google title links](https://developers.google.com/search/docs/appearance/title-link) and [snippets](https://developers.google.com/search/docs/appearance/snippet). Whitespace and HTML entities are normalized; comparison is case sensitive. |
| Exactly one h1 | Issue #167 acceptance contract (2026), a site policy rather than a claimed search ranking threshold. Template and script text does not add headings. |
| One absolute HTTPS canonical on every page; indexable page canonicals equal their sitemap URLs | Issue #167 acceptance contract and [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). HTTPS and exact file equality are site policy. Directory indexes use trailing-slash URLs. |
| Sitemap and indexable built-file sets agree; no noindex entries | [Sitemaps protocol 0.9](https://www.sitemaps.org/protocol.html), XML tag definitions, and [Google robots directives](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag). Sitemap URLs must use the configured origin. Both robots and googlebot restrictions are considered; `none` includes `noindex`. This is Google indexability from static HTML, not an HTTP or robots.txt crawl. |
| Title and description length | [Google title links](https://developers.google.com/search/docs/appearance/title-link) and [snippets](https://developers.google.com/search/docs/appearance/snippet) specify truncation by display width rather than fixed character caps. Defaults are `null`, resulting in `NOT_EVALUATED`. A maintainer can configure bounds with a source; lengths are always reported. |
| JSON-LD parses, typed nodes inherit a schema.org context | [Schema.org data model](https://schema.org/docs/datamodel.html). Objects, arrays and graphs are traversed. Pure reference objects need no type. The supported context is an unmodified schema.org HTTP or HTTPS URL, with an optional trailing slash. Remote contexts and term redefinition require a full JSON-LD processor and are outside this audit. |
| Dataset required properties and description length | [Google Dataset](https://developers.google.com/search/docs/appearance/structured-data/dataset), Required properties: `name`, `description`; description length from 50 through 5000 characters. `creator` is recommended, not required. |
| BreadcrumbList required properties | [Google Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), BreadcrumbList and ListItem tables: at least two items; ordered integer positions beginning at one; name may come from item.name; the last item URL may be omitted. This site's nonfinal URLs use HTTPS. |
| Other required-property profiles | [Google Article](https://developers.google.com/search/docs/appearance/structured-data/article) has no required properties for Article, BlogPosting and NewsArticle. Types without a configured profile are explicitly `NOT_EVALUATED` for required properties. Schema.org property listings are not universal mandatory fields. |
| Open Graph | [Open Graph protocol](https://ogp.me/), Basic Metadata requires `og:title`, `og:type`, `og:image`, `og:url`; arrays are supported. Description and HTTPS image URLs are additional site policy. `og:url` matches the page URL. |
| Twitter | Issue #167 requires a card tag. Broader completeness is `NOT_EVALUATED`: the [vendor markup address](https://developer.x.com/en/docs/x-for-websites/cards/overview/markup) redirected to a general overview without card requirements. Open Graph guidance does not define Twitter requirements. |

## Existing deviations and adding exceptions

The initial explicit allow-list records source-confirmed omissions, without
rewriting page copy or shared metadata in overlapping work. Each entry identifies
one page, one rule, an exact diagnostic and a reason. Uniqueness exceptions
(`title-unique`, `description-unique`) match on page and rule only; the duplicate
group stays in the report detail, so a page joining or leaving a group does not
make the other exceptions in that group stale. There are no wildcards or
automatic baseline updates. An exception cannot conceal a different diagnostic;
an exception that no longer matches is a failure and must be removed.

| Source-confirmed deviation | Entries | Evidence |
| --- | ---: | --- |
| Missing Twitter card | 50 | Individually listed source files, interactive templates, capability renderer and registry. |
| Duplicate redirect description | 9 | Individually listed noindex newsletter chart and diffraction stubs. |
| Home breadcrumb has only its Home item | 1 | The single ListItem in the home source. |
| Byte-for-byte digitalmodel technical page copies | 21 | Three pages under `digitalmodel/` (buckling, CFD, hydro), each lacking a description (1), `og:title`, `og:type`, `og:image`, `og:url` and `og:description` (5) and a Twitter card (1). The copies keep their stable URLs and are not rewritten here. |

These counts are the tally of `config/seo-audit.json` entries (81). Against a
build of main merged into this branch at b9e2a64, CI's `audit.py --check` reports
PASS on 148 pages with 0 unapproved deviations; a stale exception would have
failed the check. Validate the list against a clean build before merging.
Do not add entries just to make a new page pass. Fix plain defects in its source;
refer substantial wording changes for copy review. An intended redirect can
canonicalize to its replacement, so self-reference and sitemap membership do
not apply to it; canonical count, HTTPS, title, description and heading checks do.

## Add a page that passes

1. Create its source under `content/`; do not edit generated HTML first.
2. Supply a distinct title and description, and one visible h1. Use the shared
   head partial to obtain the canonical URL derived from the output path.
3. Supply Open Graph title, type, image, URL and description, plus a Twitter
   card. Match the canonical URL and use an existing vendored image.
4. Add structured data appropriate to the content. Keep the schema.org context
   and supply properties from a documented profile. Do not invent claims to
   satisfy a structured-data feature.
5. Build, then audit. An indexable page must appear in the generated sitemap;
   a redirect must carry `noindex` and be excluded by the build's sitemap policy.
6. Read all violations and unevaluated checks. Run the metadata suite and the
   tests of any changed generator. Regenerate the report after the last build.

## Worked example: a synthetic guide page

Inputs: a built file at `guide/index.html`, configuration origin
`https://example.org`, and a sitemap containing only
`https://example.org/guide/`. The example deliberately uses synthetic copy.

```html
<!doctype html>
<html><head>
  <title>Guide</title>
  <meta name="description" content="A guide.">
  <link rel="canonical" href="https://example.org/guide/">
  <meta property="og:title" content="Guide">
  <meta property="og:description" content="A guide.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.org/guide/">
  <meta property="og:image" content="https://example.org/card.png">
  <meta name="twitter:card" content="summary">
</head><body><h1>Guide</h1></body></html>
```

Method: decode head values, count the title, description, canonical and h1
independently, convert the index filename to a directory URL, then compare the
canonical and sitemap sets. Group title and description values across the input
pages. Inspect social fields and parse any JSON-LD blocks.

Answer: each counted element occurs once; the canonical and sitemap URL are
equal; the title has five characters and the description has eight, counted
directly from the strings above. All evaluated rules pass with no deviations.
Length bounds and broader Twitter completeness remain `NOT_EVALUATED`. This
example contains no JSON-LD blocks, so there is no structured-data feature to
validate; page-specific schema coverage remains in the existing metadata suite.
The fixture helper and tests in `tests/python/test_seo_audit.py` reproduce these
inputs and also mutate each rule independently. This proves the algorithm on
synthetic inputs, not the live site's metadata.

## Report and remaining validation

The report is written by the CI step and by the Jest contract on every run;
absent built input is recorded as `NOT_EVALUATED`, never as a pass. Review every
unapproved deviation and stale exception it lists. Later validation also needs citable Twitter guidance and
required-property profiles for additional structured-data types. This audit
does not assert rich-result eligibility, image availability, rendered heading
visibility, HTTP status or external structured-data validation.
