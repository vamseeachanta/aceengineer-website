# Run it yourself: jack-up and liftboat site-specific analysis

Article: https://www.aceengineer.com/newsletter/issue-002-jackup-method/

For decision makers: this prompt lets your team, or your AI assistant, set out a site study for a jack-up or liftboat with public data, and check the article's accident record. If you would rather have the site study done for you, use the contact link on the article page.

For practitioners: paste the block below into an AI assistant that can run Python and use the internet. Part A needs only public data. Part B needs your site and unit data. The key results of Part A are in `results.json` next to this file. `eval.py` grades them.

## Prompt (copy all of it)

```text
Use the article "Jack-up site-specific analysis"
(https://www.aceengineer.com/newsletter/issue-002-jackup-method/). Read its Table 3
(data for a site study) and section 5 (the checks) before you start.

Part A: check the public record (no input from me needed)
Inputs:
- Accident data set, 35 events with year, unit type, location, position, hazard group
  and source: https://www.aceengineer.com/assets/data/newsletter/issue-002/jackup-accidents.csv
- NTSB Marine Investigation Report MIR-22/26 (SEACOR Power), section 1.1.1:
  https://www.ntsb.gov/investigations/AccidentReports/Reports/MIR2226.pdf
- Valaris Ltd Form 10-K for 2025, filed 20 February 2026:
  https://www.sec.gov/Archives/edgar/data/314808/000031480826000029/val-20251231.htm
Steps:
1. Count the events of the data set by year, by unit_type, by hazard_group_ours and
   by source type, and count the events with a position (lat and lon).
2. Chart the events by year and initiating hazard (marker shape by unit type), and
   map the events with a position.
3. Find the US liftboat count in MIR-22/26 and the global jack-up count in the 10-K.
Expected key results:
- 35 events, 1999 to 2022: 17 on drilling jack-ups, 13 on construction jack-ups,
  5 on liftboats.
- By initiating hazard: storm or weather 4, punch-through or foundation 11, leg,
  jacking or structural failure 4, transit or tow 4, other or not stated 12.
- By source: 17 from the 2021 review, 14 from the 2010 MMS report list, 4 NTSB
  investigation reports. 26 events have a position.
- 77 US-flagged liftboats in active service on 1 August 2022 (MIR-22/26).
- 494 jack-ups in the global fleet at 31 December 2025 (Valaris 10-K).
- The cited sources give no world count of liftboats or of wind installation
  jack-ups, and the article found none. Say that no count was found in the sources
  you checked; do not estimate one, and do not claim that none exists.

Part B: set out a site study for my unit at my site
Ask me for these inputs before you start Part B, and say why each is needed:
- the site: latitude and longitude in decimal degrees and the water depth
  (for bathymetry, metocean data and the air gap check);
- the unit: jack-up or liftboat, leg length, spudcan or footing size, preload,
  lightship and variable load, and the air gap it is designed for
  (for the structural, overturning and air gap checks);
- soil data at the leg positions: borehole or CPT logs (for the punch-through check);
- whether I have copies of ISO 19905-1:2023, SNAME T&R 5-5A Rev 3 and the IMO MODU
  Code, which are paid documents;
- whether I have a Copernicus Climate Data Store key for ERA5 data.
Then:
4. Fill Table 3 of the article for my site. Mark each input with its source and
   date, or "to be supplied" if I do not have it. Use GEBCO for depth and NOAA NDBC
   buoy records for metocean data where a buoy is near the site.
5. Set out each check of section 5 with its code, edition and clause. Cite a clause
   of ISO 19905-1, SNAME 5-5A or the MODU Code only if I have the document;
   otherwise cite it as the article does and mark it "to be checked". The US CFR
   clauses (for example 46 CFR 174.255 for liftboats and 30 CFR 250.713) are public
   at ecfr.gov; quote them.

You cannot:
- complete the checks without my unit and soil data: give them as a template;
- name a cause for any event whose investigation is still open;
- give a world count of liftboats or of wind installation jack-ups from the cited
  sources.

Output: the Part A counts against the expected values, the two charts, the Part B
data list and check list, and a file my-results.json in this form, with the
result ids of
https://www.aceengineer.com/assets/data/report-evals/issue-002-jackup-site-assessment/results.json
{"results": [{"id": "events", "value": 35}, ...]}
```

## Check your answer

The eval is in the aceengineer-website repository. From a clone:

```text
python assets/data/report-evals/issue-002-jackup-site-assessment/eval.py --compare my-results.json
python assets/data/report-evals/issue-002-jackup-site-assessment/eval.py --sec-user-agent "Your Name you@example.com"
```

The first line grades your own results against the Part A key results. The second rebuilds them itself and also checks that the data set served on aceengineer.com equals the repository copy (a rebuild-only check). SEC EDGAR serves filings only to requests that name a contact, so the jack-up fleet count needs `--sec-user-agent`; without it that result is `NOT_EVALUATED`. The NTSB report is AES-encrypted, so its check needs `pip install "pypdf[crypto]"`.

## Adapt it to your project

Part B is the adaptation: give your site and unit. Each input goes into the study with its source and date, so a later study can see what was measured and what was assumed.
