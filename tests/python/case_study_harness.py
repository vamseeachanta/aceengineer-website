"""Uniform, offline case-study audit; see docs/case-study-consistency.md.

Rules are local consistency policies with the cited accessibility/protocol basis.
They are not a WCAG conformance assessment. Missing build evidence is explicit.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import asdict, dataclass, field
from html.parser import HTMLParser
from itertools import pairwise
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree

import yaml

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = Path(__file__).with_name("case_study_contract.json")
# HTML Living Standard, syntax/void-elements; no arbitrary parser depth limit.
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}


def norm(value):
    return " ".join(value.split()).casefold()


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)

    def find(self, tag):
        return [n for n in self.walk() if n.tag == tag]

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        if self.tag in {"script", "style", "template"}:
            return ""
        return " ".join(c.text() if isinstance(c, Node) else c for c in self.children)


class Document(HTMLParser):
    """Small tag/attribute collector; browser DOM repair is outside this audit."""

    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.stack = [self.root]
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in reversed(range(1, len(self.stack))):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def read_html(path):
    return Document(path.read_text(encoding="utf-8")).root


def discover(root):
    """Include directory indexes and future nested case-study pages."""
    content = Path(root) / "content"
    return sorted(p.relative_to(content)
                  for p in (content / "case-studies").rglob("*.html"))


@dataclass
class Result:
    page: str
    check: str
    status: str
    details: list[str]

    @property
    def message(self):
        return f"{self.page} [{self.check}] {self.status}: {'; '.join(self.details)}"


@dataclass
class Context:
    root: Path
    built_root: Path
    page: Path
    source: Node
    built: Node | None
    contract: dict
    peers: list = field(default_factory=list)

    @property
    def document(self):
        return self.built if self.built is not None else self.source

    @property
    def documents(self):
        return [("Source", self.source)] + ([("Built", self.built)] if self.built is not None else [])


def evaluated(errors=(), success="Rule satisfied"):
    return ("FAIL", list(errors)) if errors else ("PASS", [success])


def unavailable(reason):
    return "NOT_EVALUATED", [reason]


def h1(ctx):
    # Exactly one is the site contract, not a numeric requirement of WCAG.
    return evaluated([] if len(ctx.source.find("h1")) == 1 else ["Expected exactly one h1"])


def heading_order(ctx):
    # WAI Page Structure Tutorial, Heading ranks: advance by at most one rank;
    # returning to a lower rank closes a subsection (WCAG 2.2 SC 1.3.1, 2.4.6).
    ranks = [int(n.tag[1]) for n in ctx.source.walk() if re.fullmatch(r"h[1-6]", n.tag)]
    errors = [f"Heading transition {a} to {b} skips a rank"
              for a, b in pairwise(ranks) if b > a + 1]
    if ranks and ranks[0] != 1:
        errors.append("First heading must be h1")
    return evaluated(errors)


def metadata_values(doc, kind):
    if kind == "title":
        return [norm(n.text()) for n in doc.find("title")]
    return [norm(n.attrs.get("content") or "") for n in doc.find("meta")
            if norm(n.attrs.get("name") or "") == "description"]


def metadata(ctx, kind):
    # Site contract: one nonempty value, unique within discovered case studies.
    # WCAG 2.2 SC 2.4.2 supports descriptive titles; no SEO length guesses.
    values = metadata_values(ctx.source, kind)
    if len(values) != 1 or not values[0]:
        return evaluated([f"Expected one nonempty {kind}"])
    duplicate = any(values[0] in metadata_values(peer.source, kind)
                    for peer in ctx.peers if peer is not ctx)
    return evaluated([f"Duplicate {kind} across case-study pages"] if duplicate else [])


def canonicals(doc):
    return [n.attrs.get("href") or "" for n in doc.find("link")
            if "canonical" in (n.attrs.get("rel") or "").split()]


def canonical_sitemap(ctx):
    # RFC 6596 (2012), section 3; sitemaps.org protocol, XML tag definitions.
    sitemap = ctx.built_root / "sitemap.xml"
    if not sitemap.is_file():
        return unavailable("Built sitemap unavailable; run npm run build")
    try:
        tree = ElementTree.parse(sitemap)
    except ElementTree.ParseError:
        return evaluated(["Built sitemap is not valid XML"])
    route = "/" + ctx.page.as_posix()
    # build.js canonicalUrlFor: directory indexes use the directory URL.
    if route.endswith("index.html"):
        route = route.removesuffix("index.html")
    locations = [n.text or "" for n in tree.findall(
        "{http://www.sitemaps.org/schemas/sitemap/0.9}url/"
        "{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    canonical = canonicals(ctx.built)
    try:
        matches = [url for url in locations if urlsplit(url).path == route]
        for url in canonical:
            urlsplit(url)
    except ValueError:
        return evaluated(["Malformed sitemap or canonical URL"])
    valid = len(matches) == 1 and canonical == matches
    if valid:
        parts = urlsplit(canonical[0])
        valid = parts.scheme == "https" and bool(parts.netloc) and not parts.fragment
    return evaluated([] if valid else ["Canonical must equal the unique sitemap URL for this page"])


def json_ld(ctx):
    # schema.org WebPage, CollectionPage (a WebPage subtype), BreadcrumbList.
    types = set()
    scripts = [n for n in ctx.source.find("script")
               if n.attrs.get("type") == "application/ld+json"]

    def collect(value):
        if isinstance(value, list):
            for item in value:
                collect(item)
        elif isinstance(value, dict):
            node_type = value.get("@type", [])
            if isinstance(node_type, str):
                node_type = [node_type]
            if isinstance(node_type, list):
                types.update(t for t in node_type if isinstance(t, str))
            for key, child in value.items():
                if key != "@type":
                    collect(child)

    def reject_constant(value):
        raise ValueError("Non-JSON numeric literal")

    try:
        for script in scripts:
            collect(json.loads("".join(c for c in script.children if isinstance(c, str)),
                               parse_constant=reject_constant))
    except (ValueError, TypeError):
        return evaluated(["JSON-LD does not parse"])
    has_page = bool(types & {"WebPage", "CollectionPage"})
    return evaluated([] if has_page and "BreadcrumbList" in types else [
        "JSON-LD requires WebPage (or CollectionPage) and BreadcrumbList nodes"
    ])


def sections(ctx):
    # Local declared template; deviations are exact, reviewed source inventories.
    page = ctx.page.as_posix()
    override = ctx.contract["section_overrides"].get(page)
    if override and not override.get("reason"):
        return evaluated(["Section override needs a reason"])
    expected = override["headings"] if override else ctx.contract["section_template"]
    mains = ctx.source.find("main")
    actual = [norm(n.text()) for main in mains for n in main.find("h2")]
    valid = actual == [norm(s) for s in expected]
    return evaluated([] if valid else ["Section headings or order differ from declared template/allow-list"])


def href_format(ctx):
    # Local HTTPS policy; RFC 3986 (2005), sections 3 and 4: URI components.
    errors = []
    for index, link in enumerate(href_nodes(ctx.built), start=1):
        if "href" not in link.attrs:  # Named anchors need no href.
            if not (link.attrs.get("name") or link.attrs.get("id")):
                errors.append(f"Link {index}: href missing")
            continue
        href = (link.attrs["href"] or "").strip()
        try:
            parts = urlsplit(href)
        except ValueError:
            errors.append(f"Link {index}: malformed URL")
            continue
        invalid = not href or href == "#" or bool(re.search(r"[{}<>\[\]]", href))
        invalid |= norm(href) in {"todo", "tbd", "placeholder"}  # Local placeholder policy.
        if parts.scheme in {"mailto", "tel"}:
            invalid |= not bool(parts.path)
        elif parts.scheme:
            invalid |= parts.scheme != "https" or not bool(parts.netloc)
        else:
            invalid |= bool(parts.netloc)  # Protocol-relative URLs are not explicit HTTPS.
        if invalid:
            errors.append(f"Link {index}: empty, placeholder or non-HTTPS href")
    return evaluated(errors)


def href_nodes(doc):
    return [n for n in doc.walk() if "href" in n.attrs or n.tag == "a"]


def target_file(ctx, href):
    """RFC 3986 sections 5.2 and 3.5: resolve relative paths and fragments."""
    canonical = canonicals(ctx.built)
    if len(canonical) != 1:
        return None, "", "Canonical URL unavailable for link resolution"
    try:
        origin = urlsplit(canonical[0])
        target = urlsplit(urljoin(canonical[0], href))
    except ValueError:
        return None, "", "Malformed URL"
    if not origin.netloc:
        return None, "", "Canonical URL unavailable for link resolution"
    if target.scheme in {"mailto", "tel"} or target.netloc != origin.netloc:
        return None, "", None
    path = (ctx.built_root / unquote(target.path).lstrip("/")).resolve()
    if not path.is_relative_to(ctx.built_root.resolve()):
        return None, "", "Target escapes built tree"
    if path.is_dir():
        path /= "index.html"
    return path, unquote(target.fragment), None


def internal_links(ctx, reports_only=False):
    errors = []
    unknown_fragment = False
    for index, link in enumerate(href_nodes(ctx.built), start=1):
        href = link.attrs.get("href")
        if not href or href == "#":
            continue  # href_format reports these independently.
        path, anchor, error = target_file(ctx, href)
        if reports_only and (path is None or "reports" not in path.relative_to(ctx.built_root.resolve()).parts):
            continue
        if error:
            errors.append(f"Link {index}: {error}")
        elif path is not None:
            if not path.is_file():
                errors.append(f"Link {index}: built target missing")
            elif anchor:
                if path.suffix.lower() != ".html":
                    # File-specific fragment schemes (e.g. PDF pages) need other tooling.
                    unknown_fragment = True
                    continue
                doc = read_html(path)
                anchors = {n.attrs.get("id") for n in doc.walk()}
                anchors.update(n.attrs.get("name") for n in doc.find("a"))
                if anchor not in anchors:
                    errors.append(f"Link {index}: target anchor missing")
    if unknown_fragment and not errors:
        return unavailable("Non-HTML fragment semantics require a format-specific check")
    return evaluated(errors)


def image_alt(ctx):
    # WCAG 2.2 SC 1.1.1: empty alt is permitted for decorative images.
    return evaluated([f"{label} image {i}: missing alt attribute"
                      for label, doc in ctx.documents
                      for i, n in enumerate(doc.find("img"), start=1)
                      if n.attrs.get("alt") is None])


def landmark_skip(ctx):
    # WCAG 2.2 SC 2.4.1; source includes must bind the shared skip link to main.
    included = any(n.attrs.get("src") == "partials/nav.html" for n in ctx.source.find("include"))
    partial = ctx.root / "content/partials/nav.html"
    mains = ctx.document.find("main")
    errors = []
    if len(ctx.source.find("main")) != 1:
        errors.append("Source: expected exactly one main landmark")
    if len(mains) != 1:
        errors.append("Expected exactly one main landmark")
    if not included or not partial.is_file():
        errors.append("Shared navigation partial is not included")
    else:
        nav = read_html(partial)
        for doc, label in [(nav, "Shared partial"), (ctx.document, "Page")]:
            if doc is ctx.source:  # Source has an include, not the expanded link.
                continue
            skip = [n for n in doc.find("a")
                    if "skip-link" in (n.attrs.get("class") or "").split()]
            valid = any(n.attrs.get("href") == "#" + (m.attrs.get("id") or "")
                        and bool(m.attrs.get("id")) and bool(norm(n.text()))
                        for n in skip for m in mains)
            if not valid:
                errors.append(f"{label}: skip link does not target main")
    return evaluated(errors)


def link_text(ctx):
    # Local forbidden link text, supported by WCAG 2.2 SC 2.4.4; no NLP claim.
    return evaluated([f"{label} link {i}: generic link text"
                      for label, doc in ctx.documents
                      for i, n in enumerate(doc.find("a"), start=1)
                      if norm(n.text()) == "click here"])


def table_headers(ctx):
    # WCAG 2.2 SC 1.3.1: structural screening only, not header association proof.
    return evaluated([f"{label} table {i}: no nonempty header cells"
                      for label, doc in ctx.documents
                      for i, n in enumerate(doc.find("table"), start=1)
                      if not any(norm(th.text()) for th in n.find("th"))])


def configured_phrases(ctx, setting):
    path = ctx.root / setting["path"]
    if not path.is_file():
        return unavailable("Configured deny-list file unavailable")
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    phrases = data.get(setting["key"])
    if not isinstance(phrases, list) or not phrases:
        return unavailable("Configured deny-list is absent or empty")
    texts = [norm(doc.text()) for _, doc in ctx.documents]
    # Diagnostics identify the rule index, never repeat potentially private text.
    return evaluated([f"Deny-list rule {i} matched page text"
                      for i, value in enumerate(phrases, start=1)
                      if isinstance(value, str) and norm(value)
                      and any(norm(value) in text for text in texts)])


def private_names(ctx):
    setting = ctx.contract.get("name_deny_list")
    if not setting:
        return unavailable("No private-name deny-list exists in the copy-lint configuration")
    return configured_phrases(ctx, setting)


@dataclass(frozen=True)
class Check:
    id: str
    run: object
    source: str
    built: bool = False


# Single declared list: every discovered page receives every check.
CHECKS = (
    Check("h1", h1, "Local structure contract; WCAG 2.2 SC 1.3.1 and 2.4.6"),
    Check("heading_order", heading_order, "WAI Page Structure Tutorial: Heading ranks"),
    Check("title", lambda c: metadata(c, "title"), "Local metadata contract; WCAG 2.2 SC 2.4.2"),
    Check("description", lambda c: metadata(c, "description"), "Local metadata contract"),
    Check("canonical_sitemap", canonical_sitemap, "RFC 6596 section 3; sitemaps.org protocol", True),
    Check("json_ld", json_ld, "schema.org WebPage, CollectionPage and BreadcrumbList"),
    Check("sections", sections, "Declared section template and exact deviation inventory"),
    Check("href_format", href_format, "Local HTTPS policy; RFC 3986 sections 3 and 4", True),
    Check("internal_links", internal_links, "RFC 3986 sections 5.2 and 3.5", True),
    Check("report_links", lambda c: internal_links(c, True), "Local report-link policy; RFC 3986", True),
    Check("image_alt", image_alt, "WCAG 2.2 SC 1.1.1"),
    Check("landmark_skip", landmark_skip, "WCAG 2.2 SC 2.4.1; shared navigation partial"),
    Check("link_text", link_text, "Local link-text policy; WCAG 2.2 SC 2.4.4"),
    Check("table_headers", table_headers, "WCAG 2.2 SC 1.3.1"),
    Check("copy_deny_list", lambda c: configured_phrases(c, {
        "path": "brand/copy.yaml", "key": "forbidden_phrases"
    }), "Existing scripts/lint-copy.js and brand/copy.yaml"),
    Check("private_names", private_names, "Existing legal/copy-lint configuration, if supplied"),
    Check("browser_accessibility", lambda c: unavailable(
        "No axe dependency declared in package.json; browser analysis not evaluated"
    ), "WCAG 2.2; package.json dependency inventory"),
)


def audit(root=ROOT, *, built_root=None, contract_path=CONTRACT):
    root = Path(root)
    built_root = Path(built_root) if built_root is not None else root / "dist"
    contract = json.loads(Path(contract_path).read_text(encoding="utf-8"))
    pages = discover(root)
    if not pages:
        raise ValueError("No case-study pages discovered")
    contexts = [Context(root, built_root, page, read_html(root / "content" / page),
                        read_html(built_root / page) if (built_root / page).is_file() else None,
                        contract) for page in pages]
    results = []
    for context in contexts:
        context.peers = contexts
        for check in CHECKS:
            if check.built and context.built is None:
                status, details = unavailable("Built page unavailable; run npm run build")
            else:
                status, details = check.run(context)
            results.append(Result(context.page.as_posix(), check.id, status, details))
    return results


def write_report(results, path):
    """Stable output: no timestamps, absolute paths, matched text or host details."""
    payload = {
        "checks": [{"check": c.id, "source": c.source} for c in CHECKS],
        "summary": dict(sorted(Counter(r.status for r in results).items())),
        "results": [asdict(r) for r in results],
    }
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--built-root", type=Path)
    parser.add_argument("--contract", type=Path, default=CONTRACT)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--require-built", action="store_true",
                        help="Fail if a build-dependent check cannot be evaluated")
    args = parser.parse_args()
    results = audit(args.root, built_root=args.built_root, contract_path=args.contract)
    write_report(results, args.report or args.root / "reports/case-study-consistency.json")
    for result in results:
        print(result.message)
    return int(any(r.status == "FAIL" or (args.require_built and r.status == "NOT_EVALUATED"
                   and next(c for c in CHECKS if c.id == r.check).built) for r in results))


if __name__ == "__main__":
    raise SystemExit(main())
