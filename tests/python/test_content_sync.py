"""Tests for scripts/content_sync.py.

Covers: load_config, count_sn_curves, count_python_modules,
        sync_demos, update_statistics.
"""

import json
from pathlib import Path

import pytest
import yaml

from content_sync import (
    count_python_modules,
    count_sn_curves,
    load_config,
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
