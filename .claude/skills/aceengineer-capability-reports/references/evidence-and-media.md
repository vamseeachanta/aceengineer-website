# Evidence depth and media rules

## Case evidence depth

Assign the highest tier whose required artifacts are published.

| Tier | Required evidence |
|---|---|
| Detailed | Inputs, model/mesh QA, time or frequency histories, derived metrics, case-specific visual, and detailed video or equivalent field sequence |
| Standard | Inputs, numerical results, derived metrics, and a case-specific snapshot; detailed video is not required |
| Simple | Reviewed summary metrics with no case-specific field visual, or only a representative/generic visual |

Show the tier on every gallery card and individual report. Allow filtering by tier.

## Media truth labels

Use one of these labels adjacent to every visual:

- `Case-specific CFD evidence` — generated from the selected case.
- `Representative CFD evidence` — generated from another named case in the same family; identify that case.
- `Explanatory schematic` — generic or generated illustration; not simulation evidence.

Never use a generic image without its truth label. Never imply that a short retained field window covers the full simulation.

## Gallery card content

Include:

- case/series identifier and human-readable label;
- evidence-depth badge;
- loading or analysis family;
- primary independent variables;
- solver and discretization summary;
- QA/reliability status;
- image and video availability;
- thumbnail with media truth label;
- links to analysis, comparison selection, and video when available.

## Video behavior

Link high-resolution video prominently rather than forcing autoplay. Include resolution, duration, retained time window, frame basis, and whether interpolation was used. Provide a poster image and captions. Respect reduced-motion preferences.

## Fallback order

1. Selected-case field image.
2. Selected-case plot montage.
3. Named representative case from the same analysis family.
4. Explicit explanatory schematic.
5. Text-only card.

Do not let media availability determine whether a valid published case appears in the browser.
