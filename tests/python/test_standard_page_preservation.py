"""The standards generator must preserve pages with authored additions."""
import importlib.util
from pathlib import Path

import yaml


def test_generator_preserves_authored_pages(tmp_path, monkeypatch):
    script = Path(__file__).resolve().parents[2] / "scripts/seo/generate_standard_pages.py"
    spec = importlib.util.spec_from_file_location("standard_generator", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    data = yaml.safe_load(module.MANIFEST.read_text())
    protected = {
        "arps-decline-curve", "dnv-rp-f105-free-span-viv", "mooring-line-fatigue",
        "dynacard-diagnostics", "dnv-rp-b401-cathodic-protection",
    }
    selected = [row for row in data["standards"] if row["slug"] in protected]
    assert len(selected) == len(protected)
    out_dir = tmp_path / "content/standards"
    out_dir.mkdir(parents=True)
    before = {}
    for row in selected:
        path = out_dir / (row["slug"] + ".html")
        before[path] = f"authored calculator and equations: {row['slug']}\n"
        path.write_text(before[path])
    manifest = tmp_path / "standards.yaml"
    manifest.write_text(yaml.safe_dump({"standards": selected}))
    monkeypatch.setattr(module, "ROOT", tmp_path)
    monkeypatch.setattr(module, "MANIFEST", manifest)
    monkeypatch.setattr(module, "OUT_DIR", out_dir)
    module.main()
    assert {path: path.read_text() for path in before} == before
    assert (out_dir / "index.html").exists()
