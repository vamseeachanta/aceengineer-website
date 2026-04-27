# AceEngineer Website Operator Map

This map is the canonical routing surface for aceengineer-website issue work.
Use it after reading `AGENTS.md` and `README.md` to choose the smallest
correct target path.

## Code, Docs, and Tests Routing

| Area | Source path | Tests path | Docs path | Common issue labels |
|---|---|---|---|---|
| Root HTML pages | `content/*.html`, root `*.html` | `tests/js/build.test.js` | `README.md`, `docs/WEBSITE_ARCHITECTURE.md` | `cat:website`, `domain:website` |
| Content | `content/` | `tests/js/build.test.js`, targeted link checks | `docs/README.md` | `cat:website`, `cat:documentation` |
| Blog | `content/blog/`, `blog/` | `tests/js/demo-links.test.js` when links or sitemap entries change | `docs/README.md` | `cat:website`, `cat:documentation` |
| Case studies | `content/case-studies/`, `case-studies/` | targeted build and link checks | `docs/README.md` | `cat:website`, `domain:website` |
| Calculators | `content/calculators/`, `calculators/`, `assets/js/` | `tests/js/*calculator*.test.js` | `docs/WEBSITE_ARCHITECTURE.md` | `cat:website`, `cat:engineering-calculations` |
| Scripts | `scripts/`, `config/`, `assets/data/` | `tests/python/` | `docs/WEBSITE_ARCHITECTURE.md` | `cat:data-pipeline`, `cat:website` |
| Tests | `tests/python/`, `tests/js/`, `tests/docs/` | self-validating via `uv run pytest` or `npm test` | `docs/README.md` | `cat:documentation`, `cat:website` |

## Operator Rules

- For public page changes, edit `content/` first and run the build before
  judging generated root or section HTML.
- For calculator behavior, put reusable logic under `assets/js/` and cover it
  with the matching Jest suite.
- For Python scripts, run validation through `uv run pytest`; do not add new
  bare Python command examples.
- For documentation routing changes, run
  `uv run pytest tests/docs -k routing_surfaces`.
- Do not use retired product-doc paths or earlier deployment notes as active
  navigation authority.
