"""SEO audit fixtures use hand counts and the sources in seo-audit.json.

The synthetic example has one title, description, canonical and h1; its sitemap
has exactly its directory URL. Mutations below name each independently expected
failure. Google Dataset and Breadcrumb requirements are cited in the config.
"""

import copy
import json
import subprocess
import sys
from pathlib import Path

import pytest

from scripts.seo.audit import audit, read_page, write_report

ROOT = Path(__file__).resolve().parents[2]
CONFIG = json.loads((ROOT / "config/seo-audit.json").read_text())
ORIGIN = "https://example.org"
URL = ORIGIN + "/guide/"


def settings():
    config = copy.deepcopy(CONFIG)
    config["origin"] = ORIGIN
    config["allowlist"] = []
    return config


def html(title="Guide", description="A guide.", canonical=URL, extra="", body="<h1>Guide</h1>"):
    return f'''<!doctype html><html><head><title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{ORIGIN}/card.png">
    <meta name="twitter:card" content="summary">{extra}</head>
    <body>{body}</body></html>'''


def site(tmp_path, markup=None, urls=None):
    page = tmp_path / "guide/index.html"
    page.parent.mkdir(parents=True, exist_ok=True)
    page.write_text(html() if markup is None else markup)
    urls = [URL] if urls is None else urls
    (tmp_path / "sitemap.xml").write_text(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(f"<url><loc>{url}</loc></url>" for url in urls) + "</urlset>"
    )
    return tmp_path


def rules(report):
    return {item["rule"] for item in report["violations"]}


def ld(value):
    return '<script type="application/ld+json">' + json.dumps(value) + "</script>"


def test_collects_decoded_head_values_and_counts_without_executing_scripts(tmp_path):
    markup = html(title="Guide &amp; notes", extra=ld({
        "@context": "https://schema.org", "@type": "WebPage", "name": "Guide",
    }), body='<h1>Guide</h1><script>"<h1>ignored</h1>"</script>')
    report = audit(site(tmp_path, markup), settings())
    assert report["status"] == "PASS"
    assert report["violations"] == []
    page = report["pages"][0]
    assert page["title"] == ["Guide & notes"]
    assert page["description"] == ["A guide."]
    assert page["canonical"] == [URL]
    assert page["og:title"] == ["Guide & notes"]
    assert page["og:description"] == ["A guide."]
    assert page["og:image"] == [ORIGIN + "/card.png"]
    assert page["twitter:card"] == ["summary"]
    assert page["json_ld_types"] == ["WebPage"]
    assert page["h1_count"] == 1
    assert page["robots"] == []
    assert page["in_sitemap"] is True
    assert page["lengths"] == {"title": [13], "description": [8]}


@pytest.mark.parametrize(("markup", "expected"), [
    (html().replace("<title>Guide</title>", ""), "title-count"),
    (html(extra="<title>Other</title>"), "title-count"),
    (html(extra='<meta name="description" content="Other">'), "description-count"),
    (html(extra='<link rel="alternate canonical" href="https://example.org/other">'), "canonical-count"),
    (html(canonical="/guide/"), "canonical-https"),
    (html(canonical="http://example.org/guide/"), "canonical-https"),
    (html(canonical=ORIGIN + "/wrong/"), "canonical-sitemap"),
    (html(body="<h1>A</h1><h1>B</h1>"), "h1-count"),
    (html(body="<p>No heading</p>"), "h1-count"),
    (html(extra='<meta name="robots" content="NOINDEX, follow">'), "noindex-in-sitemap"),
    (html(extra='<meta name="googlebot" content="none">'), "noindex-in-sitemap"),
    (html().replace('property="og:title"', 'property="other"'), "og-required"),
    (html().replace('content="website"', 'content=""'), "og-required"),
    (html().replace('name="twitter:card"', 'name="other"'), "twitter-card"),
    (html(extra='<script type="application/ld+json">{broken}</script>'), "jsonld-parse"),
    (html(extra=ld({"@context": "https://example.org", "@type": "WebPage"})), "jsonld-context"),
    (html(extra=ld({"@type": "WebPage"})), "jsonld-context"),
    (html(extra=ld(3)), "jsonld-shape"),
    (html(extra=ld({"@context": "https://schema.org", "@type": "Dataset", "name": "Data"})), "jsonld-required"),
])
def test_independent_page_mutations(tmp_path, markup, expected):
    assert expected in rules(audit(site(tmp_path, markup), settings()))


def test_duplicates_include_both_pages_and_decode_entities(tmp_path):
    site(tmp_path, html(title="Guide &amp; notes"), [URL, ORIGIN + "/other.html"])
    (tmp_path / "other.html").write_text(html(title="Guide &#38; notes", canonical=ORIGIN + "/other.html"))
    report = audit(tmp_path, settings())
    for rule in ["title-unique", "description-unique"]:
        assert {v["page"] for v in report["violations"] if v["rule"] == rule} == {
            "guide/index.html", "other.html",
        }


def test_sitemap_set_equality_is_independent_of_canonical(tmp_path):
    report = audit(site(tmp_path, urls=[ORIGIN + "/missing/", URL, URL]), settings())
    assert {"sitemap-missing-file", "sitemap-duplicate"} <= rules(report)
    report = audit(site(tmp_path, urls=[]), settings())
    assert "indexable-not-in-sitemap" in rules(report)


@pytest.mark.parametrize("url", [
    "http://example.org/guide/", "https://elsewhere.example/guide/",
    URL + "?query=1", URL + "#part", ORIGIN + "/../outside.html",
    ORIGIN + "/%2e%2e/outside.html", "/guide/",
])
def test_sitemap_rejects_noncanonical_and_unsafe_urls(tmp_path, url):
    assert "sitemap-url" in rules(audit(site(tmp_path, urls=[url]), settings()))


def test_missing_and_malformed_inputs_never_look_like_a_pass(tmp_path):
    report = audit(tmp_path / "absent", settings())
    assert report["status"] == "NOT_EVALUATED"
    assert report["pages"] == []
    site(tmp_path)
    (tmp_path / "sitemap.xml").write_text("<broken")
    assert "sitemap-parse" in rules(audit(tmp_path, settings()))
    (tmp_path / "sitemap.xml").unlink()
    assert "sitemap-missing" in rules(audit(tmp_path, settings()))


def test_length_limits_have_no_invented_default(tmp_path):
    # Hand count: "Guide" is five characters. A synthetic max of four fails;
    # four is test input, not a search-engine recommendation.
    config = settings()
    assert config["length_limits"]["title"]["max"] is None
    report = audit(site(tmp_path), config)
    assert any(item["rule"] == "title-length" for item in report["not_evaluated"])
    config["length_limits"]["title"].update(max=4, source="synthetic fixture input")
    assert "title-length" in rules(audit(tmp_path, config))


def test_jsonld_graph_arrays_context_inheritance_and_reference_nodes(tmp_path):
    value = {"@context": "https://schema.org/", "@graph": [
        {"@type": ["Article", "Report"], "publisher": {"@id": "#organization"}},
        {"@type": "Dataset", "name": "Data", "description": "d" * 50},
    ]}
    report = audit(site(tmp_path, html(extra=ld(value))), settings())
    assert not {r for r in rules(report) if r.startswith("jsonld")}
    assert report["pages"][0]["json_ld_types"] == ["Article", "Dataset", "Report"]


@pytest.mark.parametrize("length,valid", [(49, False), (50, True), (5000, True), (5001, False)])
def test_dataset_description_documented_boundaries(tmp_path, length, valid):
    # Google Dataset, Required properties > description (2026): 50 to 5000.
    value = {"@context": "https://schema.org", "@type": "Dataset", "name": "Data", "description": "d" * length}
    report = audit(site(tmp_path, html(extra=ld(value))), settings())
    assert ("jsonld-dataset-description" not in rules(report)) is valid


def test_breadcrumbs_require_two_items_and_positions_but_final_item_can_omit_url(tmp_path):
    # Google Breadcrumb (2026), BreadcrumbList and ListItem tables: two items,
    # position begins at one; last item URL and nested item names are optional.
    value = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "item": {"@id": ORIGIN, "name": "Home"}},
        {"@type": "ListItem", "position": 2, "name": "Guide"},
    ]}
    assert "jsonld-breadcrumb" not in rules(audit(site(tmp_path, html(extra=ld(value))), settings()))
    value["itemListElement"][0]["position"] = 0
    assert "jsonld-breadcrumb" in rules(audit(site(tmp_path, html(extra=ld(value))), settings()))
    value["itemListElement"] = []
    assert "jsonld-breadcrumb" in rules(audit(site(tmp_path, html(extra=ld(value))), settings()))


def test_allowlist_is_exact_reasoned_and_stale_entries_fail(tmp_path):
    site(tmp_path, html(body=""))
    config = settings()
    entry = {"page": "guide/index.html", "rule": "h1-count", "detail": "expected 1; found 0", "reason": "Synthetic redirect fixture."}
    config["allowlist"] = [entry]
    report = audit(tmp_path, config)
    assert report["unapproved"] == []
    assert report["violations"][0]["allowed"] is True
    config["allowlist"][0]["detail"] = "different count"
    assert audit(tmp_path, config)["unapproved"]
    assert audit(tmp_path, config)["stale_allowlist"]
    config["allowlist"] = [{**entry, "reason": ""}]
    assert audit(tmp_path, config)["status"] == "FAIL"


def test_noindex_exempts_social_and_sitemap_membership_but_not_heading(tmp_path):
    markup = '<head><title>Redirect</title><meta name="description" content="Redirect."><meta name="robots" content="none"><link rel="canonical" href="https://example.org/destination/"></head><h1>Moved</h1>'
    report = audit(site(tmp_path, markup, urls=[]), settings())
    assert report["status"] == "PASS"
    assert not report["pages"][0]["indexable"]


def test_noindex_still_requires_one_absolute_canonical(tmp_path):
    markup = html(extra='<meta name="robots" content="noindex">').replace(
        f'<link rel="canonical" href="{URL}">', ''
    )
    assert "canonical-count" in rules(audit(site(tmp_path, markup, urls=[]), settings()))


def test_og_arrays_are_allowed_and_empty_values_do_not_supply_required_fields(tmp_path):
    markup = html(extra='<meta property="og:image" content="https://example.org/other.png">')
    assert audit(site(tmp_path, markup), settings())["status"] == "PASS"


def test_jsonld_array_rejects_scalar_entries_and_graph_needs_nodes(tmp_path):
    for value in [[3], {"@context": "https://schema.org", "@graph": "not nodes"}]:
        assert "jsonld-shape" in rules(audit(site(tmp_path, html(extra=ld(value))), settings()))


def test_report_is_deterministic_and_cli_check_returns_failure(tmp_path):
    site(tmp_path, html(body=""))
    report = audit(tmp_path, settings())
    output = tmp_path / "result.json"
    write_report(report, output)
    assert json.loads(output.read_text()) == report
    assert audit(tmp_path, settings()) == report
    config_file = tmp_path / "settings.json"
    config_file.write_text(json.dumps(settings()))
    result = subprocess.run([
        sys.executable, str(ROOT / "scripts/seo/audit.py"), "--built-root", str(tmp_path),
        "--config", str(config_file), "--output", str(output), "--check",
    ], capture_output=True, text=True, check=False)
    assert result.returncode == 1
    assert json.loads(output.read_text())["status"] == "FAIL"


def test_only_head_metadata_counts_and_templates_do_not_add_headings():
    page = read_page(html(body='<template><h1>Hidden</h1></template><h1>Guide</h1><meta name="description" content="Body">'))
    assert page["description"] == ["A guide."]
    assert page["h1_count"] == 1


def test_documented_worked_example_has_hand_counted_answer(tmp_path):
    # The documentation's literal HTML is independent input: Guide = 5 code
    # points; A guide. = 8. Each required head field and the h1 occurs once.
    text = (ROOT / "docs/seo-metadata.md").read_text()
    example = text.split("```html\n", 1)[1].split("```", 1)[0]
    report = audit(site(tmp_path, example), settings())
    assert report["status"] == "PASS"
    assert report["violations"] == []
    assert report["pages"][0]["lengths"] == {"title": [5], "description": [8]}


def test_committed_allowlist_has_unique_exact_entries_and_evidence():
    # Independent source inventory tally, written out in the documentation:
    # 50 card omissions + 10 repeated redirect descriptions + 1 home breadcrumb.
    entries = CONFIG["allowlist"]
    assert len(entries) == 61
    assert len({(entry["page"], entry["rule"], entry["detail"]) for entry in entries}) == 61
    assert all(entry["reason"].strip() and "*" not in entry["page"] for entry in entries)
    assert all(entry["source"] in CONFIG["sources"] for entry in CONFIG["structured_data"]["required"].values())


def test_malformed_empty_attributes_are_diagnostics_instead_of_crashes(tmp_path):
    markup = html().replace('content="A guide."', 'content').replace(
        f'href="{URL}"', 'href'
    )
    assert {"description-count", "canonical-https"} <= rules(audit(site(tmp_path, markup), settings()))


def test_malformed_breadcrumb_urls_are_diagnostics_instead_of_crashes(tmp_path):
    value = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"position": 1, "name": "Home", "item": {"@id": {"bad": "shape"}}},
        {"position": 2, "name": "Guide"},
    ]}
    assert "jsonld-breadcrumb" in rules(audit(site(tmp_path, html(extra=ld(value))), settings()))
