---
name: aceengineer-capability-reports
description: Build and refine consistent, data-backed engineering capability report systems in aceengineer-website. Use for capability landing pages, study narratives, validation fixtures, all-case visual galleries, individual analysis reports, comparison reports, Hugging Face-backed results, stable deep links, evidence/media classification, or navigation connecting these surfaces.
---

# AceEngineer Capability Reports

Create a connected engineering evidence system, not an isolated dashboard. Preserve the distinction between calculated evidence, interpretation, representative media, and explanatory graphics.

## Start with repository context

1. Read the repository `AGENTS.md`, routing documentation, and current capability files.
2. Identify the tracking issue and approved scope before implementation.
3. Inspect adjacent report systems before inventing new structure. Treat `content/reports/diffraction/` and `content/reports/sloshing-*` as evolving reference implementations, not immutable templates.
4. Inventory the dataset schema and every published series or case before designing selectors.

## Choose the report surfaces

Read [architecture.md](references/architecture.md) before creating or restructuring report URLs.

Provide the smallest useful subset of:

- capability landing page;
- engineering study report;
- stable validation fixture;
- all-results visual browser;
- single-case or single-series analysis;
- two-case or two-series comparison;
- data and provenance view.

Keep the same local navigation order on every surface: `Summary · Study · Validation · Browse Results · Analysis · Compare · Data` where those pages exist.

## Build an engineering argument

Structure study content as:

1. question or decision gate;
2. method and analysis basis;
3. quantified evidence;
4. engineering verdict;
5. caveats and reliability exceptions;
6. practical consequence and next decision-grade work.

Do not substitute KPI cards for analysis. Pair important plots and tables with an explicit interpretation that states what the evidence supports and what it does not.

## Classify results and media

Read [evidence-and-media.md](references/evidence-and-media.md) before building galleries, thumbnails, animations, or videos.

Classify every case as `detailed`, `standard`, or `simple` from published artifacts rather than subjective importance. Prefer case-specific media. Clearly label representative and generic media so neither can be mistaken for evidence from the selected run.

Never generate a plausible CFD result image and present it as simulation output. A generated or generic illustration may explain geometry or method only.

## Bind reports to data

Read [data-and-comparison.md](references/data-and-comparison.md) when adding dataset fetches, selectors, derived statistics, or comparisons.

- Populate selectors from the published data catalog.
- Keep selections bookmarkable in URL query parameters.
- Show dataset identity, revision, filters, row counts, and reliability status.
- Keep reliability-flagged rows visible where useful, but exclude them from automatic statistics unless the report explicitly justifies inclusion.
- Prefer immutable published releases for auditability. If using a live dataset API, expose the resolved revision and fetch time.
- Calculate summaries deterministically from the displayed release; do not bake claims that can drift away from the data.

## Implement safely

- Edit source pages under `content/`; do not hand-edit generated `dist/` pages.
- Reuse shared CSS and JavaScript when two capabilities need the same behavior.
- Preserve source-neutral publication boundaries and safe relative media paths.
- Provide accessible tables for plotted values and meaningful alt text for visuals.
- Make print output useful without interactive controls.
- Keep comparison warnings prominent for mismatched geometry, solver, damping, loading, mesh, or frequency bands.

## Validate

1. Run targeted report tests while iterating.
2. Run the full JavaScript test suite and site build.
3. Run routing and registry validation when URLs or capability navigation change.
4. Check every report, deep link, dataset file, image, and video over the local HTTP server.
5. Verify mobile, print, keyboard use, empty states, and invalid query parameters.
6. Confirm that every reported number is traceable to the selected dataset revision.

Report validation failures accurately. Do not hide known numerical or data-quality exceptions behind an overall passing status.
