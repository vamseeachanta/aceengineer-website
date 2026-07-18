# AceEngineer.com Deployment Guide

This is the current deployment guide for the static AceEngineer website at
https://aceengineer.com.

## Current Deployment Model

| Item | Current value |
|---|---|
| Hosting | Vercel |
| Production URL | https://aceengineer.com |
| Source branch | `main` |
| Build command | `npm run build` |
| Build output | `dist/` |
| Vercel configuration | `vercel.json` |
| Domain file | `CNAME` |

Vercel builds the site from committed source files and publishes `dist/`.
The Vercel project configuration is captured in `vercel.json`, and the
custom domain value is captured in `CNAME`.

## Change Flow

1. Edit source content under `content/`, shared assets under `assets/`, or
   repo documentation under `docs/`.
2. Run targeted tests for the changed surface.
3. Run `npm run build` when source page content or build behavior changes.
4. Commit to `main` and push to `origin`.
5. Verify the Vercel deployment and spot-check https://aceengineer.com.

## Local Verification

Use these commands from the repository root:

```bash
npm test -- --runInBand
npm run build
```

For documentation-routing changes, also run:

```bash
uv run pytest tests/docs -k routing_surfaces
```

## Sloshing report data publication

The browser never connects to the private Hugging Face dataset. Refresh the
sanitized, content-addressed snapshot only from a controlled local environment:

```bash
HF_TOKEN=... npm run refresh:sloshing
SLOSHING_REVIEW_ROOT=/path/to/review_output npm run publish:sloshing-enrichment
npm test -- --runInBand
npm run build
```

Review the immutable directory under `assets/data/sloshing/`, its manifest, and
the release-pointer diff before committing. Preview both `/reports/` routes with
network access disabled, verify print and PNG/SVG export, then promote normally.
Rollback by reverting the release pointer and report commit, or by promoting the
prior Vercel deployment; never edit an existing content-addressed release.

Representative CFD media must be rendered from retained OpenFOAM fields. Each
published video records its true field-window start/end, frame interval and a
`temporal_interpolation: none` declaration. Do not describe a final-window
preview as a full-cycle field animation. MP4/PNG bytes, pressure envelopes and
derived metrics are pinned to the same immutable HF revision and covered by the
public release digest.

## Domain Notes

- `CNAME` contains the production domain value.
- DNS is managed outside this repository.
- Vercel manages HTTPS for the production domain.
- `docs/README.md` is the docs entry point for current routing guidance.

## Related Docs

- `docs/README.md`
- `docs/WEBSITE_ARCHITECTURE.md`
- `docs/maps/aceengineer-website-operator-map.md`
- `VERCEL_DEPLOY.md`
