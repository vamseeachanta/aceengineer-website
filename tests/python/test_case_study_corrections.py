"""Guard retired claims and preserve case-study navigation."""

import json
import re
from html import unescape
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
CASE_STUDIES = ROOT / "content" / "case-studies"
MODEL_PAGES = [
    "offshore-platform-fatigue-optimization", "wind-turbine-foundation-analysis",
]
METHOD_PAGES = MODEL_PAGES + [
    "bsee-field-economics", "marine-safety-correlation",
    "multi-code-wall-thickness-comparison", "orcaflex-riser-sensitivity-automation",
    "pipeline-on-bottom-stability-assessment", "subsea-fea-automation",
]


def page_text(slug):
    return (CASE_STUDIES / f"{slug}.html").read_text()


def plain_text(html):
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", html)))


def card_text(slug):
    """Inspect the matching card when present; a metric-free index is valid."""
    cards = re.split(r'<div class="case-study-card">|<article(?:\s[^>]*)?>',
                     page_text("index"))[1:]
    return next((card for card in cards if f'href="{slug}.html"' in card), "")


def test_subsea_retires_unsubstantiated_savings_and_hourly_rate():
    text = plain_text(page_text("subsea-fea-automation")
                      + card_text("subsea-fea-automation"))
    for claim in ["$340K", "$740K", "$740,000", "Annual Savings", "$85/hr"]:
        assert claim.lower() not in text.lower(), claim


def test_case_study_index_remains_metric_free():
    page = page_text("index")
    assert "$" not in page and "%" not in page
    assert "metric-value" not in page
    assert "Illustrative Field Economics" in card_text("bsee-field-economics")
    assert "Marine Safety Import Coverage" in card_text("marine-safety-correlation")


@pytest.mark.parametrize("slug", METHOD_PAGES)
def test_method_navigation_survives_claim_corrections(slug):
    source = page_text(slug)
    assert 'src="partials/scope-invitation.html"' in source
    for page in [source, (ROOT / "dist/case-studies" / f"{slug}.html").read_text()]:
        assert re.search(r'<nav\b[^>]*aria-label="Breadcrumb"', page)
        assert 'href="./"' in page
        related = re.search(r"<h2>Related methods</h2>\s*<ul>(.*?)</ul>", page, re.S)
        assert related is not None
        links = re.findall(r'<a href="([^"#?]+\.html)">', related[1])
        assert len(links) >= 2
        assert all((CASE_STUDIES / link).is_file() for link in links)
    built = (ROOT / "dist/case-studies" / f"{slug}.html").read_text()
    assert "Use our data that is available." in built


@pytest.mark.parametrize("slug", ["marine-safety-correlation", "index"])
def test_marine_does_not_promote_sample_statistics_to_import_results(slug):
    page = page_text(slug) if slug != "index" else card_text("marine-safety-correlation")
    text = plain_text(page)
    assert not re.search(r"7\s+(?:maritime\s+)?(?:authorities|sources)", text, re.I)
    assert not re.search(r"92\s*%|30\+\s*vessel operators|2,?300\+?|18\s*%|99\.9\s*%", text)
    assert not re.search(r"Scope:\s*Global|Zero duplicates|100% accuracy", text, re.I)
    assert not re.search(r'metric-value">7</div>\s*<div class="metric-label">Maritime', page)


def test_marine_names_the_import_record_and_its_identity_limitations():
    page = page_text("marine-safety-correlation")
    assert "PHASE_2_IMPORT_COMPLETE.md" in page
    assert "TSB" in page and "MAIB" in page
    assert "2018-2024" in page and "1989-2025" not in page
    text = plain_text(page)
    assert re.search(r"MAIB.*(?:lack|without|not included).*vessel names", text, re.I)
    assert "IMO numbers" in text
    assert "North America" in text and "UK waters" in text
    assert "sample" in text.lower()
    assert "linked visualization script" not in text


def test_marine_published_counts_are_pinned_to_the_import_record():
    revision = "7493f54316cc1d1ee5b5813afe69c90c873c04e7"
    page = page_text("marine-safety-correlation")
    assert f"/blob/{revision}/docs/data-sources/PHASE_2_IMPORT_COMPLETE.md" in page
    for label, count in [("TSB Canada", 47385), ("MAIB UK", 5876)]:
        row = re.search(fr"<tr>\s*<td>{label}</td>(.*?)</tr>", page, re.S)[1]
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)
        assert plain_text(cells[0]).strip() == f"{count:,}"


@pytest.mark.parametrize("slug", ["bsee-field-economics", "index"])
def test_economics_retires_engagement_and_calculated_return_claims(slug):
    page = page_text(slug) if slug != "index" else card_text("bsee-field-economics")
    text = plain_text(page)
    for pattern in [r"15(?:\.0)?\s*%", r"3 weeks", r"board meeting", r"Partners required",
                    r"80[-–]90\s*%", r"25 scenarios", r"10,000", r"tornado",
                    r"BSEE Field Economics", r"required normalization and aggregation"]:
        assert not re.search(pattern, text, re.I), pattern


def test_economics_title_and_metadata_describe_the_synthetic_example():
    page = page_text("bsee-field-economics")
    for tag in ["title", "h1"]:
        title = re.search(fr"<{tag}[^>]*>(.*?)</{tag}>", page, re.S)[1]
        assert "Illustrative Field Economics" in title
        assert "BSEE" not in title
    blocks = []
    for text in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
        block = json.loads(text)
        blocks.extend(block if isinstance(block, list) else [block])
    article = next(block for block in blocks if block["@type"] in {"Article", "WebPage"})
    assert "Illustrative Field Economics" in article.get("headline", article.get("name", ""))
    assert "synthetic" in article["description"].lower()
    assert "placeholder" in page.lower()
    assert "generate_field_economics_data.py" in page
    assert "Monte Carlo simulation is not implemented" in page
    assert "calibrated rebuild is pending" in plain_text(page)


@pytest.mark.parametrize("slug", MODEL_PAGES)
def test_model_pages_reject_unsupported_training_validation_and_outcomes(slug):
    page = page_text(slug)
    text = plain_text(page)
    for pattern in [r"XGBoost", r"gradient.boosting", r"0\.96", r"4\.2\s*%",
                    r"284,500", r"278,200", r"Site A12", r"within 5\s*%",
                    r"(?:used|applied) the trained", r"we trained",
                    r"23\s*%", r"85\s*%", r"70\s*%", r"25\s*%",
                    r"24 inspection locations", r"5.fold cross.validation",
                    r"validated against.*inspection", r"full certification",
                    r"Type Certification", r"C203 Certified", r"BSEE Accepted"]:
        assert not re.search(pattern, text, re.I), pattern
    assert "This page describes the method; it reports no project results." in text
    assert "machine-learning surrogate model" in text
    assert "not claimed" not in text
    descriptions = re.findall(r'<meta[^>]*(?:name|property)="[^"]*description"[^>]*content="([^"]+)"', page)
    assert len(descriptions) == 3
    assert all("assessment" in description.lower() for description in descriptions)
    assert all("not claimed" not in description for description in descriptions)


@pytest.mark.parametrize("slug", MODEL_PAGES)
def test_index_does_not_reintroduce_model_results(slug):
    text = plain_text(card_text(slug))
    assert not re.search(r"85%|23%|70%|25%|\$2\.1M|4\.2M|847|92 foundations", text)


@pytest.mark.parametrize("slug", MODEL_PAGES + [
    "bsee-field-economics", "marine-safety-correlation", "index",
])
def test_site_copy_omits_internal_workflow_references(slug):
    page = page_text(slug)
    assert not re.search(r"in this repository|issue\s+106|/issues/106", page, re.I)


def test_energy_links_qualify_economics_and_import_coverage():
    page = (ROOT / "content/energy.html").read_text()
    assert "public production data where available" in page
    assert "using BSEE production data" not in page
    items = re.findall(r"<li\b[^>]*>.*?</li>", page, re.S)
    economics = next(item for item in items if "bsee-field-economics.html" in item)
    assert "illustrative" in economics.lower() and "synthetic" in economics.lower()
    assert "BSEE Field Economics" not in economics
    marine = next(item for item in items if "marine-safety-correlation.html" in item)
    assert not re.search(r"92%|2,300|30\+|7 authorities", marine)


def test_discovery_descriptions_do_not_repeat_retired_claims():
    llms = (ROOT / "dist/llms.txt").read_text()
    for line in llms.splitlines():
        if any(slug in line for slug in MODEL_PAGES + [
            "marine-safety-correlation", "bsee-field-economics", "subsea-fea-automation",
        ]):
            assert not re.search(r"7 (?:maritime )?authorities|15%|340K|92%|2,300|85%|70%|25%", line, re.I)
    sitemap = (ROOT / "dist/sitemap.xml").read_text()
    assert "marine-safety-correlation.html" in sitemap
    assert "bsee-field-economics.html" in sitemap
