# Data binding and comparison rules

## Dataset contract

Show the following wherever results are rendered:

- dataset repository and configuration;
- immutable revision or resolved live revision;
- tables used;
- selected filter clause or case IDs;
- rows fetched and rows excluded;
- reliability or QA field definitions;
- license and publication boundary;
- transform/schema version when applicable.

Populate case catalogs and selector options from data, not hard-coded option lists. Preset links may be hard-coded only when tests verify that the referenced items remain published.

## URL state

Use explicit, readable query keys. Normalize invalid values to a documented default. Keep URL state deterministic and bounded. Examples:

```text
analysis.html?solver=OrcaWave&vessel=asset_1&damping=5
comparison.html?caseA=forced-medium-t22&caseB=forced-fine-t24
browse.html?depth=detailed&loading=forced_roll&video=yes
```

## Comparison compatibility

Check and visibly flag differences in:

- asset or geometry;
- solver and version;
- loading/excitation;
- damping or control parameters;
- mesh and timestep;
- units, conventions, and normalization;
- sampled domain and overlap;
- QA or reliability status.

Describe the comparison type based on what differs. Do not call a cross-geometry comparison solver validation.

## Statistics

- Compute on the common valid domain.
- State interpolation and alignment rules.
- Exclude flagged data from automatic statistics by default while optionally plotting it.
- Suppress percentage deltas near zero using a stated threshold.
- Compare each series' peak within the shared domain unless a different rule is justified.
- Separate absolute and normalized quantities.

## Validation linkage

Every analysis and comparison report must link to the capability's stable validation fixture. The fixture must link back to the study and results browser. Validation status must not be inferred solely from a case's completion status.
