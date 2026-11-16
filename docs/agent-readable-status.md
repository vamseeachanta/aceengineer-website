# Agent-readable site status

The built site was measured before implementation on 2026-10-22. Existing case
study descriptions and sitemap dates already closed the earlier reported gaps.
Only full page text and the public reports index were absent.

## Revision history

| Revision | Date | What changed and why |
|---|---|---|
| Initial | 2026-10-22 | Record the built baseline to limit changes to remaining gaps. |

## Status table

Counts below are direct file and element counts from the baseline `npm run build`,
not estimates. Indexed pages are built HTML files minus `SITEMAP_EXCLUDE` in
`build.js`. Case studies exclude their directory index; data pages include theirs.

| Surface | Baseline observation | Disposition |
|---|---|---|
| `llms.txt` | Present; all 123 sitemap URLs listed | Preserve generation and coverage |
| `llms-full.txt` | Absent | Generate static main text at build time |
| `robots.txt` | `User-agent: *`, `Allow: /`, sitemap declaration, existing `Crawl-delay: 1`; no active block | Document existing allow-all policy |
| `sitemap.xml` | 123 URLs; 123 `lastmod` elements | Preserve Git dates; test source selection and date format |
| Case study descriptions | 8 of 8 detail pages described in `llms.txt` | Preserve metadata copy; add regression coverage |
| Data page descriptions | No built `data/` pages | Test future data pages with a small fixture |
| `/reports/` index | Absent; 12 public report pages and views already built | Generate an index from an explicit public register |
| JSON-LD presence | 123 of 123 indexed pages have a JSON-LD block | Preserve coverage; new index uses `CollectionPage` |

JSON-LD presence is not a schema validity or factual accuracy assessment. Sitemap
dates reflect content source history, not every dependency that can affect a page.
The crawler delay above is existing configuration, not a protocol requirement.

## Repeat the measurement

```sh
npm run build
node scripts/measure-agent-readable.js dist
```

The measurement script has a hand-counted fixture test. The expanded build has
124 indexed pages and a reports index containing the 12 registered destinations.
On the uncommitted tree, the new index has no Git date, so 123 sitemap entries
have `lastmod`. A full-history build after the index is committed can date it.
No rebuild timestamp is substituted for unavailable history.

See [the interface, sources and worked example](agent-readable-site.md) for the
extraction rules and limitations.
