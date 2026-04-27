# AceEngineer Website Architecture

## Overview
The site is a static marketing and technical showcase deployed on Vercel. It combines root-level HTML pages, blog/case-study content, calculators, and generated data assets.

## Main Surfaces
- root HTML pages (`index.html`, `about.html`, `engineering.html`, `energy.html`, etc.)
- `blog/` and `case-studies/` content pages
- `calculators/` interactive pages backed by `assets/js/`
- `assets/data/` generated metrics and sample datasets
- `scripts/` for content sync, competitor analysis, and data generation

Canonical routing docs:
- `docs/README.md`
- `docs/maps/aceengineer-website-operator-map.md`

## Deployment Model
- branch: `main`
- hosting: Vercel
- build: static site / minimal build tooling
- verification: local preview + targeted tests + live spot-checks

## Testing Surface
- `tests/python/` for Python-side script validation
- `tests/js/` for JavaScript-oriented validation where present

## Recommended Change Flow
1. inspect affected pages/scripts/data
2. run targeted tests
3. preview locally if rendering/assets changed
4. push to `main`
5. verify live deployment and SEO-sensitive artifacts
