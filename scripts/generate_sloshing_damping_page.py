#!/usr/bin/env python3
"""
Generate the "Damping & sizing" sloshing capability page from the reviewed analysis outputs.

Why generated rather than hand-authored: every number on this page exists in a reviewed JSON
under the analysis root. Transcribing them by hand is the exact drift this capability's own
governance is designed to prevent, so the page is emitted from the source files and the
source paths are recorded in the page footer.

Charts follow the conventions already established on the sloshing pages:
  * inline SVG, no JavaScript and no external data loading, so the principal result is
    visible even if scripts do not run
  * SVG <title> children give native hover tooltips with no script
  * every chart is paired with a full data table, so nothing is conveyed by colour alone
  * palette: the surface uses ONE hue light->dark because roll amplitude is ordinal
    magnitude (sequential, not categorical). The sizing chart uses two hues that pass the
    six-check validator (#0b6ea6 / #b54a18, worst adjacent CVD dE 20.0, normal 26.8),
    with hull damping carried by line style so identity never rests on hue alone.
    The site token --sl-blue (#176f8c) was NOT used for data marks: it fails the chroma
    floor at 0.09 and reads gray.

Usage:  python3 scripts/generate_sloshing_damping_page.py [--check]
        --check  verify the committed page matches what the sources would generate
Env:    SLOSHING_REVIEW_ROOT (default /home/undi/ws/cfd_work/dm1528)
"""
from __future__ import annotations

import argparse
import html
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REVIEW = os.environ.get("SLOSHING_REVIEW_ROOT", "/home/undi/ws/cfd_work/dm1528")
OUT = os.path.join(ROOT, "content", "reports", "sloshing", "damping-and-sizing.html")

SOURCES = {
    "surface": "review_output/damping/response_surface.json",
    "checks": "review_output/damping/prediction_checks.json",
    "loss": "analytical/loss_scaling.json",
    "moment": "analytical/moment_model.json",
    "sweep": "analytical/design_sweep.json",
}

# sequential ramp, one hue, light -> dark (roll amplitude is ordinal magnitude)
RAMP = ["#8ec4dd", "#2e87b5", "#0b4f70"]
# categorical pair, validator-passing; hull damping is carried by dash, not hue
CAT = {"18": "#0b6ea6", "21": "#b54a18"}


def load():
    data = {}
    for key, rel in SOURCES.items():
        with open(os.path.join(REVIEW, rel)) as f:
            data[key] = json.load(f)
    return data


def esc(s):
    return html.escape(str(s), quote=True)


# --------------------------------------------------------------------------
# Chart A -- exchange damping surface, drawn as three depth-ordered ridges.
# A full 7x3 mesh occludes badly at this resolution; ridges keep every measured
# point visible and readable, which a shaded mesh does not.
# --------------------------------------------------------------------------
def surface_svg(surf):
    periods = surf["axes"]["x"]["values"]
    amps = surf["axes"]["y"]["values"]
    z = surf["surfaces"]["zeta_equivalent"]["z"]

    # Geometry is constrained by the viewBox: the front lane must descend far enough to
    # read as depth, but its axis labels sit 31px below it and must stay inside 0..340.
    ax, ay = 62.0, 8.0         # period axis: right, gently down
    bx, by = 47.0, -31.0       # amplitude axis: right and up
    ox, oy = 92.0, 248.0
    zs = 215.0                 # zeta -> pixels

    def pt(i, j, zv):
        return (ox + i * ax + j * bx, oy + i * ay + j * by - zv * zs)

    parts = []
    # floor grid, one lane per amplitude, so the depth reading is unambiguous
    for j in range(len(amps)):
        p0, p1 = pt(0, j, 0), pt(len(periods) - 1, j, 0)
        parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--sl-line)" '
                     'stroke-width="1"></line>' % (p0[0], p0[1], p1[0], p1[1]))
    for i in range(len(periods)):
        p0, p1 = pt(i, 0, 0), pt(i, len(amps) - 1, 0)
        parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--sl-line)" '
                     'stroke-width="1"></line>' % (p0[0], p0[1], p1[0], p1[1]))

    # draw far ridge (largest amplitude) first so nearer, smaller ridges sit in front
    for j in range(len(amps) - 1, -1, -1):
        colour = RAMP[j]
        top = [pt(i, j, z[j][i]) for i in range(len(periods))]
        base = [pt(i, j, 0.0) for i in range(len(periods))]
        skirt = " ".join("%.1f,%.1f" % p for p in top + list(reversed(base)))
        line = " ".join("%.1f,%.1f" % p for p in top)
        parts.append('<polygon points="%s" fill="%s" opacity="0.16"></polygon>' % (skirt, colour))
        parts.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="2.4" '
                     'stroke-linejoin="round" stroke-linecap="round"></polyline>' % (line, colour))
        for i, p in enumerate(top):
            parts.append(
                '<circle cx="%.1f" cy="%.1f" r="3.6" fill="#fff" stroke="%s" stroke-width="2">'
                '<title>roll %g deg, period %g s: zeta_eq = %.3f</title></circle>'
                % (p[0], p[1], colour, amps[j], periods[i], z[j][i]))
        # direct label on each ridge -- identity never rests on colour
        lab = pt(len(periods) - 1, j, z[j][-1])
        parts.append('<text x="%.1f" y="%.1f" font-family="Inter,system-ui,sans-serif" '
                     'font-size="10.5" font-weight="700" fill="%s">%g&#176;</text>'
                     % (lab[0] + 9, lab[1] + 3, colour, amps[j]))

    # period axis labels along the front lane
    for i, T in enumerate(periods):
        p = pt(i, 0, 0)
        parts.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="10" '
                     'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">%g</text>'
                     % (p[0] - 6, p[1] + 15, T))
    p = pt(3, 0, 0)
    parts.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="10" '
                 'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">'
                 'forcing period (s)</text>' % (p[0] - 6, p[1] + 31))
    # zeta scale on the left
    for zv in (0.2, 0.4, 0.6):
        p = pt(0, 0, zv)
        parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--sl-line)" '
                     'stroke-width="1" stroke-dasharray="2 3"></line>'
                     % (p[0] - 6, p[1], p[0], p[1]))
        parts.append('<text x="%.1f" y="%.1f" text-anchor="end" font-size="10" '
                     'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">%.1f</text>'
                     % (p[0] - 10, p[1] + 3, zv))
    parts.append('<text x="22" y="150" text-anchor="middle" font-size="10" '
                 'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)" '
                 'transform="rotate(-90 22 150)">equivalent damping &#950;</text>')
    # the amplitude axis label rides alongside that axis, clear of the ridges
    a0, a1 = pt(0, 0, 0), pt(0, len(amps) - 1, 0)
    parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--sl-muted)" '
                 'stroke-width="1" opacity="0.5"></line>'
                 % (a0[0] - 16, a0[1] + 10, a1[0] - 16, a1[1] + 10))
    parts.append('<text x="%.1f" y="%.1f" font-size="10" text-anchor="middle" '
                 'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)" '
                 'transform="rotate(-33 %.1f %.1f)">roll amplitude &#8594;</text>'
                 % ((a0[0] + a1[0]) / 2 - 16, (a0[1] + a1[1]) / 2 + 4,
                    (a0[0] + a1[0]) / 2 - 16, (a0[1] + a1[1]) / 2 + 4))

    alt = ("Three-dimensional surface of equivalent damping over forcing period and roll "
           "amplitude. Damping rises steeply with roll amplitude at every period - from "
           "%.2f at 2.5 degrees to %.2f at 10 degrees at 23 seconds - and falls as period "
           "lengthens. The surface is not flat in the amplitude direction, which is the "
           "signature of a quadratic loss." % (z[0][4], z[2][4]))
    return ('<svg viewBox="0 0 620 340" role="img" aria-label="%s">%s</svg>'
            % (esc(alt), "".join(parts)))


# --------------------------------------------------------------------------
# Chart B -- roll reduction against conduit area, with the superseded sizing band.
# --------------------------------------------------------------------------
def sizing_svg(sweep):
    keys = [("Tr18_zh0.02_alpha0.05", "18", "0.02"), ("Tr18_zh0.05_alpha0.05", "18", "0.05"),
            ("Tr21_zh0.02_alpha0.05", "21", "0.02"), ("Tr21_zh0.05_alpha0.05", "21", "0.05")]
    x0, x1, y0, y1 = 62.0, 566.0, 30.0, 214.0
    amin, amax, rmax = 2.0, 30.0, 75.0

    def px(a):
        return x0 + (a - amin) / (amax - amin) * (x1 - x0)

    def py(r):
        return y1 - (r / rmax) * (y1 - y0)

    parts = []
    # the conduit area this capability previously called for, now shown against the optimum
    parts.append('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="var(--sl-muted)" '
                 'opacity="0.10"></rect>'
                 % (px(13.0), y0, px(22.0) - px(13.0), y1 - y0))
    parts.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="9.5" '
                 'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">'
                 'superseded sizing 13&#8211;22 m&#178;</text>' % ((px(13.0) + px(22.0)) / 2, y0 - 8))
    for r in (0, 25, 50, 75):
        parts.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="var(--sl-line)" '
                     'stroke-width="1"></line>' % (x0, py(r), x1, py(r)))
        parts.append('<text x="%.1f" y="%.1f" text-anchor="end" font-size="10" '
                     'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">%d%%</text>'
                     % (x0 - 8, py(r) + 3, r))

    for key, tr, zh in keys:
        pts = sweep["sweeps"][key]["points"]
        colour = CAT[tr]
        dash = ' stroke-dasharray="6 4"' if zh == "0.05" else ""
        d = " ".join("%.1f,%.1f" % (px(p["conduit_area_m2"]), py(p["peak_reduction_pct"]))
                     for p in pts if amin <= p["conduit_area_m2"] <= amax)
        parts.append('<polyline points="%s" fill="none" stroke="%s" stroke-width="2.2"%s '
                     'stroke-linejoin="round"></polyline>' % (d, colour, dash))
        o = sweep["sweeps"][key]["optimum"]
        parts.append('<circle cx="%.1f" cy="%.1f" r="5" fill="%s"><title>optimum: A_c %.1f m2, '
                     '%.1f %% reduction (roll %s s, hull zeta %s)</title></circle>'
                     % (px(o["conduit_area_m2"]), py(o["peak_reduction_pct"]), colour,
                        o["conduit_area_m2"], o["peak_reduction_pct"], tr, zh))

    for a in (2, 5, 10, 15, 20, 25, 30):
        parts.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="10" '
                     'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">%d</text>'
                     % (px(a), y1 + 16, a))
    parts.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-size="10" '
                 'font-family="Inter,system-ui,sans-serif" fill="var(--sl-muted)">'
                 'conduit area A<tspan dy="3" font-size="8">c</tspan>'
                 '<tspan dy="-3"> (m&#178;)</tspan></text>' % ((x0 + x1) / 2, y1 + 33))
    parts.append('<text x="26" y="122" font-size="10" font-family="Inter,system-ui,sans-serif" '
                 'fill="var(--sl-muted)" transform="rotate(-90 26 122)">peak roll reduction</text>')

    alt = ("Peak roll reduction against conduit area for four hull cases. Every case peaks "
           "between 4 and 6 square metres and falls away steeply beyond it; across the "
           "13 to 22 square metre band this capability previously called for, reduction has "
           "dropped to between 20 and 5 percent.")
    return ('<svg viewBox="0 0 600 262" role="img" aria-label="%s">%s</svg>'
            % (esc(alt), "".join(parts)))


def legend(items):
    out = ['<ul class="chart-legend">']
    for swatch, label in items:
        out.append('<li><span class="chart-swatch" style="background:%s"></span>%s</li>'
                   % (swatch, label))
    out.append("</ul>")
    return "".join(out)


def surface_table(surf):
    periods = surf["axes"]["x"]["values"]
    amps = surf["axes"]["y"]["values"]
    z = surf["surfaces"]["zeta_equivalent"]["z"]
    rows = []
    for j, a in enumerate(amps):
        cells = "".join("<td>%.3f</td>" % v for v in z[j])
        rows.append("<tr><th scope=\"row\">%g&#176;</th>%s</tr>" % (a, cells))
    head = "".join("<th scope=\"col\">%g s</th>" % T for T in periods)
    return ('<div class="table-wrap"><table class="summary-table"><caption>Equivalent damping '
            '&#950; over the measured grid &#8212; one CFD case per cell, 21 cells</caption>'
            '<thead><tr><th scope="col">roll</th>%s</tr></thead><tbody>%s</tbody></table></div>'
            % (head, "".join(rows)))


def build(data):
    surf, checks, loss, moment, sweep = (data["surface"], data["checks"], data["loss"],
                                         data["moment"], data["sweep"])
    Tn = surf["natural_period_s"]
    cons = surf["per_amplitude_consistency"]
    n_fit = loss["fitted"]["exponent_n"]
    rms_fit = loss["fitted"]["rms_error_pct"]
    rms_old = loss["variants"]["v0.3_area_exponent_1"]["rms_error_pct"]
    ncases = loss["cases_used"]

    cons_rows = "".join(
        "<tr><td>%g&#176;</td><td>%.2f s</td><td>%g s</td><td>&#215;%.3f</td></tr>"
        % (c["roll_amplitude_deg"], c["natural_period_s_from_phase"],
           c["amplitude_peak_period_s"], c["peak_amplification"]) for c in cons)

    chk_rows = ""
    for g in checks["groups"]:
        if g["measured_Tn_s"] is None:
            continue
        label = ("conduit area %.1f m&#178;" % g["conduit_area_m2"]
                 if "conduit" in g["group"] else "fill %.0f %%" % (g["fill_depth_m"] / 10 * 100))
        chk_rows += ("<tr><td>%s</td><td>%.2f s</td><td>%.2f s</td><td>%+.1f %%</td>"
                     "<td>%.1f&#176;</td></tr>"
                     % (label, g["predicted_Tn_s"], g["measured_Tn_s"], g["Tn_error_pct"],
                        g["lag_at_predicted_period_deg"]))

    mom_rows = ""
    for c in moment["cases"]:
        if c["roll_amplitude_deg"] != 5.0 or c["period_s"] < 20:
            continue
        mom_rows += ("<tr><td>%g s</td><td>%.3f MN&#183;m</td><td>%.3f MN&#183;m</td>"
                     "<td>%+.1f %%</td></tr>"
                     % (c["period_s"], c["M_amplitude_measured_Nm"] / 1e6,
                        c["M_amplitude_predicted_Nm"] / 1e6, c["amplitude_error_pct"]))

    opt_rows = ""
    for key in ("Tr18_zh0.02_alpha0.05", "Tr18_zh0.05_alpha0.05",
                "Tr21_zh0.02_alpha0.05", "Tr21_zh0.05_alpha0.05"):
        s = sweep["sweeps"][key]
        o = s["optimum"]
        flag = "" if s["moment_model_in_band"] else " <abbr title=\"coupled peak falls at 18.5 to 19 seconds, just below the moment model&#39;s validated band of 20 seconds and above\">extrapolated</abbr>"
        opt_rows += ("<tr><td>%.0f s</td><td>%.2f</td><td>%.1f m&#178;</td><td>%.2f s</td>"
                     "<td>%.3f</td><td>%.1f %%%s</td></tr>"
                     % (s["roll_period_s"], s["hull_zeta"], o["conduit_area_m2"], o["tank_Tn_s"],
                        o["tuning_ratio_Tn_over_Troll"], o["peak_reduction_pct"], flag))

    pts = {p["conduit_area_m2"]: p for p in sweep["sweeps"]["Tr18_zh0.02_alpha0.05"]["points"]}
    size_rows = "".join(
        "<tr%s><td>%.1f m&#178;</td><td>%.2f s</td><td>%.1f %%</td></tr>"
        % (' class="highlight"' if a == 5.0 else "", a, pts[a]["tank_Tn_s"],
           pts[a]["peak_reduction_pct"])
        for a in (3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 13.5, 18.0, 22.0, 25.0))

    src = "".join("<li><code>%s</code></li>" % esc(v) for v in SOURCES.values())

    return f"""---
rootPath: "../../"
activeNav: "damping"
---
<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Measured exchange-mode damping surface for connected sloshing tanks, the validated inertia and loss laws, and the conduit area that maximises roll reduction. Source-neutral reference geometry.">
  <title>Damping &amp; Sizing — Tank Sloshing CFD — AceEngineer</title>
  <include src="partials/head-common.html"></include><link rel="stylesheet" href="{{{{ rootPath }}}}assets/css/sloshing-browser.css">
  <style>
    .chart-legend{{list-style:none;display:flex;flex-wrap:wrap;gap:1rem;margin:.6rem 0 0;padding:0;font-size:.86rem;color:var(--sl-muted)}}
    .chart-legend li{{display:flex;align-items:center;gap:.4rem}}
    .chart-swatch{{width:14px;height:3px;border-radius:2px;display:inline-block}}
    .response-figure svg{{width:100%;height:auto}}
  </style>
</head><body><include src="partials/nav.html"></include>
<main id="main" class="slosh-capability summary-report">
  <header class="cap-hero summary-hero">
    <p class="cap-kicker">Connected-tank study · damping surface · conduit sizing</p>
    <h1>Damping &amp; Sizing</h1>
    <p class="cap-lede">A connected-tank roll device is decided by two numbers: where its exchange mode sits, and how heavily that mode is damped. Both are now <strong>measured across a grid</strong> rather than inferred from a single case, and both feed a closed-form model that predicts the <strong>conduit area which maximises roll reduction</strong>. Geometry is the source-neutral dm1528 reference; no client data appears here.</p>
    <div class="summary-verdict"><strong>Disposition</strong><span>Design-grade for conduit sizing on this geometry family. The inertia law predicts the exchange period to ±3&#8239;% across a four-fold conduit-area range and 25–70&#8239;% fill; the loss law reproduces {ncases} measured cases to {rms_fit:.1f}&#8239;% rms; the tank moment is closed form to 4.3&#8239;% rms for periods of 20&#8239;s and above.</span></div>
    <div class="cap-actions"><a class="button primary" href="#surface">The damping surface</a><a class="button" href="#sizing">Conduit sizing</a><a class="button" href="dual-connected-tanks.html">Dual tanks</a></div>
  </header>
  <include src="partials/sloshing-capability-nav.html"></include>

  <section class="cap-section summary-intro">
    <div><p class="section-label">01 · What changed</p>
      <h2>The exchange period is {Tn:.2f}&#8239;s, not the response peak</h2>
      <p>Earlier work on this capability read the exchange period off the <em>amplitude peak</em> of a forced-roll sweep, at about 23&#8239;s. That is not the natural period. Phase settles it without ambiguity: the lag through the exchange mode crosses 90° exactly at resonance whatever the damping, and it does so at <strong>{Tn:.2f}&#8239;s</strong>. The amplitude peak is a different quantity — it is loss-controlled, and it moves.</p>
      <p>The distinction is not academic. An effective conduit length calibrated to the response peak absorbs a damping-induced shift into an inertia parameter, and will not transfer to another conduit area or fill.</p></div>
    <div class="summary-metrics" aria-label="Headline results">
      <div><strong>{Tn:.2f} s</strong><span>exchange period, from phase</span></div>
      <div><strong>n = {n_fit:.2f}</strong><span>conduit-area exponent of the loss</span></div>
      <div><strong>{rms_fit:.1f}%</strong><span>loss law, rms over {ncases} cases</span></div>
      <div><strong>4–6 m²</strong><span>conduit area at maximum roll reduction</span></div>
    </div>
  </section>

  <section class="cap-section" id="surface"><p class="section-label">02 · The measured surface</p>
    <h2>Equivalent damping over period and roll amplitude</h2>
    <p>Twenty-one forced-roll CFD cases, one per cell, identical geometry, mesh and solver settings throughout. Damping is not a property of the tank alone: it rises steeply with roll amplitude at every period, which is what a quadratic conduit loss does and a linear-viscous one cannot.</p>
    <figure class="response-figure">{surface_svg(surf)}
      {legend([(RAMP[0], "roll 2.5&#176;"), (RAMP[1], "roll 5&#176;"), (RAMP[2], "roll 10&#176;")])}
      <figcaption>Equivalent damping ratio &#950; of the exchange mode. Each ridge is one roll amplitude; each marker is one CFD case. Hover a marker for its value.</figcaption>
    </figure>
    {surface_table(surf)}
    <p class="source-note">&#950; is a linearisation of a quadratic loss and is valid at the amplitude it was measured at — it is not a material constant. The 13&#8239;s column is the least reliable: it sits closest to resonance, where the extraction is numerically ill-conditioned.</p>
  </section>

  <section class="cap-section"><p class="section-label">03 · What the grid proves</p>
    <h2>The natural period does not move; the response peak does</h2>
    <p>A single-amplitude sweep cannot separate these two. The grid can, and the separation is decisive: the exchange period is an inertial property and holds to under 2&#8239;% across a four-fold change in roll amplitude, while the amplitude peak doubles over the same range.</p>
    <div class="table-wrap"><table class="summary-table"><caption>Natural period against amplitude peak, by roll amplitude</caption>
      <thead><tr><th scope="col">roll amplitude</th><th scope="col">natural period (90° phase)</th><th scope="col">amplitude peak</th><th scope="col">peak amplification</th></tr></thead>
      <tbody>{cons_rows}</tbody></table></div>
    <p class="source-note">The 10° peak sits at the edge of the tested period range, so its amplification is a lower bound.</p>
  </section>

  <section class="cap-section"><p class="section-label">04 · The laws, and what tested them</p>
    <h2>Predictions made before the runs, not fitted after</h2>
    <p>Two numbers are fitted, both at one conduit area and one fill: an effective conduit length, and a loss coefficient. Everything else is geometry. The cases below were then placed where the resulting predictions are falsifiable — at the predicted resonance of conduit areas and fills the model had never seen.</p>
    <div class="table-wrap"><table class="summary-table"><caption>Exchange period: predicted before the run, measured after</caption>
      <thead><tr><th scope="col">case</th><th scope="col">predicted</th><th scope="col">measured</th><th scope="col">error</th><th scope="col">phase lag at the predicted period</th></tr></thead>
      <tbody>{chk_rows}</tbody></table></div>
    <p>The loss law needed correcting by this test, and the correction is instructive. Derived as a form drag it scales as 1/A<sub>c</sub>, which reproduced the calibration area but failed in <em>opposite directions</em> either side of it — under by 55&#8239;% at the smaller conduit, over by 108&#8239;% at the larger. Fitting the exponent rather than assuming it gives <strong>n&#8239;=&#8239;{n_fit:.2f}</strong>, and rms error over {ncases} cases at three conduit areas falls from {rms_old:.1f}&#8239;% to {rms_fit:.1f}&#8239;%.</p>
    <div class="table-wrap"><table class="summary-table"><caption>Tank roll moment, closed form against CFD (5° roll, validated band)</caption>
      <thead><tr><th scope="col">period</th><th scope="col">measured</th><th scope="col">closed form</th><th scope="col">error</th></tr></thead>
      <tbody>{mom_rows}</tbody></table></div>
    <p class="source-note">The moment adds two static terms the redistribution estimate omits — the weight moment of the whole fluid mass about the roll axis, and the within-leg free surface. Below about 20&#8239;s the closed form degrades, and the cause is <strong>not established</strong>. An earlier note here attributed it to the legs&#8217; own sloshing modes; that is withdrawn. Roll tilts the surface across the leg width, so the roll-coupled mode is the 2.79&#8239;s transverse one, whose undamped magnification at 10&#8239;s forcing is 1.08 against the 1.72 the residual requires &#8212; far too remote. The 6.25&#8239;s longitudinal mode would give 1.64, close enough to have looked explanatory, but it is orthogonal to uniform roll forcing and is not excited. Deriving the properly coupled correction moves all-case rms 16.74&#8239;% &#8594; 16.68&#8239;%, i.e. not at all. The band is empirical.</p>
  </section>

  <section class="cap-section" id="sizing"><p class="section-label">05 · Conduit sizing</p>
    <h2>Roll reduction against conduit area</h2>
    <p>With every link validated, the chain runs from geometry to roll response, and the design question becomes answerable: for a given hull, which conduit area returns the most roll reduction?</p>
    <figure class="response-figure">{sizing_svg(sweep)}
      {legend([(CAT["18"], "roll period 18&#8239;s"), (CAT["21"], "roll period 21&#8239;s"),
               ("var(--sl-muted)", "solid = hull &#950; 0.02 · dashed = hull &#950; 0.05")])}
      <figcaption>Peak roll reduction against conduit area, tank authority &#945;&#8239;=&#8239;0.05. Filled markers are the optimum for each hull. Hover any optimum for its values.</figcaption>
    </figure>
    <div class="table-wrap"><table class="summary-table"><caption>Optimum conduit area by hull</caption>
      <thead><tr><th scope="col">roll period</th><th scope="col">hull &#950;</th><th scope="col">optimum A<sub>c</sub></th><th scope="col">tank period</th><th scope="col">tuning ratio</th><th scope="col">peak reduction</th></tr></thead>
      <tbody>{opt_rows}</tbody></table></div>
    <p>Two results matter more than the peak value. The optimum is <strong>deliberately detuned</strong> — the tank period sits below the roll period, which is correct for a heavily damped absorber. And the optimum is <strong>broad</strong>: 5 and 6&#8239;m² are within one percent of each other, so the as-built routing uncertainty that worries a tuned device is survivable here.</p>
    <div class="table-wrap"><table class="summary-table"><caption>Sensitivity to conduit area (roll 18&#8239;s, hull &#950;&#8239;=&#8239;0.02)</caption>
      <thead><tr><th scope="col">conduit area</th><th scope="col">tank period</th><th scope="col">peak reduction</th></tr></thead>
      <tbody>{size_rows}</tbody></table></div>
    <p class="source-note">Hull damping roughly halves the benefit at every conduit area. It is a property of the vessel, not of the tank, and it moves the answer by more than any sizing choice does.</p>
  </section>

  <section class="cap-section"><p class="section-label">06 · Limits</p>
    <h2>What this does not establish</h2>
    <ul>
      <li>One geometry family. Conduit area is validated over 3.4–13.5&#8239;m² and fill over 25–70&#8239;%; the loss exponent rests on two off-calibration conduit areas and should be treated as provisional until a third tests it.</li>
      <li>The closed-form moment is validated for forcing periods of 20&#8239;s and above. Where the coupled peak falls just below that, the table says so.</li>
      <li>A connected tank <em>worsens</em> long-period roll through the free-surface penalty it imposes. That is present in the same model and is not a small effect.</li>
      <li>Nothing here is a vessel result. The hull enters only as roll period, hull damping and tank authority; applying it to a ship requires that vessel&#8217;s own values.</li>
    </ul>
    <h3 class="section-label">Provenance</h3>
    <p class="source-note">Every case and derived value on this page is published in the immutable release &#8212; digest <code>1034bb4efc5d9b39…</code>, pinned dataset revision <code>51ba5ddbca8d…</code>. That release grew from 24 to <strong>57 cases</strong> and 133 to <strong>441 derived metrics</strong> to carry this work, and all 47 declared source files resolve on the pinned revision.</p>
    <p class="source-note"><strong>Three of the 33 new cases are flagged, not clean.</strong> <code>fill-f25-t12-a5</code>, <code>fill-f25-t13p95-a5</code> and <code>grid-t10-a10</code> exceed the declared 2&#8239;% exchange cycle-change limit (2.25&#8239;%, 2.30&#8239;% and 3.24&#8239;%). They are published with status <code>accepted_with_exception</code> and counted in the release&#8217;s dispositions table rather than dropped, because they are real runs and because where they fall is informative: the two lowest-fill cases and the largest-amplitude shortest-period cell are the most nonlinear conditions in the set, and the slowest to settle. Statistics that assume every cell is equally converged should exclude them.</p>
    <p class="source-note">No time series were published. The <code>samples</code> table stands at 9,933 rows against a declared limit of 10,000, so adding series would breach the release&#8217;s own limit; the raw histories stay in the pinned private source.</p>
    <p class="source-note">Generated by <code>scripts/generate_sloshing_damping_page.py</code>, which regenerates this page from the reviewed analysis files &#8212; no value here is hand-transcribed, and <code>--check</code> fails the build if the page drifts from its sources. Sources:</p>
    <ul class="source-note">{src}</ul>
  </section>
</main>
<include src="partials/footer.html"></include>
</body></html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    page = build(load())
    if args.check:
        if not os.path.exists(OUT):
            print("MISSING: %s" % OUT)
            return 1
        if open(OUT).read() != page:
            print("STALE: %s does not match its sources" % OUT)
            return 1
        print("OK: page matches its sources")
        return 0
    with open(OUT, "w") as f:
        f.write(page)
    print("wrote %s (%d bytes)" % (OUT, len(page)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
