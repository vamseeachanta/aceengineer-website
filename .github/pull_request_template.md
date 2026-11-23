<!-- Thanks for the change! Keep this short — link the issue and check the boxes that apply. -->

## What & why

<!-- One or two sentences. Link the issue: Closes #___ -->

## Checklist

- [ ] Tests pass locally (`npm test`) and the build is clean (`npm run build`).
- [ ] Copy follows the house rules (`npm run lint:copy`).

### New algorithm / capability? (the going-forward contract — C7)

If this PR surfaces a new algorithm or dataset on the site, **both** must be true:

- [ ] The result is a **published Hugging Face dataset** (public, `/splits`-resolvable).
- [ ] A matching entry was added to **`config/capabilities.yaml`** (scaffold it with
      `node scripts/scaffold-capability-entry.js <hf_dataset>`), and
      `npm run validate:registry` passes — the dataset + every config/column resolves,
      and no `withheld` column is surfaced.

<!-- Not adding a capability? Leave the three boxes above unchecked — CI still runs the
     registry gate against any capabilities.yaml change. -->
