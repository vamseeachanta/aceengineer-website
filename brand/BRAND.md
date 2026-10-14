# AceEngineer Brand Contract

## Locked hierarchy

- Consumer-facing/site/social/marketing brand: **AceEngineer**.
- SEO/accessibility long form: **Analytical & Computational Engineering**.
- Legal/contractual entity when a legal entity is required: **Achanta AceEngineer Inc.**.
- Retired placeholder/historical acronym: **A&CE**. Do not use it for new visible brand surfaces, page titles, social metadata, schema alternate names, forms, CTAs, or navigation labels.

## Visual DNA decision

The wordmark `assets/img/logo.svg` is navy `#0B3D91` and teal `#2BB2A6`. `assets/img/logo-inverse.svg` is white and teal for dark backgrounds. Site colour and type tokens are the custom properties in `assets/css/theme.css`: `--navy`, `--navy-2`, `--teal`, `--teal-lift`, `--teal-deep`, `--blue`, `--ink`, `--muted`, `--tint`, `--hairline`, `--underline`, `--bg`, `--font-body`, `--font-ui` and `--font-mono`.

## Asset contract

- Canonical source logo: `assets/img/logo.svg`.
- Raster/schema logo: `assets/img/logo.png`.
- PNG generation is deterministic for this baseline and committed as a static web asset.

## Surface contract

Canonical source pages live under `content/**` and build into `dist/**` via `npm run build`. Checked-in HTML outside `content/**` and `dist/**` is legacy/non-authoritative unless a test or workflow explicitly reads it; such tests must either target built output or be updated alongside brand changes.
