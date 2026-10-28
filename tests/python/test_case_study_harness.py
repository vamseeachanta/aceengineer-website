"""Synthetic expectations are hand counts, not snapshots of the implementation.

The fixture has one h1, three h2 sections (Scope, Method, Summary), two unique
titles/descriptions and two sitemap locations. WCAG 2.2 SC 1.3.1, 1.1.1,
2.4.1, 2.4.4 and 2.4.6 supply the accessibility basis; exact structural rules
are the local contract documented in docs/case-study-consistency.md.
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

from tests.python.case_study_harness import CHECKS, audit, discover, write_report

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture
def site(tmp_path):
    """Two literal pages, each with a same-page anchor and a report link."""
    (tmp_path / "content/case-studies").mkdir(parents=True)
    (tmp_path / "content/partials").mkdir()
    (tmp_path / "brand").mkdir()
    (tmp_path / "brand/copy.yaml").write_text(
        "forbidden_phrases:\n  - restricted fixture token\n"
    )
    (tmp_path / "content/partials/nav.html").write_text(
        '<a class="skip-link" href="#main">Skip to main content</a>'
    )
    (tmp_path / "dist/case-studies").mkdir(parents=True)
    (tmp_path / "dist/reports").mkdir()
    (tmp_path / "dist/reports/example.html").write_text('<h1 id="answer">Answer</h1>')
    config = {
        "section_template": ["Scope", "Method", "Summary"],
        "section_overrides": {},
        "name_deny_list": None,
    }
    (tmp_path / "contract.json").write_text(json.dumps(config))
    for name in ("a", "b"):
        html = f'''<!doctype html><html><head><title>Example {name}</title>
<meta name="description" content="Description {name}">
<link rel="canonical" href="https://example.invalid/case-studies/{name}.html">
<script type="application/ld+json">{{"@graph":[{{"@type":"WebPage"}},
{{"@type":"BreadcrumbList"}}]}}</script></head><body>
<a class="skip-link" href="#main">Skip to main content</a><main id="main">
<h1>Example</h1><h2>Scope</h2><h2>Method</h2><h2>Summary</h2>
<a href="#main">Method</a><a href="../reports/example.html#answer">Report</a>
<img alt="" src="decoration.svg"><table><tr><th>Input</th></tr>
<tr><td>synthetic</td></tr></table></main></body></html>'''
        (tmp_path / f"dist/case-studies/{name}.html").write_text(html)
        (tmp_path / f"content/case-studies/{name}.html").write_text(
            html.replace('<main id="main">',
                         '<include src="partials/nav.html"></include><main id="main">')
        )
    (tmp_path / "dist/sitemap.xml").write_text(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        '<url><loc>https://example.invalid/case-studies/a.html</loc></url>'
        '<url><loc>https://example.invalid/case-studies/b.html</loc></url></urlset>'
    )
    return tmp_path


def results(site):
    return audit(site, contract_path=site / "contract.json")


def row(site, check, page="a.html"):
    return next(r for r in results(site)
                if r.check == check and r.page == f"case-studies/{page}")


def change(site, old, new, *, built=False, page="a.html"):
    base = "dist" if built else "content"
    path = site / base / "case-studies" / page
    text = path.read_text()
    assert old in text, "fixture mutation must affect the intended input"
    path.write_text(text.replace(old, new))


def test_declared_checks_cover_each_discovered_page(site):
    expected = {f"case-studies/{p}.html" for p in ("a", "b")}
    assert {p.as_posix() for p in discover(site)} == expected
    rows = results(site)
    assert {(r.page, r.check) for r in rows} == {
        (page, check.id) for page in expected for check in CHECKS
    }
    assert all(r.status == "PASS" for r in rows
               if r.check not in {"private_names", "browser_accessibility"})
    assert row(site, "private_names").status == "NOT_EVALUATED"
    assert row(site, "browser_accessibility").status == "NOT_EVALUATED"


def test_discovery_is_recursive_and_empty_input_fails(site):
    nested = site / "content/case-studies/nested"
    nested.mkdir()
    (nested / "new.html").write_text("<h1>New</h1>")
    assert Path("case-studies/nested/new.html") in discover(site)
    empty = site / "empty"
    empty.mkdir()
    with pytest.raises(ValueError, match="No case-study pages"):
        audit(empty, contract_path=site / "contract.json")


@pytest.mark.parametrize(("old", "new", "check"), [
    ("<h1>Example</h1>", "", "h1"),
    ("<h1>Example</h1>", "<h1>Example</h1><h1>Again</h1>", "h1"),
    ("<h2>Scope</h2>", "<h3>Scope</h3>", "heading_order"),
    ("<title>Example a</title>", "<title> </title>", "title"),
    ('content="Description a"', 'content=" "', "description"),
    ("Example a</title>", "Example b</title>", "title"),
    ('content="Description a"', 'content="Description b"', "description"),
    ('{"@type":"BreadcrumbList"}', '{"@type":"Thing"}', "json_ld"),
    ('{"@type":"WebPage"}', '{"@type":"Article"}', "json_ld"),
    ('{"@graph":', '{broken:', "json_ld"),
    ("<h2>Method</h2>", "<h2>Unexpected</h2>", "sections"),
    ("<h2>Scope</h2><h2>Method</h2>",
     "<h2>Method</h2><h2>Scope</h2>", "sections"),
    ('alt=""', "", "image_alt"),
    ('<main id="main">', '<div id="main">', "landmark_skip"),
    ('src="partials/nav.html"', 'src="partials/missing.html"', "landmark_skip"),
    (">Method</a>", ">Click Here</a>", "link_text"),
    ("<th>Input</th>", "<td>Input</td>", "table_headers"),
    ("<th>Input</th>", "<th> </th>", "table_headers"),
    ("<h1>Example</h1>", "<h1>Restricted Fixture Token</h1>", "copy_deny_list"),
])
def test_source_mutations_fail_with_page_and_check(site, old, new, check):
    change(site, old, new)
    result = row(site, check)
    assert result.status == "FAIL", result
    assert "case-studies/a.html" in result.message and check in result.message


def test_closing_subsections_can_return_to_a_lower_heading_rank(site):
    """WAI headings tutorial permits h4 to h2 when closing a subsection."""
    change(site, "<h2>Scope</h2>", "<h2>Scope</h2><h3>Part</h3><h4>Detail</h4>")
    assert row(site, "heading_order").status == "PASS"


def test_worked_heading_example_fails_then_passes_after_fix(site):
    """Hand count: h2 to h4 skips h3; changing h4 to h3 removes the skip."""
    change(site, "<h2>Method</h2>", "<h2>Method</h2><h4>Detail</h4>")
    assert row(site, "heading_order").status == "FAIL"
    change(site, "<h4>Detail</h4>", "<h3>Detail</h3>")
    assert row(site, "heading_order").status == "PASS"


@pytest.mark.parametrize(("old", "new", "check"), [
    ("https://example.invalid/case-studies/a.html", "https://example.invalid/wrong.html",
     "canonical_sitemap"),
    ('rel="canonical"', 'rel="alternate"', "canonical_sitemap"),
    ('href="#main"', 'href="#missing"', "internal_links"),
    ('href="#main"', 'href=""', "href_format"),
    ('href="#main"', 'href="#"', "href_format"),
    ('href="#main"', 'href="javascript:void(0)"', "href_format"),
    ('href="#main"', 'href="//elsewhere.invalid/path"', "href_format"),
    ('href="#main"', 'href="http://elsewhere.invalid/path"', "href_format"),
    ('href="#main"', 'href="missing.html"', "internal_links"),
    ('href="#main"', 'href="https://example.invalid/missing.html"', "internal_links"),
    ('href="#main"', 'href="../reports/missing.html"', "report_links"),
    ('href="#main"', 'href="../reports/example.html#missing"', "report_links"),
    ('class="skip-link"', 'class="ordinary-link"', "landmark_skip"),
])
def test_built_mutations(site, old, new, check):
    change(site, old, new, built=True)
    assert row(site, check).status == "FAIL"


def test_internal_urls_decode_anchors_and_ignore_query_strings(site):
    change(site, 'href="#main"', 'href="a.html?view=full#ma%69n"', built=True)
    assert row(site, "internal_links").status == "PASS"
    change(site, 'href="a.html?view=full#ma%69n"',
           'href="https://elsewhere.invalid/path"', built=True)
    assert row(site, "href_format").status == "PASS"


@pytest.mark.parametrize("href", ["https://[", "https:///missing", "TODO", "[target]"])
def test_invalid_or_placeholder_urls_produce_findings(site, href):
    change(site, 'href="#main"', f'href="{href}"', built=True)
    assert row(site, "href_format").status == "FAIL"


def test_non_anchor_href_is_also_checked(site):
    """Hand count: one added stylesheet link, pointing to a missing built file."""
    change(site, "</head>", '<link rel="stylesheet" href="missing.css"></head>', built=True)
    assert row(site, "internal_links").status == "FAIL"


def test_link_without_href_is_not_a_named_anchor(site):
    change(site, 'href="#main"', '', built=True)
    assert row(site, "href_format").status == "FAIL"


def test_partial_skip_target_must_bind_to_source_main(site):
    (site / "content/partials/nav.html").write_text(
        '<a class="skip-link" href="#missing">Skip to main content</a>'
    )
    assert row(site, "landmark_skip").status == "FAIL"


def test_sitemap_must_parse_and_have_one_matching_location(site):
    path = site / "dist/sitemap.xml"
    original = path.read_text()
    path.write_text("<broken>")
    assert row(site, "canonical_sitemap").status == "FAIL"
    path.write_text(original.replace('</urlset>',
        '<url><loc>https://example.invalid/case-studies/a.html</loc></url></urlset>'))
    assert row(site, "canonical_sitemap").status == "FAIL"


def test_malformed_canonical_is_a_finding_instead_of_aborting(site):
    change(site, "https://example.invalid/case-studies/a.html", "https://[", built=True)
    assert row(site, "canonical_sitemap").status == "FAIL"
    assert row(site, "internal_links").status == "FAIL"


def test_unknown_fragment_does_not_hide_a_broken_link(site):
    (site / "dist/reports/example.pdf").write_text("Synthetic format placeholder")
    change(site, 'href="#main"', 'href="missing.html"', built=True)
    change(site, "</main>",
           '<a href="../reports/example.pdf#page=1">Document</a></main>', built=True)
    assert row(site, "internal_links").status == "FAIL"


def test_schema_collection_page_is_a_webpage_subtype(site):
    """schema.org CollectionPage lists WebPage in its type hierarchy."""
    change(site, '"@type":"WebPage"', '"@type":"CollectionPage"')
    assert row(site, "json_ld").status == "PASS"


def test_nested_json_ld_breadcrumb_is_recognized(site):
    change(site, '{"@graph":[{"@type":"WebPage"},\n{"@type":"BreadcrumbList"}]}',
           '{"@type":"WebPage","breadcrumb":{"@type":"BreadcrumbList"}}')
    assert row(site, "json_ld").status == "PASS"


def test_json_ld_rejects_non_json_numbers(site):
    change(site, '"@type":"WebPage"', '"@type":"WebPage","value":NaN')
    assert row(site, "json_ld").status == "FAIL"


def test_cli_can_require_a_completed_build(site):
    process = subprocess.run([
        sys.executable, str(ROOT / "tests/python/case_study_harness.py"),
        "--root", str(site), "--contract", str(site / "contract.json"),
        "--built-root", str(site / "unavailable"),
        "--report", str(site / "report.json"), "--require-built",
    ], capture_output=True, text=True, check=False)
    assert process.returncode == 1


def test_directory_index_and_named_anchor(site):
    (site / "dist/reports/index.html").write_text('<a name="answer">Answer</a>')
    change(site, 'href="#main"', 'href="../reports/#answer"', built=True)
    assert row(site, "internal_links").status == "PASS"


def test_json_ld_accepts_arrays_type_lists_and_rejects_non_nodes(site):
    change(site, '{"@graph":[{"@type":"WebPage"},\n{"@type":"BreadcrumbList"}]}',
           '[{"@type":["WebPage","Thing"]},{"@type":"BreadcrumbList"}]')
    assert row(site, "json_ld").status == "PASS"
    change(site, '[{"@type":["WebPage","Thing"]},{"@type":"BreadcrumbList"}]', 'null')
    assert row(site, "json_ld").status == "FAIL"


def test_sections_allow_list_is_exact_and_cannot_hide_new_drift(site):
    config_path = site / "contract.json"
    config = json.loads(config_path.read_text())
    config["section_overrides"]["case-studies/a.html"] = {
        "headings": ["Scope", "Legacy", "Summary"], "reason": "Synthetic legacy fixture"
    }
    config_path.write_text(json.dumps(config))
    change(site, "<h2>Method</h2>", "<h2>Legacy</h2>")
    assert row(site, "sections").status == "PASS"
    change(site, "<h2>Legacy</h2>", "<h2>New drift</h2>")
    assert row(site, "sections").status == "FAIL"


def test_private_name_list_is_loaded_and_never_echoed(site):
    """Only a synthetic token is supplied; no real names are embedded in tests."""
    config_path = site / "contract.json"
    config = json.loads(config_path.read_text())
    config["name_deny_list"] = {"path": "brand/copy.yaml", "key": "private_names"}
    config_path.write_text(json.dumps(config))
    with (site / "brand/copy.yaml").open("a") as stream:
        stream.write("private_names:\n  - restricted fixture token\n")
    change(site, "<h1>Example</h1>", "<h1>Restricted <em>Fixture</em> Token</h1>")
    result = row(site, "private_names")
    assert result.status == "FAIL"
    assert "restricted" not in result.message.lower()


def test_missing_build_is_not_a_false_pass(site):
    rows = audit(site, built_root=site / "unavailable", contract_path=site / "contract.json")
    assert {r.status for r in rows if r.check in {
        "canonical_sitemap", "internal_links", "report_links", "href_format"
    }} == {"NOT_EVALUATED"}
    assert next(r for r in rows if r.check == "h1").status == "PASS"


def test_report_is_deterministic_and_cli_failure_returns_nonzero(site):
    report = site / "report.json"
    write_report(results(site), report)
    first = report.read_bytes()
    write_report(results(site), report)
    assert report.read_bytes() == first
    rows = json.loads(first)["results"]
    assert {r["page"] for r in rows} == {"case-studies/a.html", "case-studies/b.html"}
    change(site, "<h1>Example</h1>", "")
    process = subprocess.run([
        sys.executable, str(ROOT / "tests/python/case_study_harness.py"),
        "--root", str(site), "--contract", str(site / "contract.json"),
        "--report", str(report),
    ], capture_output=True, text=True, check=False)
    assert process.returncode == 1
    assert "case-studies/a.html [h1] FAIL" in process.stdout


def test_repository_pages_follow_the_contract():
    """All source pages including the index are checked, without a fixed count."""
    rows = audit(ROOT)
    failures = [r.message for r in rows if r.status == "FAIL"]
    assert not failures, "\n".join(failures)
    assert {r.page for r in rows} == {p.as_posix() for p in discover(ROOT)}


def test_committed_report_has_every_page_and_check():
    report = json.loads((ROOT / "reports/case-study-consistency.json").read_text())
    rows = report["results"]
    assert {(r["page"], r["check"]) for r in rows} == {
        (page.as_posix(), check.id) for page in discover(ROOT) for check in CHECKS
    }
    assert len(rows) == len(discover(ROOT)) * len(CHECKS)
    assert all(r["status"] in {"PASS", "FAIL", "NOT_EVALUATED"} and r["details"] for r in rows)
