# Agent-readable site interface

The build publishes a short page guide, full static page text, sitemap dates,
crawler guidance and a public report index. These surfaces describe the existing
public site. They do not qualify engineering claims or execute calculators.

## Revision history

| Revision | Date | What changed and why |
|---|---|---|
| Initial | 2026-10-22 | Document the remaining discovery surfaces and their build tests. |

## Build inputs and outputs

Run `npm run build`, then serve `dist/`. The build extends the existing
`writeSitemap` and `writeLlmsTxt` functions in `build.js`.

| Public path | Inputs | Rule |
|---|---|---|
| `/llms.txt` | Built titles and meta descriptions, canonical firm copy and capability registry | Existing sorted page guide; withheld capabilities and `SITEMAP_EXCLUDE` destinations remain absent |
| `/llms-full.txt` | Built titles, meta descriptions and main landmarks | One entry per indexed page, in sorted relative-path order |
| `/sitemap.xml` | Built destinations and content source history | Canonical URLs with available Git content dates |
| `/reports/` | `config/public-reports.json` and `content/reports/index.html` | Render only explicitly public report entries with title, content revision date, format and link |
| `/robots.txt` | Root `robots.txt` | Copy existing allow-all crawler guidance and sitemap location |

The page set is shared with the sitemap through `builtPages` and
`SITEMAP_EXCLUDE`. That exclusion map carries a reason for each omitted error or
retired redirect page. The full text file lists every sitemap destination;
`llms.txt` lists every destination and retains its existing extra capability links.
Case study and data page descriptions are checked against their own meta tags.
No data pages existed in the measured baseline; fixture coverage exercises that
directory without introducing a public example dataset.

The short guide retains its existing omission of percentage or currency
descriptions. All current case studies have descriptions without those figures.
The build tests require complete descriptions for case study and data pages;
future pages must supply suitable meta copy rather than silently losing coverage.

## Full text extraction

`writeLlmsFullTxt` reads the final built HTML after report and capability
generation. It decodes entities through the existing PostHTML parser, reads the
head title and description, and selects the first `main` or `role="main"`
landmark. Missing metadata or a missing main landmark fails generation.

The extractor walks static content in document order. It keeps paragraph breaks,
heading text and levels, list item boundaries and table row boundaries. Table
cells are separated by spaces. It excludes scripts, styles, templates, comments,
navigation, footers, `hidden` elements and `aria-hidden="true"` subtrees. Heading
markers follow the HTML heading elements described in [WHATWG HTML, sections
(2026)](https://html.spec.whatwg.org/multipage/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements).
Whitespace is normalized; the output is UTF-8 text with Markdown heading markers.

Each entry contains a title, a canonical `URL:`, a `Description:` and the main
text. The canonical URL and description come from the existing build logic and
page metadata. No current time, network lookup or generated engineering answer
is inserted. Repeated generation from the same built pages produces identical
bytes. The format is a local companion to the [llms.txt proposal (2024; current
proposal read in 2026)](https://llmstxt.org/), rather than a separate standard.

Extraction does not run JavaScript or evaluate CSS visibility. Dynamic report
values, interactive charts and calculator answers must be read on the original
page. Link labels are retained; link attributes and image-only evidence are not
transcribed. Source text, including assumptions and limitations, remains the
basis of the export. Use the entry URL to inspect linked references and figures.

## Sitemap dates

The [sitemaps.org protocol 0.9, XML tag definitions / lastmod](https://www.sitemaps.org/protocol.html#lastmoddef)
permits the W3C complete date, `YYYY-MM-DD`. The [W3C Date and Time Formats note
(1997), Formats](https://www.w3.org/TR/NOTE-datetime#Formats) defines that date form.
`git log -1 --format=%cs -- <source>` supplies the most recent committer date for
the content source. See [Git log, Pretty formats / `%cs`](https://git-scm.com/docs/git-log#Documentation/git-log.txt-cs).
This is the recorded content date, not the build time.

Direct pages use `content/<relative output path>`. Generated capability pages use
`config/capabilities.yaml`; generated sample pages use `config/samples.yaml`.
The generated drilldown and QA hub use their respective templates in
`scripts/templates/`. These dates do not track shared includes, styles, scripts,
report-register changes or data snapshot changes. A full dependency-date graph is
outside this change. The public report register likewise records the last Git
date of each corresponding `content/reports/` source at the time of this update;
maintainers update that date when revising its entry. It is not a claimed first
publication date.

The existing shallow-history guard remains: shallow and non-Git builds omit all
`lastmod` fields. A source with no reachable commit also has no date; the protocol
makes `lastmod` optional. The new index is uncommitted during local validation,
so its date is absent until a full-history build after commit. Fixture tests use
the W3C note's literal complete-date example to check output independently.

## Public reports and crawler policy

`config/public-reports.json` is an explicit allowlist of existing public report
pages and report views. Entries require an explicit publication flag, title,
valid complete date, format and a local report link. Duplicate links, self-links,
external URLs, traversal, missing targets and excluded targets are rejected.
The build does not scan internal report folders or copy unpublished documents.
The index uses [schema.org CollectionPage](https://schema.org/CollectionPage) and
the site's existing organization and breadcrumb conventions.

`User-agent: *` with `Allow: /` permits every crawler to request public paths,
including both text guides and the reports index. This follows [RFC 9309 (2022),
sections 2.2.1 and 2.2.2](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.2.1).
The sitemap declaration remains. The existing crawl delay is retained as an
extension with varying support; it is not a rule specified by RFC 9309.
Robots guidance does not grant content reuse rights and does not provide access
control. No crawler-specific or path block is added. A future block remains a
maintainer decision; issue #166 records no such decision.

## Worked example: page to full-text entry

Question: does the illustrative field economics example import observed
production records?

Inputs are `content/case-studies/bsee-field-economics.html`, its built HTML and
its own meta description. The method reads that description, maps the output
path to the canonical URL and transcribes the main landmark. A hand transcription
of the opening of its resulting entry is:

```text
## Illustrative Field Economics | AceEngineer

URL: https://www.aceengineer.com/case-studies/bsee-field-economics.html
Description: Illustrative field economics with synthetic production and assumed costs. Saved NPV and cash flows are illustrative; IRR remains a placeholder.

# Illustrative Field Economics

## Illustrative Example

This example describes the field economics generator, its saved metrics and saved cash flows. The production profile is synthetic and the financial inputs are assumed. No BSEE records are imported by this generator, and no client engagement or investment decision is represented.
```

Answer: the example uses synthetic production and assumed financial inputs; it
does not import BSEE records. This answer follows the page's explicit statement,
not an inference from the exported numerical table. The rest of the entry keeps
the page's method, saved outputs and limitations. Read the [source
page](https://www.aceengineer.com/case-studies/bsee-field-economics.html) for its
linked implementation and evidence. A build test checks this opening against
the generated entry.

## Validation and status

`tests/js/agent-readable.test.js` uses a synthetic site with hand-transcribed
expected text and hand-counted measurement totals. It checks sorted and repeatable
output, decoded entities, hidden content, excluded destinations, descriptions,
W3C dates, unavailable history, source mapping, report validation and crawler
rules. Built-site checks compare both text files with every sitemap URL and the
report register with every public report destination.

See [the measured baseline](agent-readable-status.md). Later work may add a full
dependency-date graph, per-page Markdown and JavaScript result exports; none is
required for the static surfaces documented here.
