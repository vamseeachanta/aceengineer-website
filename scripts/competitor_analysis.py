#!/usr/bin/env python3
"""Competitor analysis for AceEngineer website SEO.

Tracks keyword rankings, detects competitors, and generates HTML reports
with SEO recommendations.

Usage:
    python scripts/competitor_analysis.py
    python scripts/competitor_analysis.py --dry-run
    python scripts/competitor_analysis.py --output reports/custom.html
"""

import argparse
import hashlib
import os
import random
import sys
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

# Constants
DEFAULT_CONFIG = Path(__file__).parent.parent / "config" / "keywords.yaml"
DEFAULT_OUTPUT = Path(__file__).parent.parent / "reports" / "competitor-analysis"

# Simulated competitor data (in production, would come from search API)
SIMULATED_COMPETITORS = {
    "orcaflex automation": [
        {"domain": "orcina.com", "title": "OrcaFlex - Dynamic Analysis Software", "position": 1},
        {"domain": "wood.com", "title": "Offshore Engineering Solutions", "position": 3},
        {"domain": "dnv.com", "title": "DNV Software Solutions", "position": 5},
    ],
    "offshore engineering automation": [
        {"domain": "dnv.com", "title": "DNV Digital Solutions", "position": 1},
        {"domain": "wood.com", "title": "Wood - Engineering Services", "position": 2},
        {"domain": "bentley.com", "title": "Bentley MOSES", "position": 4},
    ],
    "fatigue analysis software": [
        {"domain": "dnv.com", "title": "Fatigue Analysis - DNV", "position": 1},
        {"domain": "ansys.com", "title": "ANSYS Fatigue Module", "position": 2},
        {"domain": "simulia.com", "title": "fe-safe Fatigue Analysis", "position": 3},
    ],
    "python engineering automation": [
        {"domain": "scipy.org", "title": "SciPy Scientific Computing", "position": 1},
        {"domain": "numpy.org", "title": "NumPy for Engineering", "position": 2},
        {"domain": "github.com", "title": "Engineering Python Libraries", "position": 3},
    ],
    "S-N curve calculator": [
        {"domain": "dnv.com", "title": "DNV S-N Curves Guide", "position": 1},
        {"domain": "efatigue.com", "title": "eFatigue S-N Calculator", "position": 2},
        {"domain": "engineeringexcel.com", "title": "S-N Curve Excel Tool", "position": 4},
    ],
}


def load_keywords(config_path: Path) -> dict:
    """Load keywords from YAML config.

    Args:
        config_path: Path to the keywords.yaml configuration file.

    Returns:
        Dictionary containing keywords, competitors, and settings.

    Raises:
        FileNotFoundError: If config file doesn't exist.
        yaml.YAMLError: If config file is invalid YAML.
    """
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    return config


def get_all_keywords(config: dict) -> list[str]:
    """Extract all keywords from config into a flat list.

    Args:
        config: Parsed config dictionary.

    Returns:
        List of all keywords across all categories.
    """
    keywords = []
    keyword_groups = config.get("keywords", {})

    for category in ["primary", "secondary", "long_tail"]:
        keywords.extend(keyword_groups.get(category, []))

    return keywords


def analyze_keyword(keyword: str, dry_run: bool = False) -> dict:
    """Analyze a single keyword for competitor presence.

    In production, this would use a search API (Google Search Console,
    SEMrush, Ahrefs, etc.). For now, returns simulated data.

    Args:
        keyword: The keyword to analyze.
        dry_run: If True, returns minimal test data.

    Returns:
        Dictionary containing analysis results.
    """
    if dry_run:
        return {
            "keyword": keyword,
            "analyzed_at": datetime.now().isoformat(),
            "estimated_position": None,
            "competitors": [],
            "search_volume": 0,
            "difficulty": 0,
            "dry_run": True,
        }

    # Generate deterministic but varied simulated data based on keyword hash
    keyword_hash = int(hashlib.md5(keyword.encode()).hexdigest()[:8], 16)
    random.seed(keyword_hash)

    # Check if we have predefined competitor data
    competitors = SIMULATED_COMPETITORS.get(keyword, [])

    if not competitors:
        # Generate random competitors for keywords not in our predefined list
        competitor_pool = ["dnv.com", "wood.com", "orcina.com", "bentley.com", "offshore-technology.com"]
        num_competitors = random.randint(2, 4)
        selected = random.sample(competitor_pool, num_competitors)
        competitors = [
            {"domain": domain, "title": f"Results for {keyword}", "position": i + 1}
            for i, domain in enumerate(selected)
        ]

    # Simulate AceEngineer's position (usually not ranking yet for most keywords)
    aceengineer_position = random.choice([None, None, None, 15, 23, 45, 67])

    return {
        "keyword": keyword,
        "analyzed_at": datetime.now().isoformat(),
        "estimated_position": aceengineer_position,
        "competitors": competitors,
        "search_volume": random.randint(50, 2000),
        "difficulty": random.randint(20, 85),
        "opportunity_score": calculate_opportunity_score(aceengineer_position, competitors),
    }


def calculate_opportunity_score(our_position: int | None, competitors: list) -> int:
    """Calculate SEO opportunity score for a keyword.

    Higher score = better opportunity to rank.

    Args:
        our_position: Our current ranking position (None if not ranking).
        competitors: List of competitor data.

    Returns:
        Opportunity score from 0-100.
    """
    score = 50  # Base score

    # Better if we're already ranking
    if our_position:
        if our_position <= 10:
            score += 30
        elif our_position <= 30:
            score += 15
        else:
            score += 5

    # Better if fewer strong competitors
    strong_competitors = sum(1 for c in competitors if c.get("position", 100) <= 3)
    score -= strong_competitors * 10

    return max(0, min(100, score))


def generate_seo_recommendations(results: list[dict]) -> list[dict]:
    """Generate SEO recommendations based on analysis results.

    Args:
        results: List of keyword analysis results.

    Returns:
        List of recommendation dictionaries.
    """
    recommendations = []

    # Find high-opportunity keywords
    high_opportunity = [r for r in results if r.get("opportunity_score", 0) >= 60]
    if high_opportunity:
        keywords = [r["keyword"] for r in high_opportunity[:3]]
        recommendations.append({
            "priority": "high",
            "category": "Content Creation",
            "title": "Focus on High-Opportunity Keywords",
            "description": f"Create detailed content targeting: {', '.join(keywords)}",
        })

    # Find keywords where we're close to page 1
    close_to_ranking = [
        r for r in results
        if r.get("estimated_position") and 11 <= r["estimated_position"] <= 30
    ]
    if close_to_ranking:
        keywords = [r["keyword"] for r in close_to_ranking[:3]]
        recommendations.append({
            "priority": "high",
            "category": "Link Building",
            "title": "Boost Near-Ranking Keywords",
            "description": f"Build backlinks for pages targeting: {', '.join(keywords)}",
        })

    # General recommendations
    recommendations.extend([
        {
            "priority": "medium",
            "category": "Technical SEO",
            "title": "Improve Page Speed",
            "description": "Ensure all pages load under 3 seconds on mobile devices.",
        },
        {
            "priority": "medium",
            "category": "Content",
            "title": "Add Schema Markup",
            "description": "Implement Organization and SoftwareApplication schema for better rich snippets.",
        },
        {
            "priority": "low",
            "category": "Social",
            "title": "Increase Social Signals",
            "description": "Share case studies and calculators on LinkedIn and engineering forums.",
        },
    ])

    return recommendations


def generate_html_report(results: list[dict], config: dict, output_path: Path) -> str:
    """Generate HTML report from analysis results.

    Args:
        results: List of keyword analysis results.
        config: Original config dictionary for reference.
        output_path: Path where report will be saved.

    Returns:
        Generated HTML content.
    """
    recommendations = generate_seo_recommendations(results)
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Sort results by opportunity score
    sorted_results = sorted(results, key=lambda x: x.get("opportunity_score", 0), reverse=True)

    # Generate keyword rows
    keyword_rows = ""
    for r in sorted_results:
        position = r.get("estimated_position")
        position_display = str(position) if position else "Not ranking"
        position_class = "success" if position and position <= 10 else "warning" if position else "danger"

        opp_score = r.get("opportunity_score", 0)
        opp_class = "success" if opp_score >= 60 else "warning" if opp_score >= 40 else "danger"

        top_competitor = r["competitors"][0]["domain"] if r.get("competitors") else "N/A"

        keyword_rows += f"""
        <tr>
            <td><strong>{r['keyword']}</strong></td>
            <td><span class="label label-{position_class}">{position_display}</span></td>
            <td>{r.get('search_volume', 'N/A')}</td>
            <td>{r.get('difficulty', 'N/A')}</td>
            <td>{top_competitor}</td>
            <td><span class="label label-{opp_class}">{opp_score}</span></td>
        </tr>
        """

    # Generate competitor summary
    all_competitors = {}
    for r in results:
        for comp in r.get("competitors", []):
            domain = comp["domain"]
            if domain not in all_competitors:
                all_competitors[domain] = {"count": 0, "avg_position": 0, "positions": []}
            all_competitors[domain]["count"] += 1
            all_competitors[domain]["positions"].append(comp.get("position", 100))

    for domain in all_competitors:
        positions = all_competitors[domain]["positions"]
        all_competitors[domain]["avg_position"] = sum(positions) / len(positions)

    competitor_rows = ""
    for domain, data in sorted(all_competitors.items(), key=lambda x: x[1]["count"], reverse=True):
        competitor_rows += f"""
        <tr>
            <td><strong>{domain}</strong></td>
            <td>{data['count']}</td>
            <td>{data['avg_position']:.1f}</td>
        </tr>
        """

    # Generate recommendations HTML
    recommendation_cards = ""
    priority_colors = {"high": "danger", "medium": "warning", "low": "info"}
    for rec in recommendations:
        color = priority_colors.get(rec["priority"], "default")
        recommendation_cards += f"""
        <div class="panel panel-{color}">
            <div class="panel-heading">
                <span class="label label-{color}">{rec['priority'].upper()}</span>
                <strong>{rec['category']}</strong>: {rec['title']}
            </div>
            <div class="panel-body">
                {rec['description']}
            </div>
        </div>
        """

    # Calculate summary stats
    total_keywords = len(results)
    ranking_keywords = sum(1 for r in results if r.get("estimated_position"))
    avg_opportunity = sum(r.get("opportunity_score", 0) for r in results) / total_keywords if total_keywords else 0

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Competitor Analysis Report - AceEngineer</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <style>
        body {{ padding: 20px; background: #f5f5f5; }}
        .report-header {{ background: #e74c3c; color: white; padding: 30px; margin-bottom: 30px; border-radius: 4px; }}
        .summary-box {{ background: white; padding: 20px; margin-bottom: 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }}
        .summary-box h2 {{ margin: 0; font-size: 36px; }}
        .summary-box p {{ margin: 5px 0 0 0; color: #666; }}
        .panel {{ margin-bottom: 15px; }}
        .table-container {{ background: white; padding: 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }}
        .label {{ font-size: 12px; }}
        .section-title {{ margin-top: 30px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e74c3c; }}
        .dry-run-notice {{ background: #fcf8e3; border: 1px solid #faebcc; color: #8a6d3b; padding: 15px; margin-bottom: 20px; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="report-header">
            <h1>Competitor Analysis Report</h1>
            <p>Generated: {generated_at}</p>
        </div>

        {"<div class='dry-run-notice'><strong>Dry Run Mode:</strong> This report contains simulated test data only.</div>" if any(r.get("dry_run") for r in results) else ""}

        <div class="row">
            <div class="col-md-3">
                <div class="summary-box">
                    <h2>{total_keywords}</h2>
                    <p>Keywords Tracked</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-box">
                    <h2>{ranking_keywords}</h2>
                    <p>Currently Ranking</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-box">
                    <h2>{len(all_competitors)}</h2>
                    <p>Competitors Detected</p>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-box">
                    <h2>{avg_opportunity:.0f}</h2>
                    <p>Avg Opportunity Score</p>
                </div>
            </div>
        </div>

        <h2 class="section-title">Keyword Rankings</h2>
        <div class="table-container">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Keyword</th>
                        <th>Position</th>
                        <th>Search Volume</th>
                        <th>Difficulty</th>
                        <th>Top Competitor</th>
                        <th>Opportunity</th>
                    </tr>
                </thead>
                <tbody>
                    {keyword_rows}
                </tbody>
            </table>
        </div>

        <h2 class="section-title">Competitor Overview</h2>
        <div class="table-container">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Competitor Domain</th>
                        <th>Keywords Competing</th>
                        <th>Avg Position</th>
                    </tr>
                </thead>
                <tbody>
                    {competitor_rows}
                </tbody>
            </table>
        </div>

        <h2 class="section-title">SEO Recommendations</h2>
        {recommendation_cards}

        <hr>
        <p class="text-muted text-center">
            Report generated by AceEngineer Competitor Analysis Tool<br>
            <small>Data is simulated for demonstration purposes. Connect to a real SEO API for production use.</small>
        </p>
    </div>
</body>
</html>
"""
    return html


def create_latest_symlink(report_path: Path, output_dir: Path) -> None:
    """Create or update 'latest.html' symlink pointing to newest report.

    Args:
        report_path: Path to the newly generated report.
        output_dir: Directory containing reports.
    """
    latest_link = output_dir / "latest.html"

    # Remove existing symlink if it exists
    if latest_link.exists() or latest_link.is_symlink():
        latest_link.unlink()

    # Create relative symlink
    latest_link.symlink_to(report_path.name)


def print_summary(results: list[dict], report_path: Path) -> None:
    """Print analysis summary to stdout.

    Args:
        results: List of keyword analysis results.
        report_path: Path to the generated report.
    """
    print("\n" + "=" * 60)
    print("COMPETITOR ANALYSIS SUMMARY")
    print("=" * 60)

    total = len(results)
    ranking = sum(1 for r in results if r.get("estimated_position"))
    high_opportunity = sum(1 for r in results if r.get("opportunity_score", 0) >= 60)

    print(f"\nKeywords Analyzed: {total}")
    print(f"Currently Ranking: {ranking} ({ranking/total*100:.0f}%)" if total else "Currently Ranking: 0")
    print(f"High Opportunity:  {high_opportunity}")

    # Top opportunities
    sorted_by_opp = sorted(results, key=lambda x: x.get("opportunity_score", 0), reverse=True)[:5]
    print("\nTop Opportunities:")
    for r in sorted_by_opp:
        opp = r.get("opportunity_score", 0)
        pos = r.get("estimated_position", "N/A")
        print(f"  - {r['keyword']}: Opportunity {opp}, Position {pos}")

    print(f"\nReport saved to: {report_path}")
    print("=" * 60 + "\n")


def main():
    """Main entry point for competitor analysis script."""
    parser = argparse.ArgumentParser(
        description="Competitor analysis for AceEngineer website SEO.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                    Run full analysis
  %(prog)s --dry-run          Test without real analysis
  %(prog)s --output custom.html  Specify output location
        """
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help=f"Path to keywords config file (default: {DEFAULT_CONFIG})"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output path for HTML report (default: reports/competitor-analysis/YYYY-MM-DD.html)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run in test mode with minimal simulated data"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print detailed progress information"
    )

    args = parser.parse_args()

    # Load configuration
    try:
        if args.verbose:
            print(f"Loading config from: {args.config}")
        config = load_keywords(args.config)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"Error parsing config: {e}", file=sys.stderr)
        sys.exit(1)

    # Get all keywords
    keywords = get_all_keywords(config)
    if not keywords:
        print("Error: No keywords found in config", file=sys.stderr)
        sys.exit(1)

    if args.verbose:
        print(f"Found {len(keywords)} keywords to analyze")

    # Analyze keywords
    results = []
    for i, keyword in enumerate(keywords, 1):
        if args.verbose:
            print(f"Analyzing [{i}/{len(keywords)}]: {keyword}")
        result = analyze_keyword(keyword, dry_run=args.dry_run)
        results.append(result)

    # Determine output path
    if args.output:
        output_path = args.output
        output_dir = output_path.parent
    else:
        output_dir = DEFAULT_OUTPUT
        date_str = datetime.now().strftime("%Y-%m-%d")
        output_path = output_dir / f"{date_str}.html"

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate and save report
    html_content = generate_html_report(results, config, output_path)

    with open(output_path, "w") as f:
        f.write(html_content)

    # Create latest symlink (only for default output directory)
    if not args.output:
        create_latest_symlink(output_path, output_dir)
        if args.verbose:
            print(f"Updated latest.html symlink -> {output_path.name}")

    # Print summary
    print_summary(results, output_path)

    if args.dry_run:
        print("(Dry run - no real analysis performed)")


if __name__ == "__main__":
    main()
