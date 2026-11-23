#!/usr/bin/env python3
"""Content sync for AceEngineer website.

Synchronizes content from digitalmodel and worldenergydata repositories:
- Counts S-N curves and Python modules from digitalmodel
- Copies HTML reports and demos
- Updates statistics.json with current counts
"""

import argparse
import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

# Default paths
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent
DEFAULT_CONFIG = PROJECT_ROOT / "config" / "content-sync.yaml"


def load_config(config_path: Path) -> dict[str, Any]:
    """Load sync configuration from YAML file.

    Args:
        config_path: Path to the configuration file.

    Returns:
        Configuration dictionary.

    Raises:
        FileNotFoundError: If config file doesn't exist.
        yaml.YAMLError: If config file is invalid YAML.
    """
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    return config


def count_sn_curves(digitalmodel_path: Path) -> int:
    """Count S-N curves in digitalmodel repo.

    S-N curves are stored as individual data files in the sn_curves directory.

    Args:
        digitalmodel_path: Path to digitalmodel repository root.

    Returns:
        Number of S-N curve files found.
    """
    sn_curves_dir = digitalmodel_path / "src" / "digitalmodel" / "data" / "sn_curves"

    if not sn_curves_dir.exists():
        print(f"  Warning: S-N curves directory not found: {sn_curves_dir}")
        return 0

    # Count all data files (yml, yaml, json, csv)
    count = 0
    for pattern in ["*.yml", "*.yaml", "*.json", "*.csv"]:
        count += len(list(sn_curves_dir.glob(pattern)))

    # Also check subdirectories
    for pattern in ["**/*.yml", "**/*.yaml", "**/*.json", "**/*.csv"]:
        count += len(list(sn_curves_dir.glob(pattern))) - len(
            list(sn_curves_dir.glob(pattern.replace("**/", "")))
        )

    return count


def count_python_modules(digitalmodel_path: Path) -> int:
    """Count Python modules in digitalmodel repo.

    Args:
        digitalmodel_path: Path to digitalmodel repository root.

    Returns:
        Number of Python files found.
    """
    src_dir = digitalmodel_path / "src" / "digitalmodel"

    if not src_dir.exists():
        print(f"  Warning: Source directory not found: {src_dir}")
        return 0

    # Count all .py files recursively, excluding __pycache__
    count = 0
    for py_file in src_dir.glob("**/*.py"):
        if "__pycache__" not in str(py_file):
            count += 1

    return count


def count_standards(digitalmodel_path: Path) -> int:
    """Count engineering standards referenced in digitalmodel.

    Args:
        digitalmodel_path: Path to digitalmodel repository root.

    Returns:
        Number of standards found.
    """
    # Check for standards in data or config directories
    standards_locations = [
        digitalmodel_path / "src" / "digitalmodel" / "data" / "standards",
        digitalmodel_path / "src" / "digitalmodel" / "config" / "standards",
        digitalmodel_path / "data" / "standards",
    ]

    for location in standards_locations:
        if location.exists():
            count = 0
            for pattern in ["*.yml", "*.yaml", "*.json"]:
                count += len(list(location.glob(pattern)))
            if count > 0:
                return count

    # Default count if no standards directory found
    return 17


def sync_demos(
    source_path: Path,
    dest_path: Path,
    patterns: list[str],
    ignore_patterns: list[str],
    dry_run: bool = False,
) -> int:
    """Sync demo files from source to destination.

    Args:
        source_path: Source directory path.
        dest_path: Destination directory path.
        patterns: File patterns to include.
        ignore_patterns: Patterns to ignore.
        dry_run: If True, only print what would be done.

    Returns:
        Number of files synced.
    """
    if not source_path.exists():
        print(f"  Warning: Source path not found: {source_path}")
        return 0

    synced_count = 0

    # Create destination if needed
    if not dry_run:
        dest_path.mkdir(parents=True, exist_ok=True)

    # Collect files matching patterns
    files_to_sync = []
    for pattern in patterns:
        for file_path in source_path.glob(pattern):
            if file_path.is_file():
                # Check if file matches ignore patterns
                should_ignore = False
                for ignore in ignore_patterns:
                    if file_path.match(ignore):
                        should_ignore = True
                        break

                if not should_ignore:
                    files_to_sync.append(file_path)

    # Sync files
    for src_file in files_to_sync:
        rel_path = src_file.relative_to(source_path)
        dest_file = dest_path / rel_path

        if dry_run:
            print(f"  [DRY-RUN] Would copy: {src_file} -> {dest_file}")
        else:
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dest_file)
            print(f"  Copied: {rel_path}")

        synced_count += 1

    return synced_count


def extract_blog_content(
    source_path: Path,
    dest_path: Path,
    patterns: list[str],
    dry_run: bool = False,
) -> int:
    """Extract blog content from markdown files.

    Args:
        source_path: Source directory with markdown files.
        dest_path: Destination for blog content.
        patterns: File patterns to include.
        dry_run: If True, only print what would be done.

    Returns:
        Number of blog posts extracted.
    """
    if not source_path.exists():
        print(f"  Warning: Blog source path not found: {source_path}")
        return 0

    extracted_count = 0

    if not dry_run:
        dest_path.mkdir(parents=True, exist_ok=True)

    for pattern in patterns:
        for md_file in source_path.glob(pattern):
            if md_file.is_file() and not md_file.name.startswith("_"):
                dest_file = dest_path / md_file.name

                if dry_run:
                    print(f"  [DRY-RUN] Would extract: {md_file} -> {dest_file}")
                else:
                    shutil.copy2(md_file, dest_file)
                    print(f"  Extracted: {md_file.name}")

                extracted_count += 1

    return extracted_count


def update_statistics(
    stats_path: Path,
    stats: dict[str, Any],
    dry_run: bool = False,
) -> None:
    """Update statistics JSON file.

    Args:
        stats_path: Path to statistics.json file.
        stats: Statistics dictionary to write.
        dry_run: If True, only print what would be done.
    """
    stats["last_updated"] = datetime.now().strftime("%Y-%m-%d")

    if dry_run:
        print(f"\n[DRY-RUN] Would update {stats_path} with:")
        print(json.dumps(stats, indent=2))
    else:
        stats_path.parent.mkdir(parents=True, exist_ok=True)
        with open(stats_path, "w") as f:
            json.dump(stats, f, indent=2)
        print(f"\nUpdated: {stats_path}")


def process_sync_rules(
    config: dict[str, Any],
    source_name: str,
    base_path: Path,
    dry_run: bool = False,
) -> dict[str, Any]:
    """Process sync rules for a source repository.

    Args:
        config: Full configuration dictionary.
        source_name: Name of the source (digitalmodel or worldenergydata).
        base_path: Base path to the source repository.
        dry_run: If True, only print what would be done.

    Returns:
        Dictionary of collected statistics.
    """
    stats = {}
    source_config = config["sources"].get(source_name, {})
    sync_rules = source_config.get("sync_rules", [])
    settings = config.get("settings", {})
    ignore_patterns = settings.get("ignore_patterns", [])

    print(f"\nProcessing {source_name}...")
    print(f"  Base path: {base_path}")

    if not base_path.exists():
        print(f"  Warning: Repository not found at {base_path}")
        return stats

    for rule in sync_rules:
        action = rule.get("action")
        source = rule.get("source", "")
        source_path = base_path / source

        if action == "count":
            target_stat = rule.get("target_stat")
            if target_stat == "sn_curves":
                count = count_sn_curves(base_path)
                stats["sn_curves"] = count
                print(f"  Counted {count} S-N curves")

        elif action == "count_modules":
            target_stat = rule.get("target_stat")
            count = count_python_modules(base_path)
            stats[target_stat] = count
            print(f"  Counted {count} Python modules")

        elif action == "copy":
            dest = rule.get("destination", "")
            dest_path = PROJECT_ROOT / dest
            patterns = rule.get("patterns", ["*"])
            synced = sync_demos(source_path, dest_path, patterns, ignore_patterns, dry_run)
            print(f"  Synced {synced} files to {dest}")

        elif action == "extract_blog":
            dest = rule.get("destination", "")
            dest_path = PROJECT_ROOT / dest
            patterns = rule.get("patterns", ["*.md"])
            extracted = extract_blog_content(source_path, dest_path, patterns, dry_run)
            print(f"  Extracted {extracted} blog posts to {dest}")

    return stats


def main() -> int:
    """Main entry point for content sync.

    Returns:
        Exit code (0 for success, non-zero for errors).
    """
    parser = argparse.ArgumentParser(
        description="Sync content from source repositories to AceEngineer website.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                    # Sync all sources
  %(prog)s --dry-run                          # Preview changes
  %(prog)s --digitalmodel /path/to/repo       # Custom path
  %(prog)s --config custom-config.yaml        # Custom config
        """,
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without making them",
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help=f"Path to config file (default: {DEFAULT_CONFIG})",
    )
    parser.add_argument(
        "--digitalmodel",
        type=Path,
        help="Path to digitalmodel repository",
    )
    parser.add_argument(
        "--worldenergydata",
        type=Path,
        help="Path to worldenergydata repository",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("AceEngineer Content Sync")
    print("=" * 60)

    if args.dry_run:
        print("\n*** DRY RUN MODE - No changes will be made ***\n")

    # Load configuration
    try:
        config = load_config(args.config)
        print(f"Loaded config: {args.config}")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        return 1
    except yaml.YAMLError as e:
        print(f"Error parsing config: {e}")
        return 1

    # Determine repository paths
    sources = config.get("sources", {})

    digitalmodel_path = args.digitalmodel
    if not digitalmodel_path:
        default_path = sources.get("digitalmodel", {}).get("base_path", "../digitalmodel")
        digitalmodel_path = (PROJECT_ROOT / default_path).resolve()

    worldenergydata_path = args.worldenergydata
    if not worldenergydata_path:
        default_path = sources.get("worldenergydata", {}).get("base_path", "../worldenergydata")
        worldenergydata_path = (PROJECT_ROOT / default_path).resolve()

    # Collect all statistics
    all_stats = {}

    # Process digitalmodel
    if "digitalmodel" in sources:
        stats = process_sync_rules(config, "digitalmodel", digitalmodel_path, args.dry_run)
        all_stats.update(stats)

    # Process worldenergydata
    if "worldenergydata" in sources:
        stats = process_sync_rules(config, "worldenergydata", worldenergydata_path, args.dry_run)
        all_stats.update(stats)

    # Add standards count
    all_stats["standards"] = count_standards(digitalmodel_path)

    # Update statistics file
    output_config = config.get("output", {})
    stats_file = output_config.get("statistics_file", "assets/data/statistics.json")
    stats_path = PROJECT_ROOT / stats_file

    if all_stats:
        update_statistics(stats_path, all_stats, args.dry_run)

    print("\n" + "=" * 60)
    print("Sync complete!")
    print("=" * 60)

    # Print summary
    print("\nStatistics collected:")
    for key, value in all_stats.items():
        print(f"  {key}: {value}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
