"""Inventory visible case-study quantities and validate their evidence register.

Rules are editorial rules for issue #164, not engineering acceptance limits.
See docs/case-study-figures.md for the grammar, exclusions and evidence policy.
HTML parsing uses the Python 3 HTMLParser documentation (accessed 2026):
https://docs.python.org/3/library/html.parser.html
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "content/case-studies"
REGISTER = PAGES / "figures.json"
REPORT = ROOT / "reports/case-study-figures.md"
STATUSES = ("SOURCED", "DERIVED", "ILLUSTRATIVE", "NOT_EVALUATED")

# Grammar choices, based on the existing page spellings and the hand-counted
# fixture in test_case_study_figures.py; these are not physical thresholds.
NUMBER = re.compile(
    r"(?<![\w.])(?P<currency>[$£€])?"
    r"(?P<value>[+−-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)"
    r"(?P<ordinal>st|nd|rd|th)?(?P<plus>\+)?"
)
UNIT = re.compile(
    r"(?:[-\s]*(?P<unit>days per month|barrels per day|million USD|million bbl|"
    r"months?|days?|hours?|minutes?|seconds?|years?|weeks?|inch(?:es)?|"
    r"mm|cm|km|m|MPa|kPa|Pa|psi|kN|MN|N|kg|tonnes?|MW|kW|W|Hz|USD|bbl|%|°C))"
    r"(?![\w])"
)
SCALE = re.compile(r"\s*(billion|million|thousand|[KMB])\b")
PER = re.compile(r"/(?:bbl|hr|day)\b")
BLOCKS = {
    "p",
    "div",
    "main",
    "section",
    "article",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "pre",
    "blockquote",
    "figcaption",
    "caption",
    "dt",
    "dd",
    "nav",
    "header",
    "footer",
}
VOID = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
SKIP = {"head", "script", "style", "template"}

# Identifier/date spellings present in the case-study pages plus synthetic
# counterexamples. Four digits alone are a year only without quantity context.
IGNORE = [
    re.compile(r"\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b"),
    re.compile(r"\b\d{1,2}/\d{1,2}/\d{4}\b"),
    re.compile(
        r"\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)\s+\d{4}\b",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:API(?:\s+(?:RP|Spec))?|ASME|DNV(?:GL)?(?:-(?:RP|ST|OS))?|IEC|ISO)"
        r"[-\s]+[A-Z]*\d[\w.−–-]*",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:Section|Sec|Eq|Equation|Clause|Table|Figure|Division|Phase)"
        r"\s+(?:[IVX]+\s+)?\d+(?:[.−–-]\d+)*",
        re.IGNORECASE,
    ),
    re.compile(r"\bSOL\s+\d+(?:,\s*\d+)*", re.IGNORECASE),
    re.compile(r"\b(?:Python|version)\s+\d+(?:\.\d+)*\+?", re.IGNORECASE),
    re.compile(r"\b[A-Za-z_][\w.-]*\d[\w.-]*\b"),
]


def normalize(text):
    return " ".join(text.split())


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)
    parent: Node | None = None


class VisibleHTML(HTMLParser):
    """Small source-text tree; no scripts, external resources or CSS execution."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("document")
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs), parent=self.current)
        self.current.children.append(node)
        if tag == "br":
            node.children.append(" ")
        if tag not in VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        node = self.current
        while node.parent is not None:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, data):
        self.current.children.append(data)


def hidden(node):
    style = re.sub(r"\s+", "", node.attrs.get("style", "")).lower()
    return (
        node.tag in SKIP
        or "hidden" in node.attrs
        or "display:none" in style
        or "visibility:hidden" in style
        or "step-number" in node.attrs.get("class", "").split()
    )


def visible_text(node):
    if hidden(node):
        return ""
    return "".join(visible_text(c) if isinstance(c, Node) else c for c in node.children)


def blocks(html):
    parser = VisibleHTML()
    parser.feed(html)

    def contains_block(node):
        return (
            node.tag in BLOCKS
            or node.tag in {"html", "body", "tr", "table", "hr"}
            or any(contains_block(c) for c in node.children if isinstance(c, Node))
        )

    def walk(node, in_body=False):
        if hidden(node):
            return
        in_body = in_body or node.tag == "body"
        if node.tag == "tr" and in_body:
            table = node.parent
            while table and table.tag != "table":
                table = table.parent
            headers = []

            def collect_headers(n):
                if hidden(n):
                    return
                if n.tag == "th":
                    headers.append(normalize(visible_text(n)))
                else:
                    for child in n.children:
                        if isinstance(child, Node):
                            collect_headers(child)

            if table:
                collect_headers(table)
            cells = [
                normalize(visible_text(c)) for c in node.children if isinstance(c, Node)
            ]
            labelled_spans = []
            offset = 0
            for index, cell in enumerate(cells):
                label = headers[index] if index < len(headers) else ""
                labelled_spans.append((offset, offset + len(cell), label))
                offset += len(cell) + len(" | ")
            yield " | ".join(cells), labelled_spans, node.tag
            return
        pending = []
        for child in node.children:
            if isinstance(child, Node) and contains_block(child):
                if in_body and normalize("".join(pending)):
                    yield normalize("".join(pending)), [], node.tag
                pending = []
                yield from walk(child, in_body)
            elif isinstance(child, Node):
                pending.append(visible_text(child))
            else:
                pending.append(child)
        if in_body and normalize("".join(pending)):
            yield normalize("".join(pending)), [], node.tag

    yield from walk(parser.root)


def sentence_bounds(text, start):
    # A sentence stop is punctuation followed by whitespace; decimal points and
    # dotted standard identifiers are not sentence stops (editorial rule #164).
    boundaries = list(re.finditer(r"[.!?](?:\s|$)", text))
    left = max((m.end() for m in boundaries if m.end() <= start), default=0)
    right = next((m.end() for m in boundaries if m.start() >= start), len(text))
    return left, right


def illustrative(text):
    return bool(re.search(r"\billustrative\b", text, re.IGNORECASE)) and not re.search(
        r"\b(?:not|non)[\s-]+illustrative\b", text, re.IGNORECASE
    )


def extract_figures(html, page):
    result = []
    for block_index, (text, labels, tag) in enumerate(blocks(html), start=1):
        ignored = [
            (m.start(), m.end()) for pattern in IGNORE for m in pattern.finditer(text)
        ]
        # A physical range with an explicit trailing unit is not a year range.
        ignored.extend(
            m.span()
            for m in re.finditer(r"\b\d{4}\s*[-–]\s*\d{4}\b", text)
            if not UNIT.match(text, m.end())
        )
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            heading = re.match(r"\d+(?:\.\d+)*[.)]?\s", text)
            if heading:
                ignored.append(heading.span())
        for match in NUMBER.finditer(text):
            if any(a <= match.start() < b for a, b in ignored):
                continue
            end = match.end()
            unit_match = UNIT.match(text, end)
            unit = unit_match["unit"] if unit_match else ""
            currency = match["currency"] or ""
            scale = SCALE.match(text, end) if currency else None
            per = PER.match(text, end) if currency else None
            if unit_match:
                end = unit_match.end()
            elif scale:
                end = scale.end()
            elif per:
                end = per.end()
            cell_start, cell_end = 0, len(text)
            if tag == "tr":
                cell_start, cell_end = next(
                    ((a, b) for a, b, _ in labels if a <= match.start() < b),
                    (cell_start, cell_end),
                )
            cell = text[cell_start:cell_end]
            left, right = sentence_bounds(cell, match.start() - cell_start)
            context = cell[left:right]
            relative_end = match.end() - cell_start - left
            # Bare four-digit tokens are calendar years only when not labelled
            # with a quantity noun. This covers current source date labels.
            tail = text[match.end() :]
            if re.fullmatch(r"\d{4}", match["value"]) and not unit and not currency:
                prefix = text[: match.start()]
                calendar_context = (
                    text.strip() == match[0]
                    or re.search(
                        r"(?:\b(?:in|since|during|year|copyright)|©)\s*$",
                        prefix,
                        re.IGNORECASE,
                    )
                    or re.search(r"\d{4}\s*[-–]\s*\d{4}\s+and\s+$", prefix)
                )
                count_label = any(
                    a <= match.start() < b
                    and re.search(
                        r"\b(?:count|records?|incidents?|models?|items?)\b",
                        label,
                        re.IGNORECASE,
                    )
                    for a, b, label in labels
                )
                if calendar_context and not count_label:
                    continue
            if currency:
                unit = (
                    currency
                    + (" " + scale[1] if scale else "")
                    + (per[0] if per else "")
                )
            if not unit:
                # Shared list/range units and table quantity labels are kept in
                # their page spelling; no conversion or source inference occurs.
                following = UNIT.search(context[relative_end:])
                label_unit = (
                    re.search(r"\(([^()]+)\)", text.split(" | ")[0])
                    if tag == "tr"
                    else None
                )
                if label_unit:
                    unit = label_unit[1].split(",")[0]
                elif re.search(r"\bratio\b", context, re.IGNORECASE):
                    unit = "ratio"
                elif following and re.fullmatch(
                    r"(?:[\s,\d.+−–-]|and\b|to\b)*",
                    context[relative_end:][: following.start()],
                ):
                    unit = following["unit"]
                elif re.match(r"\s+modeled month\b", tail):
                    unit = "month"
                else:
                    unit = "count"
            result.append(
                {
                    "id": f"{page}:b{block_index}:n{match.start()}",
                    "page": page,
                    "figure_text": text[match.start() : end],
                    "value": match["value"].replace(",", "").replace("−", "-"),
                    "unit": unit,
                    "context": context.strip(),
                    "illustrative_label": bool(
                        illustrative(context)
                        or any(
                            a <= match.start() < b and illustrative(label)
                            for a, b, label in labels
                        )
                    ),
                }
            )
    return result


def scan_pages(directory=PAGES):
    pages = sorted(
        p.relative_to(directory).as_posix() for p in directory.rglob("*.html")
    )
    figures = [
        f
        for page in pages
        for f in extract_figures((directory / page).read_text(encoding="utf-8"), page)
    ]
    return figures, pages


def load_register(path=REGISTER):
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise TypeError("register must be an array")
    return data


def validate_register(figures, entries):
    errors = []
    expected = {f["id"]: f for f in figures}
    seen = set()
    required = {
        "id",
        "page",
        "figure_text",
        "value",
        "unit",
        "source_name",
        "source_location",
        "status",
    }
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or not required.issubset(entry):
            errors.append(f"schema: entry {index} lacks required fields")
            continue
        if not all(isinstance(entry[k], str) for k in required):
            errors.append(f"schema: entry {index} requires string fields")
            continue
        key = entry["id"]
        if key in seen:
            errors.append(f"duplicate: {key}")
        seen.add(key)
        if key not in expected:
            errors.append(f"stale: {key}")
        else:
            for name in ("page", "figure_text", "value", "unit"):
                if entry[name] != expected[key][name]:
                    errors.append(f"mismatch: {key} {name}")
        if entry["status"] not in STATUSES:
            errors.append(f"status: {key}")
        if entry["status"] in {"SOURCED", "DERIVED"} and (
            not entry["source_name"].strip() or not entry["source_location"].strip()
        ):
            errors.append(f"source: {key} requires source name and location")
        if (
            entry["status"] == "ILLUSTRATIVE"
            and key in expected
            and not expected[key]["illustrative_label"]
        ):
            errors.append(f"illustrative: {key} lacks a sentence or table label")
    errors.extend(f"missing: {key}" for key in expected.keys() - seen)
    return sorted(errors)


def render_report(figures, entries, pages):
    errors = validate_register(figures, entries)
    if errors:
        raise ValueError("\n".join(errors))
    lines = [
        "# Case-study figures",
        "",
        "## Summary",
        "",
        "Visible source-page quantities, grouped by evidence status. NOT_EVALUATED",
        "means the evidence has not been established; it does not assert a result is false.",
        "See the [extraction rules and worked example](../docs/case-study-figures.md).",
        "",
        "## Revision history",
        "",
        "| Revision | Date | Change and reason |",
        "| --- | --- | --- |",
        "| 1 | 2026-10-22 | Add the occurrence register to expose evidence gaps. |",
        "",
        "Generated with `uv run python scripts/case_study_figures.py report`.",
        "",
        "| Page | SOURCED | DERIVED | ILLUSTRATIVE | NOT_EVALUATED | Total |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for page in pages:
        counts = Counter(e["status"] for e in entries if e["page"] == page)
        values = [counts[s] for s in STATUSES]
        lines.append(
            f"| {page} | " + " | ".join(str(v) for v in [*values, sum(values)]) + " |"
        )
    lines += [
        "",
        "## Figures and evidence",
        "",
        "Occurrence IDs distinguish repeated text. Source locators refer to repository",
        "files, symbols or the pinned citation already linked from the page.",
        "",
    ]
    for page in pages:
        lines += [f"### {page}", ""]
        selected = [e for e in entries if e["page"] == page]
        if not selected:
            lines += ["No numeric quantities detected under the documented rules.", ""]
            continue
        lines += [
            "| Occurrence | Figure | Unit | Status | Source location |",
            "| --- | --- | --- | --- | --- |",
        ]
        for e in selected:
            values = [
                e["id"],
                e["figure_text"],
                e["unit"],
                e["status"],
                e["source_location"] or "Not established",
            ]
            lines.append(
                "| "
                + " | ".join(v.replace("|", "\\|").replace("\n", " ") for v in values)
                + " |"
            )
        lines.append("")
    lines += [
        "## Follow-up",
        "",
        "Source or remove NOT_EVALUATED figures before treating them as substantiated",
        "claims. The report does not validate engineering methods, source accuracy or",
        "current database counts. Page text has not been changed.",
        "",
    ]
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("extract", "check", "report"))
    parser.add_argument("--pages", type=Path, default=PAGES)
    parser.add_argument("--register", type=Path, default=REGISTER)
    parser.add_argument("--output", type=Path, default=REPORT)
    args = parser.parse_args(argv)
    figures, pages = scan_pages(args.pages)
    if args.command == "extract":
        print(json.dumps(figures, indent=2, ensure_ascii=False))
        return 0
    try:
        entries = load_register(args.register)
        errors = validate_register(figures, entries)
        if errors:
            print("\n".join(errors))
            return 1
        if args.command == "report":
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(
                render_report(figures, entries, pages), encoding="utf-8"
            )
        else:
            print(
                f"Figure register: {len(figures)} occurrences across {len(pages)} pages; valid."
            )
    except (OSError, ValueError, TypeError) as error:
        print(f"Figure register: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
