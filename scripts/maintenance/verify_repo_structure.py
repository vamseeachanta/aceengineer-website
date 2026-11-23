#!/usr/bin/env python3
"""Verify aceengineer-website's Phase 1 repository-structure contract.

The checker is intentionally conservative: it validates the current tracked
repository shape plus non-ignored working-tree paths without moving or deleting
anything. It also rejects deletion/relocation of classified generated evidence
so generated-looking artifacts cannot disappear silently during structure work.
"""

from __future__ import annotations

import argparse
import collections.abc
import dataclasses
import re
import shlex
import subprocess
import sys
from pathlib import Path
from typing import Iterable, Sequence

import yaml

PLACEHOLDER_VALUES = {"", "tbd", "todo", "none", "n/a", "na", "unknown"}
VALID_EXCEPTION_CATEGORIES = {
    "durable-evidence",
    "temporary-durable-exception",
    "authorized-generated-artifact",
}


@dataclasses.dataclass(frozen=True)
class RepoStructureViolation:
    """Stable repo-structure violation emitted by the checker."""

    code: str
    root: str
    path: str


@dataclasses.dataclass(frozen=True)
class WorktreeStatusEntry:
    """Parsed `git status --short` path with its two-character status code."""

    status: str
    path: str
    original_path: str | None = None


@dataclasses.dataclass(frozen=True)
class RepoStructureContract:
    """Loaded machine-readable repo-structure policy."""

    allowed_roots: frozenset[str]
    ignored_roots: frozenset[str]
    generated_artifact_roots: frozenset[str]
    temporary_exceptions: dict[str, dict]
    schema_violations: tuple[RepoStructureViolation, ...] = ()


def root_for(path: str) -> str:
    """Return the first repository path component without stripping leading dots."""

    normalized = path.replace("\\", "/")
    while normalized.startswith("./"):
        normalized = normalized[2:]
    normalized = normalized.strip()
    return normalized.split("/", 1)[0] if normalized else ""


def load_contract(path: Path) -> RepoStructureContract:
    """Load `config/repo_structure.yml` into a normalized contract object."""

    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    schema_violations: list[RepoStructureViolation] = []
    if not isinstance(data, collections.abc.Mapping):
        data = {}
        schema_violations.append(
            RepoStructureViolation("invalid-contract-schema", "<root>", "config/repo_structure.yml")
        )

    def _string_set(field: str) -> frozenset[str]:
        value = data.get(field, [])
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            schema_violations.append(RepoStructureViolation("invalid-contract-schema", field, field))
            return frozenset()
        return frozenset(value)

    exceptions = data.get("temporary_exceptions", {})
    if not isinstance(exceptions, dict):
        schema_violations.append(
            RepoStructureViolation("invalid-contract-schema", "temporary_exceptions", "temporary_exceptions")
        )
        exceptions = {}

    return RepoStructureContract(
        allowed_roots=_string_set("allowed_roots"),
        ignored_roots=_string_set("ignored_roots"),
        generated_artifact_roots=_string_set("generated_artifact_roots"),
        temporary_exceptions=dict(exceptions),
        schema_violations=tuple(schema_violations),
    )


def _is_placeholder(value: object) -> bool:
    text = str(value or "").strip().lower()
    return text in PLACEHOLDER_VALUES or text.startswith("todo") or text.startswith("tbd")


def _exception_metadata_valid(root: str, metadata: dict) -> bool:
    required_fields = ("category", "owner", "review_date", "justification")
    if any(_is_placeholder(metadata.get(field)) for field in required_fields):
        return False
    if metadata.get("category") not in VALID_EXCEPTION_CATEGORIES:
        return False
    follow_up = str(metadata.get("follow_up", "")).strip()
    permanent = str(metadata.get("permanent_justification", "")).strip()
    if _is_placeholder(follow_up) and _is_placeholder(permanent):
        return False
    if follow_up and not follow_up.startswith("https://github.com/"):
        return False
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(metadata.get("review_date", ""))):
        return False
    allowed_paths = metadata.get("allowed_paths", [])
    if not isinstance(allowed_paths, list) or not allowed_paths:
        return False
    return all(root_for(path) == root for path in allowed_paths)


def validate_exception_metadata(contract: RepoStructureContract) -> list[RepoStructureViolation]:
    """Validate all generated-artifact temporary-exception metadata."""

    violations: list[RepoStructureViolation] = list(contract.schema_violations)
    for root, metadata in sorted(contract.temporary_exceptions.items()):
        if root not in contract.generated_artifact_roots:
            violations.append(RepoStructureViolation("invalid-exception-root", root, root))
            continue
        if not isinstance(metadata, dict) or not _exception_metadata_valid(root, metadata):
            violations.append(RepoStructureViolation("invalid-exception-metadata", root, root))
    return violations


def validate_paths(
    paths: Iterable[str],
    contract: RepoStructureContract,
    *,
    honor_ignored_roots: bool = False,
) -> list[RepoStructureViolation]:
    """Validate repository paths against the loaded contract."""

    violations = validate_exception_metadata(contract)
    classified_paths_by_root = {
        root: set(metadata.get("allowed_paths", []))
        for root, metadata in contract.temporary_exceptions.items()
        if isinstance(metadata, dict)
    }

    for raw_path in sorted(set(paths)):
        path = raw_path.replace("\\", "/")
        root = root_for(path)
        if not root:
            continue
        if honor_ignored_roots and root in contract.ignored_roots:
            continue
        if root in contract.generated_artifact_roots:
            if root not in contract.temporary_exceptions:
                violations.append(
                    RepoStructureViolation("generated-root-missing-exception", root, path)
                )
                continue
            if path not in classified_paths_by_root.get(root, set()):
                violations.append(
                    RepoStructureViolation("generated-path-not-classified", root, path)
                )
                continue
        if root not in contract.allowed_roots and root not in contract.generated_artifact_roots:
            violations.append(RepoStructureViolation("unknown-root", root, path))
    return sorted(set(violations), key=lambda item: (item.code, item.root, item.path))


def validate_worktree_status_entries(
    entries: Iterable[WorktreeStatusEntry], contract: RepoStructureContract
) -> list[RepoStructureViolation]:
    """Validate worktree status entries, preserving destructive status codes."""

    violations: list[RepoStructureViolation] = []
    for entry in entries:
        roots = [root_for(entry.path)]
        if entry.original_path:
            roots.append(root_for(entry.original_path))
        status = entry.status.strip()
        if ("D" in entry.status or status.startswith("R")) and any(
            root in contract.generated_artifact_roots for root in roots
        ):
            root = next(root for root in roots if root in contract.generated_artifact_roots)
            path = (
                f"{entry.original_path} -> {entry.path}"
                if entry.original_path
                else entry.path
            )
            violations.append(
                RepoStructureViolation("generated-artifact-deletion-or-relocation", root, path)
            )
    return sorted(set(violations), key=lambda item: (item.code, item.root, item.path))


def validate_move_reference_scan(
    entries: Iterable[WorktreeStatusEntry], reference_hits: dict[str, Sequence[str]]
) -> list[RepoStructureViolation]:
    """Reject renamed paths that still have live references to their old path."""

    violations: list[RepoStructureViolation] = []
    for entry in entries:
        if not entry.original_path:
            continue
        hits = [hit for hit in reference_hits.get(entry.original_path, []) if hit.strip()]
        if not hits:
            continue
        violations.append(
            RepoStructureViolation(
                "moved-path-has-live-references",
                root_for(entry.original_path),
                f"{entry.original_path} -> {entry.path}",
            )
        )
    return sorted(set(violations), key=lambda item: (item.code, item.root, item.path))


def git_reference_hits_for_moves(
    repo_root: Path, entries: Iterable[WorktreeStatusEntry]
) -> dict[str, list[str]]:
    """Return `git grep` hits for old paths in rename entries.

    This is a conservative Phase 1 guard: if a pending rename still has any
    repository reference to the old path, the checker blocks the move until a
    later approved cleanup includes reference-scan proof and updates consumers.
    """

    hits: dict[str, list[str]] = {}
    for entry in entries:
        if not entry.original_path:
            continue
        result = subprocess.run(
            ["git", "grep", "-n", "--fixed-strings", "--", entry.original_path, "."],
            cwd=repo_root,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if result.returncode == 0:
            hits[entry.original_path] = [
                line for line in result.stdout.splitlines() if line.strip()
            ]
        elif result.returncode not in {1}:
            hits[entry.original_path] = [f"git grep failed: {result.stderr.strip()}"]
    return hits


def _split_status_path(payload: str, *, is_rename: bool) -> tuple[str | None, str]:
    """Split a short-status payload into optional old path and current path."""

    if not is_rename or " -> " not in payload:
        return None, _unquote_path(payload)
    old_path, new_path = payload.split(" -> ", 1)
    return _unquote_path(old_path), _unquote_path(new_path)


def _unquote_path(path: str) -> str:
    """Parse Git's quoted path form while leaving unquoted paths unchanged."""

    path = path.strip()
    if path.startswith('"') and path.endswith('"'):
        inner = path[1:-1]
        decoded = bytearray()
        index = 0
        while index < len(inner):
            char = inner[index]
            if char == "\\" and index + 1 < len(inner):
                escaped = inner[index + 1]
                if escaped in {'"', "\\"}:
                    decoded.extend(escaped.encode("utf-8"))
                    index += 2
                    continue
                octal = inner[index + 1 : index + 4]
                if len(octal) == 3 and all(digit in "01234567" for digit in octal):
                    decoded.append(int(octal, 8))
                    index += 4
                    continue
            decoded.extend(char.encode("utf-8"))
            index += 1
        return decoded.decode("utf-8", errors="surrogateescape")
    if path.startswith('"'):
        return shlex.split(path)[0]
    return path


def parse_git_status_entries(output: str) -> list[WorktreeStatusEntry]:
    """Parse `git status --short --untracked-files=all` output."""

    entries: list[WorktreeStatusEntry] = []
    for line in output.splitlines():
        if not line.strip():
            continue
        status = line[:2]
        payload = line[3:] if len(line) > 3 else ""
        old_path, path = _split_status_path(payload, is_rename=status.startswith("R"))
        entries.append(WorktreeStatusEntry(status=status, path=path, original_path=old_path))
    return entries


def parse_git_status_paths(output: str) -> list[str]:
    """Return current paths from short-status output."""

    return [entry.path for entry in parse_git_status_entries(output)]


def _git(repo_root: Path, args: Sequence[str]) -> str:
    return subprocess.check_output(["git", *args], cwd=repo_root, text=True)


def git_tracked_paths(repo_root: Path) -> list[str]:
    """Return tracked repository paths without C-style quoting non-ASCII names."""

    output = subprocess.check_output(
        ["git", "ls-files", "-z"], cwd=repo_root, text=False
    )
    return [
        path.decode("utf-8", errors="surrogateescape")
        for path in output.split(b"\0")
        if path
    ]


def git_worktree_status_entries(repo_root: Path) -> list[WorktreeStatusEntry]:
    """Return tracked and untracked non-ignored worktree status entries."""

    output = _git(repo_root, ["status", "--short", "--untracked-files=all"])
    return parse_git_status_entries(output)


def _print_violations(violations: Sequence[RepoStructureViolation]) -> None:
    if not violations:
        print("repo-structure: OK")
        return
    print("repo-structure: violations found")
    for violation in violations:
        print(f"{violation.code}\t{violation.root}\t{violation.path}")


def _default_config_path(repo_root: Path) -> Path:
    return repo_root / "config" / "repo_structure.yml"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="Path to repo_structure.yml (default: config/repo_structure.yml)",
    )
    parser.add_argument(
        "--path",
        action="append",
        default=[],
        help="Validate an explicit path instead of the default git path set; repeatable.",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """CLI entrypoint."""

    parser = build_parser()
    args = parser.parse_args(argv)
    repo_root = Path.cwd()
    config_path = args.config or _default_config_path(repo_root)
    contract = load_contract(config_path)

    if args.path:
        status_entries: list[WorktreeStatusEntry] = []
        violations = validate_paths(list(args.path), contract)
    else:
        status_entries = git_worktree_status_entries(repo_root)
        tracked_paths = git_tracked_paths(repo_root)
        worktree_paths = [entry.path for entry in status_entries]
        violations = validate_paths(tracked_paths, contract)
        violations.extend(validate_paths(worktree_paths, contract, honor_ignored_roots=True))

    violations.extend(validate_worktree_status_entries(status_entries, contract))
    violations.extend(validate_move_reference_scan(status_entries, git_reference_hits_for_moves(repo_root, status_entries)))
    violations = sorted(set(violations), key=lambda item: (item.code, item.root, item.path))
    _print_violations(violations)
    return 1 if violations else 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())


