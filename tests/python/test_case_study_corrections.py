"""Regression checks for evidence-backed case-study corrections."""

import json
import re
from html import unescape
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
CASE_STUDIES = ROOT / "content" / "case-studies"


def page_text(slug):
    return (CASE_STUDIES / f"{slug}.html").read_text()


def plain_text(html):
    return unescape(re.sub(r"<[^>]+>", " ", html))


def test_subsea_roi_total_agrees_with_signed_line_items():
    page = page_text("subsea-fea-automation")
    table = page.split("<h3>Return on Investment</h3>", 1)[1].split("</table>", 1)[0]
    cells = re.findall(r"<td[^>]*>(.*?)</td>", table, re.S)
    amounts = [plain_text(cell).strip() for cell in cells[1::2]]
    numbers = [int(re.sub(r"[^0-9]", "", amount)) for amount in amounts]
    expected = sum(-value if "(" in amount else value
                   for amount, value in zip(amounts[:-1], numbers[:-1]))
    assert numbers[-1] == expected == 740000
    assert "$740K" in page
    assert "$740K" in page_text("index")


@pytest.mark.parametrize("slug", ["marine-safety-correlation", "index"])
def test_marine_coverage_matches_two_recorded_source_counts(slug):
    data = json.loads((ROOT / "assets/data/marine_safety_correlation.json").read_text())
    counts = {item["source"]: item["count"] for item in data["source_distribution"]}
    total = counts["TSB_CANADA"] + counts["MAIB_UK"]
    assert total == 53261
    page = page_text(slug)
    assert f"{total:,}" in page
    assert not re.search(r"7 (?:maritime |Maritime )?(?:authorities|Authorities|sources)", page)
    assert not re.search(r'metric-value">7</div>\s*<div class="metric-label">Maritime', page)


def test_marine_sample_visualizations_do_not_establish_measured_coverage():
    page = page_text("marine-safety-correlation")
    assert "sample" in page.lower()
    assert "PHASE_2_IMPORT_COMPLETE.md" in page
    assert "1989-2025" not in page
    assert "2018-2024" in page
    assert not re.search(r"<td>Integrated</td>", page)


@pytest.mark.parametrize("slug", ["bsee-field-economics", "index"])
def test_economics_does_not_present_placeholder_as_calculated_return(slug):
    page = page_text(slug)
    assert not re.search(r"15(?:\.0)?%", page)
    assert "placeholder" in page.lower()
    assert "illustrative" in page.lower()
    assert "https://github.com/vamseeachanta/aceengineer-website/issues/106" in page


def test_economics_does_not_claim_unimplemented_simulation_or_sensitivity():
    page = page_text("bsee-field-economics")
    assert "10,000" not in page
    assert "25 scenarios" not in page
    assert "tornado" not in page.lower()
    assert "Monte Carlo simulation is not implemented" in page
    assert "generate_field_economics_data.py" in page


@pytest.mark.parametrize("slug", [
    "offshore-platform-fatigue-optimization", "wind-turbine-foundation-analysis", "index",
])
def test_case_specific_model_and_approval_claims_require_evidence(slug):
    page = page_text(slug)
    assert "XGBoost" not in page
    assert "BSEE Accepted" not in page
    assert "full certification" not in page
    assert "Type Certification" not in page
    assert "C203 Certified" not in page


def test_generated_discovery_surfaces_do_not_repeat_retired_claims():
    llms = (ROOT / "dist/llms.txt").read_text()
    for line in llms.splitlines():
        if any(slug in line for slug in ["marine-safety-correlation", "bsee-field-economics",
                                        "subsea-fea-automation"]):
            assert not re.search(r"7 (?:maritime )?authorities|15%|340K", line, re.I)
    sitemap = (ROOT / "dist/sitemap.xml").read_text()
    assert "marine-safety-correlation.html" in sitemap
    assert "bsee-field-economics.html" in sitemap
