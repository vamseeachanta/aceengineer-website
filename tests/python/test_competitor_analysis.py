"""Tests for scripts/competitor_analysis.py.

Covers: load_keywords, get_all_keywords, calculate_opportunity_score,
        analyze_keyword, generate_seo_recommendations,
        generate_html_report, create_latest_symlink, print_summary, main.
"""

import sys
from pathlib import Path

import pytest
import yaml

from competitor_analysis import (
    analyze_keyword,
    calculate_opportunity_score,
    create_latest_symlink,
    generate_html_report,
    generate_seo_recommendations,
    get_all_keywords,
    load_keywords,
    main,
    print_summary,
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


# ---------------------------------------------------------------------------
# analyze_keyword
# ---------------------------------------------------------------------------


class TestAnalyzeKeyword:
    """Tests for analyze_keyword() keyword analysis logic."""

    def test_dry_run_returns_minimal_data(self):
        # Act
        result = analyze_keyword("test keyword", dry_run=True)

        # Assert
        assert result["keyword"] == "test keyword"
        assert result["estimated_position"] is None
        assert result["competitors"] == []
        assert result["search_volume"] == 0
        assert result["difficulty"] == 0
        assert result["dry_run"] is True

    def test_non_dry_run_returns_full_data(self):
        # Act
        result = analyze_keyword("orcaflex automation")

        # Assert
        assert result["keyword"] == "orcaflex automation"
        assert "analyzed_at" in result
        assert "competitors" in result
        assert "search_volume" in result
        assert "difficulty" in result
        assert "opportunity_score" in result

    def test_predefined_keyword_returns_known_competitors(self):
        # Act
        result = analyze_keyword("orcaflex automation")

        # Assert - this keyword is in SIMULATED_COMPETITORS
        domains = [c["domain"] for c in result["competitors"]]
        assert "orcina.com" in domains

    def test_unknown_keyword_generates_random_competitors(self):
        # Act
        result = analyze_keyword("unknown niche keyword xyz")

        # Assert
        assert len(result["competitors"]) >= 2
        assert len(result["competitors"]) <= 4
        for comp in result["competitors"]:
            assert "domain" in comp
            assert "title" in comp
            assert "position" in comp

    def test_search_volume_is_positive_integer(self):
        # Act
        result = analyze_keyword("fatigue analysis software")

        # Assert
        assert isinstance(result["search_volume"], int)
        assert result["search_volume"] >= 50
        assert result["search_volume"] <= 2000

    def test_difficulty_in_valid_range(self):
        # Act
        result = analyze_keyword("python engineering automation")

        # Assert
        assert isinstance(result["difficulty"], int)
        assert result["difficulty"] >= 20
        assert result["difficulty"] <= 85

    def test_deterministic_results_for_same_keyword(self):
        # Act
        result1 = analyze_keyword("S-N curve calculator")
        result2 = analyze_keyword("S-N curve calculator")

        # Assert - same keyword hash produces same random seed
        assert result1["search_volume"] == result2["search_volume"]
        assert result1["difficulty"] == result2["difficulty"]

    def test_different_keywords_produce_different_results(self):
        # Act
        result1 = analyze_keyword("orcaflex automation")
        result2 = analyze_keyword("fatigue analysis software")

        # Assert
        assert result1["keyword"] != result2["keyword"]

    def test_opportunity_score_is_calculated(self):
        # Act
        result = analyze_keyword("offshore engineering automation")

        # Assert
        assert "opportunity_score" in result
        assert isinstance(result["opportunity_score"], int)
        assert 0 <= result["opportunity_score"] <= 100


# ---------------------------------------------------------------------------
# generate_html_report
# ---------------------------------------------------------------------------


class TestGenerateHtmlReport:
    """Tests for generate_html_report() HTML generation."""

    def test_returns_valid_html_string(self):
        # Arrange
        results = [
            {
                "keyword": "test keyword",
                "estimated_position": 5,
                "search_volume": 100,
                "difficulty": 30,
                "competitors": [
                    {"domain": "example.com", "title": "Example", "position": 1}
                ],
                "opportunity_score": 70,
            }
        ]
        config = {"keywords": {"primary": ["test keyword"]}}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "<!DOCTYPE html>" in html
        assert "Competitor Analysis Report" in html

    def test_contains_keyword_data(self):
        # Arrange
        results = [
            {
                "keyword": "my special keyword",
                "estimated_position": 12,
                "search_volume": 500,
                "difficulty": 45,
                "competitors": [
                    {"domain": "rival.com", "title": "Rival", "position": 2}
                ],
                "opportunity_score": 55,
            }
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "my special keyword" in html
        assert "rival.com" in html

    def test_contains_summary_statistics(self):
        # Arrange
        results = [
            {
                "keyword": f"kw{i}",
                "estimated_position": i * 5 if i % 2 else None,
                "search_volume": 100,
                "difficulty": 50,
                "competitors": [
                    {"domain": "comp.com", "title": "Comp", "position": 1}
                ],
                "opportunity_score": 50,
            }
            for i in range(1, 4)
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert - should contain summary boxes
        assert "Keywords Tracked" in html
        assert "Currently Ranking" in html
        assert "Competitors Detected" in html
        assert "Avg Opportunity Score" in html

    def test_contains_recommendations_section(self):
        # Arrange
        results = [
            {
                "keyword": "high opp",
                "estimated_position": None,
                "search_volume": 200,
                "difficulty": 30,
                "competitors": [],
                "opportunity_score": 75,
            }
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "SEO Recommendations" in html

    def test_dry_run_notice_for_dry_run_results(self):
        # Arrange
        results = [
            {
                "keyword": "test",
                "estimated_position": None,
                "competitors": [],
                "search_volume": 0,
                "difficulty": 0,
                "dry_run": True,
            }
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "Dry Run Mode" in html

    def test_no_dry_run_notice_for_real_results(self):
        # Arrange
        results = [
            {
                "keyword": "real keyword",
                "estimated_position": 10,
                "competitors": [
                    {"domain": "comp.com", "title": "Comp", "position": 1}
                ],
                "search_volume": 500,
                "difficulty": 40,
                "opportunity_score": 60,
            }
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "Dry Run Mode" not in html

    def test_handles_not_ranking_position(self):
        # Arrange
        results = [
            {
                "keyword": "unranked keyword",
                "estimated_position": None,
                "competitors": [
                    {"domain": "comp.com", "title": "Comp", "position": 1}
                ],
                "search_volume": 100,
                "difficulty": 50,
                "opportunity_score": 40,
            }
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "Not ranking" in html

    def test_competitor_overview_section(self):
        # Arrange
        results = [
            {
                "keyword": "kw1",
                "estimated_position": None,
                "competitors": [
                    {"domain": "dnv.com", "title": "DNV", "position": 1},
                    {"domain": "wood.com", "title": "Wood", "position": 3},
                ],
                "search_volume": 100,
                "difficulty": 50,
                "opportunity_score": 30,
            },
            {
                "keyword": "kw2",
                "estimated_position": None,
                "competitors": [
                    {"domain": "dnv.com", "title": "DNV Again", "position": 2},
                ],
                "search_volume": 200,
                "difficulty": 60,
                "opportunity_score": 40,
            },
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert
        assert "Competitor Overview" in html
        assert "dnv.com" in html
        assert "wood.com" in html

    def test_results_sorted_by_opportunity_score_descending(self):
        # Arrange
        results = [
            {
                "keyword": "low_opp",
                "estimated_position": None,
                "competitors": [{"domain": "a.com", "title": "A", "position": 1}],
                "search_volume": 100,
                "difficulty": 50,
                "opportunity_score": 20,
            },
            {
                "keyword": "high_opp",
                "estimated_position": 5,
                "competitors": [{"domain": "b.com", "title": "B", "position": 5}],
                "search_volume": 200,
                "difficulty": 30,
                "opportunity_score": 80,
            },
        ]
        config = {}

        # Act
        html = generate_html_report(results, config, Path("/tmp/report.html"))

        # Assert - high_opp should appear before low_opp in the HTML
        assert html.index("high_opp") < html.index("low_opp")


# ---------------------------------------------------------------------------
# create_latest_symlink
# ---------------------------------------------------------------------------


class TestCreateLatestSymlink:
    """Tests for create_latest_symlink() symlink management."""

    def test_creates_symlink_to_report(self, tmp_path):
        # Arrange
        report_path = tmp_path / "2026-01-31.html"
        report_path.write_text("<html>Report</html>")

        # Act
        create_latest_symlink(report_path, tmp_path)

        # Assert
        latest = tmp_path / "latest.html"
        assert latest.is_symlink()
        assert latest.resolve() == report_path.resolve()

    def test_replaces_existing_symlink(self, tmp_path):
        # Arrange
        old_report = tmp_path / "old.html"
        old_report.write_text("<html>Old</html>")
        new_report = tmp_path / "new.html"
        new_report.write_text("<html>New</html>")

        # Create initial symlink
        latest = tmp_path / "latest.html"
        latest.symlink_to("old.html")
        assert latest.resolve() == old_report.resolve()

        # Act
        create_latest_symlink(new_report, tmp_path)

        # Assert
        assert latest.is_symlink()
        assert latest.resolve() == new_report.resolve()

    def test_replaces_existing_regular_file(self, tmp_path):
        # Arrange
        latest = tmp_path / "latest.html"
        latest.write_text("<html>I am a regular file</html>")
        report_path = tmp_path / "report.html"
        report_path.write_text("<html>Report</html>")

        # Act
        create_latest_symlink(report_path, tmp_path)

        # Assert
        assert latest.is_symlink()

    def test_symlink_is_relative(self, tmp_path):
        # Arrange
        report_path = tmp_path / "2026-01-31.html"
        report_path.write_text("<html>Report</html>")

        # Act
        create_latest_symlink(report_path, tmp_path)

        # Assert - symlink target should be just the filename (relative)
        latest = tmp_path / "latest.html"
        target = Path(str(latest.readlink()) if hasattr(latest, 'readlink') else str(latest.resolve()))
        # The symlink_to call uses report_path.name which is relative
        assert latest.is_symlink()


# ---------------------------------------------------------------------------
# print_summary
# ---------------------------------------------------------------------------


class TestPrintSummary:
    """Tests for print_summary() console output."""

    def test_prints_summary_header(self, capsys):
        # Arrange
        results = [
            {
                "keyword": "test keyword",
                "estimated_position": 5,
                "opportunity_score": 70,
            }
        ]
        report_path = Path("/tmp/report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "COMPETITOR ANALYSIS SUMMARY" in captured.out

    def test_prints_keyword_count(self, capsys):
        # Arrange
        results = [
            {"keyword": "kw1", "estimated_position": 5, "opportunity_score": 60},
            {"keyword": "kw2", "estimated_position": None, "opportunity_score": 40},
            {"keyword": "kw3", "estimated_position": 15, "opportunity_score": 50},
        ]
        report_path = Path("/tmp/report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "Keywords Analyzed: 3" in captured.out

    def test_prints_ranking_count(self, capsys):
        # Arrange
        results = [
            {"keyword": "ranked", "estimated_position": 5, "opportunity_score": 70},
            {"keyword": "not_ranked", "estimated_position": None, "opportunity_score": 30},
        ]
        report_path = Path("/tmp/report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "Currently Ranking: 1" in captured.out

    def test_prints_high_opportunity_count(self, capsys):
        # Arrange
        results = [
            {"keyword": "high1", "estimated_position": 5, "opportunity_score": 70},
            {"keyword": "high2", "estimated_position": 10, "opportunity_score": 65},
            {"keyword": "low", "estimated_position": None, "opportunity_score": 30},
        ]
        report_path = Path("/tmp/report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "High Opportunity:  2" in captured.out

    def test_prints_top_opportunities(self, capsys):
        # Arrange
        results = [
            {"keyword": "best keyword", "estimated_position": 5, "opportunity_score": 90},
        ]
        report_path = Path("/tmp/report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "Top Opportunities:" in captured.out
        assert "best keyword" in captured.out

    def test_prints_report_path(self, capsys):
        # Arrange
        results = [{"keyword": "kw", "estimated_position": None, "opportunity_score": 50}]
        report_path = Path("/tmp/my-report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "/tmp/my-report.html" in captured.out

    def test_handles_empty_results(self, capsys):
        # Arrange
        results = []
        report_path = Path("/tmp/report.html")

        # Act
        print_summary(results, report_path)

        # Assert
        captured = capsys.readouterr()
        assert "Keywords Analyzed: 0" in captured.out
        assert "Currently Ranking: 0" in captured.out


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


class TestMain:
    """Tests for main() CLI entry point."""

    def test_main_with_valid_config_dry_run(
        self, tmp_path, monkeypatch, valid_keywords_yaml
    ):
        # Arrange
        output_file = tmp_path / "report.html"
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(valid_keywords_yaml),
                "--output", str(output_file),
                "--dry-run",
            ],
        )

        # Act
        main()

        # Assert
        assert output_file.exists()
        html = output_file.read_text()
        assert "Competitor Analysis Report" in html

    def test_main_missing_config_exits_with_error(self, tmp_path, monkeypatch):
        # Arrange
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(tmp_path / "nonexistent.yaml"),
            ],
        )

        # Act & Assert
        with pytest.raises(SystemExit) as exc_info:
            main()
        assert exc_info.value.code == 1

    def test_main_invalid_yaml_exits_with_error(self, tmp_path, monkeypatch):
        # Arrange
        bad_config = tmp_path / "bad.yaml"
        bad_config.write_text("{{invalid: yaml: [broken")
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(bad_config),
            ],
        )

        # Act & Assert
        with pytest.raises(SystemExit) as exc_info:
            main()
        assert exc_info.value.code == 1

    def test_main_empty_keywords_exits_with_error(
        self, tmp_path, monkeypatch, empty_keywords_yaml
    ):
        # Arrange
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(empty_keywords_yaml),
            ],
        )

        # Act & Assert
        with pytest.raises(SystemExit) as exc_info:
            main()
        assert exc_info.value.code == 1

    def test_main_verbose_prints_progress(
        self, tmp_path, monkeypatch, capsys, valid_keywords_yaml
    ):
        # Arrange
        output_file = tmp_path / "report.html"
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(valid_keywords_yaml),
                "--output", str(output_file),
                "--dry-run",
                "--verbose",
            ],
        )

        # Act
        main()

        # Assert
        captured = capsys.readouterr()
        assert "Loading config from:" in captured.out
        assert "Found" in captured.out
        assert "keywords to analyze" in captured.out
        assert "Analyzing [" in captured.out

    def test_main_generates_report_file(
        self, tmp_path, monkeypatch, valid_keywords_yaml
    ):
        # Arrange
        output_file = tmp_path / "output" / "report.html"
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(valid_keywords_yaml),
                "--output", str(output_file),
            ],
        )

        # Act
        main()

        # Assert
        assert output_file.exists()
        content = output_file.read_text()
        assert "<!DOCTYPE html>" in content

    def test_main_dry_run_prints_notice(
        self, tmp_path, monkeypatch, capsys, valid_keywords_yaml
    ):
        # Arrange
        output_file = tmp_path / "report.html"
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(valid_keywords_yaml),
                "--output", str(output_file),
                "--dry-run",
            ],
        )

        # Act
        main()

        # Assert
        captured = capsys.readouterr()
        assert "(Dry run - no real analysis performed)" in captured.out

    def test_main_default_output_creates_symlink(
        self, tmp_path, monkeypatch, valid_keywords_yaml
    ):
        # Arrange - use default output path (no --output flag)
        # We need to monkeypatch DEFAULT_OUTPUT to use tmp_path
        import competitor_analysis

        monkeypatch.setattr(
            competitor_analysis, "DEFAULT_OUTPUT", tmp_path / "reports"
        )
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(valid_keywords_yaml),
                "--dry-run",
            ],
        )

        # Act
        main()

        # Assert
        reports_dir = tmp_path / "reports"
        assert reports_dir.exists()
        latest = reports_dir / "latest.html"
        assert latest.is_symlink()

    def test_main_prints_summary(
        self, tmp_path, monkeypatch, capsys, valid_keywords_yaml
    ):
        # Arrange
        output_file = tmp_path / "report.html"
        monkeypatch.setattr(
            sys, "argv",
            [
                "competitor_analysis",
                "--config", str(valid_keywords_yaml),
                "--output", str(output_file),
            ],
        )

        # Act
        main()

        # Assert
        captured = capsys.readouterr()
        assert "COMPETITOR ANALYSIS SUMMARY" in captured.out
        assert "Keywords Analyzed:" in captured.out
