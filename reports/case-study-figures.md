# Case-study figures

## Summary

Visible source-page quantities, grouped by evidence status. NOT_EVALUATED
means the evidence has not been established; it does not assert a result is false.
See the [extraction rules and worked example](../docs/case-study-figures.md).

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| 1 | 2026-10-22 | Add the occurrence register to expose evidence gaps. |

Generated with `uv run python scripts/case_study_figures.py report`.

| Page | SOURCED | DERIVED | ILLUSTRATIVE | NOT_EVALUATED | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| bsee-field-economics.html | 13 | 1 | 3 | 0 | 17 |
| index.html | 0 | 0 | 0 | 0 | 0 |
| marine-safety-correlation.html | 4 | 1 | 0 | 0 | 5 |
| multi-code-wall-thickness-comparison.html | 0 | 0 | 0 | 12 | 12 |
| offshore-platform-fatigue-optimization.html | 0 | 0 | 0 | 0 | 0 |
| orcaflex-riser-sensitivity-automation.html | 0 | 0 | 0 | 2 | 2 |
| pipeline-on-bottom-stability-assessment.html | 0 | 0 | 0 | 4 | 4 |
| subsea-fea-automation.html | 0 | 0 | 0 | 0 | 0 |
| wind-turbine-foundation-analysis.html | 0 | 0 | 0 | 0 | 0 |

## Figures and evidence

Occurrence IDs distinguish repeated text. Source locators refer to repository
files, symbols or the pinned citation already linked from the page.

### bsee-field-economics.html

| Occurrence | Figure | Unit | Status | Source location |
| --- | --- | --- | --- | --- |
| bsee-field-economics.html:b8:n24 | 180-month | month | SOURCED | scripts/generate_field_economics_data.py#create_production_profile |
| bsee-field-economics.html:b8:n49 | 12-month | month | SOURCED | scripts/generate_field_economics_data.py#create_production_profile |
| bsee-field-economics.html:b8:n69 | 24-month | month | SOURCED | scripts/generate_field_economics_data.py#create_production_profile |
| bsee-field-economics.html:b8:n89 | 100,000 barrels per day | barrels per day | SOURCED | scripts/generate_field_economics_data.py#create_production_profile |
| bsee-field-economics.html:b8:n169 | 8% | % | SOURCED | scripts/generate_field_economics_data.py#create_production_profile |
| bsee-field-economics.html:b8:n208 | 30.4 days per month | days per month | SOURCED | scripts/generate_field_economics_data.py#create_production_profile |
| bsee-field-economics.html:b9:n32 | $75/bbl | $/bbl | SOURCED | scripts/generate_field_economics_data.py#main.params; calculate_economics (capital allocation) |
| bsee-field-economics.html:b9:n51 | $18/bbl | $/bbl | SOURCED | scripts/generate_field_economics_data.py#main.params; calculate_economics (capital allocation) |
| bsee-field-economics.html:b9:n75 | $3.5 billion | $ billion | SOURCED | scripts/generate_field_economics_data.py#main.params; calculate_economics (capital allocation) |
| bsee-field-economics.html:b9:n132 | 24 months | months | SOURCED | scripts/generate_field_economics_data.py#main.params; calculate_economics (capital allocation) |
| bsee-field-economics.html:b9:n143 | 18.75% | % | SOURCED | scripts/generate_field_economics_data.py#main.params; calculate_economics (capital allocation) |
| bsee-field-economics.html:b9:n164 | 10% | % | SOURCED | scripts/generate_field_economics_data.py#main.params; calculate_economics (capital allocation) |
| bsee-field-economics.html:b12:n20 | 6,078.1 | million USD | ILLUSTRATIVE | assets/data/field_economics_metrics.json#/npv_mm (rounded to one decimal place) |
| bsee-field-economics.html:b13:n27 | 373.5 | million bbl | ILLUSTRATIVE | assets/data/field_economics_metrics.json#/total_production_mmbbls (rounded to one decimal place) |
| bsee-field-economics.html:b14:n36 | 32 | month | ILLUSTRATIVE | assets/data/field_economics_metrics.json#/payback_months |
| bsee-field-economics.html:b14:n84 | 32 | month | SOURCED | assets/data/field_economics_metrics.json#/payback_months |
| bsee-field-economics.html:b14:n94 | 33rd | month | DERIVED | assets/data/field_economics_metrics.json#/payback_months (zero-based index + 1) |

### index.html

No numeric quantities detected under the documented rules.

### marine-safety-correlation.html

| Occurrence | Figure | Unit | Status | Source location |
| --- | --- | --- | --- | --- |
| marine-safety-correlation.html:b6:n48 | 47,385 | count | SOURCED | content/case-studies/marine-safety-correlation.html:31 (pinned import-record link); agency import counts |
| marine-safety-correlation.html:b6:n122 | 5,876 | count | SOURCED | content/case-studies/marine-safety-correlation.html:31 (pinned import-record link); agency import counts |
| marine-safety-correlation.html:b6:n221 | 53,261 | count | DERIVED | content/case-studies/marine-safety-correlation.html:31 (pinned import-record link); agency import counts; sum of the two cited agency counts |
| marine-safety-correlation.html:b9:n13 | 47,385 | count | SOURCED | content/case-studies/marine-safety-correlation.html:31 (pinned import-record link); agency import counts |
| marine-safety-correlation.html:b10:n10 | 5,876 | count | SOURCED | content/case-studies/marine-safety-correlation.html:31 (pinned import-record link); agency import counts |

### multi-code-wall-thickness-comparison.html

| Occurrence | Figure | Unit | Status | Source location |
| --- | --- | --- | --- | --- |
| multi-code-wall-thickness-comparison.html:b10:n78 | 5 | count | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n102 | 8 | inch | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n105 | 10 | inch | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n109 | 12 | inch | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n113 | 14 | inch | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n121 | 16 inch | inch | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n131 | 3 | count | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n190 | 5,000 | psi | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n199 | 10,000 psi | psi | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n233 | 500 | m | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n240 | 2,500 m | m | NOT_EVALUATED | Not established |
| multi-code-wall-thickness-comparison.html:b10:n292 | 3 | count | NOT_EVALUATED | Not established |

### offshore-platform-fatigue-optimization.html

No numeric quantities detected under the documented rules.

### orcaflex-riser-sensitivity-automation.html

| Occurrence | Figure | Unit | Status | Source location |
| --- | --- | --- | --- | --- |
| orcaflex-riser-sensitivity-automation.html:b10:n81 | 50 | count | NOT_EVALUATED | Not established |
| orcaflex-riser-sensitivity-automation.html:b18:n507 | 8 | count | NOT_EVALUATED | Not established |

### pipeline-on-bottom-stability-assessment.html

| Occurrence | Figure | Unit | Status | Source location |
| --- | --- | --- | --- | --- |
| pipeline-on-bottom-stability-assessment.html:b17:n61 | 0.8 | ratio | NOT_EVALUATED | Not established |
| pipeline-on-bottom-stability-assessment.html:b17:n101 | 0.8 | ratio | NOT_EVALUATED | Not established |
| pipeline-on-bottom-stability-assessment.html:b17:n105 | 1.0 | ratio | NOT_EVALUATED | Not established |
| pipeline-on-bottom-stability-assessment.html:b17:n147 | 1.0 | ratio | NOT_EVALUATED | Not established |

### subsea-fea-automation.html

No numeric quantities detected under the documented rules.

### wind-turbine-foundation-analysis.html

No numeric quantities detected under the documented rules.

## Follow-up

Source or remove NOT_EVALUATED figures before treating them as substantiated
claims. The report does not validate engineering methods, source accuracy or
current database counts. Page text has not been changed.
