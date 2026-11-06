# Copyright (c) 2026 AceEngineer. Licensed under the MIT License.
"""Eval: jack-up and liftboat site-specific analysis (newsletter issue 2).

Rebuilds the accident counts behind Figures 2 and 3 from the published data
set, checks that the copy served on aceengineer.com equals the copy in this
repository, and checks the two fleet counts against their public sources.

    python assets/data/report-evals/issue-002-jackup-site-assessment/eval.py
    python .../eval.py --sec-user-agent "Your Name your.address@example.com"
    python .../eval.py --compare my-results.json

Standard library, plus pypdf for the NTSB report (optional). SEC EDGAR serves
filings only to requests that declare a contact in the User-Agent; without
--sec-user-agent the jack-up fleet count is NOT_EVALUATED.

The site assessment itself needs the reader's location and unit, so it has no
numeric key result; PROMPT.md asks the reader for those inputs.
"""

from __future__ import annotations

import collections
import csv
import html
import re
import sys
import tempfile
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import evalkit  # noqa: E402

REPO_ROOT = HERE.parents[3]
CSV_PATH = "assets/data/newsletter/issue-002/jackup-accidents.csv"
CSV_URL = "https://www.aceengineer.com/assets/data/newsletter/issue-002/jackup-accidents.csv"
NTSB_URL = "https://www.ntsb.gov/investigations/AccidentReports/Reports/MIR2226.pdf"
SEC_URL = "https://www.sec.gov/Archives/edgar/data/314808/000031480826000029/val-20251231.htm"
HAZARDS = {"storm or weather": "storm", "punch-through or foundation": "punch_through",
           "leg, jacking or structural failure": "leg_structural", "transit or tow": "transit_tow",
           "other or not stated": "other"}
UNITS = {"drilling jack-up": "drilling_jackup", "construction jack-up": "construction_jackup",
         "liftboat": "liftboat"}
SOURCES = {"published review": "review_2021", "compiled list": "mms_list",
           "investigation report": "ntsb_reports"}


def add_args(ap):
    ap.add_argument("--repo-root", type=Path, default=REPO_ROOT,
                    help="aceengineer-website clone that holds the data set")
    ap.add_argument("--cache", type=Path,
                    default=Path(tempfile.gettempdir()) / "report-evals-cache" / date.today().isoformat(),
                    help="folder for downloaded files (one folder per day by default)")
    ap.add_argument("--sec-user-agent",
                    help='contact for SEC EDGAR, for example "Your Name you@example.com"')
    ap.add_argument("--offline", action="store_true", help="use the repository copy only")


def _counts(rows, values):
    values["events"] = len(rows)
    for name, key in UNITS.items():
        values[f"events_{key}"] = sum(r["unit_type"] == name for r in rows)
    for name, key in HAZARDS.items():
        values[f"hazard_{key}"] = sum(r["hazard_group_ours"] == name for r in rows)
    kinds = collections.Counter(r["source_type"].split(":")[0].strip() for r in rows)
    for name, key in SOURCES.items():
        values[f"source_{key}"] = kinds.get(name, 0)
    values["events_with_position"] = sum(bool(r["lat"].strip() and r["lon"].strip()) for r in rows)
    years = [int(r["year"]) for r in rows]
    values["first_year"], values["last_year"] = min(years), max(years)


def compute(args):
    values, notes = {}, {}
    local = args.repo_root / CSV_PATH
    context = {"repo_root": str(args.repo_root), "repo_head": evalkit.git_head(args.repo_root),
               "csv_sha256": evalkit.sha256_file(local)}
    rows = list(csv.DictReader(open(local, encoding="utf-8")))
    _counts(rows, values)
    if args.offline:
        for rid in ("served_csv_equals_repo", "us_liftboats_2022", "global_jackups_2025"):
            notes[rid] = "--offline"
        return values, notes, context

    served = evalkit.fetch(CSV_URL, args.cache / "jackup-accidents.csv")
    values["served_csv_equals_repo"] = served["sha256"] == context["csv_sha256"]

    try:
        from pypdf import PdfReader
    except ImportError:
        notes["us_liftboats_2022"] = "install pypdf to read the NTSB report"
    else:
        pdf = evalkit.fetch(NTSB_URL, args.cache / "MIR2226.pdf")
        context["ntsb_mir2226"] = pdf
        text = " ".join((p.extract_text() or "") for p in PdfReader(pdf["path"]).pages[:30])
        m = re.search(r"there were (\d+) US-flagged liftboats in active service", re.sub(r"\s+", " ", text))
        values["us_liftboats_2022"] = int(m.group(1)) if m else None
        if not m:
            notes["us_liftboats_2022"] = "sentence not found in MIR-22/26"

    if not args.sec_user_agent:
        notes["global_jackups_2025"] = "SEC EDGAR needs --sec-user-agent with your name and e-mail"
    else:
        page = evalkit.fetch(SEC_URL, args.cache / "val-20251231.htm",
                             headers={"User-Agent": args.sec_user_agent})
        context["valaris_10k"] = {k: page[k] for k in ("url", "sha256", "retrieved_utc")}
        raw = Path(page["path"]).read_text(encoding="utf-8", errors="replace")
        text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", raw)))
        # 10-K, Market outlook: "as of December 31, 2025, there were 494 jackups in the global fleet"
        m = re.search(r"there were (\d+) jackups in the global fleet", text, re.IGNORECASE)
        values["global_jackups_2025"] = int(m.group(1)) if m else None
        context["valaris_10k_sentence"] = text[max(0, m.start() - 160):m.end() + 80] if m else None
        if not m:
            notes["global_jackups_2025"] = "jack-up fleet count not found in the 10-K text"
    return values, notes, context


if __name__ == "__main__":
    raise SystemExit(evalkit.main(HERE / "results.json", compute, add_args))
