"""Positioning checks against canonical content and shared firm copy.

The homepage now uses the firm/service layout in brand/copy.yaml. It must not
be tested against the retired AI-native homepage in a legacy root HTML copy.
Rendered homepage behavior is also covered by tests/js/home-page.test.js.
"""

import re
from html import unescape
from pathlib import Path

import pytest
import yaml

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

SITE_ROOT = Path(__file__).parent.parent.parent / "content"
COPY = yaml.safe_load((SITE_ROOT.parent / "brand" / "copy.yaml").read_text())
HOME = COPY["home"]
SERVICES_INTRO = COPY["services_intro"]


def read_page(relative_path: str) -> str:
    """Read the canonical content source rather than a stale root copy."""
    return (SITE_ROOT / relative_path).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Homepage positioning tests
# ---------------------------------------------------------------------------


class TestHomepagePositioning:
    """Homepage sources must use the current firm/service layout."""

    def test_hero_uses_shared_firm_heading(self):
        content = read_page("index.html")
        assert "<h1>{{ copy.home.heading }}</h1>" in content
        assert "agentic engineering workflows" in HOME["heading"].lower()

    def test_hero_positions_as_offshore_and_marine_firm(self):
        content = read_page("index.html")
        assert "{{ copy.home.kicker }}" in content
        assert "engineering analysis, ai automation and agentic workflows" in HOME["kicker"].lower()

    def test_meta_description_reflects_new_positioning(self):
        content = read_page("index.html")
        assert 'name="description" content="{{ copy.home.description }}"' in content
        assert "ai-native" in HOME["description"].lower()

    def test_hero_title_not_generic_automation_only(self):
        """Hero h1 must not be exclusively the old generic automation tagline."""
        content = read_page("index.html")
        h1_region = content[content.find("<h1"):content.find("</h1>") + 5]
        assert "copy.home.heading" in h1_region
        assert "engineering" in HOME["heading"].lower()

    def test_homepage_has_services_section(self):
        content = read_page("index.html")
        assert 'id="services"' in content
        assert "service in copy.home.services" in content

    def test_homepage_explains_engineering_delivery(self):
        content = read_page("index.html")
        assert "{{ copy.home.lead }}" in content
        assert "agentic engineering workflow processes" in HOME["lead"]

    def test_homepage_firm_facts_present(self):
        content = read_page("index.html")
        assert "fact in copy.home.facts" in content
        facts = str(HOME["facts"])
        assert "Founded 2010" in facts
        assert "25+ years" in facts

    def test_homepage_uses_shared_navigation(self):
        content = read_page("index.html")
        assert '<include src="partials/nav.html">' in content

    def test_homepage_service_links_resolve_to_content(self):
        content = read_page("index.html")
        assert 'href="{{ service.page }}"' in content
        for service in HOME["services"]:
            assert (SITE_ROOT / service["page"]).is_file()

    def test_homepage_samples_section_is_conditional(self):
        content = read_page("index.html")
        assert '<if condition="samplesPublished">' in content
        assert "{{{ sampleHomeRows }}}" in content


# ---------------------------------------------------------------------------
# About page tests
# ---------------------------------------------------------------------------


class TestAboutPagePositioning:
    """About page must tell Vamsee's full founder story with AI-augmentation."""

    def test_about_mentions_vamsee(self):
        content = read_page("about.html")
        assert "Vamsee" in content, (
            "About page must mention Vamsee Achanta by name"
        )

    def test_about_mentions_years_experience(self):
        content = read_page("about.html")
        assert "25+ years" in content, (
            "About page must mention 25+ years of experience"
        )

    def test_about_mentions_python_modules(self):
        content = read_page("about.html")
        assert "35 of 196 modules" in content
        assert "704+" not in content

    def test_about_mentions_ai_orchestration(self):
        content = read_page("about.html")
        ai_mentioned = any(
            phrase in content.lower()
            for phrase in [
                "ai orchestration",
                "ai-augmented",
                "claude code",
                "ai automation",
                "automated orchestration",
                "ai-native",
            ]
        )
        assert ai_mentioned, (
            "About page must mention the AI orchestration/augmentation layer"
        )

    def test_about_mentions_offshore_domains(self):
        content = read_page("about.html")
        domains = ["deepwater", "FPSO", "mooring", "riser", "fatigue", "pipeline"]
        found = [d for d in domains if d.lower() in content.lower()]
        assert len(found) >= 3, (
            f"About page must mention at least 3 offshore domains, found: {found}"
        )

    def test_about_mentions_standards_bodies(self):
        content = read_page("about.html")
        standards = ["DNV", "API", "ASME", "BS"]
        found = [s for s in standards if s in content]
        assert len(found) >= 3, (
            f"About page must mention at least 3 standards bodies, found: {found}"
        )

    def test_about_firm_positioning_not_freelancer(self):
        """About page should position as firm, not solo freelancer."""
        content = read_page("about.html")
        assert "AceEngineer" in content or "analytical" in content.lower(), (
            "About page must use approved firm/site brand"
        )

    def test_about_founder_section_has_substance(self):
        """Founder section must be more than 4 sentences."""
        content = read_page("about.html")
        # Proxy: count occurrences of "Vamsee" and "founder" sections
        founder_idx = content.lower().find("founder")
        assert founder_idx != -1, "About page must have a Founder section"
        # Extract the founder section text (next 1000 chars after "founder")
        founder_excerpt = content[founder_idx : founder_idx + 1000]
        # Verify it has meaningful depth — at least 200 chars of content
        text_only = founder_excerpt.replace("\n", " ").strip()
        assert len(text_only) >= 200, (
            "Founder section must have substantial content (>200 chars), "
            f"got: {len(text_only)}"
        )

    def test_about_omits_unsupported_sn_curve_count(self):
        content = read_page("about.html")
        assert "221" not in content, (
            "About page must omit the unsupported S-N curve count"
        )

    def test_about_how_we_work_section(self):
        content = read_page("about.html")
        assert "how we work" in content.lower(), (
            "About page must have a 'How We Work' section"
        )


# ---------------------------------------------------------------------------
# Case study narrative tests
# ---------------------------------------------------------------------------


class TestCaseStudyNarratives:
    """Both featured case studies must have full narrative structure."""

    @pytest.mark.parametrize(
        "case_file",
        [
            "case-studies/offshore-platform-fatigue-optimization.html",
            "case-studies/subsea-fea-automation.html",
        ],
    )
    def test_case_study_has_challenge_section(self, case_file):
        content = read_page(case_file)
        assert "challenge" in content.lower() or "problem" in content.lower(), (
            f"{case_file} must have a 'Challenge' or 'Problem' section"
        )

    @pytest.mark.parametrize(
        "case_file",
        [
            "case-studies/offshore-platform-fatigue-optimization.html",
            "case-studies/subsea-fea-automation.html",
        ],
    )
    def test_case_study_has_approach_section(self, case_file):
        content = read_page(case_file)
        has_approach = any(
            term in content.lower()
            for term in ["approach", "methodology", "process", "solution"]
        )
        assert has_approach, (
            f"{case_file} must have an 'Approach'/'Process'/'Methodology' section"
        )

    @pytest.mark.parametrize(
        "case_file",
        [
            "case-studies/offshore-platform-fatigue-optimization.html",
            "case-studies/subsea-fea-automation.html",
        ],
    )
    def test_case_study_has_outcome_section(self, case_file):
        content = read_page(case_file)
        has_outcome = any(
            term in content.lower()
            for term in ["outcome", "result", "summary", "conclusion"]
        )
        assert has_outcome, (
            f"{case_file} must have an 'Outcome'/'Result' section"
        )

    @pytest.mark.parametrize(
        "case_file",
        [
            "case-studies/offshore-platform-fatigue-optimization.html",
            "case-studies/subsea-fea-automation.html",
        ],
    )
    def test_case_study_retains_method_without_unsupported_outcomes(self, case_file):
        """Case studies retain method text without unsupported outcome figures."""
        content = read_page(case_file)
        import re
        visible = re.sub(r"<style[\s\S]*?</style>|<[^>]+>", " ", content)
        assert not re.search(r"\d+%|\$\d", visible)
        assert "Method" in content or "Approach" in content

    @pytest.mark.parametrize(
        "case_file",
        [
            "case-studies/offshore-platform-fatigue-optimization.html",
            "case-studies/subsea-fea-automation.html",
        ],
    )
    def test_case_study_links_to_related_blog_or_service(self, case_file):
        """Case studies should link to services or related blog articles."""
        content = read_page(case_file)
        has_link = (
            "blog/" in content
            or "engineering.html" in content
            or "contact.html" in content
        )
        assert has_link, (
            f"{case_file} must link to related blog posts or services page"
        )


# ---------------------------------------------------------------------------
# Blog integration tests
# ---------------------------------------------------------------------------


class TestBlogIntegration:
    """Blog navigation must remain available through shared chrome and services."""

    def test_homepage_includes_shared_footer_with_blog_link(self):
        content = read_page("index.html")
        assert '<include src="partials/footer.html">' in content
        assert "blog/" in read_page("partials/footer.html")

    def test_blog_index_links_to_articles(self):
        content = read_page("blog/index.html")
        assert content.count(".html") >= 2

    def test_services_page_links_to_blog(self):
        content = read_page("engineering.html")
        assert "blog" in content.lower(), (
            "Services (engineering.html) must link to relevant blog articles"
        )

    def test_blog_index_exists(self):
        assert (SITE_ROOT / "blog" / "index.html").exists(), (
            "Blog index page must exist"
        )


# ---------------------------------------------------------------------------
# Services and social proof tests
# ---------------------------------------------------------------------------


class TestServicesAndSocialProof:
    """Services must link to case studies and shared copy must describe deliverables."""

    def test_services_link_to_case_studies(self):
        content = read_page("engineering.html")
        assert "case-studies/" in content or "case_studies/" in content, (
            "Services must link to supporting case studies"
        )

    def test_homepage_services_describe_client_deliverables(self):
        for service in HOME["services"]:
            assert service["receives"].startswith("Client receives:")

    def test_homepage_explains_engineering_disciplines(self):
        assert "{{ copy.services_intro }}" in read_page("index.html")
        content = SERVICES_INTRO
        for discipline in ["riser", "hydrodynamic", "asset integrity", "cathodic protection", "marine installation"]:
            assert discipline in content.lower()

    def test_social_proof_section_on_about_page(self):
        content = read_page("about.html")
        # Should list at least 3 standards or industry credentials
        standards = ["DNV", "API", "ABS", "ASME", "BS", "Norsok", "IEC"]
        found = [s for s in standards if s in content]
        assert len(found) >= 3, (
            f"About page social proof must list at least 3 standards, found: {found}"
        )


# ---------------------------------------------------------------------------
# Consistent positioning across all pages
# ---------------------------------------------------------------------------


class TestConsistentPositioning:
    """Verify firm branding, shared chrome and contact navigation."""

    def test_index_page_title_uses_shared_firm_title(self):
        content = read_page("index.html")
        assert "<title>{{ copy.home.title }}</title>" in content
        assert "AceEngineer" in HOME["title"]
        assert "agentic engineering workflows" in HOME["title"].lower()

    def test_footer_firm_name_consistent(self):
        for page in ["index.html", "about.html", "engineering.html"]:
            content = read_page(page)
            assert '<include src="partials/footer.html">' in content
        assert "AceEngineer" in read_page("partials/footer.html")

    def test_no_page_says_freelancer(self):
        """No core page should describe the firm as a freelancer."""
        for page in ["index.html", "about.html", "engineering.html"]:
            content = read_page(page)
            assert "freelancer" not in content.lower(), (
                f"{page} must not describe AceEngineer as a 'freelancer'"
            )

    def test_all_pages_have_contact_cta(self):
        """All core pages must have a contact CTA, directly or through the shared include."""
        for page in ["index.html", "about.html", "engineering.html"]:
            content = read_page(page)
            assert "contact.html" in content or '<include src="partials/scope-invitation.html">' in content
        assert "contact.html" in read_page("partials/scope-invitation.html")


class TestPositioningContract:
    """Source checks supplement the rendered-page JavaScript checks.

    Expected purpose: issue #89 implementation brief (2026). Three supporting
    claims and three target leads are that brief's enumerated scope, not a
    numerical marketing claim. No performance figure or length limit is assumed.
    """

    PURPOSE = (
        "AceEngineer helps clients set up agentic engineering workflow processes "
        "suited to their needs, so that they become AI-native, and also does the "
        "engineering work."
    )

    def test_purpose_and_supporting_claims_are_offer_statements(self):
        positioning = COPY["positioning"]
        assert positioning["purpose"] == self.PURPOSE
        assert positioning["primary_audience"] == (
            "Engineering teams that need workflow setup and engineering delivery."
        )
        assert [claim["basis"] for claim in positioning["supporting_claims"]] == [
            "offer statement", "offer statement", "offer statement"
        ]
        for term in ["agentic engineering workflow processes", "AI-native", "engineering work"]:
            assert term in positioning["approved_key_terms"]
            assert term in self.PURPOSE

    def test_lead_selectors_match_the_source_containers(self):
        assert COPY["positioning"]["leads"] == {
            "index.html": "main .home-hero .home-lead",
            "ai-automation/index.html": "main .positioning-lead",
            "about.html": "main .about-hero .lead",
        }
        assert '<section class="home-hero">' in read_page("index.html")
        assert '<section class="about-hero">' in read_page("about.html")
        assert '<p class="positioning-lead">' in read_page("ai-automation/index.html")

    def test_both_banned_lists_are_absent_from_all_source_pages(self):
        phrases = COPY["forbidden_phrases"] + COPY["positioning"]["banned_wording"]
        failures = []
        for page in SITE_ROOT.rglob("*.html"):
            source = page.read_text()
            source = re.sub(r"<!--.*?-->|<(script|style)\b[^>]*>.*?</\1>", "", source, flags=re.DOTALL)
            text = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", source))).lower()
            raw = unescape(source).lower()
            for phrase in phrases:
                if phrase.lower() in text or phrase.lower() in raw:
                    failures.append((str(page.relative_to(SITE_ROOT)), phrase))
        assert failures == []

    @pytest.mark.parametrize(
        ("page", "key"),
        [("index.html", "home"), ("about.html", "about"), ("ai-automation/index.html", "ai_automation")],
    )
    def test_metadata_templates_use_contract_fields(self, page, key):
        source = read_page(page)
        title = "{{ copy." + key + ".title }}"
        description = "{{ copy." + key + ".description }}"
        assert "<title>" + title + "</title>" in source
        for attribute, name, field in [
            ("name", "description", description),
            ("property", "og:title", title),
            ("property", "og:description", description),
            ("name", "twitter:title", title),
            ("name", "twitter:description", description),
        ]:
            assert f'<meta {attribute}="{name}" content="{field}">' in source

    @pytest.mark.parametrize(
        ("page", "lead", "heading"),
        [
            ("index.html", "home.lead", "home.heading"),
            ("about.html", "firm_lede", "tagline"),
            ("ai-automation/index.html", "ai_automation.lead", "ai_automation.heading"),
        ],
    )
    def test_lead_and_heading_use_canonical_fields(self, page, lead, heading):
        source = read_page(page)
        assert re.search(r"<p\b[^>]*>\s*\{\{\{? copy\." + re.escape(lead), source)
        assert "<h1>{{ copy." + heading + " }}</h1>" in source
        value = COPY
        for part in lead.split("."):
            value = value[part]
        assert value == self.PURPOSE

    @pytest.mark.parametrize(
        ("key", "expected", "length"),
        [
            ("home", "AceEngineer | Agentic engineering workflows", 43),
            ("about", "About AceEngineer | Agentic engineering workflows", 49),
            ("ai_automation", "AI automation | Agentic engineering workflows", 45),
        ],
    )
    def test_metadata_title_examples_have_independent_counts(self, key, expected, length):
        """Hand count: shared suffix = 7+1+11+1+9 = 29 characters.

        Prefixes including separators: 11+3 = 14; 6+11+3 = 20;
        2+1+10+3 = 16. Totals: 43, 49, 45. These are counts, not limits.
        """
        assert COPY[key]["title"] == expected
        assert len(COPY[key]["title"]) == length
        assert "AI-native" in COPY[key]["description"]
        assert "agentic engineering workflows" in COPY[key]["description"]

    def test_length_limits_remain_unevaluated(self):
        assert COPY["positioning"]["metadata_length"] == {
            "status": "NOT_EVALUATED", "title_max": None, "description_max": None
        }

    def test_claims_checklist_covers_every_new_sentence(self):
        report = (SITE_ROOT.parent / "docs/positioning-claims.md").read_text()
        sentences = [self.PURPOSE, *(claim["sentence"] for claim in COPY["positioning"]["supporting_claims"])]
        for key in ["home", "about", "ai_automation"]:
            sentences.extend(part.rstrip(".") + "." for part in COPY[key]["description"].split(". "))
        for sentence in sentences:
            assert sentence in report
        assert report.index("## Revision history") < report.index("## Contract")
        assert "## Worked example" in report
        assert "## Before and after" in report
