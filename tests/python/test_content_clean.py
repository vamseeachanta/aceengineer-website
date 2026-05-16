"""Asserts no git merge-conflict markers in content/ markdown files.

Filed as durable enforcement against a recurring failure mode. The blog post
content/blog/AI_AGENT_ORCHESTRATION.md had 105 unresolved markers across 35
conflict blocks from commit 91b18d1 (src/→content/ directory rename); resolution
landed via issue #14.

Refs: aceengineer-website#14, workspace-hub#2411, workspace-hub#2719.
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = REPO_ROOT / "content"
BLOG_FILE = CONTENT_DIR / "blog" / "AI_AGENT_ORCHESTRATION.md"

CONFLICT_PATTERN = re.compile(r"^(<<<<<<<|=======|>>>>>>>)", re.MULTILINE)


def test_content_dir_exists():
    """content/ directory must exist."""
    assert CONTENT_DIR.is_dir(), f"{CONTENT_DIR} missing"


def test_blog_file_exists():
    """The AI_AGENT_ORCHESTRATION.md blog post must exist."""
    assert BLOG_FILE.exists(), f"{BLOG_FILE} missing"


def test_no_conflict_markers_in_any_markdown():
    """No .md file under content/ may contain git merge-conflict markers."""
    bad = []
    for f in CONTENT_DIR.rglob("*.md"):
        if CONFLICT_PATTERN.search(f.read_text(encoding="utf-8")):
            bad.append(str(f.relative_to(REPO_ROOT)))
    assert not bad, f"Conflict markers in {len(bad)} file(s): {bad}"


def test_ai_agent_orchestration_specific():
    """Explicit assertion on the file that triggered #14."""
    body = BLOG_FILE.read_text(encoding="utf-8")
    markers = CONFLICT_PATTERN.findall(body)
    assert len(markers) == 0, (
        f"{BLOG_FILE.relative_to(REPO_ROOT)} contains {len(markers)} conflict markers; "
        f"run `git checkout --ours {BLOG_FILE.relative_to(REPO_ROOT)}` to resolve"
    )


def test_blog_paths_use_head_structure():
    """After resolution, blog references must use HEAD paths (scripts/automation, config/ai_agents),
    not the stale origin/main paths (modules/automation, modules/config) from before commit 91b18d1.
    """
    body = BLOG_FILE.read_text(encoding="utf-8")
    assert "scripts/automation" in body, "HEAD path scripts/automation missing"
    assert "config/ai_agents" in body, "HEAD path config/ai_agents missing"
    assert "modules/automation" not in body, (
        "Stale origin/main path modules/automation present — conflict not fully resolved"
    )
    assert "modules/config" not in body, (
        "Stale origin/main path modules/config present — conflict not fully resolved"
    )
