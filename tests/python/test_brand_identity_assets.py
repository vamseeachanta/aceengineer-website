"""Brand identity regression tests for #2438.

These tests pin the approved AceEngineer brand hierarchy:
- visible/consumer brand: AceEngineer
- SEO/accessibility long form: Analytical & Computational Engineering
- retired placeholder: A&CE, forbidden in visible chrome, titles, metadata,
  schema alternateName, and consumer-facing labels/CTAs.
"""

from __future__ import annotations

import re
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parents[2]
CONTENT_ROOT = SITE_ROOT / "content"
DIST_ROOT = SITE_ROOT / "dist"
ASSETS_ROOT = SITE_ROOT / "assets" / "img"
LEGACY_EXCLUDED_PARTS = {"content", "dist", "node_modules", ".git"}

DISALLOWED_CONTEXT_PATTERNS = [
    re.compile(r"<title[^>]*>.*A(?:&|&amp;)CE", re.IGNORECASE),
    re.compile(r"<meta[^>]+(?:title|description)[^>]+content=[\"'][^\"']*A(?:&|&amp;)CE", re.IGNORECASE),
    re.compile(r"<meta[^>]+content=[\"'][^\"']*A(?:&|&amp;)CE[^\"']*[\"'][^>]+(?:title|description)", re.IGNORECASE),
    re.compile(r'"alternateName"\s*:\s*"A&CE"', re.IGNORECASE),
    re.compile(r"<(?:h[1-6]|th|button|a|input)[^>]*(?:>|value=[\"'])[^\n<]*A(?:&|&amp;)CE", re.IGNORECASE),
]


def _html_files(root: Path) -> list[Path]:
    if not root.exists():
        return []
    return sorted(path for path in root.rglob("*.html") if "partials" not in path.parts)


def _legacy_html_files() -> list[Path]:
    files = []
    for path in SITE_ROOT.rglob("*.html"):
        rel_parts = path.relative_to(SITE_ROOT).parts
        if any(part in LEGACY_EXCLUDED_PARTS for part in rel_parts):
            continue
        files.append(path)
    return sorted(files)


def _context_violations(root: Path, paths: list[Path] | None = None) -> list[str]:
    violations: list[str] = []
    for path in (paths if paths is not None else _html_files(root)):
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if "A&CE" not in line and "A&amp;CE" not in line:
                continue
            if any(pattern.search(line) for pattern in DISALLOWED_CONTEXT_PATTERNS):
                rel = path.relative_to(SITE_ROOT)
                violations.append(f"{rel}:{line_no}: {line.strip()}")
    return violations


def test_logo_assets_exist_and_are_nonempty():
    """Canonical SVG and PNG logo assets must exist for site/schema consumers."""
    for logo_name in ["logo.svg", "logo.png"]:
        logo_path = ASSETS_ROOT / logo_name
        assert logo_path.exists(), f"missing logo asset: {logo_path.relative_to(SITE_ROOT)}"
        assert logo_path.stat().st_size > 100, f"logo asset is unexpectedly small: {logo_path}"


def test_nav_footer_visible_brand_uses_aceengineer():
    """Shared chrome should expose AceEngineer, not the retired A&CE placeholder."""
    nav = (CONTENT_ROOT / "partials" / "nav.html").read_text(encoding="utf-8")
    footer = (CONTENT_ROOT / "partials" / "footer.html").read_text(encoding="utf-8")

    assert "assets/img/logo.svg" in nav or "assets/img/logo.png" in nav
    assert "alt=\"AceEngineer" in nav or "aria-label=\"AceEngineer" in nav
    assert "A&CE" not in nav and "A&amp;CE" not in nav
    assert "<h3>AceEngineer</h3>" in footer
    assert "<h3>A&CE</h3>" not in footer and "<h3>A&amp;CE</h3>" not in footer


def test_content_visible_metadata_schema_do_not_use_retired_acronym():
    """Canonical content sources must not use A&CE in visible/metadata/schema identity contexts."""
    violations = _context_violations(CONTENT_ROOT)
    assert not violations, "retired A&CE identity contexts in content:\n" + "\n".join(violations[:40])


def test_dist_visible_metadata_schema_do_not_use_retired_acronym_after_build():
    """Built deploy output must mirror the canonical brand identity after npm run build."""
    assert DIST_ROOT.exists(), "dist/ must exist; run npm run build before final validation"
    violations = _context_violations(DIST_ROOT)
    assert not violations, "retired A&CE identity contexts in dist:\n" + "\n".join(violations[:40])
    assert (DIST_ROOT / "assets" / "img" / "logo.svg").exists()
    assert (DIST_ROOT / "assets" / "img" / "logo.png").exists()


def test_legacy_checked_in_html_has_no_retired_identity_contexts():
    """Legacy checked-in HTML outside content/dist must not preserve retired visible A&CE branding."""
    violations = _context_violations(SITE_ROOT, _legacy_html_files())
    assert not violations, "retired A&CE identity contexts in legacy checked-in HTML:\n" + "\n".join(violations[:40])


def test_existing_positioning_tests_no_longer_require_retired_acronym():
    """Existing tests should not preserve the old A&CE root-page contract."""
    positioning_test = SITE_ROOT / "tests" / "python" / "test_wrk146_positioning.py"
    text = positioning_test.read_text(encoding="utf-8")
    assert "A&amp;CE" not in text
    assert '"A&CE"' not in text
    assert "must use firm name (A&CE)" not in text
