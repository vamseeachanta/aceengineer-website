"""Regression guards for canonical repository routing surfaces."""

from __future__ import annotations

import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]

DOCS_README = REPO_ROOT / "docs" / "README.md"
OPERATOR_MAP = REPO_ROOT / "docs" / "maps" / "aceengineer-website-operator-map.md"
AGENTS = REPO_ROOT / "AGENTS.md"
README = REPO_ROOT / "README.md"
DEPLOYMENT_GUIDE = REPO_ROOT / "docs" / "DEPLOYMENT_GUIDE.md"
ARCHITECTURE = REPO_ROOT / "docs" / "WEBSITE_ARCHITECTURE.md"

REQUIRED_OPERATOR_AREAS = {
    "root html pages",
    "content/",
    "blog/",
    "case-studies/",
    "calculators/",
    "scripts/",
    "tests/",
}

README_BANNED_ACTIVE = (
    "Deploy to GitHub Pages",
    "GitHub Pages Settings",
    "Enable GitHub Pages",
    "pages.github.com",
)

DEPLOYMENT_GUIDE_BANNED_ACTIVE = (
    "deploy.yml",
    "Phase 3 - GitHub Pages Deployment",
    "deploying the static AceEngineer website to GitHub Pages",
    "Enable GitHub Pages",
)

DEPLOYMENT_GUIDE_LEGACY_PREFIXES = (
    "<!-- LEGACY: This document describes the historical GitHub Pages deployment path.",
    "# Legacy: GitHub Pages deployment (retired)",
)

DEPLOYMENT_GUIDE_VERCEL_TOKENS = (
    "Vercel",
    "vercel.json",
    "CNAME",
    "https://aceengineer.com",
)

DOCS_TO_LINK_CHECK = (
    DOCS_README,
    OPERATOR_MAP,
    AGENTS,
    README,
    DEPLOYMENT_GUIDE,
    ARCHITECTURE,
)

DOC_GLOBS_TO_SCAN = (
    README,
    AGENTS,
    *sorted((REPO_ROOT / "docs").rglob("*.md")),
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def strip_fenced_code(markdown: str) -> str:
    return re.sub(r"```.*?```", "", markdown, flags=re.DOTALL)


def active_lines(markdown: str) -> list[str]:
    lines = strip_fenced_code(markdown).splitlines()
    return [
        line
        for line in lines
        if not line.lstrip().startswith(("Historical:", "**Migrated from**", "Migrated from"))
    ]


def markdown_links(markdown: str) -> list[str]:
    pattern = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
    return pattern.findall(markdown)


def target_path(source: Path, href: str) -> Path | None:
    target = href.split("#", 1)[0].strip()
    if not target:
        return None
    if re.match(r"^[a-z][a-z0-9+.-]*:", target, flags=re.IGNORECASE):
        return None
    return (source.parent / target).resolve()


def test_routing_surfaces_docs_readme_exists():
    assert DOCS_README.is_file()
    assert read(DOCS_README).strip()


def test_routing_surfaces_operator_map_exists_and_covers_required_areas():
    assert OPERATOR_MAP.is_file()
    text = read(OPERATOR_MAP).lower()
    assert text.strip()
    missing = sorted(area for area in REQUIRED_OPERATOR_AREAS if area not in text)
    assert missing == []


def test_routing_surfaces_agents_has_repo_routing_section():
    text = read(AGENTS)
    assert "Routing (repo-specific)" in text
    assert "docs/maps/aceengineer-website-operator-map.md" in text


def test_routing_surfaces_readme_has_no_active_github_pages_block():
    active_text = "\n".join(active_lines(read(README)))
    for banned in README_BANNED_ACTIVE:
        assert banned not in active_text


def test_routing_surfaces_deployment_guide_has_no_active_deploy_yml_reference():
    text = read(DEPLOYMENT_GUIDE)
    has_legacy_banner = text.startswith(DEPLOYMENT_GUIDE_LEGACY_PREFIXES)
    if has_legacy_banner:
        return

    for banned in DEPLOYMENT_GUIDE_BANNED_ACTIVE:
        assert banned not in text

    for token in DEPLOYMENT_GUIDE_VERCEL_TOKENS:
        assert token in text


def test_routing_surfaces_no_legacy_product_doc_references():
    offenders = [
        path.relative_to(REPO_ROOT).as_posix()
        for path in DOC_GLOBS_TO_SCAN
        if ".agent-os/product" in read(path)
    ]

    assert offenders == []


def test_routing_surfaces_no_broken_internal_doc_links():
    broken_links: list[str] = []

    for source in DOCS_TO_LINK_CHECK:
        assert source.is_file(), f"missing checked doc: {source.relative_to(REPO_ROOT)}"
        for href in markdown_links(read(source)):
            resolved = target_path(source, href)
            if resolved is None:
                continue
            if not resolved.exists():
                broken_links.append(f"{source.relative_to(REPO_ROOT)} -> {href}")

    assert broken_links == []
