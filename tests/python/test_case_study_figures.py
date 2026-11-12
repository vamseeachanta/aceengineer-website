"""Figure contract for issue #164; expectations are independent hand counts."""

import copy
import json
import subprocess
import sys

import pytest

from scripts.case_study_figures import (
    PAGES,
    ROOT,
    extract_figures,
    load_register,
    render_report,
    scan_pages,
    validate_register,
)

SYNTHETIC = """<!doctype html><html><head><title>99%</title>
<style>.x {width: 80%}</style><script>const n = 44;</script></head><body>
<h2>1. Inputs</h2><div class="step-number">2</div>
<p>On 2025-10-12, in 2018–2024 and 2026, see ASME B31.4, API 1111,
DNV-ST-F101, IEC 61400-3-1, Sec 4, Eq 3.1–3.6 and Table 3-2.</p>
<p>Illustrative cost: $12.5 million; duration 6 months; 25<strong>%</strong> saved.</p>
<p>There are 7 models. Diameters 8, 10 and 12 inch. Pressure 500 to 900 psi.</p>
<p>Ratio &lt; 0.8; ratio 0.8–1.0. A 180-month run uses 30.4 days per month.</p>
<table><tr><th>Quantity</th><th>Saved illustrative value</th></tr>
<tr><td>NPV (million USD)</td><td>42.5</td></tr></table>
<p>Repeat 7 models; 7 models.</p>
<p hidden>98%</p><div style="display:none">97%</div><template>96%</template>
<!-- 95% --><p>Python 3.10+ reads .f06 and .op2; SOL 101, 103, 106.</p>
<pre>run(parallel_jobs=8)</pre></body></html>"""


def entry(figure, **changes):
    result = {
        **figure,
        "source_name": "",
        "source_location": "",
        "status": "NOT_EVALUATED",
    }
    result.update(changes)
    return result


def test_hand_counted_visible_figures_and_ignore_rules():
    """Hand count: 3 cost/time/percent + 1 count + 3 diameters + 2 pressures
    + 3 ratios + 2 durations + 1 table value + 2 repeated counts + 1 code
    parameter = 18 occurrences. Metadata, hidden text, dates, years, section
    labels, standard IDs, file names, solver IDs and versions contribute zero.
    No extractor output was used to construct the expected list.
    """
    figures = extract_figures(SYNTHETIC, "synthetic.html")
    assert [(f["figure_text"], f["value"], f["unit"]) for f in figures] == [
        ("$12.5 million", "12.5", "$ million"),
        ("6 months", "6", "months"),
        ("25%", "25", "%"),
        ("7", "7", "count"),
        ("8", "8", "inch"),
        ("10", "10", "inch"),
        ("12 inch", "12", "inch"),
        ("500", "500", "psi"),
        ("900 psi", "900", "psi"),
        ("0.8", "0.8", "ratio"),
        ("0.8", "0.8", "ratio"),
        ("1.0", "1.0", "ratio"),
        ("180-month", "180", "month"),
        ("30.4 days per month", "30.4", "days per month"),
        ("42.5", "42.5", "million USD"),
        ("7", "7", "count"),
        ("7", "7", "count"),
        ("8", "8", "count"),
    ]
    assert len({f["id"] for f in figures}) == len(figures)


@pytest.mark.parametrize(
    "text",
    [
        "2025-10-12",
        "12/10/2025",
        "12 October 2025",
        "2018-2024",
        "2026",
        "API RP 2RD",
        "API 17B",
        "ASME Section VIII Division 2",
        "S403.2.1 burst",
        "Table 1. Counts",
        "Phase 2 import record",
        "SOL 101, 103, 106",
        "Python 3.10+",
    ],
)
def test_individual_ignore_rules(text):
    """Each literal is an identifier or calendar label, with zero quantities."""
    assert extract_figures(f"<body><p>{text}</p></body>", "x.html") == []


@pytest.mark.parametrize(
    "text,value,unit",
    [
        ("2000 m", "2000", "m"),
        ("2026 incidents", "2026", "count"),
        ("-2.5 MPa", "-2.5", "MPa"),
        ("€40", "40", "€"),
        ("£2K", "2", "£ K"),
        ("1e3 Pa", "1e3", "Pa"),
        (".5%", ".5", "%"),
        ("33rd modeled month", "33", "month"),
        ("5 codes", "5", "count"),
        ("API workflow tracks 6 models", "6", "count"),
    ],
)
def test_quantities_are_not_mistaken_for_identifiers(text, value, unit):
    """One hand-written quantity in each literal; magnitudes are not converted."""
    result = extract_figures(f"<body><p>{text}</p></body>", "x.html")
    assert [(f["value"], f["unit"]) for f in result] == [(value, unit)]


def sample():
    figures = extract_figures("<body><p>Illustrative: 25% saved.</p></body>", "x.html")
    return figures, [entry(figures[0])]


def test_complete_register_accepts_explicit_unknowns():
    figures, entries = sample()
    assert validate_register(figures, entries) == []


@pytest.mark.parametrize(
    "mutation,kind",
    [
        (lambda rows: rows.clear(), "missing"),
        (lambda rows: rows.append({**rows[0], "id": "absent"}), "stale"),
        (lambda rows: rows.append(copy.deepcopy(rows[0])), "duplicate"),
        (lambda rows: rows[0].update(value="26"), "mismatch"),
        (lambda rows: rows[0].update(unit="count"), "mismatch"),
        (lambda rows: rows[0].update(figure_text="26%"), "mismatch"),
        (lambda rows: rows[0].update(status="UNKNOWN"), "status"),
        (lambda rows: rows[0].pop("source_name"), "schema"),
    ],
)
def test_register_rejects_missing_stale_duplicate_and_edited_entries(mutation, kind):
    figures, entries = sample()
    mutation(entries)
    assert any(kind in error for error in validate_register(figures, entries))


@pytest.mark.parametrize("status", ["SOURCED", "DERIVED"])
@pytest.mark.parametrize("field", ["source_name", "source_location"])
def test_evidence_status_requires_name_and_location(status, field):
    figures, entries = sample()
    entries[0].update(
        status=status, source_name="Fixture source", source_location="fixture:inputs"
    )
    entries[0][field] = " "
    assert any("source" in e for e in validate_register(figures, entries))


@pytest.mark.parametrize(
    "html,valid",
    [
        ("<p>Illustrative: 25% saved.</p>", True),
        ("<p>25% saved (illustrative).</p>", True),
        ("<h2>Illustrative</h2><p>25% saved.</p>", False),
        ("<p>Illustrative inputs. Savings 25%.</p>", False),
        ("<p>25% saved.</p><p>Illustrative.</p>", False),
        (
            "<table><tr><th>Saved illustrative value</th></tr><tr><td>25%</td></tr></table>",
            True,
        ),
        ("<p>Not illustrative: 25%.</p>", False),
        ("<p>Non-illustrative: 25%.</p>", False),
        (
            (
                "<table><tr><th>Illustrative value</th><th>Basis</th></tr>"
                "<tr><td>Example</td><td>25%</td></tr></table>"
            ),
            False,
        ),
        (
            "<table><tr><td>Unrelated illustrative text.</td><td>25%</td></tr></table>",
            False,
        ),
    ],
)
def test_illustrative_label_must_cover_the_figure_sentence_or_table_label(html, valid):
    """Each page has one quantity; only its own sentence or table label qualifies."""
    figures = extract_figures(f"<body>{html}</body>", "x.html")
    entries = [entry(f, status="ILLUSTRATIVE") for f in figures]
    assert bool(validate_register(figures, entries)) is not valid


def test_occurrences_cannot_hide_behind_one_register_entry():
    """Two identical percentages need two entries, even in the same paragraph."""
    figures = extract_figures("<body><p>25%; 25%.</p></body>", "x.html")
    assert any("missing" in e for e in validate_register(figures, [entry(figures[0])]))


def test_source_layout_wrappers_preserve_blocks_and_table_cells():
    """Hand count: two prose counts and one table value; neither adjacent cells
    nor unrelated sentences may be concatenated. Wrapper tags model the source
    pages, including main, nested layout divs and a table body.
    """
    html = """<html><head></head><body><main><div><section><article>
    <p>Generate 50 configurations.</p><p>Run 8 jobs.</p>
    <table><thead><tr><th>Count</th><th>Period</th></tr></thead><tbody>
    <tr><td>47,385</td><td>1975-2025</td></tr></tbody></table>
    </article></section></div></main></body></html>"""
    figures = extract_figures(html, "x.html")
    assert [(f["figure_text"], f["unit"]) for f in figures] == [
        ("50", "count"),
        ("8", "count"),
        ("47,385", "count"),
    ]
    assert len({f["context"] for f in figures}) == len(figures)


def test_unqualified_counts_are_not_discarded_as_years():
    """Three counts: a prose total and two table totals. Four digits alone do
    not make a labelled count a calendar year. The final sentence is a year.
    """
    html = """<body><p>Imported 1234.</p><table><tr><th>Records</th></tr>
    <tr><td>2026</td></tr><tr><td>1234</td></tr></table><p>In 2026.</p></body>"""
    assert [f["value"] for f in extract_figures(html, "x.html")] == [
        "1234",
        "2026",
        "1234",
    ]


def test_lists_and_unknown_wrappers_keep_quantity_boundaries():
    """Independent hand count: one count per list item, plus a shared range.
    Repeated values in a sentence must use their own position for unit inference.
    """
    html = """<body><custom-wrapper><ul><li>7</li><li>8 models</li></ul>
    <p>8 models; lengths 8 to 10 m.</p></custom-wrapper></body>"""
    assert [(f["value"], f["unit"]) for f in extract_figures(html, "x.html")] == [
        ("7", "count"),
        ("8", "count"),
        ("8", "count"),
        ("8", "m"),
        ("10", "m"),
    ]


def test_physical_range_is_not_a_calendar_range():
    """Two depth endpoints have an explicit metre unit; the year range has
    no physical unit. Hand count: two depth quantities, no calendar quantities.
    """
    html = "<body><p>Depths 2000–2500 m; period 2018–2024.</p></body>"
    assert [(f["value"], f["unit"]) for f in extract_figures(html, "x.html")] == [
        ("2000", "m"),
        ("2500", "m"),
    ]


def test_recursive_page_discovery_and_empty_page_report(tmp_path):
    nested = tmp_path / "nested"
    nested.mkdir()
    (tmp_path / "index.html").write_text("<body>No quantities.</body>")
    (nested / "a.html").write_text("<body><p>7 models</p></body>")
    figures, pages = scan_pages(tmp_path)
    assert pages == ["index.html", "nested/a.html"]
    report = render_report(figures, [entry(f) for f in figures], pages)
    assert "| index.html | 0 | 0 | 0 | 0 | 0 |" in report
    assert "| nested/a.html | 0 | 0 | 0 | 1 | 1 |" in report
    assert "7" in report and "NOT_EVALUATED" in report


def test_repository_register_and_report_are_current():
    figures, pages = scan_pages()
    entries = load_register()
    assert validate_register(figures, entries) == []
    assert (ROOT / "reports/case-study-figures.md").read_text() == render_report(
        figures, entries, pages
    )


def test_repository_occurrences_match_independent_page_count():
    """Manual source-text count: economics has 12 inputs and 5 output mentions;
    marine has 3 prose counts and 2 table counts; multi-code has 1 diameter
    count, 5 diameters, 1 thickness count, 2 pressures, 2 depths and 1 code
    count; riser has 1 model count and 1 visible code parameter; stability has
    4 ratio endpoints. The other 4 pages contain only ignored identifiers.
    These expected values were read from page text, not from the extractor.
    """
    from collections import Counter

    figures, pages = scan_pages()
    actual = Counter(f["page"] for f in figures)
    assert {p: actual[p] for p in pages} == {
        "bsee-field-economics.html": 17,
        "index.html": 0,
        "marine-safety-correlation.html": 5,
        "multi-code-wall-thickness-comparison.html": 12,
        "offshore-platform-fatigue-optimization.html": 0,
        "orcaflex-riser-sensitivity-automation.html": 2,
        "pipeline-on-bottom-stability-assessment.html": 4,
        "subsea-fea-automation.html": 0,
        "wind-turbine-foundation-analysis.html": 0,
    }


def test_worked_example_uses_cited_inputs_and_independent_addition():
    """The pinned 2025 import record's Successfully Imported lines state 47,385
    and 5,876. Their independent integer sum is 53,261. The page repeats both
    agency inputs in a table. This does not establish incident deduplication.
    """
    entries = [
        e for e in load_register() if e["page"] == "marine-safety-correlation.html"
    ]
    assert [e["value"] for e in entries] == ["47385", "5876", "53261", "47385", "5876"]
    total = next(e for e in entries if e["status"] == "DERIVED")
    assert int(total["value"]) == 47385 + 5876
    assert "sum of the two cited agency counts" in total["source_location"]
    source_page = (PAGES / "marine-safety-correlation.html").read_text()
    cited_line = source_page.splitlines()[30]
    assert 'href="https://' in cited_line
    assert "/7493f54316cc1d1ee5b5813afe69c90c873c04e7/" in cited_line
    assert "PHASE_2_IMPORT_COMPLETE.md" in cited_line
    docs = (ROOT / "docs/case-study-figures.md").read_text()
    assert total["id"] in docs
    assert "47,385 + 5,876 = 53,261" in docs


def test_saved_illustrative_outputs_match_artifact_rounding():
    """Saved metrics are the evidence, not a rerun of the synthetic generator.
    Expected display precision comes from the page's one-decimal output text.
    """
    metrics = json.loads(
        (ROOT / "assets/data/field_economics_metrics.json").read_text()
    )
    entries = [e for e in load_register() if e["status"] == "ILLUSTRATIVE"]
    assert [e["figure_text"] for e in entries] == [
        f"{metrics['npv_mm']:,.1f}",
        f"{metrics['total_production_mmbbls']:.1f}",
        str(metrics["payback_months"]),
    ]


def test_extractor_and_report_cli(tmp_path):
    """CLI inventory and generated report agree with the checked-in contracts."""
    script = ROOT / "scripts/case_study_figures.py"
    result = subprocess.run(
        [sys.executable, str(script), "extract"],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert json.loads(result.stdout) == scan_pages()[0]
    report = tmp_path / "report.md"
    result = subprocess.run(
        [sys.executable, str(script), "report", "--output", str(report)],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert report.read_text() == (ROOT / "reports/case-study-figures.md").read_text()


@pytest.mark.parametrize("payload", ["[]", "{}", "invalid JSON"])
def test_cli_rejects_incomplete_or_malformed_register_without_overwriting_report(
    tmp_path, payload
):
    """An empty register misses page figures; an object and invalid JSON violate
    the array contract. In each case the existing report must remain intact.
    """
    register = tmp_path / "register.json"
    register.write_text(payload)
    report = tmp_path / "report.md"
    report.write_text("Existing report")
    result = subprocess.run(
        [
            sys.executable,
            str(ROOT / "scripts/case_study_figures.py"),
            "report",
            "--register",
            str(register),
            "--output",
            str(report),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 1
    assert report.read_text() == "Existing report"
