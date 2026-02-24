#!/usr/bin/env python3
"""
Generate MPD adoption visualizations for blog article.

Produces three charts for the MPD adoption case study article:
  1. MPD adoption timeline — % of active deepwater floater fleet, 2010–2028
  2. Contractor MPD readiness — sampled fleet comparison by major driller
  3. Well complexity / pressure window — conventional vs. MPD in narrow-margin well

Output: HTML files written to assets/data/mpd_charts/ (interactive Plotly)
        PNG files written to assets/images/mpd_charts/ (static, requires kaleido)

Usage:
    python scripts/generate_mpd_charts.py
    python scripts/generate_mpd_charts.py --output-dir /tmp/mpd_charts --format html
    python scripts/generate_mpd_charts.py --format png  # requires kaleido

Data notes:
    - Fleet adoption percentages are estimates derived from public industry data,
      announced contracts, and contractor investor presentations (2010–2025).
    - Forecast years (2026–2028) are trend projections, not guaranteed outcomes.
    - Contractor rig counts are a sampled subset tracked in worldenergydata fleet module;
      12 rigs across Noble, Transocean, and Valaris deepwater fleets.
    - Pressure window values are illustrative Lower Tertiary Wilcox analog conditions
      for the purpose of engineering explanation. Not well-specific data.
"""

import argparse
import json
from pathlib import Path
from typing import Optional

try:
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    print("WARNING: plotly not installed. Run: pip install plotly")

# ---------------------------------------------------------------------------
# Chart colour palette (matches aceengineer.com brand)
# ---------------------------------------------------------------------------
COLOR_PRIMARY = "#E95420"   # A&CE orange
COLOR_BLUE = "#1f77b4"
COLOR_GREEN = "#2ca02c"
COLOR_PURPLE = "#7b1fa2"
COLOR_AMBER = "#f57c00"
COLOR_RED = "#d32f2f"
COLOR_DARK_BLUE = "#1565c0"
COLOR_GREY = "#b0bec5"
PLOT_BG = "#ffffff"
PAPER_BG = "#fafafa"


# ---------------------------------------------------------------------------
# Data definitions
# ---------------------------------------------------------------------------

# Fleet adoption timeline data
# Years split into historical (through 2025) and forecast (2026–2028)
ADOPTION_YEARS = [
    2010, 2012, 2014, 2016, 2018, 2019,
    2020, 2021, 2022, 2023, 2024, 2025,
    2026, 2027, 2028,
]
# % of active fleet with certified MPD capability
PCT_DRILLSHIPS = [2, 3, 5, 8, 14, 19, 25, 32, 42, 52, 60, 66, 71, 76, 80]
PCT_SEMIS = [1, 2, 3, 5, 8, 11, 14, 18, 24, 30, 36, 41, 46, 51, 56]
PCT_ALL_FLOATERS = [
    1.5, 2.5, 4, 6.5, 11, 15,
    19.5, 25, 33, 41, 48, 53.5,
    58.5, 63.5, 68,
]
HIST_END_IDX = 11  # index of last historical point (2025)

# Contractor MPD readiness (sampled fleet, early 2026)
CONTRACTORS = ["Noble", "Transocean", "Valaris"]
TOTAL_TRACKED = [4, 4, 4]
MPD_CAPABLE = [2, 3, 2]

# Pressure window data — illustrative Lower Tertiary Wilcox analog
# Pore pressure 16.5 ppg EMW, fracture gradient 17.2 ppg EMW
# Static mud weight 16.8 ppg, annular friction ~350 psi
DEPTHS_FT = [18000, 20000, 22000, 24000, 26000, 28000, 30000]
PORE_PRESSURE_PPG = 16.5
FRAC_GRADIENT_PPG = 17.2
STATIC_MW_PPG = 16.8
ANNULAR_FRICTION_PSI = 350
PPG_TO_PSI_PER_FT = 0.052  # psi = ppg * 0.052 * TVD_ft


def _ppg_to_psi(ppg: float, depths: list) -> list:
    """Convert ppg equivalent mud weight to psi at each depth."""
    return [d * ppg * PPG_TO_PSI_PER_FT for d in depths]


# ---------------------------------------------------------------------------
# Chart 1: MPD Adoption Timeline
# ---------------------------------------------------------------------------

def build_adoption_timeline() -> "go.Figure":
    """Build MPD fleet adoption timeline (S-curve, 2010–2028)."""
    fig = go.Figure()

    years_hist = ADOPTION_YEARS[: HIST_END_IDX + 1]
    years_fcast = ADOPTION_YEARS[HIST_END_IDX:]

    def _add_series(name: str, color: str, hist_y: list, fcast_y: list,
                    symbol: str = "circle") -> None:
        fig.add_trace(go.Scatter(
            x=years_hist, y=hist_y,
            mode="lines+markers",
            name=f"{name} (actual)",
            line={"color": color, "width": 2.5},
            marker={"size": 7, "symbol": symbol},
        ))
        fig.add_trace(go.Scatter(
            x=years_fcast, y=fcast_y,
            mode="lines",
            name=f"{name} (forecast)",
            line={"color": color, "width": 2, "dash": "dash"},
            showlegend=False,
        ))

    _add_series(
        "Drillships", COLOR_PRIMARY,
        PCT_DRILLSHIPS[: HIST_END_IDX + 1],
        PCT_DRILLSHIPS[HIST_END_IDX:],
    )
    _add_series(
        "Semisubmersibles", COLOR_BLUE,
        PCT_SEMIS[: HIST_END_IDX + 1],
        PCT_SEMIS[HIST_END_IDX:],
        symbol="diamond",
    )
    _add_series(
        "All floaters", COLOR_GREEN,
        PCT_ALL_FLOATERS[: HIST_END_IDX + 1],
        PCT_ALL_FLOATERS[HIST_END_IDX:],
        symbol="square",
    )

    fig.add_vline(
        x=2025.5, line_width=1.5, line_dash="dot", line_color="#aaaaaa"
    )
    fig.add_annotation(
        x=2025.9, y=85, text="Forecast", showarrow=False,
        font={"color": "#888888", "size": 12},
    )

    fig.update_layout(
        title="MPD Adoption: % of Active Deepwater Floater Fleet (2010–2028)",
        xaxis={
            "title": "Year",
            "tickmode": "array",
            "tickvals": ADOPTION_YEARS,
            "tickangle": -45,
        },
        yaxis={
            "title": "MPD-Capable Rigs (% of active fleet)",
            "range": [0, 92],
        },
        legend={"x": 0.02, "y": 0.98},
        margin={"t": 60, "b": 80, "l": 75, "r": 30},
        plot_bgcolor=PLOT_BG,
        paper_bgcolor=PAPER_BG,
        height=480,
    )
    return fig


# ---------------------------------------------------------------------------
# Chart 2: Contractor MPD Readiness
# ---------------------------------------------------------------------------

def build_contractor_readiness() -> "go.Figure":
    """Build grouped bar chart of contractor MPD readiness."""
    mpd_pct = [
        round((v / TOTAL_TRACKED[i]) * 100)
        for i, v in enumerate(MPD_CAPABLE)
    ]
    non_mpd = [TOTAL_TRACKED[i] - MPD_CAPABLE[i] for i in range(len(CONTRACTORS))]

    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=CONTRACTORS,
        y=non_mpd,
        name="Non-MPD rigs",
        marker_color=COLOR_GREY,
        text=[str(v) for v in non_mpd],
        textposition="inside",
    ))
    fig.add_trace(go.Bar(
        x=CONTRACTORS,
        y=MPD_CAPABLE,
        name="MPD-capable rigs",
        marker_color=COLOR_PRIMARY,
        text=[f"{v} ({mpd_pct[i]}%)" for i, v in enumerate(MPD_CAPABLE)],
        textposition="outside",
    ))

    fig.update_layout(
        title="Contractor MPD Readiness — Sampled Deepwater Fleet (Early 2026)",
        xaxis={"title": "Contractor"},
        yaxis={"title": "Rig count", "range": [0, 5.5]},
        barmode="stack",
        legend={"x": 0.7, "y": 0.98},
        margin={"t": 60, "b": 100, "l": 65, "r": 30},
        plot_bgcolor=PLOT_BG,
        paper_bgcolor=PAPER_BG,
        height=460,
        annotations=[{
            "x": 0.5, "y": -0.22,
            "xref": "paper", "yref": "paper",
            "text": (
                "Source: worldenergydata fleet_mpd module — "
                "12 sampled rigs across Noble, Transocean, and Valaris deepwater fleets. "
                "MPD-capable = certified installed system with trained crews."
            ),
            "showarrow": False,
            "font": {"size": 10, "color": "#888888"},
            "align": "center",
        }],
    )
    return fig


# ---------------------------------------------------------------------------
# Chart 3: Pressure Window — Conventional vs. MPD
# ---------------------------------------------------------------------------

def build_pressure_window() -> "go.Figure":
    """Build pressure window schematic for narrow-margin deepwater well."""
    pore_psi = _ppg_to_psi(PORE_PRESSURE_PPG, DEPTHS_FT)
    frac_psi = _ppg_to_psi(FRAC_GRADIENT_PPG, DEPTHS_FT)
    static_psi = _ppg_to_psi(STATIC_MW_PPG, DEPTHS_FT)
    ecd_circ = [p + ANNULAR_FRICTION_PSI for p in static_psi]
    ecd_conn = static_psi[:]  # static only at connection
    mpd_bhp = ecd_circ[:]     # MPD holds circulating ECD constant

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=pore_psi, y=DEPTHS_FT, mode="lines",
        name="Pore pressure (16.5 ppg EMW)",
        line={"color": COLOR_RED, "width": 2.5},
    ))
    fig.add_trace(go.Scatter(
        x=frac_psi, y=DEPTHS_FT, mode="lines",
        name="Fracture gradient (17.2 ppg EMW)",
        line={"color": COLOR_DARK_BLUE, "width": 2.5},
    ))
    fig.add_trace(go.Scatter(
        x=ecd_circ, y=DEPTHS_FT, mode="lines",
        name="Conventional ECD — circulating",
        line={"color": COLOR_GREEN, "width": 2, "dash": "dash"},
    ))
    fig.add_trace(go.Scatter(
        x=ecd_conn, y=DEPTHS_FT, mode="lines",
        name="Conventional ECD — connection (pump off)",
        line={"color": COLOR_AMBER, "width": 2, "dash": "dot"},
    ))
    fig.add_trace(go.Scatter(
        x=mpd_bhp, y=DEPTHS_FT, mode="lines",
        name="MPD maintained BHP (CBHP)",
        line={"color": COLOR_PURPLE, "width": 2.5},
    ))

    mid_depth_idx = 3  # 24,000 ft
    window_annotation_x = (pore_psi[mid_depth_idx] + frac_psi[mid_depth_idx]) / 2

    fig.update_layout(
        title=(
            "Pressure Window: Conventional vs. MPD<br>"
            "<sup>Illustrative Lower Tertiary Wilcox analog — "
            "not well-specific data</sup>"
        ),
        xaxis={"title": "Equivalent Pressure (psi)", "autorange": True},
        yaxis={
            "title": "True Vertical Depth (ft)",
            "autorange": "reversed",
            "tickformat": ",d",
        },
        legend={"x": 0.01, "y": 0.01},
        margin={"t": 80, "b": 70, "l": 85, "r": 30},
        plot_bgcolor=PLOT_BG,
        paper_bgcolor=PAPER_BG,
        height=500,
        annotations=[{
            "x": window_annotation_x,
            "y": DEPTHS_FT[mid_depth_idx],
            "xref": "x", "yref": "y",
            "text": "~0.7 ppg window",
            "showarrow": True,
            "arrowhead": 2,
            "ax": 70, "ay": 0,
            "font": {"size": 11, "color": "#555555"},
        }],
    )
    return fig


# ---------------------------------------------------------------------------
# Export helpers
# ---------------------------------------------------------------------------

def save_html(fig: "go.Figure", path: Path, include_plotlyjs: bool = True) -> None:
    """Write interactive Plotly chart to HTML file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.write_html(
        str(path),
        include_plotlyjs="cdn" if not include_plotlyjs else True,
        config={"displayModeBar": False, "responsive": True},
    )
    print(f"  Wrote HTML: {path}")


def save_png(fig: "go.Figure", path: Path, scale: int = 2) -> None:
    """Write static PNG chart. Requires kaleido: pip install kaleido"""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        fig.write_image(str(path), scale=scale)
        print(f"  Wrote PNG:  {path}")
    except Exception as exc:
        print(f"  PNG export failed (kaleido required): {exc}")


def save_chart_data(output_dir: Path) -> None:
    """Write chart data as JSON for downstream use (e.g. embedding in HTML)."""
    data = {
        "adoption_timeline": {
            "years": ADOPTION_YEARS,
            "hist_end_idx": HIST_END_IDX,
            "pct_drillships": PCT_DRILLSHIPS,
            "pct_semis": PCT_SEMIS,
            "pct_all_floaters": PCT_ALL_FLOATERS,
            "notes": (
                "Fleet adoption percentages estimated from public contractor disclosures, "
                "investor presentations, and rig fleet tracking (2010-2025). "
                "Forecast years 2026-2028 are trend projections."
            ),
        },
        "contractor_readiness": {
            "contractors": CONTRACTORS,
            "total_tracked": TOTAL_TRACKED,
            "mpd_capable": MPD_CAPABLE,
            "mpd_pct": [
                round((v / TOTAL_TRACKED[i]) * 100)
                for i, v in enumerate(MPD_CAPABLE)
            ],
            "notes": (
                "Sampled subset of 12 rigs from worldenergydata fleet_mpd module. "
                "MPD-capable defined as certified installed system with trained crews."
            ),
        },
        "pressure_window": {
            "depths_ft": DEPTHS_FT,
            "pore_pressure_ppg": PORE_PRESSURE_PPG,
            "frac_gradient_ppg": FRAC_GRADIENT_PPG,
            "static_mw_ppg": STATIC_MW_PPG,
            "annular_friction_psi": ANNULAR_FRICTION_PSI,
            "notes": (
                "Illustrative Lower Tertiary Wilcox analog conditions. "
                "Not well-specific data."
            ),
        },
    }
    json_path = output_dir / "mpd_chart_data.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w") as fh:
        json.dump(data, fh, indent=2)
    print(f"  Wrote JSON: {json_path}")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate MPD adoption visualizations for aceengineer-website blog."
    )
    parser.add_argument(
        "--output-dir",
        default="assets/data/mpd_charts",
        help="Output directory for generated files (default: assets/data/mpd_charts)",
    )
    parser.add_argument(
        "--format",
        choices=["html", "png", "both"],
        default="html",
        help="Output format: html (default), png (requires kaleido), or both",
    )
    parser.add_argument(
        "--include-plotlyjs",
        action="store_true",
        default=False,
        help="Embed full Plotly.js in HTML output (larger files; default: use CDN)",
    )
    return parser.parse_args()


def main() -> None:
    """Generate all three MPD charts and write output files."""
    if not PLOTLY_AVAILABLE:
        print("ERROR: plotly is required. Install with: pip install plotly")
        raise SystemExit(1)

    args = parse_args()
    output_dir = Path(args.output_dir)
    fmt = args.format

    print(f"Generating MPD adoption charts -> {output_dir}/")

    charts = [
        ("mpd_adoption_timeline", build_adoption_timeline),
        ("mpd_contractor_readiness", build_contractor_readiness),
        ("mpd_pressure_window", build_pressure_window),
    ]

    for name, builder in charts:
        print(f"\nBuilding: {name}")
        fig = builder()
        if fmt in ("html", "both"):
            save_html(fig, output_dir / f"{name}.html", args.include_plotlyjs)
        if fmt in ("png", "both"):
            save_png(fig, output_dir / f"{name}.png")

    save_chart_data(output_dir)
    print("\nDone.")


if __name__ == "__main__":
    main()
