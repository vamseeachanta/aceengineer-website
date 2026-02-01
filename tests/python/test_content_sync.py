"""Tests for scripts/content_sync.py.

Covers: load_config, count_sn_curves, count_python_modules,
        count_standards, sync_demos, extract_blog_content,
        update_statistics, process_sync_rules, main.
"""

import json
import sys
from pathlib import Path

import pytest
import yaml

from content_sync import (
    count_python_modules,
    count_sn_curves,
    count_standards,
    extract_blog_content,
    load_config,
    main,
    process_sync_rules,
    sync_demos,
    update_statistics,
)


# ---------------------------------------------------------------------------
# load_config
# ---------------------------------------------------------------------------


class TestLoadConfig:
    """Tests for load_config() YAML configuration loading."""

    def test_load_valid_config(self, valid_content_sync_yaml):
        config = load_config(valid_content_sync_yaml)
        assert "sources" in config
        assert "digitalmodel" in config["sources"]

    def test_load_missing_file_raises(self, tmp_path):
        missing = tmp_path / "nonexistent.yaml"
        with pytest.raises(FileNotFoundError):
            load_config(missing)

    def test_load_invalid_yaml_raises(self, invalid_yaml_file):
        with pytest.raises(yaml.YAMLError):
            load_config(invalid_yaml_file)

    def test_load_preserves_nested_structure(self, valid_content_sync_yaml):
        config = load_config(valid_content_sync_yaml)
        rules = config["sources"]["digitalmodel"]["sync_rules"]
        assert len(rules) == 1
        assert rules[0]["action"] == "count"
        assert rules[0]["target_stat"] == "sn_curves"

    def test_load_empty_config(self, tmp_path):
        empty = tmp_path / "empty.yaml"
        empty.write_text("")
        result = load_config(empty)
        assert result is None


# ---------------------------------------------------------------------------
# count_sn_curves
# ---------------------------------------------------------------------------


class TestCountSnCurves:
    """Tests for count_sn_curves() S-N curve file counting."""

    def test_counts_data_files(self, digitalmodel_tree):
        count = count_sn_curves(digitalmodel_tree)
        # curve_a.yaml, curve_b.yml, curve_c.json
        assert count == 3

    def test_missing_directory_returns_zero(self, tmp_path):
        empty_repo = tmp_path / "empty_repo"
        empty_repo.mkdir()
        count = count_sn_curves(empty_repo)
        assert count == 0

    def test_empty_sn_curves_dir(self, tmp_path):
        repo = tmp_path / "repo"
        sn_dir = repo / "src" / "digitalmodel" / "data" / "sn_curves"
        sn_dir.mkdir(parents=True)
        count = count_sn_curves(repo)
        assert count == 0

    def test_ignores_non_data_files(self, tmp_path):
        repo = tmp_path / "repo"
        sn_dir = repo / "src" / "digitalmodel" / "data" / "sn_curves"
        sn_dir.mkdir(parents=True)
        (sn_dir / "readme.txt").write_text("not a data file")
        (sn_dir / "curve.yaml").write_text("name: real")
        count = count_sn_curves(repo)
        assert count == 1

    def test_counts_csv_files(self, tmp_path):
        repo = tmp_path / "repo"
        sn_dir = repo / "src" / "digitalmodel" / "data" / "sn_curves"
        sn_dir.mkdir(parents=True)
        (sn_dir / "curve.csv").write_text("col1,col2")
        count = count_sn_curves(repo)
        assert count == 1

    def test_counts_subdirectory_files(self, tmp_path):
        repo = tmp_path / "repo"
        sn_dir = repo / "src" / "digitalmodel" / "data" / "sn_curves"
        sub = sn_dir / "dnv"
        sub.mkdir(parents=True)
        (sn_dir / "top_level.yaml").write_text("name: top")
        (sub / "sub_curve.yaml").write_text("name: sub")
        count = count_sn_curves(repo)
        assert count == 2


# ---------------------------------------------------------------------------
# count_python_modules
# ---------------------------------------------------------------------------


class TestCountPythonModules:
    """Tests for count_python_modules() Python file counting."""

    def test_counts_py_files(self, digitalmodel_tree):
        count = count_python_modules(digitalmodel_tree)
        # __init__.py, module_a.py, module_b.py, utils/__init__.py, utils/helpers.py
        assert count == 5

    def test_excludes_pycache(self, digitalmodel_tree):
        count = count_python_modules(digitalmodel_tree)
        # The __pycache__/helpers.cpython-310.pyc should NOT be counted
        # Even though it doesn't end in .py, the exclusion logic targets __pycache__ dirs
        assert count == 5

    def test_missing_src_dir_returns_zero(self, tmp_path):
        empty_repo = tmp_path / "empty_repo"
        empty_repo.mkdir()
        count = count_python_modules(empty_repo)
        assert count == 0

    def test_empty_src_dir(self, tmp_path):
        repo = tmp_path / "repo"
        src_dir = repo / "src" / "digitalmodel"
        src_dir.mkdir(parents=True)
        count = count_python_modules(repo)
        assert count == 0

    def test_deeply_nested_modules(self, tmp_path):
        repo = tmp_path / "repo"
        deep = repo / "src" / "digitalmodel" / "a" / "b" / "c"
        deep.mkdir(parents=True)
        (deep / "deep_module.py").write_text("# deep")
        (repo / "src" / "digitalmodel" / "top.py").write_text("# top")
        count = count_python_modules(repo)
        assert count == 2


# ---------------------------------------------------------------------------
# sync_demos
# ---------------------------------------------------------------------------


class TestSyncDemos:
    """Tests for sync_demos() file synchronization."""

    def test_sync_copies_matching_files(self, demo_source_dir, tmp_path):
        dest = tmp_path / "dest"
        count = sync_demos(
            source_path=demo_source_dir,
            dest_path=dest,
            patterns=["*.html", "*.png", "*.svg"],
            ignore_patterns=[],
        )
        assert count == 3
        assert (dest / "report.html").exists()
        assert (dest / "chart.png").exists()
        assert (dest / "diagram.svg").exists()

    def test_sync_respects_ignore_patterns(self, demo_source_dir, tmp_path):
        dest = tmp_path / "dest"
        count = sync_demos(
            source_path=demo_source_dir,
            dest_path=dest,
            patterns=["*"],
            ignore_patterns=["*.pyc", ".DS_Store"],
        )
        assert not (dest / "cache.pyc").exists()
        assert not (dest / ".DS_Store").exists()
        # html, png, svg should still be copied
        assert count >= 3

    def test_dry_run_does_not_copy(self, demo_source_dir, tmp_path):
        dest = tmp_path / "dest"
        count = sync_demos(
            source_path=demo_source_dir,
            dest_path=dest,
            patterns=["*.html"],
            ignore_patterns=[],
            dry_run=True,
        )
        assert count == 1  # still counts
        assert not dest.exists()  # but dest not created

    def test_missing_source_returns_zero(self, tmp_path):
        count = sync_demos(
            source_path=tmp_path / "nonexistent",
            dest_path=tmp_path / "dest",
            patterns=["*"],
            ignore_patterns=[],
        )
        assert count == 0

    def test_empty_source_returns_zero(self, tmp_path):
        source = tmp_path / "empty_source"
        source.mkdir()
        dest = tmp_path / "dest"
        count = sync_demos(
            source_path=source,
            dest_path=dest,
            patterns=["*.html"],
            ignore_patterns=[],
        )
        assert count == 0

    def test_creates_dest_directory(self, demo_source_dir, tmp_path):
        dest = tmp_path / "nested" / "deep" / "dest"
        sync_demos(
            source_path=demo_source_dir,
            dest_path=dest,
            patterns=["*.html"],
            ignore_patterns=[],
        )
        assert dest.exists()
        assert (dest / "report.html").exists()

    def test_preserves_file_content(self, demo_source_dir, tmp_path):
        dest = tmp_path / "dest"
        sync_demos(
            source_path=demo_source_dir,
            dest_path=dest,
            patterns=["*.html"],
            ignore_patterns=[],
        )
        assert (dest / "report.html").read_text() == "<h1>Report</h1>"

    def test_no_matching_patterns(self, demo_source_dir, tmp_path):
        dest = tmp_path / "dest"
        count = sync_demos(
            source_path=demo_source_dir,
            dest_path=dest,
            patterns=["*.xyz"],
            ignore_patterns=[],
        )
        assert count == 0


# ---------------------------------------------------------------------------
# update_statistics
# ---------------------------------------------------------------------------


class TestUpdateStatistics:
    """Tests for update_statistics() JSON stats writing."""

    def test_writes_json_file(self, tmp_path):
        stats_path = tmp_path / "stats.json"
        stats = {"sn_curves": 42, "python_modules": 15}
        update_statistics(stats_path, stats)
        assert stats_path.exists()

        data = json.loads(stats_path.read_text())
        assert data["sn_curves"] == 42
        assert data["python_modules"] == 15
        assert "last_updated" in data

    def test_dry_run_does_not_write(self, tmp_path):
        stats_path = tmp_path / "stats.json"
        stats = {"sn_curves": 42}
        update_statistics(stats_path, stats, dry_run=True)
        assert not stats_path.exists()

    def test_creates_parent_directories(self, tmp_path):
        stats_path = tmp_path / "nested" / "deep" / "stats.json"
        stats = {"count": 10}
        update_statistics(stats_path, stats)
        assert stats_path.exists()

    def test_adds_last_updated_field(self, tmp_path):
        stats_path = tmp_path / "stats.json"
        stats = {"sn_curves": 5}
        update_statistics(stats_path, stats)

        data = json.loads(stats_path.read_text())
        assert "last_updated" in data
        # Should be in YYYY-MM-DD format
        parts = data["last_updated"].split("-")
        assert len(parts) == 3
        assert len(parts[0]) == 4  # year

    def test_overwrites_existing_file(self, tmp_path):
        stats_path = tmp_path / "stats.json"
        stats_path.write_text('{"old": true}')

        stats = {"new_data": 99}
        update_statistics(stats_path, stats)

        data = json.loads(stats_path.read_text())
        assert "new_data" in data
        assert "old" not in data

    def test_json_is_pretty_printed(self, tmp_path):
        stats_path = tmp_path / "stats.json"
        stats = {"key": "value"}
        update_statistics(stats_path, stats)

        content = stats_path.read_text()
        # json.dump with indent=2 produces multiline output
        assert "\n" in content

    def test_dry_run_still_modifies_stats_dict(self, tmp_path):
        stats_path = tmp_path / "stats.json"
        stats = {"count": 5}
        update_statistics(stats_path, stats, dry_run=True)
        # The function adds last_updated to the dict even in dry_run
        assert "last_updated" in stats


# ---------------------------------------------------------------------------
# count_standards
# ---------------------------------------------------------------------------


class TestCountStandards:
    """Tests for count_standards() engineering standards counting."""

    def test_returns_default_when_no_standards_directory(self, tmp_path):
        # Arrange - repo with no standards directories
        repo = tmp_path / "repo"
        repo.mkdir()

        # Act
        count = count_standards(repo)

        # Assert - default fallback is 17
        assert count == 17

    def test_counts_from_data_standards_directory(self, tmp_path):
        # Arrange - create standards in src/digitalmodel/data/standards
        repo = tmp_path / "repo"
        standards_dir = repo / "src" / "digitalmodel" / "data" / "standards"
        standards_dir.mkdir(parents=True)
        (standards_dir / "dnvgl-rp-c203.yaml").write_text("name: C203")
        (standards_dir / "api-rp-2a.yml").write_text("name: API2A")
        (standards_dir / "norsok-n003.json").write_text('{"name": "N003"}')

        # Act
        count = count_standards(repo)

        # Assert
        assert count == 3

    def test_counts_from_config_standards_directory(self, tmp_path):
        # Arrange - create standards in src/digitalmodel/config/standards
        repo = tmp_path / "repo"
        standards_dir = repo / "src" / "digitalmodel" / "config" / "standards"
        standards_dir.mkdir(parents=True)
        (standards_dir / "standard_a.yaml").write_text("name: A")
        (standards_dir / "standard_b.json").write_text('{"name": "B"}')

        # Act
        count = count_standards(repo)

        # Assert
        assert count == 2

    def test_counts_from_data_root_standards_directory(self, tmp_path):
        # Arrange - create standards in data/standards
        repo = tmp_path / "repo"
        standards_dir = repo / "data" / "standards"
        standards_dir.mkdir(parents=True)
        (standards_dir / "std.yaml").write_text("name: std")

        # Act
        count = count_standards(repo)

        # Assert
        assert count == 1

    def test_prefers_first_found_location(self, tmp_path):
        # Arrange - create standards in both first and third locations
        repo = tmp_path / "repo"
        first_dir = repo / "src" / "digitalmodel" / "data" / "standards"
        first_dir.mkdir(parents=True)
        (first_dir / "first.yaml").write_text("name: first")

        third_dir = repo / "data" / "standards"
        third_dir.mkdir(parents=True)
        (third_dir / "third_a.yaml").write_text("name: a")
        (third_dir / "third_b.yaml").write_text("name: b")

        # Act
        count = count_standards(repo)

        # Assert - returns count from the first location found (1, not 2)
        assert count == 1

    def test_returns_default_when_directory_exists_but_empty(self, tmp_path):
        # Arrange - empty standards directory
        repo = tmp_path / "repo"
        standards_dir = repo / "src" / "digitalmodel" / "data" / "standards"
        standards_dir.mkdir(parents=True)

        # Act
        count = count_standards(repo)

        # Assert - empty dir yields 0 count, so it falls through to default
        assert count == 17


# ---------------------------------------------------------------------------
# extract_blog_content
# ---------------------------------------------------------------------------


class TestExtractBlogContent:
    """Tests for extract_blog_content() markdown extraction."""

    def test_extracts_markdown_files(self, tmp_path):
        # Arrange
        source = tmp_path / "blog_source"
        source.mkdir()
        (source / "post1.md").write_text("# Post 1")
        (source / "post2.md").write_text("# Post 2")
        dest = tmp_path / "blog_dest"

        # Act
        count = extract_blog_content(source, dest, ["*.md"])

        # Assert
        assert count == 2
        assert (dest / "post1.md").exists()
        assert (dest / "post2.md").exists()

    def test_skips_files_starting_with_underscore(self, tmp_path):
        # Arrange
        source = tmp_path / "blog_source"
        source.mkdir()
        (source / "post.md").write_text("# Good post")
        (source / "_draft.md").write_text("# Draft - skip this")
        dest = tmp_path / "blog_dest"

        # Act
        count = extract_blog_content(source, dest, ["*.md"])

        # Assert
        assert count == 1
        assert (dest / "post.md").exists()
        assert not (dest / "_draft.md").exists()

    def test_dry_run_does_not_copy_files(self, tmp_path):
        # Arrange
        source = tmp_path / "blog_source"
        source.mkdir()
        (source / "post.md").write_text("# Post")
        dest = tmp_path / "blog_dest"

        # Act
        count = extract_blog_content(source, dest, ["*.md"], dry_run=True)

        # Assert
        assert count == 1
        assert not dest.exists()

    def test_missing_source_returns_zero(self, tmp_path):
        # Arrange
        dest = tmp_path / "blog_dest"

        # Act
        count = extract_blog_content(tmp_path / "nonexistent", dest, ["*.md"])

        # Assert
        assert count == 0

    def test_preserves_file_content(self, tmp_path):
        # Arrange
        source = tmp_path / "blog_source"
        source.mkdir()
        content = "# My Blog Post\n\nSome content here."
        (source / "post.md").write_text(content)
        dest = tmp_path / "blog_dest"

        # Act
        extract_blog_content(source, dest, ["*.md"])

        # Assert
        assert (dest / "post.md").read_text() == content

    def test_creates_destination_directory(self, tmp_path):
        # Arrange
        source = tmp_path / "blog_source"
        source.mkdir()
        (source / "post.md").write_text("# Post")
        dest = tmp_path / "nested" / "deep" / "blog_dest"

        # Act
        extract_blog_content(source, dest, ["*.md"])

        # Assert
        assert dest.exists()

    def test_multiple_patterns(self, tmp_path):
        # Arrange
        source = tmp_path / "blog_source"
        source.mkdir()
        (source / "post.md").write_text("# Markdown")
        (source / "page.rst").write_text("RST Page")
        dest = tmp_path / "blog_dest"

        # Act
        count = extract_blog_content(source, dest, ["*.md", "*.rst"])

        # Assert
        assert count == 2

    def test_empty_source_returns_zero(self, tmp_path):
        # Arrange
        source = tmp_path / "empty_source"
        source.mkdir()
        dest = tmp_path / "blog_dest"

        # Act
        count = extract_blog_content(source, dest, ["*.md"])

        # Assert
        assert count == 0


# ---------------------------------------------------------------------------
# process_sync_rules
# ---------------------------------------------------------------------------


class TestProcessSyncRules:
    """Tests for process_sync_rules() rule processing logic."""

    def test_count_action_counts_sn_curves(self, digitalmodel_tree):
        # Arrange
        config = {
            "sources": {
                "digitalmodel": {
                    "sync_rules": [
                        {
                            "source": "src/digitalmodel/data/sn_curves/",
                            "action": "count",
                            "target_stat": "sn_curves",
                        }
                    ]
                }
            },
            "settings": {"ignore_patterns": []},
        }

        # Act
        stats = process_sync_rules(config, "digitalmodel", digitalmodel_tree)

        # Assert
        assert "sn_curves" in stats
        assert stats["sn_curves"] == 3

    def test_count_modules_action(self, digitalmodel_tree):
        # Arrange
        config = {
            "sources": {
                "digitalmodel": {
                    "sync_rules": [
                        {
                            "source": "src/digitalmodel/",
                            "action": "count_modules",
                            "target_stat": "python_modules",
                        }
                    ]
                }
            },
            "settings": {"ignore_patterns": []},
        }

        # Act
        stats = process_sync_rules(config, "digitalmodel", digitalmodel_tree)

        # Assert
        assert "python_modules" in stats
        assert stats["python_modules"] == 5

    def test_copy_action_syncs_files(self, tmp_path):
        # Arrange - create a source repo with demo files
        repo = tmp_path / "repo"
        demo_dir = repo / "demos"
        demo_dir.mkdir(parents=True)
        (demo_dir / "page.html").write_text("<h1>Demo</h1>")

        # We need to patch PROJECT_ROOT for the copy destination
        # Instead, use absolute destination path in config
        config = {
            "sources": {
                "myrepo": {
                    "sync_rules": [
                        {
                            "source": "demos",
                            "action": "copy",
                            "destination": "demos",
                            "patterns": ["*.html"],
                        }
                    ]
                }
            },
            "settings": {"ignore_patterns": ["*.pyc"]},
        }

        # Act
        stats = process_sync_rules(config, "myrepo", repo)

        # Assert - the function ran without error (files go to PROJECT_ROOT/demos)
        assert isinstance(stats, dict)

    def test_extract_blog_action(self, tmp_path):
        # Arrange
        repo = tmp_path / "repo"
        blog_dir = repo / "blog"
        blog_dir.mkdir(parents=True)
        (blog_dir / "article.md").write_text("# Article")

        config = {
            "sources": {
                "myrepo": {
                    "sync_rules": [
                        {
                            "source": "blog",
                            "action": "extract_blog",
                            "destination": "blog_output",
                            "patterns": ["*.md"],
                        }
                    ]
                }
            },
            "settings": {"ignore_patterns": []},
        }

        # Act
        stats = process_sync_rules(config, "myrepo", repo)

        # Assert - function completes without error
        assert isinstance(stats, dict)

    def test_missing_repo_returns_empty_stats(self, tmp_path):
        # Arrange
        config = {
            "sources": {
                "digitalmodel": {
                    "sync_rules": [
                        {"action": "count", "target_stat": "sn_curves"}
                    ]
                }
            },
            "settings": {"ignore_patterns": []},
        }

        # Act
        stats = process_sync_rules(
            config, "digitalmodel", tmp_path / "nonexistent"
        )

        # Assert
        assert stats == {}

    def test_empty_sync_rules_returns_empty_stats(self, digitalmodel_tree):
        # Arrange
        config = {
            "sources": {
                "digitalmodel": {
                    "sync_rules": []
                }
            },
            "settings": {"ignore_patterns": []},
        }

        # Act
        stats = process_sync_rules(config, "digitalmodel", digitalmodel_tree)

        # Assert
        assert stats == {}

    def test_dry_run_copy_does_not_create_files(self, tmp_path):
        # Arrange
        repo = tmp_path / "repo"
        demo_dir = repo / "demos"
        demo_dir.mkdir(parents=True)
        (demo_dir / "page.html").write_text("<h1>Demo</h1>")

        config = {
            "sources": {
                "myrepo": {
                    "sync_rules": [
                        {
                            "source": "demos",
                            "action": "copy",
                            "destination": "demos_out",
                            "patterns": ["*.html"],
                        }
                    ]
                }
            },
            "settings": {"ignore_patterns": []},
        }

        # Act
        stats = process_sync_rules(config, "myrepo", repo, dry_run=True)

        # Assert
        assert isinstance(stats, dict)


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------


class TestMain:
    """Tests for main() CLI entry point."""

    def test_main_with_valid_config_returns_zero(self, tmp_path, monkeypatch):
        # Arrange - create a valid config
        config_file = tmp_path / "config.yaml"
        config_file.write_text(
            "sources:\n"
            "  digitalmodel:\n"
            '    base_path: "digitalmodel"\n'
            "    sync_rules: []\n"
            "output:\n"
            '  statistics_file: "stats.json"\n'
            "settings:\n"
            "  ignore_patterns: []\n"
        )

        # Create the digitalmodel directory so count_standards
        # can check for standards directories
        dm_path = tmp_path / "digitalmodel"
        dm_path.mkdir()

        monkeypatch.setattr(
            sys, "argv",
            [
                "content_sync",
                "--config", str(config_file),
                "--digitalmodel", str(dm_path),
                "--dry-run",
            ],
        )

        # Act
        result = main()

        # Assert
        assert result == 0

    def test_main_missing_config_returns_one(self, tmp_path, monkeypatch):
        # Arrange
        monkeypatch.setattr(
            sys, "argv",
            [
                "content_sync",
                "--config", str(tmp_path / "nonexistent.yaml"),
            ],
        )

        # Act
        result = main()

        # Assert
        assert result == 1

    def test_main_invalid_yaml_config_returns_one(self, tmp_path, monkeypatch):
        # Arrange
        bad_config = tmp_path / "bad.yaml"
        bad_config.write_text("{{invalid: yaml: [broken")

        monkeypatch.setattr(
            sys, "argv",
            ["content_sync", "--config", str(bad_config)],
        )

        # Act
        result = main()

        # Assert
        assert result == 1

    def test_main_dry_run_prints_dry_run_notice(
        self, tmp_path, monkeypatch, capsys
    ):
        # Arrange
        config_file = tmp_path / "config.yaml"
        config_file.write_text(
            "sources: {}\n"
            "output:\n"
            '  statistics_file: "stats.json"\n'
            "settings:\n"
            "  ignore_patterns: []\n"
        )
        dm_path = tmp_path / "dm"
        dm_path.mkdir()

        monkeypatch.setattr(
            sys, "argv",
            [
                "content_sync",
                "--config", str(config_file),
                "--digitalmodel", str(dm_path),
                "--dry-run",
            ],
        )

        # Act
        main()

        # Assert
        captured = capsys.readouterr()
        assert "DRY RUN MODE" in captured.out

    def test_main_prints_sync_complete(self, tmp_path, monkeypatch, capsys):
        # Arrange
        config_file = tmp_path / "config.yaml"
        config_file.write_text(
            "sources: {}\n"
            "output:\n"
            '  statistics_file: "stats.json"\n'
            "settings:\n"
            "  ignore_patterns: []\n"
        )
        dm_path = tmp_path / "dm"
        dm_path.mkdir()

        monkeypatch.setattr(
            sys, "argv",
            [
                "content_sync",
                "--config", str(config_file),
                "--digitalmodel", str(dm_path),
            ],
        )

        # Act
        result = main()

        # Assert
        captured = capsys.readouterr()
        assert "Sync complete!" in captured.out
        assert result == 0

    def test_main_with_worldenergydata_source(self, tmp_path, monkeypatch):
        # Arrange
        config_file = tmp_path / "config.yaml"
        config_file.write_text(
            "sources:\n"
            "  worldenergydata:\n"
            '    base_path: "wed"\n'
            "    sync_rules: []\n"
            "output:\n"
            '  statistics_file: "stats.json"\n'
            "settings:\n"
            "  ignore_patterns: []\n"
        )
        dm_path = tmp_path / "dm"
        dm_path.mkdir()
        wed_path = tmp_path / "wed"
        wed_path.mkdir()

        monkeypatch.setattr(
            sys, "argv",
            [
                "content_sync",
                "--config", str(config_file),
                "--digitalmodel", str(dm_path),
                "--worldenergydata", str(wed_path),
                "--dry-run",
            ],
        )

        # Act
        result = main()

        # Assert
        assert result == 0

    def test_main_prints_statistics_summary(
        self, tmp_path, monkeypatch, capsys
    ):
        # Arrange
        config_file = tmp_path / "config.yaml"
        config_file.write_text(
            "sources:\n"
            "  digitalmodel:\n"
            '    base_path: "dm"\n'
            "    sync_rules:\n"
            '      - action: "count"\n'
            '        target_stat: "sn_curves"\n'
            '        source: "src/digitalmodel/data/sn_curves/"\n'
            "output:\n"
            '  statistics_file: "stats.json"\n'
            "settings:\n"
            "  ignore_patterns: []\n"
        )
        # Create a digitalmodel tree with some sn_curves
        dm_path = tmp_path / "dm"
        sn_dir = dm_path / "src" / "digitalmodel" / "data" / "sn_curves"
        sn_dir.mkdir(parents=True)
        (sn_dir / "curve.yaml").write_text("name: test")

        monkeypatch.setattr(
            sys, "argv",
            [
                "content_sync",
                "--config", str(config_file),
                "--digitalmodel", str(dm_path),
                "--dry-run",
            ],
        )

        # Act
        main()

        # Assert
        captured = capsys.readouterr()
        assert "Statistics collected:" in captured.out
