# AceEngineer Brand Contract

## Locked hierarchy

- Consumer-facing/site/social/marketing brand: **AceEngineer**.
- SEO/accessibility long form: **Analytical & Computational Engineering**.
- Legal/contractual entity when a legal entity is required: **Achanta AceEngineer Inc.**.
- Retired placeholder/historical acronym: **A&CE**. Do not use it for new visible brand surfaces, page titles, social metadata, schema alternate names, forms, CTAs, or navigation labels.

## Visual DNA decision

Issue #2440 locked Option B: aceengineer.com deliberately differentiates from digitalmodel. The AceEngineer logo therefore uses the site's existing plum/copper family and does not inherit digitalmodel's navy/teal asset identity.

## Asset contract

- Canonical source logo: `assets/img/logo.svg`.
- Raster/schema logo: `assets/img/logo.png`.
- PNG generation is deterministic for this baseline and committed as a static web asset.

## Surface contract

Canonical source pages live under `content/**` and build into `dist/**` via `npm run build`. Checked-in HTML outside `content/**` and `dist/**` is legacy/non-authoritative unless a test or workflow explicitly reads it; such tests must either target built output or be updated alongside brand changes.
