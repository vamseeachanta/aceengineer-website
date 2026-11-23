# Capability registry (`config/capabilities.yaml`)

The registry is the **single source of truth** for the HF-backed capability pages on
aceengineer.com. The website is a *function of this file*: `build.js` reads it at build
time, pulls each dataset from the Hugging Face **datasets-server** `/rows` API, and
renders one indexable page per capability under `/capabilities/`.

> **The going-forward contract.** Adding a new algorithm to the website is two steps:
> 1. **Publish** its results as a Hugging Face dataset (use the `hf-dataset-publishing`
>    skill in `workspace-hub`).
> 2. **Register** it — add one entry to `config/capabilities.yaml`.
>
> CI validates every entry (see [C7](https://github.com/vamseeachanta/aceengineer-website/issues/54)).
> No per-algorithm website code is required.
>
> Epic: [workspace-hub#3485](https://github.com/vamseeachanta/workspace-hub/issues/3485).

## Why Hugging Face + build-time

- The datasets-server `/rows` and `/splits` endpoints are **public, CORS-enabled, and
  need no auth** — the static site pulls data with no backend and no secrets.
- Fetching at **build time** bakes SEO-indexable static pages, keeps the site fast, and
  makes it **resilient to HF downtime** (a committed last-good snapshot survives an
  outage — see [C2](https://github.com/vamseeachanta/aceengineer-website/issues/50)).
- Freshness comes from **rebuild-on-publish**: publishing a dataset pings a Vercel Deploy
  Hook ([C5](https://github.com/vamseeachanta/workspace-hub/issues/3488)). An optional
  client-side "refresh to latest" is progressive enhancement only
  ([C6](https://github.com/vamseeachanta/aceengineer-website/issues/53)).

## Schema

```yaml
version: 1
capabilities:
  - id: <kebab-case>          # required · stable URL slug → /capabilities/<id>
    title: <string>           # required · unique, SEO-friendly page title
    domain: worldenergy|digitalmodel   # required
    summary: <string>         # required · one sentence
    hf_dataset: <owner/name>  # required · Hugging Face dataset id
    provenance_url: <url>     # required · source repo/report
    status: live|pending|withheld      # required
    primary_config: <config>  # required · table whose headline stat is on the card
    tables:                   # required · one or more
      - config: <config>              # required · HF dataset config (table) name
        label: <string>               # required · section label
        viz: table|bar|line|map       # required
        highlight_columns: [<col>...] # required · must exist in the table
    withheld_columns: [<col>...]      # optional · never surfaced; CI blocks them
    data_limits: <string>     # required · honest coverage/limitations disclosure
```

### `status` semantics

| status     | rendered? | behavior |
|------------|-----------|----------|
| `live`     | yes       | full page with real HF data |
| `pending`  | placeholder | visible "— pending" card linking to `provenance_url` (never a silent gap) |
| `withheld` | no        | entry kept for the record but not surfaced (e.g. data-correctness hold) |

## Validation

`scripts/validate-capabilities.js` performs **offline structural** validation
(required fields, enum values, unique ids, `highlight_columns` not in
`withheld_columns`). Run it locally:

```bash
npm run validate:capabilities
```

**Online** resolution — that every `hf_dataset` and `config` actually resolves via the
datasets-server `/splits` API, and that no `withheld_columns` leak into rendered output —
is enforced in CI by [C7](https://github.com/vamseeachanta/aceengineer-website/issues/54).

## Data refresh (C2)

Data flows through a **snapshot layer** so builds are deterministic and outage-proof:

- **`npm run refresh:hf`** — live-fetches every non-withheld capability's tables from the
  datasets-server `/rows` API and writes committed snapshots under `data/hf-cache/`
  (`<owner>__<name>__<config>.json`, byte-stable, no timestamps). Run it locally or on a
  schedule / from the C5 deploy hook, then commit the changed JSON. Exits non-zero if any
  table fails, and leaves existing snapshots untouched on failure.
- **`npm run build`** — hydrates each table from those snapshots **offline by default**
  (deterministic, no network). Set **`HF_FETCH=1`** to fetch live at build time (Vercel
  production does this via the deploy hook); the snapshot remains the fallback, so a build
  never fails because Hugging Face is slow or down.

Only `DEFAULT_MAX_ROWS` (100) rows are materialized per table for display; truncation is
surfaced and the full dataset stays linkable on Hugging Face — never a silent cap.

## Adding a capability (checklist)

1. Publish the dataset to `aceengineer/<repo>-<projection>` (public) via the skill.
2. **Sanity-check the numbers** before publishing — "faithful to source" ≠ "correct"
   (lesson from worldenergydata#971).
3. Add an entry here with accurate `highlight_columns` (copy real column names from the
   dataset's `/rows` response).
4. `npm run validate:capabilities` → green.
5. Open the PR; CI resolves the dataset and blocks withheld columns.
