"""Tests for scripts/competitor_analysis.py.

Covers: load_keywords, get_all_keywords, calculate_opportunity_score,
        generate_seo_recommendations.
"""

from pathlib import Path

import pytest
import yaml

from competitor_analysis import (
    calculate_opportunity_score,
    generate_seo_recommendations,
    get_all_keywords,
    load_keywords,
)


# ---------------------------------------------------------------------------
# load_keywords
# ---------------------------------------------------------------------------


class TestLoadKeywords:
    """Tests for load_keywords() config file loading."""

    def test_load_valid_yaml(self, valid_keywords_yaml):
        config = load_keywords(valid_keywords_yaml)
        assert "keywords" in config
        assert "primary" in config["keywords"]
        assert len(config["keywords"]["primary"]) == 2

    def test_load_missing_file_raises(self, tmp_path):
        missing = tmp_path / "nonexistent.yaml"
        with pytest.raises(FileNotFoundError):
            load_keywords(missing)

    def test_load_invalid_yaml_raises(self, invalid_yaml_file):
        with pytest.raises(yaml.YAMLError):
            load_keywords(invalid_yaml_file)

    def test_load_preserves_all_sections(self, valid_keywords_yaml):
        config = load_keywords(valid_keywords_yaml)
        assert "competitors" in config
        assert "settings" in config
        assert config["settings"]["report_frequency"] == "weekly"

    def test_load_empty_yaml(self, tmp_path):
        empty = tmp_path / "empty.yaml"
        empty.write_text("")
        result = load_keywords(empty)
        assert result is None


# ---------------------------------------------------------------------------
# get_all_keywords
# ---------------------------------------------------------------------------


class TestGetAllKeywords:
    """Tests for get_all_keywords() keyword extraction."""

    def test_extracts_from_all_categories(self, valid_keywords_yaml):
        config = load_keywords(valid_keywords_yaml)
        keywords = get_all_keywords(config)
        assert len(keywords) == 5
        assert "orcaflex automation" in keywords
        assert "S-N curve calculator" in keywords
        assert "orcaflex python scripting" in keywords

    def test_handles_missing_categories(self, minimal_keywords_yaml):
        config = load_keywords(minimal_keywords_yaml)
        keywords = get_all_keywords(config)
        assert keywords == ["test keyword"]

    def test_handles_empty_keywords(self, empty_keywords_yaml):
        config = load_keywords(empty_keywords_yaml)
        keywords = get_all_keywords(config)
        assert keywords == []

    def test_handles_no_keywords_key(self):
        config = {"competitors": ["dnv.com"]}
        keywords = get_all_keywords(config)
        assert keywords == []

    def test_preserves_order(self, valid_keywords_yaml):
        config = load_keywords(valid_keywords_yaml)
        keywords = get_all_keywords(config)
        # primary comes first, then secondary, then long_tail
        assert keywords[0] == "orcaflex automation"
        assert keywords[1] == "fatigue analysis software"
        assert keywords[2] == "S-N curve calculator"
        assert keywords[4] == "orcaflex python scripting"


# ---------------------------------------------------------------------------
# calculate_opportunity_score
# ---------------------------------------------------------------------------


class TestCalculateOpportunityScore:
    """Tests for calculate_opportunity_score() scoring logic."""

    def test_base_score_no_position_no_competitors(self):
        score = calculate_opportunity_score(None, [])
        assert score == 50

    def test_top_10_position_bonus(self):
        score = calculate_opportunity_score(5, [])
        assert score == 80  # 50 base + 30

    def test_position_11_to_30_bonus(self):
        score = calculate_opportunity_score(20, [])
        assert score == 65  # 50 base + 15

    def test_position_beyond_30_small_bonus(self):
        score = calculate_opportunity_score(50, [])
        assert score == 55  # 50 base + 5

    def test_strong_competitors_reduce_score(self):
        competitors = [
            {"domain": "dnv.com", "position": 1},
            {"domain": "wood.com", "position": 2},
            {"domain": "orcina.com", "position": 3},
        ]
        score = calculate_opportunity_score(None, competitors)
        assert score == 20  # 50 base - 3*10

    def test_weak_competitors_no_penalty(self):
        competitors = [
            {"domain": "example.com", "position": 15},
            {"domain": "other.com", "position": 25},
        ]
        score = calculate_opportunity_score(None, competitors)
        assert score == 50  # no penalty, positions > 3

    def test_score_never_below_zero(self):
        many_strong = [{"domain": f"d{i}.com", "position": 1} for i in range(10)]
        score = calculate_opportunity_score(None, many_strong)
        assert score == 0

    def test_score_never_above_100(self):
        score = calculate_opportunity_score(1, [])
        assert score <= 100

    def test_mixed_competitor_strengths(self):
        competitors = [
            {"domain": "strong.com", "position": 2},
            {"domain": "weak.com", "position": 50},
        ]
        score = calculate_opportunity_score(None, competitors)
        assert score == 40  # 50 base - 1*10

    def test_position_boundary_at_10(self):
        score_at_10 = calculate_opportunity_score(10, [])
        score_at_11 = calculate_opportunity_score(11, [])
        assert score_at_10 == 80  # 50 + 30
        assert score_at_11 == 65  # 50 + 15

    def test_position_boundary_at_30(self):
        score_at_30 = calculate_opportunity_score(30, [])
        score_at_31 = calculate_opportunity_score(31, [])
        assert score_at_30 == 65  # 50 + 15
        assert score_at_31 == 55  # 50 + 5

    def test_competitor_missing_position_key(self):
        competitors = [{"domain": "no-pos.com"}]
        # position defaults to 100 via .get("position", 100) so > 3
        score = calculate_opportunity_score(None, competitors)
        assert score == 50


# ---------------------------------------------------------------------------
# generate_seo_recommendations
# ---------------------------------------------------------------------------


class TestGenerateSeoRecommendations:
    """Tests for generate_seo_recommendations() recommendation engine."""

    def test_always_includes_general_recommendations(self):
        recs = generate_seo_recommendations([])
        categories = [r["category"] for r in recs]
        assert "Technical SEO" in categories
        assert "Content" in categories
        assert "Social" in categories

    def test_high_opportunity_triggers_content_creation_rec(self):
        results = [
            {"keyword": "good keyword", "opportunity_score": 70},
            {"keyword": "another good", "opportunity_score": 65},
        ]
        recs = generate_seo_recommendations(results)
        high_priority = [r for r in recs if r["priority"] == "high" and r["category"] == "Content Creation"]
        assert len(high_priority) == 1
        assert "good keyword" in high_priority[0]["description"]

    def test_near_ranking_triggers_link_building_rec(self):
        results = [
            {"keyword": "close keyword", "estimated_position": 15, "opportunity_score": 40},
            {"keyword": "far keyword", "estimated_position": 50, "opportunity_score": 30},
        ]
        recs = generate_seo_recommendations(results)
        link_building = [r for r in recs if r["category"] == "Link Building"]
        assert len(link_building) == 1
        assert "close keyword" in link_building[0]["description"]
        assert "far keyword" not in link_building[0]["description"]

    def test_no_high_opportunity_omits_content_creation_rec(self):
        results = [
            {"keyword": "low opp", "opportunity_score": 30},
        ]
        recs = generate_seo_recommendations(results)
        content_creation = [r for r in recs if r["category"] == "Content Creation"]
        assert len(content_creation) == 0

    def test_no_near_ranking_omits_link_building_rec(self):
        results = [
            {"keyword": "not ranking", "estimated_position": None, "opportunity_score": 50},
            {"keyword": "ranking high", "estimated_position": 5, "opportunity_score": 60},
        ]
        recs = generate_seo_recommendations(results)
        link_building = [r for r in recs if r["category"] == "Link Building"]
        assert len(link_building) == 0

    def test_high_opportunity_limits_to_3_keywords(self):
        results = [
            {"keyword": f"kw{i}", "opportunity_score": 80}
            for i in range(5)
        ]
        recs = generate_seo_recommendations(results)
        content_creation = [r for r in recs if r["category"] == "Content Creation"]
        assert len(content_creation) == 1
        # Description should mention at most 3 keywords
        desc = content_creation[0]["description"]
        mentioned = [f"kw{i}" for i in range(5) if f"kw{i}" in desc]
        assert len(mentioned) <= 3

    def test_near_ranking_range_11_to_30(self):
        results = [
            {"keyword": "pos10", "estimated_position": 10, "opportunity_score": 50},
            {"keyword": "pos11", "estimated_position": 11, "opportunity_score": 50},
            {"keyword": "pos30", "estimated_position": 30, "opportunity_score": 50},
            {"keyword": "pos31", "estimated_position": 31, "opportunity_score": 50},
        ]
        recs = generate_seo_recommendations(results)
        link_building = [r for r in recs if r["category"] == "Link Building"]
        assert len(link_building) == 1
        desc = link_building[0]["description"]
        assert "pos11" in desc
        assert "pos30" in desc
        assert "pos10" not in desc
        assert "pos31" not in desc

    def test_recommendation_structure(self):
        results = [{"keyword": "test", "opportunity_score": 75, "estimated_position": 20}]
        recs = generate_seo_recommendations(results)
        for rec in recs:
            assert "priority" in rec
            assert "category" in rec
            assert "title" in rec
            assert "description" in rec
            assert rec["priority"] in ("high", "medium", "low")
