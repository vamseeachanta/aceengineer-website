#!/usr/bin/env python3
"""Programmatic-SEO generator — standard landing pages (W8, aceengineer-website#27).

Reads config/seo/standards.yaml and emits:
  - content/standards/<slug>.html      one cluster page per standard
  - content/standards/index.html       the cluster hub
  - sitemap.xml                         refreshes the marked generated block

The generated pages are committed (the repo builds content/ -> dist/). Re-run
after editing the manifest:

    uv run python scripts/seo/generate_standard_pages.py

Each page is part of a topic cluster that points up to its Solutions pillar
page (W5) and, where one exists, the matching free calculator. Content is
authored in the manifest; this script only renders it. No external claims are
invented here.
"""

from __future__ import annotations

import html
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "config" / "seo" / "standards.yaml"
OUT_DIR = ROOT / "content" / "standards"
SITEMAP = ROOT / "sitemap.xml"
BASE = "https://www.aceengineer.com"

SITE_BEGIN = "  <!-- BEGIN standards (generated) -->"
SITE_END = "  <!-- END standards (generated) -->"


def esc(text: str) -> str:
    """HTML-escape visible text (leaves &mdash; style entities authored as plain dashes)."""
    return html.escape(str(text).strip(), quote=False)


def render_page(s: dict) -> str:
    slug = s["slug"]
    code = esc(s["code"])
    name = esc(s["name"])
    discipline = esc(s["discipline"])
    intro = esc(s["intro"])
    pillar = s["pillar"]
    calc = s.get("calculator")
    src_tag = s["src_tag"]
    url = f"{BASE}/standards/{slug}.html"

    title = f"{s['code']} — {s['name']} | AceEngineer"
    description = (
        f"{s['code']}: {s['name']}. Run it from chat with Deckhand — "
        "standards-traceable, deterministic, with every assumption shown."
    )
    keywords = ", ".join(s.get("chips", []) + [f"{s['code']} calculator", "offshore engineering AI"])

    # --- structured data ---
    breadcrumb = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Standards", "item": f"{BASE}/standards/"},
            {"@type": "ListItem", "position": 2, "name": s["code"], "item": url},
        ],
    }
    faq_schema = {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": f["q"],
             "acceptedAnswer": {"@type": "Answer", "text": f["a"]}}
            for f in s.get("faqs", [])
        ],
    }
    schema_blocks = [breadcrumb, faq_schema]
    if calc:
        schema_blocks.append({
            "@context": "https://schema.org", "@type": "SoftwareApplication",
            "name": f"{s['code']} calculator", "applicationCategory": "EngineeringApplication",
            "operatingSystem": "Web", "url": url,
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
            "publisher": {"@id": f"{BASE}/#organization"},
        })
    schema_html = "\n".join(
        f'    <script type="application/ld+json">\n{json.dumps(b, indent=2)}\n    </script>'
        for b in schema_blocks
    )

    does_html = "\n".join(f"                        <li>{esc(d)}</li>" for d in s.get("does", []))
    chips_html = "\n".join(
        f'                <span class="domain-chip">{esc(c)}</span>' for c in s.get("chips", [])
    )
    faqs_html = "\n".join(
        f'                    <details class="faq"><summary>{esc(f["q"])}</summary>'
        f'<p>{esc(f["a"])}</p></details>'
        for f in s.get("faqs", [])
    )

    calc_btn = (
        f'<a href="{calc["href"]}" class="btn btn-info btn-lg">{esc(calc["label"])}</a>'
        if calc else ""
    )

    return f"""---
rootPath: "../"
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{esc(description)}">
    <meta name="keywords" content="{esc(keywords)}">

    <meta property="og:title" content="{esc(s['code'])} — {name} | AceEngineer">
    <meta property="og:description" content="{esc(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{url}">
    <meta property="og:site_name" content="Analytical & Computational Engineering">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{esc(s['code'])} — {name}">
    <meta name="twitter:description" content="{esc(description)}">

    <title>{esc(title)}</title>

    <include src="partials/head-common.html"></include>

{schema_html}

    <style>
        .ask-list{{list-style:none;padding:0;max-width:820px;margin:0 auto;}}
        .ask-list li{{background:#fff;border:1px solid #e6e8eb;border-radius:8px;padding:14px 18px;margin-bottom:12px;color:#3a4654;}}
        .domain-chip{{display:inline-block;background:#eef1f4;color:#2c3e50;border-radius:16px;padding:6px 14px;margin:5px;font-size:.92em;}}
        .faq{{max-width:820px;margin:0 auto 12px;background:#fff;border:1px solid #e6e8eb;border-radius:8px;padding:14px 18px;}}
        .faq summary{{font-weight:600;color:#2c3e50;cursor:pointer;}}
        .faq p{{color:#3a4654;margin:10px 0 0;}}
    </style>
</head>
<body>

    <include src="partials/nav.html"></include>

    <section class="hero-section" style="padding-bottom:36px;">
        <div class="container">
            <div class="row">
                <div class="col-md-9 col-md-offset-1">
                    <p style="text-transform:uppercase;letter-spacing:.08em;color:#6b7785;font-size:.85em;"><a href="index.html" style="color:#6b7785;">Standards</a> &rsaquo; {discipline}</p>
                    <h1 class="hero-title" style="text-align:left;">{code}</h1>
                    <p style="font-size:1.05em;color:#52606d;margin:-6px 0 14px;">{name}</p>
                    <p class="hero-subtitle" style="text-align:left;margin-left:0;">{intro}</p>
                    <div class="hero-cta" style="text-align:left;">
                        <!-- OPEN_DECK_CTA: swap to https://t.me/the_deckhand_bot?start={src_tag} once deckhand#432 live -->
                        <a href="https://t.me/+T6HF8jf-NGdmM2I5" target="_blank" rel="noopener" class="btn btn-primary btn-lg" data-cta="open-deck" data-src="{src_tag}">Run it on Open Deck</a>
                        {calc_btn}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section style="padding:56px 0;background:#f8f9fa;">
        <div class="container">
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    <h2 class="section-title text-center">What you can ask it to do</h2>
                    <ul class="ask-list">
{does_html}
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section style="padding:48px 0;text-align:center;">
        <div class="container">
            <h2 class="section-title">Related standards</h2>
            <div style="margin:18px 0;">
{chips_html}
            </div>
            <p>Part of <a href="{pillar['href']}">{esc(pillar['label'])}</a> &middot; <a href="../platform.html">see the platform engine</a></p>
        </div>
    </section>

    <section style="padding:40px 0;">
        <div class="container">
            <div class="row"><div class="col-md-10 col-md-offset-1">
                <h2 class="section-title text-center">Questions</h2>
{faqs_html}
            </div></div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container"><div class="row"><div class="col-md-8 col-md-offset-2 text-center">
            <h2>Run {code} on your own inputs</h2>
            <p>Open Deck is free &mdash; bring your numbers and check the result against your own methods.</p>
            <!-- OPEN_DECK_CTA -->
            <a href="https://t.me/+T6HF8jf-NGdmM2I5" target="_blank" rel="noopener" class="btn btn-primary btn-lg" data-cta="open-deck" data-src="{src_tag}_footer">Try Open Deck on Telegram</a>
        </div></div></div>
    </section>

    <include src="partials/footer.html"></include>

</body>
</html>
"""


def render_index(standards: list[dict]) -> str:
    by_disc: dict[str, list[dict]] = {}
    for s in standards:
        by_disc.setdefault(s["discipline"], []).append(s)

    groups_html = []
    for disc, items in by_disc.items():
        cards = "\n".join(
            f'                        <div class="col-md-4"><div class="std-card">'
            f'<span class="std-code">{esc(s["code"])}</span>'
            f'<h3>{esc(s["name"])}</h3>'
            f'<a href="{s["slug"]}.html" class="btn btn-sm btn-info">Open</a></div></div>'
            for s in items
        )
        groups_html.append(
            f'                    <h2 class="section-title sol-group-title">{esc(disc)}</h2>\n'
            f'                    <div class="row">\n{cards}\n                    </div>'
        )
    groups = "\n\n".join(groups_html)

    return f"""---
rootPath: "../"
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Engineering standards you can run from chat — DNV, API, ASME and more. Each page explains the standard and lets you run the check on Open Deck, standards-traceable and deterministic.">
    <meta name="keywords" content="engineering standards calculator, DNV API ASME calculators, offshore standards, fatigue wall thickness on-bottom stability cathodic protection">

    <meta property="og:title" content="Engineering Standards, Run From Chat | AceEngineer">
    <meta property="og:description" content="Run DNV / API / ASME checks from a chat message — traced to the clause, deterministic.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{BASE}/standards/">
    <meta property="og:site_name" content="Analytical & Computational Engineering">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Engineering Standards, Run From Chat | AceEngineer">
    <meta name="twitter:description" content="Run DNV / API / ASME checks from chat, traced to the clause.">

    <title>Engineering Standards, Run From Chat | AceEngineer</title>

    <include src="partials/head-common.html"></include>

    <style>
        .std-card{{background:#fff;border:1px solid #e6e8eb;border-radius:10px;padding:22px;margin-bottom:24px;height:100%;}}
        .std-card h3{{font-size:1.05em;color:#2c3e50;margin:6px 0 14px;}}
        .std-code{{display:inline-block;background:#2c3e50;color:#fff;border-radius:6px;padding:3px 10px;font-size:.82em;font-weight:700;}}
        .sol-group-title{{margin:34px 0 10px;}}
    </style>
</head>
<body>

    <include src="partials/nav.html"></include>

    <section class="hero-section" style="padding-bottom:24px;">
        <div class="container">
            <div class="row">
                <div class="col-md-8 col-md-offset-2 text-center">
                    <h1 class="hero-title">Standards, run from chat</h1>
                    <p class="hero-subtitle">Each standard below explains what it governs and lets you run the check on Open Deck &mdash; traced to the clause, deterministic, with the assumptions shown.</p>
                </div>
            </div>
        </div>
    </section>

    <section style="padding:24px 0 56px;">
        <div class="container">
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
{groups}
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container"><div class="row"><div class="col-md-8 col-md-offset-2 text-center">
            <h2>Bring a real check</h2>
            <p>Join Open Deck and run any of these against your own inputs.</p>
            <!-- OPEN_DECK_CTA -->
            <a href="https://t.me/+T6HF8jf-NGdmM2I5" target="_blank" rel="noopener" class="btn btn-primary btn-lg" data-cta="open-deck" data-src="src_web_standards_hub">Try Open Deck on Telegram</a>
        </div></div></div>
    </section>

    <include src="partials/footer.html"></include>

</body>
</html>
"""


def sitemap_block(standards: list[dict]) -> str:
    rows = [SITE_BEGIN]
    rows.append("  <url>")
    rows.append(f"    <loc>{BASE}/standards/</loc>")
    rows.append("    <lastmod>2026-06-17</lastmod>")
    rows.append("    <changefreq>weekly</changefreq>")
    rows.append("    <priority>0.8</priority>")
    rows.append("  </url>")
    for s in standards:
        rows.append("  <url>")
        rows.append(f"    <loc>{BASE}/standards/{s['slug']}.html</loc>")
        rows.append("    <lastmod>2026-06-17</lastmod>")
        rows.append("    <changefreq>monthly</changefreq>")
        rows.append("    <priority>0.7</priority>")
        rows.append("  </url>")
    rows.append(SITE_END)
    return "\n".join(rows)


def update_sitemap(standards: list[dict]) -> None:
    text = SITEMAP.read_text()
    block = sitemap_block(standards)
    if SITE_BEGIN in text and SITE_END in text:
        pre = text.split(SITE_BEGIN)[0]
        post = text.split(SITE_END, 1)[1]
        text = pre + block + post
    else:
        text = text.replace("</urlset>", block + "\n</urlset>")
    SITEMAP.write_text(text)


def main() -> None:
    data = yaml.safe_load(MANIFEST.read_text())
    standards = data["standards"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for s in standards:
        (OUT_DIR / f"{s['slug']}.html").write_text(render_page(s))
    (OUT_DIR / "index.html").write_text(render_index(standards))
    update_sitemap(standards)

    print(f"generated {len(standards)} standard pages + index into {OUT_DIR.relative_to(ROOT)}")
    print("sitemap.xml updated")


if __name__ == "__main__":
    main()
