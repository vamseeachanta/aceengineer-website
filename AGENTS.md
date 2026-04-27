# Aceengineer-website Agent Contract Pointer

This repository inherits the canonical contract from:
../AGENTS.md

- Contract-Version: 1.0.0
- Generated-At: 2026-02-17T16:39:59Z

Do not hand-edit policy here. Update workspace-hub/AGENTS.md and regenerate adapters.

<!-- aceengineer-website:repo-specific:begin -->

## Routing (repo-specific)

Use the workspace-hub contract above for policy. Use this section for
aceengineer-website path routing.

| Work type | Primary path | Validation path | Notes |
|---|---|---|---|
| Root HTML pages | `content/*.html`, rendered to root `*.html` by `npm run build` | `tests/js/build.test.js` and local preview from `dist/` | Edit `content/` first for generated pages. Root HTML files are checked-in deploy artifacts for this repo. |
| Blog pages | `content/blog/` and `blog/` | `tests/js/demo-links.test.js` where links/sitemap are affected | Use live site copy and approved issue scope as canonical source. |
| Case studies | `content/case-studies/` and `case-studies/` | targeted build/link checks | Keep client-facing claims grounded in public evidence. |
| Calculators | `content/calculators/`, `calculators/`, `assets/js/` | `tests/js/*calculator*.test.js` | Calculator logic belongs in shared JS assets, not inline page-only copies. |
| Scripts and data refresh | `scripts/`, `config/`, `assets/data/` | `tests/python/` with `uv run pytest` | Python commands use `uv run`; do not use bare `python3` for new validation. |
| Repo docs and routing | `docs/README.md`, `docs/maps/aceengineer-website-operator-map.md` | `uv run pytest tests/docs -k routing_surfaces` | These are the trusted routing surfaces for issue work. |

Canonical docs entry point: `docs/README.md`.

Operator map: `docs/maps/aceengineer-website-operator-map.md`.

## How to verify

Run the routing-surface guard after changing repo navigation or deployment docs:

```bash
uv run pytest tests/docs -k routing_surfaces
```

<!-- aceengineer-website:repo-specific:end -->
