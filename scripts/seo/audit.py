"""Audit built HTML without network access or third-party dependencies.

Rules and numeric policy inputs are cited in config/seo-audit.json. This is a
static contract audit, not a crawler or a complete JSON-LD processor. Reports
never include local absolute paths, raw structured data or exception contents.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CONFIG = ROOT / "config/seo-audit.json"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def normalize(text):
    return " ".join(text.split())


class MetadataParser(HTMLParser):
    """Read head fields, JSON-LD raw text and body h1s; never execute scripts."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.head = False
        self.title = None
        self.script = None
        self.template_depth = 0
        self.values = defaultdict(list)
        self.blocks = []
        self.h1_count = 0

    def handle_starttag(self, tag, attrs):
        attrs = {key: value or "" for key, value in attrs}
        if tag == "template":
            self.template_depth += 1
        if self.template_depth:
            return
        if tag == "head":
            self.head = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "title" and self.head:
            self.title = []
        elif tag == "link" and self.head:
            if "canonical" in attrs.get("rel", "").lower().split():
                self.values["canonical"].append(attrs.get("href", ""))
        elif tag == "meta" and self.head:
            key = (attrs.get("name") or attrs.get("property") or "").lower()
            self.values[key].append(attrs.get("content", ""))
        elif tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self.script = []

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "template":
            self.template_depth = max(0, self.template_depth - 1)
            return
        if self.template_depth:
            return
        if tag == "head":
            self.head = False
        elif tag == "title" and self.title is not None:
            self.values["title"].append(normalize("".join(self.title)))
            self.title = None
        elif tag == "script" and self.script is not None:
            self.blocks.append("".join(self.script))
            self.script = None

    def handle_data(self, data):
        if self.template_depth:
            return
        if self.script is not None:
            self.script.append(data)
        elif self.title is not None:
            self.title.append(data)


def read_page(html):
    parser = MetadataParser()
    parser.feed(html)
    parser.close()
    fields = ["title", "description", "canonical", "og:title", "og:description",
              "og:type", "og:url", "og:image", "twitter:card", "twitter:title",
              "twitter:description", "twitter:image", "robots", "googlebot"]
    return {**{key: parser.values[key] for key in fields},
            "h1_count": parser.h1_count, "_jsonld": parser.blocks}


def https_url(value):
    if not isinstance(value, str):
        return False
    try:
        parsed = urlsplit(value)
        return parsed.scheme == "https" and bool(parsed.hostname) and not (
            parsed.username or parsed.password or re.search(r"\s", value)
        )
    except ValueError:
        return False


def page_url(page, origin):
    # Directory indexes use the site's existing trailing-slash convention.
    suffix = page.removesuffix("index.html")
    return origin + "/" + quote(suffix, safe="/")


def sitemap_page(url, origin):
    """Reject off-site, escaped traversal, query and fragment aliases."""
    if not https_url(url):
        return None
    parsed = urlsplit(url)
    if f"{parsed.scheme}://{parsed.netloc}" != origin or parsed.query or parsed.fragment:
        return None
    decoded = unquote(parsed.path)
    if "\\" in decoded or any(part in {".", ".."} for part in decoded.split("/")):
        return None
    page = decoded.lstrip("/")
    if not page or page.endswith("/"):
        page += "index.html"
    if page_url(page, origin) != url:
        return None
    return page


def jsonld_checks(blocks, config, add, not_evaluated, page):
    types = set()

    def context_ok(context):
        # Remote contexts and term redefinition require a full JSON-LD processor.
        return isinstance(context, str) and context.rstrip("/") in {
            "https://schema.org", "http://schema.org",
        }

    def present(value):
        return value is not None and value != "" and value != [] and value != {}

    def visit(value, inherited=None, node_container=False):
        if isinstance(value, list):
            for item in value:
                if node_container and not isinstance(item, dict):
                    add(page, "jsonld-shape", "node arrays must contain objects", "schema")
                else:
                    visit(item, inherited)
            return
        if not isinstance(value, dict):
            if node_container:
                add(page, "jsonld-shape", "graph must contain node objects", "schema")
            return
        context = value.get("@context", inherited)
        raw_types = value.get("@type", [])
        node_types = raw_types if isinstance(raw_types, list) else [raw_types]
        if any(not isinstance(kind, str) for kind in node_types):
            add(page, "jsonld-type", "@type must be a string or string array", "schema")
            node_types = [kind for kind in node_types if isinstance(kind, str)]
        if node_types and not context_ok(context):
            add(page, "jsonld-context", "typed node needs an unmodified schema.org context", "schema")
        types.update(node_types)
        for kind in node_types:
            profile = config["structured_data"]["required"].get(kind)
            if profile is None:
                not_evaluated.append({"page": page, "rule": "jsonld-properties", "type": kind,
                                      "source": "schema", "reason": "No required-property profile configured for this type."})
                continue
            for prop in profile["properties"]:
                if not present(value.get(prop)):
                    add(page, "jsonld-required", f"{kind}.{prop} is required", profile["source"])
            if kind == "Dataset":
                description = value.get("description")
                limits = config["structured_data"]["dataset_description"]
                if not isinstance(value.get("name"), str) or not value.get("name", "").strip():
                    add(page, "jsonld-required", "Dataset.name must be nonempty text", "dataset")
                if not isinstance(description, str) or not limits["min"] <= len(description) <= limits["max"]:
                    add(page, "jsonld-dataset-description", "Dataset.description outside configured text bounds", limits["source"])
            elif kind == "BreadcrumbList":
                items = value.get("itemListElement")
                minimum = config["structured_data"]["breadcrumb_min_items"]["value"]
                if not isinstance(items, list) or len(items) < minimum:
                    add(page, "jsonld-breadcrumb", "breadcrumb has fewer than the configured minimum items", "breadcrumb")
                else:
                    for position, item in enumerate(items, start=1):  # Google ListItem table, position (2026).
                        if not isinstance(item, dict):
                            add(page, "jsonld-breadcrumb", "breadcrumb item must be an object", "breadcrumb")
                            continue
                        target = item.get("item")
                        name = item.get("name") or (target.get("name") if isinstance(target, dict) else None)
                        target_url = target.get("@id") if isinstance(target, dict) else target
                        valid_position = type(item.get("position")) is int and item["position"] == position
                        if not isinstance(name, str) or not name.strip() or not valid_position or (position < len(items) and not https_url(target_url or "")):
                            add(page, "jsonld-breadcrumb", "breadcrumb needs name, ordered position and nonfinal item URL", "breadcrumb")
        for key, child in value.items():
            if key != "@context":
                visit(child, context, node_container=key == "@graph")

    for block in blocks:
        try:
            value = json.loads(block, parse_constant=lambda _: (_ for _ in ()).throw(ValueError()))
        except (ValueError, TypeError):
            add(page, "jsonld-parse", "JSON-LD block does not parse as strict JSON", "schema")
            continue
        if not isinstance(value, (dict, list)):
            add(page, "jsonld-shape", "JSON-LD block must be an object or array", "schema")
            continue
        if isinstance(value, dict) and "@context" in value and not context_ok(value["@context"]):
            add(page, "jsonld-context", "root context must be schema.org", "schema")
        visit(value, node_container=True)
    return sorted(types)


def audit(built_root, config):
    built_root = Path(built_root)
    violations = []
    report = {"status": "NOT_EVALUATED", "sources": config["sources"], "pages": [],
              "violations": violations, "unapproved": [], "stale_allowlist": [],
              "not_evaluated": [], "inputs": {"html_sha256": {}, "sitemap_sha256": None}}

    def add(page, rule, detail, source="contract"):
        item = {"page": page, "rule": rule, "detail": detail, "source": source}
        if item not in violations:
            violations.append(item)

    files = sorted(built_root.rglob("*.html")) if built_root.is_dir() else []
    if not files:
        report["not_evaluated"].append({"rule": "built-input", "reason": "Built HTML is absent; run the site build before auditing."})
        return report

    origin = config["origin"].rstrip("/")
    paths = {file.relative_to(built_root).as_posix(): file for file in files}
    urls = []
    sitemap = built_root / "sitemap.xml"
    if not sitemap.is_file():
        add("sitemap.xml", "sitemap-missing", "built sitemap is absent", "sitemap")
    else:
        data = sitemap.read_bytes()
        report["inputs"]["sitemap_sha256"] = hashlib.sha256(data).hexdigest()
        try:
            root = ElementTree.fromstring(data)
            if root.tag != f"{{{SITEMAP_NS}}}urlset":
                raise ValueError()
            entries = root.findall(f"{{{SITEMAP_NS}}}url")
            for entry in entries:
                locs = entry.findall(f"{{{SITEMAP_NS}}}loc")
                if len(locs) != 1 or not (locs[0].text or "").strip():
                    add("sitemap.xml", "sitemap-loc", "each url needs exactly one nonempty loc", "sitemap")
                else:
                    urls.append(locs[0].text.strip())
        except (ElementTree.ParseError, ValueError):
            add("sitemap.xml", "sitemap-parse", "expected a sitemap protocol urlset", "sitemap")

    for url, count in sorted(Counter(urls).items()):
        page = sitemap_page(url, origin)
        if count > 1:
            add(page or "sitemap.xml", "sitemap-duplicate", "URL occurs more than once", "sitemap")
        if page is None:
            add("sitemap.xml", "sitemap-url", "loc must be an absolute HTTPS URL at the configured origin without aliases", "sitemap")
        elif page not in paths:
            add(page, "sitemap-missing-file", "sitemap URL has no built HTML file", "sitemap")

    unique = {"title": defaultdict(list), "description": defaultdict(list)}
    for page, file in paths.items():
        data = file.read_bytes()
        report["inputs"]["html_sha256"][page] = hashlib.sha256(data).hexdigest()
        row = read_page(data.decode("utf-8"))
        blocks = row.pop("_jsonld")
        directives = {word.lower() for value in row["robots"] + row["googlebot"]
                      for word in re.split(r"[,\s]+", value)}
        indexable = not directives.intersection({"noindex", "none"})
        expected = page_url(page, origin)
        row.update(page=page, url=expected, indexable=indexable, in_sitemap=expected in urls)
        row["lengths"] = {key: [len(value) for value in row[key]] for key in unique}
        for key, values in unique.items():
            content = row[key]
            # Exactly one title/description/h1/canonical is the issue contract,
            # not an asserted Google ranking threshold (source: contract).
            if len(content) != 1 or not content[0].strip():
                add(page, f"{key}-count", f"expected 1 nonempty value; found {len(content)}")
            for value in {normalize(text) for text in content if text.strip()}:
                values[value].append(page)
            bounds = config["length_limits"][key]
            if bounds["min"] is None and bounds["max"] is None:
                report["not_evaluated"].append({"page": page, "rule": f"{key}-length", "source": bounds["source"],
                                               "reason": "No citable fixed character limit; lengths reported only."})
            else:
                for text in content:
                    if (bounds["min"] is not None and len(text) < bounds["min"]) or (bounds["max"] is not None and len(text) > bounds["max"]):
                        add(page, f"{key}-length", "outside configured character bounds", bounds["source"])
        if row["h1_count"] != 1:
            add(page, "h1-count", f"expected 1; found {row['h1_count']}")
        if row["in_sitemap"] and not indexable:
            add(page, "noindex-in-sitemap", "noindex page occurs in sitemap", "robots")
        canonical = row["canonical"]
        if len(canonical) != 1:
            add(page, "canonical-count", f"expected 1; found {len(canonical)}")
        for value in canonical:
            if not https_url(value):
                add(page, "canonical-https", "canonical must be absolute HTTPS", "canonical")
        if indexable:
            for value in canonical:
                if value != expected or value not in urls:
                    add(page, "canonical-sitemap", "canonical must equal the sitemap URL for this built file", "canonical")
            if not row["in_sitemap"]:
                add(page, "indexable-not-in-sitemap", "indexable built page has no sitemap URL", "sitemap")
            for field in ["og:title", "og:type", "og:image", "og:url", "og:description"]:
                if not any(value.strip() for value in row[field]):
                    add(page, "og-required", f"missing nonempty {field}", "contract" if field == "og:description" else "og")
            if row["og:url"] and row["og:url"][0] != expected:
                add(page, "og-url", "og:url must equal the canonical page URL", "og")
            if any(not https_url(value) for value in row["og:image"]):
                add(page, "og-image-url", "og:image must be an absolute HTTPS URL")
            if len(row["twitter:card"]) != 1 or not row["twitter:card"][0].strip():
                add(page, "twitter-card", "expected one nonempty twitter:card")
            report["not_evaluated"].append({"page": page, "rule": "twitter-completeness", "source": "twitter",
                                           "reason": config["sources"]["twitter"]["note"]})
        row["json_ld_types"] = jsonld_checks(blocks, config, add, report["not_evaluated"], page)
        report["pages"].append(row)

    for key, values in unique.items():
        for grouped_pages in values.values():
            if len(grouped_pages) > 1:
                for page in grouped_pages:
                    add(page, f"{key}-unique", "duplicates: " + ", ".join(sorted(grouped_pages)))

    allowlist = config["allowlist"]
    for item in violations:
        item["allowed"] = any(all(item[key] == entry.get(key) for key in ["page", "rule", "detail"])
                              and bool(entry.get("reason", "").strip()) for entry in allowlist)
    report["stale_allowlist"] = [entry for entry in allowlist if not entry.get("reason", "").strip()
                                or not any(all(item[key] == entry.get(key) for key in ["page", "rule", "detail"])
                                           for item in violations)]
    violations.sort(key=lambda item: (item["page"], item["rule"], item["detail"]))
    report["unapproved"] = [item for item in violations if not item["allowed"]]
    report["status"] = "FAIL" if report["unapproved"] or report["stale_allowlist"] else "PASS"
    report["summary"] = {"pages": len(paths), "indexable": sum(row["indexable"] for row in report["pages"]),
                         "failing_pages": len({item["page"] for item in violations}),
                         "violations": len(violations), "unapproved": len(report["unapproved"]),
                         "stale_allowlist": len(report["stale_allowlist"])}
    return report


def write_report(report, output):
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--built-root", type=Path, default=ROOT / "dist")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--output", type=Path, default=ROOT / "reports/seo-audit.json")
    parser.add_argument("--check", action="store_true", help="Fail on new deviations, stale exceptions or absent built input.")
    args = parser.parse_args(argv)
    config = json.loads(args.config.read_text(encoding="utf-8"))
    report = audit(args.built_root, config)
    write_report(report, args.output)
    print(f"SEO audit: {report['status']}; {len(report['pages'])} pages; {len(report['unapproved'])} unapproved deviations")
    return int(args.check and report["status"] != "PASS")


if __name__ == "__main__":
    raise SystemExit(main())
