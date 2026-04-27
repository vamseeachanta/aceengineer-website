# AceEngineer Website Docs

This directory is the canonical documentation entry point for
aceengineer-website issue work.

## Trusted Routing Surfaces

| Surface | Purpose |
|---|---|
| `../AGENTS.md` | Worker entry point plus repo-specific routing hints. |
| `../README.md` | Human overview, deployment summary, and top-level navigation. |
| `README.md` | This docs entry point. |
| `maps/aceengineer-website-operator-map.md` | Canonical operator map for pages, content, calculators, scripts, and tests. |
| `WEBSITE_ARCHITECTURE.md` | Static-site architecture and change-flow summary. |
| `DEPLOYMENT_GUIDE.md` | Current Vercel deployment guide. |

## Routing Shortcuts

| Work type | Start here |
|---|---|
| Root pages | `../content/*.html` and `../*.html` |
| Blog posts | `../content/blog/` and `../blog/` |
| Case studies | `../content/case-studies/` and `../case-studies/` |
| Calculators | `../content/calculators/`, `../calculators/`, and `../assets/js/` |
| Scripts and generated data | `../scripts/`, `../config/`, and `../assets/data/` |
| Tests | `../tests/python/` and `../tests/js/` |

For full routing detail, use `maps/aceengineer-website-operator-map.md`.

## Retired Navigation

Historical product-doc and earlier deployment references are not active
routing authority. Current work should route through `AGENTS.md`, `README.md`,
this file, and the operator map.

## Validation

Run the routing-surface guard after changing trusted docs or navigation:

```bash
uv run pytest tests/docs -k routing_surfaces
```
