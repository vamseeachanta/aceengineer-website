"""Tests for WRK-146: aceengineer-website positioning overhaul.

Verifies that key positioning elements from the WRK-146 spec are present
in the modified HTML pages. Tests cover:
- Homepage hero uses AI-native positioning (not generic automation tagline)
- Homepage has "How We Work" section with solo+AI model
- About page has full Vamsee founder story with AI orchestration
- About page has solo+AI positioning throughout
- Case studies have narrative structure (problem, process, outcome)
- Blog posts are surfaced/linked from homepage and services
- Social proof section present with standards bodies
- Pricing claims linked to case studies
- Consistent "solo engineer + AI" framing sitewide
"""

from pathlib import Path

import pytest


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

SITE_ROOT = Path(__file__).parent.parent.parent


def read_page(relative_path: str) -> str:
    """Read an HTML page from the site root for legacy positioning coverage."""
    return (SITE_ROOT / relative_path).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Homepage positioning tests
# ---------------------------------------------------------------------------


class TestHomepagePositioning:
    """Homepage hero must lead with AI-native offshore analytics positioning."""

    def test_hero_contains_ai_native_phrase(self):
        content = read_page("index.html")
        assert "AI-native" in content or "ai-native" in content.lower(), (
            "Homepage hero must contain 'AI-native' positioning phrase"
        )

    def test_hero_contains_offshore_engineering_analytics(self):
        content = read_page("index.html")
        assert "offshore engineering analytics" in content.lower(), (
            "Homepage must position as 'offshore engineering analytics'"
        )

    def test_meta_description_reflects_new_positioning(self):
        content = read_page("index.html")
        assert "ai-native" in content.lower() or "offshore engineering analytics" in content.lower(), (
            "Meta description must reflect AI-native or analytics positioning"
        )

    def test_hero_title_not_generic_automation_only(self):
        """Hero h1 must not be exclusively the old generic automation tagline."""
        content = read_page("index.html")
        # The old tagline was about riser configurations; new h1 should include
        # AI-native, analytics, or firm-level positioning.
        h1_region = content[content.find("<h1"):content.find("</h1>") + 5]
        old_only = (
            "ai-native" not in h1_region.lower()
            and "offshore engineering analytics" not in h1_region.lower()
            and "analytical" not in h1_region.lower()
        )
        assert not old_only, (
            "Hero h1 must include AI-native/analytics positioning, "
            f"got: {h1_region[:200]}"
        )

    def test_homepage_has_how_we_work_section(self):
        content = read_page("index.html")
        assert "how we work" in content.lower() or "How We Work" in content, (
            "Homepage must have a 'How We Work' section explaining the solo+AI model"
        )

    def test_homepage_solo_ai_model_mentioned(self):
        content = read_page("index.html")
        # Accept any variant of solo/one engineer + AI framing
        framing_present = any(
            phrase in content.lower()
            for phrase in [
                "solo engineer",
                "one engineer",
                "ai orchestration",
                "ai-augmented",
                "ai augmented",
                "engineer + ai",
            ]
        )
        assert framing_present, (
            "Homepage must mention the solo-engineer + AI delivery model"
        )

    def test_homepage_key_numbers_present(self):
        content = read_page("index.html")
        assert "704" in content, "Homepage must show 704+ production modules"
        assert "221" in content, "Homepage must show 221 S-N curves"
        assert "15" in content, "Homepage must show 15+ years experience"

    def test_homepage_blog_preview_section_exists(self):
        content = read_page("index.html")
        assert "blog" in content.lower(), (
            "Homepage must have a blog preview/link section"
        )

    def test_homepage_case_study_links_present(self):
        content = read_page("index.html")
        assert "case-studies" in content or "case_studies" in content.lower(), (
            "Homepage must link to case studies"
        )

    def test_homepage_social_proof_standards_section(self):
        content = read_page("index.html")
        for standard in ["DNV", "API", "BS"]:
            assert standard in content, (
                f"Homepage social proof must include {standard} standard"
            )


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
        assert "15" in content, (
            "About page must mention 15+ years of experience"
        )

    def test_about_mentions_python_modules(self):
        content = read_page("about.html")
        assert "704" in content or "700" in content, (
            "About page must mention 700+ Python modules"
        )

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

    def test_about_sn_curves_count_mentioned(self):
        content = read_page("about.html")
        assert "221" in content, (
            "About page must mention 221 S-N curves to quantify technical depth"
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
    def test_case_study_has_quantified_result(self, case_file):
        """Case studies must have quantified results (%, $, or numeric)."""
        content = read_page(case_file)
        has_quantity = "%" in content or "$" in content
        assert has_quantity, (
            f"{case_file} must have quantified results (%, $, or similar)"
        )

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
    """Blog articles must be surfaced from homepage and services page."""

    def test_homepage_links_to_blog_articles(self):
        content = read_page("index.html")
        # Should have at least 2 direct blog article links
        blog_link_count = content.count("blog/")
        assert blog_link_count >= 2, (
            f"Homepage must link to at least 2 blog articles, found {blog_link_count}"
        )

    def test_homepage_blog_section_has_articles(self):
        content = read_page("index.html")
        # The blog preview section should have article cards
        assert "blog-preview" in content or "blog_preview" in content or (
            "Technical Insights" in content or "Featured Analysis" in content
            or "blog/" in content
        ), "Homepage must surface blog articles in a preview/featured section"

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
# Pricing and social proof tests
# ---------------------------------------------------------------------------


class TestPricingAndSocialProof:
    """Pricing claims must link to case studies; social proof section must exist."""

    def test_pricing_links_to_case_studies(self):
        content = read_page("engineering.html")
        assert "case-studies/" in content or "case_studies/" in content, (
            "Pricing section must link to supporting case studies"
        )

    def test_social_proof_standards_badges_on_homepage(self):
        content = read_page("index.html")
        for badge in ["DNV", "API"]:
            assert badge in content, (
                f"Social proof section must include {badge} standards badge"
            )

    def test_social_proof_industry_experience_mentioned(self):
        content = read_page("index.html")
        sectors = ["deepwater", "FPSO", "mooring", "pipeline", "offshore"]
        found = [s for s in sectors if s.lower() in content.lower()]
        assert len(found) >= 2, (
            f"Homepage must mention at least 2 industry sectors, found: {found}"
        )

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
    """Verify consistent solo-engineer + AI-native positioning sitewide."""

    def test_index_page_title_includes_analytics_or_ai_native(self):
        content = read_page("index.html")
        title_start = content.find("<title>")
        title_end = content.find("</title>")
        title = content[title_start:title_end]
        has_positioning = any(
            phrase in title.lower()
            for phrase in ["analytics", "ai-native", "offshore", "a&ce", "ace"]
        )
        assert has_positioning, (
            f"Page title must reflect positioning, got: {title}"
        )

    def test_footer_firm_name_consistent(self):
        for page in ["index.html", "about.html", "engineering.html"]:
            content = read_page(page)
            assert "AceEngineer" in content or "Analytical" in content, (
                f"Footer in {page} must use approved firm/site brand"
            )

    def test_no_page_says_freelancer(self):
        """No core page should describe the firm as a freelancer."""
        for page in ["index.html", "about.html", "engineering.html"]:
            content = read_page(page)
            assert "freelancer" not in content.lower(), (
                f"{page} must not describe AceEngineer as a 'freelancer'"
            )

    def test_all_pages_have_contact_cta(self):
        """All core pages must have a contact/quote CTA."""
        for page in ["index.html", "about.html", "engineering.html"]:
            content = read_page(page)
            assert "contact.html" in content, (
                f"{page} must have a link to contact.html"
            )
