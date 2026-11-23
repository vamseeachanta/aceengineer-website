"""TDD coverage for the repo-structure normalization checker (#13)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import yaml

from scripts.maintenance import verify_repo_structure
from scripts.maintenance.verify_repo_structure import (
    RepoStructureViolation,
    load_contract,
    main,
    root_for,
    validate_paths,
)


def _contract(tmp_path: Path, overrides: dict | None = None) -> Path:
    payload = {
        "allowed_roots": [
            "content",
            "assets",
            "tests",
            "docs",
            "config",
            "scripts",
            "README.md",
            "package.json",
            "pyproject.toml",
        ],
        "ignored_roots": [".git", ".venv", "node_modules", "dist", "__pycache__"],
        "generated_artifact_roots": ["reports", "blog_output", "stats.json"],
        "temporary_exceptions": {
            "reports": {
                "category": "durable-evidence",
                "owner": "aceengineer-website maintainers",
                "review_date": "2026-06-30",
                "follow_up": "https://github.com/vamseeachanta/aceengineer-website/issues/13",
                "justification": (
                    "Tracked competitor-analysis report artifacts require a dedicated "
                    "generated-evidence migration issue before relocation or deletion."
                ),
                "allowed_paths": ["reports/competitor-analysis/latest.html"],
            },
            "blog_output": {
                "category": "temporary-durable-exception",
                "owner": "aceengineer-website maintainers",
                "review_date": "2026-06-30",
                "follow_up": "https://github.com/vamseeachanta/aceengineer-website/issues/13",
                "justification": "Tracked blog generation output is preserved until content pipeline cleanup is explicitly approved.",
                "allowed_paths": ["blog_output/article.md"],
            },
            "stats.json": {
                "category": "authorized-generated-artifact",
                "owner": "aceengineer-website maintainers",
                "review_date": "2026-06-30",
                "follow_up": "https://github.com/vamseeachanta/aceengineer-website/issues/13",
                "justification": "Root stats.json is a currently tracked build telemetry artifact and must not be silently removed.",
                "allowed_paths": ["stats.json"],
            },
        },
    }
    if overrides:
        payload.update(overrides)
    path = tmp_path / "repo_structure.yml"
    path.write_text(yaml.safe_dump(payload, sort_keys=False), encoding="utf-8")
    return path


def test_checker_rejects_unapproved_root_entry(tmp_path: Path) -> None:
    contract = load_contract(_contract(tmp_path))

    violations = validate_paths(["content/index.html", "scratch.txt"], contract)

    assert RepoStructureViolation("unknown-root", "scratch.txt", "scratch.txt") in violations


def test_checker_rejects_generated_root_without_exception(tmp_path: Path) -> None:
    contract = load_contract(_contract(tmp_path, {"temporary_exceptions": {}}))

    violations = validate_paths(["reports/demo.html"], contract)

    assert RepoStructureViolation("generated-root-missing-exception", "reports", "reports/demo.html") in violations


def test_checker_rejects_placeholder_exception_metadata(tmp_path: Path) -> None:
    contract = load_contract(
        _contract(
            tmp_path,
            {
                "temporary_exceptions": {
                    "reports": {
                        "category": "durable-evidence",
                        "owner": "TBD",
                        "review_date": "TODO",
                        "follow_up": "https://github.com/vamseeachanta/aceengineer-website/issues/13",
                        "justification": "TODO",
                        "allowed_paths": ["reports/demo.html"],
                    }
                }
            },
        )
    )

    violations = validate_paths(["reports/demo.html"], contract)

    assert RepoStructureViolation("invalid-exception-metadata", "reports", "reports") in violations


def test_checker_rejects_generated_path_not_listed_in_exception(tmp_path: Path) -> None:
    contract = load_contract(_contract(tmp_path))

    violations = validate_paths(["reports/competitor-analysis/new.html"], contract)

    assert RepoStructureViolation("generated-path-not-classified", "reports", "reports/competitor-analysis/new.html") in violations


def test_current_contract_accepts_approved_roots_and_exceptions() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    contract = load_contract(repo_root / "config" / "repo_structure.yml")
    paths = verify_repo_structure.git_tracked_paths(repo_root)

    violations = validate_paths(paths, contract)

    assert violations == []


def test_root_for_preserves_leading_dot_roots() -> None:
    assert root_for(".github/workflows/ci.yml") == ".github"
    assert root_for(".claude/settings.json") == ".claude"
    assert root_for("./.planning/plan-approved/13.md") == ".planning"


def test_pre_commit_wires_repo_structure_checker() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    precommit = (repo_root / ".pre-commit-config.yaml").read_text(encoding="utf-8")

    assert "repo-structure-contract" in precommit
    assert "scripts/maintenance/verify_repo_structure.py" in precommit


def test_ci_wires_repo_structure_checker() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    workflow = (repo_root / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")

    assert "Run repo-structure contract checker" in workflow
    assert "uv run python scripts/maintenance/verify_repo_structure.py" in workflow


def test_cli_reports_violations_for_explicit_paths(tmp_path: Path) -> None:
    contract = _contract(tmp_path)
    result = subprocess.run(
        [
            sys.executable,
            "scripts/maintenance/verify_repo_structure.py",
            "--config",
            str(contract),
            "--path",
            "scratch.txt",
        ],
        cwd=Path(__file__).resolve().parents[2],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )

    assert result.returncode == 1
    assert "unknown-root" in result.stdout
    assert "scratch.txt" in result.stdout


def test_default_cli_includes_nonignored_worktree_paths(tmp_path: Path, monkeypatch, capsys) -> None:
    contract = _contract(tmp_path)
    monkeypatch.setattr(verify_repo_structure, "git_tracked_paths", lambda repo_root: [])
    monkeypatch.setattr(
        verify_repo_structure,
        "git_worktree_status_entries",
        lambda repo_root: [verify_repo_structure.WorktreeStatusEntry("??", "scratch/file.txt")],
    )

    result = main(["--config", str(contract)])

    captured = capsys.readouterr()
    assert result == 1
    assert "unknown-root" in captured.out
    assert "scratch/file.txt" in captured.out


def test_deleted_generated_artifact_is_rejected_even_when_classified(tmp_path: Path) -> None:
    contract = load_contract(_contract(tmp_path))

    violations = verify_repo_structure.validate_worktree_status_entries(
        [verify_repo_structure.WorktreeStatusEntry(" D", "reports/competitor-analysis/latest.html")],
        contract,
    )

    assert RepoStructureViolation(
        "generated-artifact-deletion-or-relocation",
        "reports",
        "reports/competitor-analysis/latest.html",
    ) in violations


def test_renamed_generated_artifact_is_rejected_as_relocation(tmp_path: Path) -> None:
    contract = load_contract(_contract(tmp_path))

    entries = verify_repo_structure.parse_git_status_entries('R  "reports/competitor-analysis/latest.html" -> "reports/archive/latest.html"\n')
    violations = verify_repo_structure.validate_worktree_status_entries(entries, contract)

    assert RepoStructureViolation(
        "generated-artifact-deletion-or-relocation",
        "reports",
        "reports/competitor-analysis/latest.html -> reports/archive/latest.html",
    ) in violations


def test_reference_scan_blocks_renamed_paths_with_live_consumers() -> None:
    entries = verify_repo_structure.parse_git_status_entries(
        "R  docs/standards/repo-structure.md -> docs/archive/repo-structure.md\n"
    )
    reference_hits = {
        "docs/standards/repo-structure.md": ["README.md:10:see docs/standards/repo-structure.md"]
    }

    violations = verify_repo_structure.validate_move_reference_scan(entries, reference_hits)

    assert RepoStructureViolation(
        "moved-path-has-live-references",
        "docs",
        "docs/standards/repo-structure.md -> docs/archive/repo-structure.md",
    ) in violations


def test_git_status_parser_preserves_quoted_arrow_path_without_rename() -> None:
    entries = verify_repo_structure.parse_git_status_entries('?? "scratch/a -> b.txt"\n')

    assert entries == [verify_repo_structure.WorktreeStatusEntry("??", "scratch/a -> b.txt")]


def test_git_tracked_paths_handles_quoted_filenames_with_non_ascii() -> None:
    repo_root = Path(__file__).resolve().parents[2]

    paths = verify_repo_structure.git_tracked_paths(repo_root)

    assert "assets/Capability Brief · AceEngineer.pdf" in paths
    assert not any(path.startswith('"assets/') for path in paths)


def test_exception_for_non_generated_root_is_invalid(tmp_path: Path) -> None:
    contract = load_contract(
        _contract(
            tmp_path,
            {
                "temporary_exceptions": {
                    "content": {
                        "category": "durable-evidence",
                        "owner": "aceengineer-website maintainers",
                        "review_date": "2026-06-30",
                        "follow_up": "https://github.com/vamseeachanta/aceengineer-website/issues/13",
                        "justification": "Content root is not a generated-artifact root and cannot use generated-output exception metadata.",
                        "allowed_paths": ["content/index.html"],
                    }
                }
            },
        )
    )

    violations = validate_paths(["content/index.html"], contract)

    assert RepoStructureViolation("invalid-exception-root", "content", "content") in violations
