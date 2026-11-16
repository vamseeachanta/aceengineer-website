"""The standards generator must preserve pages with authored additions."""

import copy
import hashlib
import importlib.util
import json
from html.parser import HTMLParser
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import urlsplit

import pytest
import yaml

# Repository layout: this test lives in tests/python/.
ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "config/seo/standards.yaml"
PROTECTED_SLUGS = [
    row["slug"]
    for row in yaml.safe_load(MANIFEST.read_bytes())["standards"]
    if row.get("preserve_authored")
]


class PageStructure(HTMLParser):
    """Record authored links, targets, landmarks and parsed structured data."""

    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.calculator_hrefs = []
        self.fragment_hrefs = []
        self.fragment_targets = []
        self.main_ids = []
        self.skip_destinations = []
        self.json_ld = []
        self.includes = []
        self._json_text = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.fragment_targets.append(attrs["id"])
        if tag == "a" and "name" in attrs:
            self.fragment_targets.append(attrs["name"])
        if tag == "main" or attrs.get("role") == "main":
            self.main_ids.append(attrs.get("id"))
        if tag == "include":
            self.includes.append(attrs["src"])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._json_text = []
        if "href" in attrs:
            href = attrs["href"]
            self.hrefs.append(href)
            target = urlsplit(href)
            if "calculators" in target.path.split("/") or "calculator" in target.fragment:
                self.calculator_hrefs.append(href)
            if target.fragment and not target.scheme and not target.netloc:
                self.fragment_hrefs.append(href)
            if "skip-link" in attrs.get("class", "").split():
                self.skip_destinations.append(href)

    def handle_data(self, data):
        if self._json_text is not None:
            self._json_text.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self._json_text is not None:
            self.json_ld.append(json.loads("".join(self._json_text)))
            self._json_text = None


def page_structure(path, content_root):
    page = PageStructure()
    page.feed(path.read_text(encoding="utf-8"))
    # Source pages reference shared navigation rather than inline its skip link.
    # Parse only copied includes, recursively, without running the site builder.
    seen = set()
    for include in page.includes:
        if include not in seen:
            seen.add(include)
            page.feed((content_root / include).read_text(encoding="utf-8"))
    page.close()
    return page


def assert_source_hash(path, expected_hash):
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected_hash, (
        f"source hash changed: {path.name}"
    )


@pytest.fixture
def sandbox(tmp_path, monkeypatch):
    script = ROOT / "scripts/seo/generate_standard_pages.py"
    spec = importlib.util.spec_from_file_location("standard_generator", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    manifest_bytes = MANIFEST.read_bytes()
    data = yaml.safe_load(manifest_bytes)
    protected = {
        row["slug"]: ROOT / "content/standards" / f"{row['slug']}.html"
        for row in data["standards"]
        if row.get("preserve_authored")
    }
    assert protected, "the manifest must declare authored pages to exercise preservation"
    originals = {path: path.read_bytes() for path in protected.values()}
    originals[MANIFEST] = manifest_bytes
    # Include sources are needed only for structural inspection, not generation.
    originals.update({
        path: path.read_bytes() for path in (ROOT / "content/partials").glob("*.html")
    })
    hashes = {path: hashlib.sha256(raw).hexdigest() for path, raw in originals.items()}
    for source, raw in originals.items():
        destination = tmp_path / source.relative_to(ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(raw)
    manifest = tmp_path / MANIFEST.relative_to(ROOT)
    out_dir = tmp_path / "content/standards"
    monkeypatch.setattr(module, "ROOT", tmp_path)
    monkeypatch.setattr(module, "MANIFEST", manifest)
    monkeypatch.setattr(module, "OUT_DIR", out_dir)
    yield SimpleNamespace(
        module=module, data=data, manifest=manifest, out_dir=out_dir,
        content_root=tmp_path / "content", protected=protected,
        originals=originals, hashes=hashes,
    )
    # Check tracked inputs even when an assertion in a test fails.
    for source, raw in originals.items():
        assert source.read_bytes() == raw, source.name
        assert_source_hash(source, hashes[source])


def test_generator_preserves_authored_pages(sandbox):
    # Independently enumerate flags again: no historical slug list or fixed count.
    expected = [
        row for row in yaml.safe_load(MANIFEST.read_bytes())["standards"]
        if row.get("preserve_authored")
    ]
    assert len(sandbox.protected) == len(expected)
    assert set(sandbox.protected) == {row["slug"] for row in expected}
    sandbox.module.main()
    copied = [sandbox.out_dir / f"{row['slug']}.html" for row in expected]
    assert sum(path.is_file() for path in copied) == len(expected)
    for path in copied:
        source = sandbox.protected[path.stem]
        assert path.read_bytes() == sandbox.originals[source]
        assert_source_hash(path, sandbox.hashes[source])
    assert (sandbox.out_dir / "index.html").is_file()


@pytest.mark.parametrize("slug", PROTECTED_SLUGS)
def test_all_manifest_protected_pages_keep_source_hashes(sandbox, slug):
    path = sandbox.out_dir / f"{slug}.html"
    source = sandbox.protected[slug]
    before = path.read_bytes()
    before_hash = hashlib.sha256(before).hexdigest()
    assert before == sandbox.originals[source]
    assert before_hash == sandbox.hashes[source]
    structure = page_structure(path, sandbox.content_root)
    # Issue #135 requires two successive generations, checked after each run.
    for _ in range(2):
        sandbox.module.main()
        assert_source_hash(path, before_hash)
        assert path.read_bytes() == before
        after = page_structure(path, sandbox.content_root)
        assert after.calculator_hrefs == structure.calculator_hrefs
        assert after.fragment_hrefs == structure.fragment_hrefs
        assert after.fragment_targets == structure.fragment_targets
        assert after.json_ld == structure.json_ld
        assert after.main_ids == structure.main_ids
        assert after.skip_destinations == structure.skip_destinations
        assert source.read_bytes() == before
        assert_source_hash(source, before_hash)


@pytest.mark.parametrize(
    "preserve_authored", [False, True], ids=["unprotected", "missing-protected"],
)
def test_generated_standard_pages_keep_main_and_index_links(sandbox, preserve_authored):
    row = copy.deepcopy(next(
        row for row in sandbox.data["standards"] if not row.get("preserve_authored")
    ))
    # Literal synthetic URL expectations are independent of generator rendering.
    row.update(
        slug="synthetic-standard", code="Synthetic reference", name="Synthetic standard",
    )
    row["preserve_authored"] = preserve_authored
    sandbox.data["standards"].append(row)
    sandbox.manifest.write_text(yaml.safe_dump(sandbox.data), encoding="utf-8")
    target = sandbox.out_dir / "synthetic-standard.html"
    index = sandbox.out_dir / "index.html"
    assert not target.exists()
    sandbox.module.main()
    assert target.is_file()
    assert page_structure(target, sandbox.content_root).main_ids == ["main"]
    assert "synthetic-standard.html" in page_structure(index, sandbox.content_root).hrefs
    first_page = target.read_bytes()
    first_index = index.read_bytes()
    sandbox.module.main()
    assert target.read_bytes() == first_page
    assert index.read_bytes() == first_index
    assert page_structure(target, sandbox.content_root).main_ids == ["main"]
    assert "synthetic-standard.html" in page_structure(index, sandbox.content_root).hrefs


def test_preservation_hash_rejects_changed_output(sandbox):
    source = next(iter(sandbox.protected.values()))
    path = sandbox.out_dir / source.name
    expected_hash = sandbox.hashes[source]
    assert_source_hash(path, expected_hash)
    changed = bytearray(path.read_bytes())
    # Issue #135 prescribes a one-byte alteration; flip one bit of the first byte.
    changed[0] ^= 1
    path.write_bytes(changed)
    with pytest.raises(AssertionError, match="source hash changed"):
        assert_source_hash(path, expected_hash)
