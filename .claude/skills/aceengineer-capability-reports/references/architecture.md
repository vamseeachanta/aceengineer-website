# Capability report architecture

## Canonical hierarchy

```text
Capability landing
├── Study report
├── Validation fixture
├── Results browser
│   └── Case/series deep links
├── Individual analysis
├── Comparison
└── Data and provenance
```

Use stable paths beneath `reports/<capability>/` for new systems. Redirect or retain compatibility links when migrating existing URLs.

## Surface responsibilities

### Capability landing

Explain the engineering question, dataset coverage, available report types, evidence maturity, and recommended starting points. Offer presets for important cases and comparisons.

### Study report

Synthesize all published cases into a high-level engineering narrative. Include analysis basis, campaign matrix, key curves, validation result, major findings, limitations, and next work. Link every important conclusion to the cases that support it.

### Validation fixture

Provide one durable URL used consistently by the capability landing, study, browser, analysis, comparison, standards, and dataset documentation. State the benchmark, acceptance measure, numerical convergence evidence, result, and qualification.

### Results browser

Show every published case or series. Provide filters, visual cards, evidence-depth badges, QA status, media availability, and stable case links. Make meaningful empty states and reset behavior.

### Individual analysis

Show the selected input basis, assumptions, mesh/model configuration, key metrics, histories, envelopes, visual evidence, QA disposition, limitations, and provenance. Selection must survive refresh and be shareable.

### Comparison

Compare two published items with explicit compatibility checks. State interpolation, overlap, normalization, exclusion, and percentage-delta rules. Distinguish solver comparison, sensitivity study, and cross-asset comparison.

### Data and provenance

Expose dataset name, resolved revision, license, tables, filters, row counts, transform version, source class, and publication boundary.

## Navigation contract

Use the same labels and order throughout the capability. Highlight the current surface. Preserve query parameters only when meaningful to the destination.

Use these reviewed systems as patterns:

- Diffraction: landing + single-series analysis + arbitrary two-series comparison.
- Sloshing: pinned release + normalized study summary + case histories + CFD QA and media.

Combine their strengths; do not mechanically copy their current markup.
