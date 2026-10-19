# Technical-writer pre-flight — correction set, revision A

Family: business (FW-BUS). Exemplar named by the family: `aceengineer-admin/business/newsletter/tribune-2026-10-15/issue-001-web-r10.html`. The exemplar and locked house-style stylesheet are unavailable in the inspected local checkouts; exact exemplar/style parity is OPEN. The smaller correction preserves the existing website layout, cards and contact invitations. The standalone review copy uses an inlined reading style and contains the complete corrected text of the five pages.

One writer edits the complete text. The originating instruction explicitly authorizes prose corrections and prohibits other model/assistant invocations; no delegated writer, independent provider review or separate cold-reader review is claimed. Separate structure, evidence, language and layout passes are performed within this session. Source digests in `changes.json` identify the incorporated bytes; the containing commit identifies the final revision.

- [x] 01 Ten sections, contents, two section levels, acronyms and references in the correction analysis (TW-01). Website section order is preserved.
- [x] 02 Detailed change register and incorporated pages are in the appendix (TW-02).
- [x] 03 System/purpose summary and decision bullets are present (TW-03, TW-09).
- [x] 04 Correction-analysis section introductions use a consistent subject register (TW-04).
- [ ] 05 Exact exemplar and locked house-style parity are not reproduced (TW-05, FW-BUS-01). Existing website layout is retained under corrections-only scope.
- [x] 06 Generic analysis title and revision are present (TW-06). No new engineering document number is invented for the correction record.
- [x] 07 The analysis team is named generically; checking and approval remain unsigned (TW-07). No personal data is added.
- [x] 08 One-line draft status and compact cause-based revision history follow the summary (TW-08).
- [x] 09 Summary bullets have two levels (TW-10).
- [x] 10 New correction-analysis narrative omits internal execution terminology; technical locators are in 9.2 (TW-11, TW-14). Incorporated website text and the traceability appendix retain necessary source wording.
- [x] 11 New analysis narrative has no bold running text (TW-13). Existing website emphasis is retained.
- [x] 12 Abbreviations in the correction analysis are defined; no new engineering symbols are introduced (TW-14).
- [x] 13 No new charts are introduced; arithmetic is shown as arithmetic (TW-15; not applicable).
- [x] 14 No new charts or engineering limits are invented (TW-16; not applicable).
- [x] 15 Physical-system schematics are outside an editorial correction analysis (TW-17; not applicable).
- [x] 16 Table captions are below the tables (TW-19).
- [x] 17 No new performance comparisons or factors are introduced (TW-21). Original out-of-scope comparisons remain unchanged.
- [x] 18 Source precision is retained without new long decimal figures (TW-22).
- [x] 19 The basis defines arithmetic and method-correspondence criteria and their rationale (TW-23).
- [x] 20 Synthetic economics and assumed inputs are identified; evidence gaps are in Appendix A (TW-24, TW-25).
- [x] 21 No new failing engineering result is issued; the pending financial correction links to issue 106 (TW-26).
- [x] 22 Validation evidence and data limitations are recorded in Appendix A (TW-27, TW-28).
- [ ] 23 Exact house-style parity remains unverified; inlined reading style and responsive layout are checked (TW-29). Repeated website claims are aligned.
- [x] 24 Current narrative uses corrected claims; superseded wording appears only in the traceability appendix/change register (TW-30, TW-31).
- [ ] 25 A separate cold-reader review is not performed because other assistant/model invocations are prohibited. This is not represented as independent review.
- [x] 26 Incorporated-source digests agree with the corrected pages; text selection, comment/replacement capture, save payload and reload pass browser checks (TW-32 to TW-34). Chrome/Edge folder selection writes `review.comments.json` in the selected directory; native dialog placement remains reader-selected and is not automated.
- [ ] 27 The external workstation link-opening check is not performed (TW-35). Public evidence endpoints are read through GitHub, the marine reference is compared with the owning local checkout, and local linked data files exist.
- [x] 28 Comment log: 19 October 2026, revision A, initial correction copy, zero owner comments received (TW-36). No prior comment file was supplied.
- [x] 29 No new physical result is issued; no physical-behaviour screenshot is warranted (TW-38).

## Verification evidence

- Before correction: 10 content checks fail on the original arithmetic and unsupported claims.
- After correction: all 11 correction checks pass; full Python suite: 215 passed.
- Site build: passed; generated discovery surfaces inspected. Sitemap contains URLs and dates, with no narrative figures to correct.
- Jest: 34 suites and 975 tests passed. Public-claims suite: 10 passed.
- Capability schema: 8 valid; repository-structure checker: OK.
- Standalone browser checks: ten sections, five incorporated pages, current ROI, comment selection and replacement, save payload/reload, desktop/mobile and zero page errors.
- Source arithmetic: $680,000 + $45,000 + $120,000 - $85,000 - $20,000 = $740,000; 47,385 + 5,876 = 53,261.
- The economics script, metrics JSON, cash-flow CSV and marine sample generator/data remain unchanged.

## Open boundaries

The marine sample JSON still contains estimated additional-source entries; it is not a measured import of seven sources. The calibrated economics and validated return remain with issue 106. Other historical, throughput, load-cycle, performance and compliance claims are not qualified by this correction set. Open pull request 148 overlaps the pages; integration remains with the owner. Existing npm dependency audit reports 45 findings; no dependency changes are made. Visual baselines are governed by the existing CI container; no baselines are regenerated locally.
