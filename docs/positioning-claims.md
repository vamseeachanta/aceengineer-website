# Positioning contract and claims

The opening message is workflow setup suited to the client's needs, with engineering delivery alongside it. The home, automation and About leads share one purpose. Public code and finished work support that purpose after the lead. These are service offers and an intended direction, not measured results or a promise that a client has already become AI-native.

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| Initial | 2026-10-22 | Record the common purpose, offer statements and enforcement rules to prevent the three leads drifting apart. |

## Contract

`brand/copy.yaml` remains the single source of reusable copy. Its `positioning` section holds the purpose, primary audience, supporting claims, approved key terms, additional banned wording and lead selectors. YAML aliases supply the same purpose to `home.lead`, `firm_lede` and `ai_automation.lead`; there is no separate copy of the sentence to maintain.

The primary audience is engineering teams that need workflow setup and engineering delivery. The key terms are **agentic engineering workflow processes**, **AI-native** and **engineering work**. The requested AI-native direction describes the aim of workflow setup. It is not a guarantee of autonomy, a quantified improvement or a replacement for engineering judgment.

`scripts/lint-copy.js` preserves the existing firm-copy checks and adds a visible-lead check on each mapped page. It compares normalized text with the canonical purpose and checks each approved term. Text elsewhere on the page or in metadata cannot satisfy the lead check. It recursively checks HTML, including nested pages and redirect stubs, against the union of `forbidden_phrases` and `positioning.banned_wording`. Decoded body text, title, metadata, link destinations and structured data are checked. Exclusion from the sitemap grants no exception.

The commercial-copy suite retains its checks for prices, free offers and turnaround promises. Its added fixtures exercise the purpose, hidden or misplaced wording, split markup, nested pages and both banned lists. The metadata suite checks the titles, descriptions, Open Graph text, Twitter text, structured page descriptions and visible headings on the three target pages. Existing assertions for the superseded home title and service-only description are updated at those assertions.

To change the message, edit the contract first, update this checklist, then update only the affected source templates. Run `npm run build`, `npm run lint:copy`, `npm test -- --runInBand` and the Python suite before requesting copy review. The build renders `content/` to `dist/`; the target root HTML files are absent in this checkout, so no legacy HTML copies are introduced. Assets and navigation are unchanged.

## Sentence checklist

Each new sentence is listed below. Repeated use in the three leads is one offer, not three independent pieces of evidence. Metadata summarizes the offer and supplies no new performance claim.

| New sentence | Where used | Basis |
| --- | --- | --- |
| AceEngineer helps clients set up agentic engineering workflow processes suited to their needs, so that they become AI-native, and also does the engineering work. | Home hero, automation lead, About lead | offer statement; exact purpose supplied by the issue #89 implementation brief (2026) |
| Workflow setup is scoped to the client's engineering needs. | Supporting claim in the contract | offer statement |
| Engineering analysis and calculation work is available alongside workflow setup. | Supporting claim in the contract | offer statement |
| Public code and samples support discussion of the agreed scope. | Supporting claim in the contract; home hero before the supporting-work link | offer statement; the existing `proof.html` destination supplies the work to inspect |
| AceEngineer helps clients become AI-native with agentic engineering workflows suited to their needs, and also provides engineering analysis. | Home description and social/structured descriptions | offer statement |
| Learn how AceEngineer helps clients become AI-native with agentic engineering workflows suited to their needs, and provides engineering analysis. | About description and social descriptions | offer statement |
| Set up agentic engineering workflows to become AI-native. | Automation description and social/structured descriptions | offer statement |
| AceEngineer scopes the process to your needs and also does engineering work. | Automation description and social/structured descriptions | offer statement |

Titles, headings and link labels are fragments rather than added factual sentences:

| Surface | Approved fragment |
| --- | --- |
| Home title | AceEngineer \| Agentic engineering workflows |
| About title | About AceEngineer \| Agentic engineering workflows |
| Automation title | AI automation \| Agentic engineering workflows |
| Home h1 | Become AI-native with agentic engineering workflows |
| About h1 | Agentic engineering workflows and engineering analysis |
| Automation h1 | AI automation for agentic engineering workflows |
| Supporting-work link | See the supporting work |

No new figure, price, free offer, turnaround promise or client identity is introduced. Existing supporting figures elsewhere on the pages retain their existing evidence and are outside this copy change.

## Newsletter alignment and sources

- Issue #89 and its implementation brief (2026) supply the purpose, audience and three-page scope. The parent issue #80 supplies the original drift problem.
- The merged newsletter edition in `content/newsletter/issue-001-energy-street/index.html` (2026), introduction, refers to “engineering workflows and their automation” and “the use of AI agents”. Its `engineering-offer` section offers engineering analysis and calculation workflows with an agreed scope. These passages support the vocabulary and engineering-delivery offer; they do not establish that AI-native transformation has already been achieved. The pinned edition is preserved verbatim.
- `content/newsletter/index.html` (2026) describes engineering analysis, AI automation and agentic workflows. The new leads match those topics without deriving a performance claim from them.
- [Google Search Central: title links](https://developers.google.com/search/docs/appearance/title-link), accessed 2026-10-22, says titles have no fixed length limit; display truncation depends on device width.
- [Google Search Central: snippets](https://developers.google.com/search/docs/appearance/snippet), accessed 2026-10-22, likewise gives no fixed meta-description length limit. Fixed title and description character bounds are therefore `NOT_EVALUATED`, with null maxima in the contract. This matches the pending SEO audit in PR #170. No threshold is guessed.
- The site-review text in PR #148 is present in the base checkout. Its agreed-scope sections, supporting work, navigation and evidence links are preserved. PR #162 changes shared charts; no chart work is duplicated. The overlapping metadata additions in PRs #159, #160, #161 and #170 were read; the new metadata test is a separate block.

## Before and after

The former home and About text below is abridged at sentence boundaries. Existing catalogue figures remain in the supporting sections; no catalogue result is reinterpreted.

| Lead | Before | After |
| --- | --- | --- |
| Home | AI automation and agentic workflows are topics for discussion under a separately agreed scope. | AceEngineer helps clients set up agentic engineering workflow processes suited to their needs, so that they become AI-native, and also does the engineering work. |
| Automation | AI automation and agentic workflows for engineering and small-business administration. Contact us to discuss a separately agreed scope. | AceEngineer helps clients set up agentic engineering workflow processes suited to their needs, so that they become AI-native, and also does the engineering work. |
| About | AceEngineer is a Houston engineering firm that runs its analysis as automated, checked workflows. AI automation and agentic workflows are topics for discussion under a separately agreed scope. | AceEngineer helps clients set up agentic engineering workflow processes suited to their needs, so that they become AI-native, and also does the engineering work. |

## Worked example

**Inputs.** Use the purpose in the sentence checklist and the contract's mappings to `index.html`, `ai-automation/index.html` and `about.html`. Use the home title `AceEngineer | Agentic engineering workflows`. The title's independent hand count is: `AceEngineer` has eleven characters, the separator has three, and `Agentic engineering workflows` has seven plus one plus eleven plus one plus nine. The total is forty-three characters, a count rather than an acceptance limit. The Python test docstring records the same addition and the other title counts.

**Method.** Resolve the YAML aliases, render the source templates with the existing build, and select each mapped lead. Reject missing, repeated or hidden leads. Collapse whitespace, compare the visible lead with the exact purpose, then check all approved terms. Scan every built HTML page against both banned lists. Compare title and description metadata with the corresponding contract fields; independently check the approved heading. The fixtures put the purpose only in metadata, a hidden node or a later section to prove that those inputs fail.

**Answer.** Each source lead references the same purpose; the home title has forty-three characters. The intended rendered answer is a matching visible purpose on each target page, matching metadata and no banned wording anywhere in the built HTML. Source-level Python checks verify the aliases, template references, independent title counts and checklist coverage. Built-page verification requires the Node dependencies; a source check alone does not establish that the rendered answer passes.

## Review checklist and limits

- Confirm that the first lead answers what is offered: workflow setup suited to needs, an AI-native aim and engineering delivery.
- Treat each sentence marked “offer statement” as a proposed service, not a past result. Request registered evidence before adding a measured outcome.
- Open the supporting-work link after reading the lead. Finished work supplies context rather than replacing the purpose.
- Preserve the newsletter edition text and supporting catalogue evidence.
- Read both banned lists when reviewing new copy. A new ban applies throughout the built site, not just the three leads.
- Require maintainer copy review before merge. No deployment or live-page result is claimed.
- Later work: broader copy changes, newsletter edition rewrites and fixed metadata bounds are outside this change. Evaluate a numeric bound only when a source or explicit configuration supplies it.
- The expanded source check identifies an existing banned phrase, `consulting practice`, split across a link and following text at `content/blog/npv-analysis-deepwater-field-development.html:683`. Reading the same line on `origin/main` confirms the baseline. The check retains this failure without an exception; correcting blog copy needs a separate copy review because this change is limited to the three opening leads and their metadata.
