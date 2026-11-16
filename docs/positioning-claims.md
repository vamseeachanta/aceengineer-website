# Positioning contract and claims

The opening message is engineering analysis first, with agentic engineering workflow setup offered alongside it. This order follows the capabilities-first decision recorded on issue #89 on 2026-07-28. The home, automation and About leads share one purpose. Public code and finished work support that purpose after the lead. These are service offers and an intended direction, not measured results or a statement that any client has become AI-native.

## Revision history

| Revision | Date | Change and reason |
| --- | --- | --- |
| Initial | 2026-10-22 | Record the common purpose, offer statements and enforcement rules to prevent the three leads drifting apart. |
| 1 | 2026-11-16 | Review findings: the purpose put workflow setup first, against the capabilities-first decision recorded on issue #89 (2026-07-28), and cited an issue #89 "implementation brief" that the issue does not contain. The purpose now leads with engineering analysis and is phrased as an offer; the citation names the recorded decision; the home title, heading and description return to the wording specified with the home page; the blog phrase that the wider banned-phrase scan exposed is corrected for copy review. |

## Contract

`brand/copy.yaml` remains the single source of reusable copy. Its `positioning` section holds the purpose, primary audience, supporting claims, approved key terms, additional banned wording and lead selectors. YAML aliases supply the same purpose to `home.lead`, `firm_lede` and `ai_automation.lead`; there is no separate copy of the sentence to maintain.

The primary audience is engineering teams that need engineering analysis, with workflow setup alongside it. The key terms, in the order the purpose states them, are **engineering analysis**, **agentic engineering workflows** and **AI-native**. The AI-native wording describes the aim of workflow setup. It is not a guarantee of autonomy, a quantified improvement, a delivered outcome or a replacement for engineering judgment.

`scripts/lint-copy.js` preserves the existing firm-copy checks and adds a visible-lead check on each mapped page. It compares normalized text with the canonical purpose and checks each approved term. Text elsewhere on the page or in metadata cannot satisfy the lead check. It recursively checks HTML, including nested pages and redirect stubs, against the union of `forbidden_phrases` and `positioning.banned_wording`. Decoded body text, title, metadata, link destinations and structured data are checked. Exclusion from the sitemap grants no exception.

The commercial-copy suite retains its checks for prices, free offers and turnaround promises. Its added fixtures exercise the purpose, its capabilities-first term order, hidden or misplaced wording, split markup, nested pages and both banned lists. The metadata suite checks the titles, descriptions, Open Graph text, Twitter text, structured page descriptions and visible headings on the About and automation pages. The home title, heading and description are unchanged from the home-page specification, so their existing assertions are unchanged.

To change the message, edit the contract first, update this checklist, then update only the affected source templates. Run `npm run build`, `npm run lint:copy`, `npm test -- --runInBand` and the Python suite before requesting copy review. The build renders `content/` to `dist/`; the target root HTML files are absent in this checkout, so no legacy HTML copies are introduced. Assets and navigation are unchanged.

## Sentence checklist

Each new sentence is listed below. Repeated use in the three leads is one offer, not three independent pieces of evidence. Metadata summarizes the offer and supplies no new performance claim.

| New sentence | Where used | Basis |
| --- | --- | --- |
| AceEngineer provides engineering analysis and calculation work, and sets up agentic engineering workflows suited to the needs of each client, aimed at helping engineering teams become AI-native. | Home hero, automation lead, About lead | offer statement; order from the issue #89 capabilities-first decision (2026-07-28); wording is new copy awaiting maintainer copy review |
| Engineering analysis and calculation work is available, with workflow setup alongside it. | Supporting claim in the contract | offer statement |
| Workflow setup is scoped to the client's engineering needs. | Supporting claim in the contract | offer statement |
| Public code and samples support discussion of the agreed scope. | Supporting claim in the contract; home hero before the supporting-work link | offer statement; the existing `proof.html` destination supplies the work to inspect |
| Learn how AceEngineer provides engineering analysis and sets up agentic engineering workflows, aimed at helping engineering teams become AI-native. | About description and social descriptions | offer statement |
| AceEngineer sets up agentic engineering workflows suited to your needs, aimed at helping engineering teams become AI-native, alongside its engineering analysis. | Automation description and social/structured descriptions | offer statement |

Titles, headings and link labels are fragments rather than added factual sentences. The home title, heading and description are not changed by this contract.

| Surface | Approved fragment |
| --- | --- |
| About title | About AceEngineer \| Engineering analysis and agentic workflows |
| Automation title | AI automation \| Agentic engineering workflows |
| About h1 | Engineering analysis and agentic engineering workflows |
| Automation h1 | AI automation for agentic engineering workflows |
| Supporting-work link | See the supporting work |

No new figure, price, free offer, turnaround promise or client identity is introduced. Existing supporting figures elsewhere on the pages retain their existing evidence and are outside this copy change.

## Newsletter alignment and sources

- Issue #89, owner decisions of 2026-07-28: the primary story is capabilities-first, and "AI" is permitted in visible copy with "AI-native" kept in `firm_lede`. These set the order of the purpose. The workflow-setup wording itself is recorded in no issue; it is new copy and needs maintainer copy review before merge. The parent issue #80 supplies the original drift problem.
- The merged newsletter edition in `content/newsletter/issue-001-energy-street/index.html` (2026, as revised in #179 and #181), `engineering-offer` section, says that AceEngineer “provides engineering analysis and calculation workflows” and plans later issues on “engineering workflows, their automation and the use of AI assistants for everyday engineering”. These passages support the vocabulary and engineering-delivery offer; they do not establish that AI-native transformation has already been achieved. The edition is not changed here.
- `content/newsletter/index.html` (2026) describes engineering analysis, AI automation and agentic workflows. The new leads match those topics without deriving a performance claim from them.
- [Google Search Central: title links](https://developers.google.com/search/docs/appearance/title-link), accessed 2026-10-22, says titles have no fixed length limit; display truncation depends on device width.
- [Google Search Central: snippets](https://developers.google.com/search/docs/appearance/snippet), accessed 2026-10-22, likewise gives no fixed meta-description length limit. Fixed title and description character bounds are therefore `NOT_EVALUATED`, with null maxima in the contract. This matches the pending SEO audit in PR #170. No threshold is guessed.
- The site-review text in PR #148 is present in the base checkout. Its agreed-scope sections, supporting work, navigation and evidence links are preserved. PR #162 changes shared charts; no chart work is duplicated. The overlapping metadata additions in PRs #159, #160, #161 and #170 were read; the new metadata test is a separate block.

## Before and after

The former home and About text below is abridged at sentence boundaries. Existing catalogue figures remain in the supporting sections; no catalogue result is reinterpreted.

| Lead | Before | After |
| --- | --- | --- |
| Home | AI automation and agentic workflows are topics for discussion under a separately agreed scope. | AceEngineer provides engineering analysis and calculation work, and sets up agentic engineering workflows suited to the needs of each client, aimed at helping engineering teams become AI-native. |
| Automation | AI automation and agentic workflows for engineering and small-business administration. Contact us to discuss a separately agreed scope. | AceEngineer provides engineering analysis and calculation work, and sets up agentic engineering workflows suited to the needs of each client, aimed at helping engineering teams become AI-native. |
| About | AceEngineer is a Houston engineering firm that runs its analysis as automated, checked workflows. AI automation and agentic workflows are topics for discussion under a separately agreed scope. | AceEngineer provides engineering analysis and calculation work, and sets up agentic engineering workflows suited to the needs of each client, aimed at helping engineering teams become AI-native. |

## Worked example

**Inputs.** Use the purpose in the sentence checklist and the contract's mappings to `index.html`, `ai-automation/index.html` and `about.html`. Use the About title `About AceEngineer | Engineering analysis and agentic workflows`. The title's independent hand count is: `About` has five characters, the space one, `AceEngineer` eleven and the separator three, so the prefix has twenty; `Engineering analysis and agentic workflows` has eleven plus one plus eight plus one plus three plus one plus seven plus one plus nine, which is forty-two. The total is sixty-two characters, a count rather than an acceptance limit. The Python test docstring records the same addition and the automation title count.

**Method.** Resolve the YAML aliases, render the source templates with the existing build, and select each mapped lead. Reject missing, repeated or hidden leads. Collapse whitespace, compare the visible lead with the exact purpose, then check all approved terms and that they appear in contract order. Scan every built HTML page against both banned lists. Compare title and description metadata with the corresponding contract fields; independently check the approved heading. The fixtures put the purpose only in metadata, a hidden node or a later section to prove that those inputs fail.

**Answer.** Each source lead references the same purpose, which states engineering analysis before workflow setup; the About title has sixty-two characters. The rendered answer is a matching visible purpose on each target page, matching metadata and no banned wording anywhere in the built HTML.

## Review checklist and limits

- Confirm that the first lead answers what is offered: engineering analysis first, then workflow setup suited to needs with an AI-native aim.
- Treat each sentence marked “offer statement” as a proposed service, not a past result. Request registered evidence before adding a measured outcome.
- Open the supporting-work link after reading the lead. Finished work supplies context rather than replacing the purpose.
- Preserve the newsletter edition text and supporting catalogue evidence.
- Read both banned lists when reviewing new copy. A new ban applies throughout the built site, not just the three leads.
- Require maintainer copy review before merge. No deployment or live-page result is claimed.
- Later work: broader copy changes, newsletter edition rewrites and fixed metadata bounds are outside this change. Evaluate a numeric bound only when a source or explicit configuration supplies it.
- The expanded source check exposed an existing banned phrase, `consulting practice`, split across a link and the following text at `content/blog/npv-analysis-deepwater-field-development.html:683`. This change corrects that one line to "energy sector engineering practice", with no exception added to the check; the maintainer's copy review covers that wording too.
