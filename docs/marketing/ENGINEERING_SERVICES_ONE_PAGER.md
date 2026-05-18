# A&CE Engineering Services — One-Pager

> Practical technical analysis for offshore deep-water, subsea, and well intervention teams.
> A leave-behind summary. For deeper detail see [PORTFOLIO_CAPABILITIES.md](./PORTFOLIO_CAPABILITIES.md).

## Who

Vamsee Achanta · Principal, Analytical & Computational Engineering (A&CE) · Houston, TX
- Email: `vamsee.achanta@aceengineer.com` · Phone: `+1 713-306-9029`
- 20+ years offshore engineering practice — deep-water field development life-cycle, mooring & riser dynamic analysis, subsea infrastructure, LNG terminal mooring, intervention engineering
- Active engineering software practice: [`digitalmodel`](https://github.com/vamseeachanta/digitalmodel) (open source), `aceengineercode`, `worldenergydata`

## What I do for operator engineering teams

Practical analysis bandwidth — not productized tooling. Engagements ship as audit-ready deliverables (calc reports, model files, review memos) that a tier-1 operator engineering authority can sign off on.

**Mooring & Floating Systems**
- Mooring re-rate and life-extension studies — chain/wire/polyester catenary analysis, anchor verification
- Permanent mooring fatigue assessment (SCR, SLWR, chain segments) — DNV-OS-E301, API RP 2SK
- Disconnectable / turret-moored FPSO analysis — extreme + intact + damaged condition
- CALM/SALM/jetty mooring for offloading and terminal designs

**Riser & Flowline Engineering**
- SCR, SLWR, flexible riser stack-up, VIV, and fatigue
- Strake / buoyancy module sizing
- Installation analysis (S-lay, J-lay, reel-lay) and on-bottom stability
- Subsea jumper lift engineering — pipe geometry, weight tally, multi-crane utilization

**Vessel & Intervention Operations**
- Vessel operability and motion analysis (LSV, intervention vessel, FPSO)
- Riserless light well intervention (RLWI) stationkeeping and proximity studies
- Crane operations, deck-load optimization, dual-vessel lift coordination
- Wave-loading and environmental design criteria

**Hydrodynamics & Field Development**
- Diffraction analysis with AQWA / OrcaWave — single canonical spec, multi-solver comparison
- 6-DOF RAOs, 6×6 added mass/damping, response analysis
- Field development economics — NPV, production forecasting, tieback-vs-newbuild trade studies
- Workover candidate ranking against deferred-production NPV

**Standards-Backed Calcs**
- Citation-traceable numerical deliverables — each safety-factor / S-N curve / design constant pinned to a published standard with publisher, code id, and revision
- 221 fatigue S-N curves implemented from DNV / API / BS 7608 / ABS / Norsok / Bureau Veritas
- Fail-closed validation: a calc cannot ship if the standards reference is missing or mismatched

## How I engage

| Model | When it fits |
|---|---|
| **Time-and-materials engineering analysis** | You have spillover scope; you need a senior pair of hands for 1–6 weeks |
| **Project SOW** | Defined deliverable (mooring re-rate report, RAO comparison study, jumper installation analysis) with fixed acceptance criteria |
| **Embedded sprint support** | Short engagement to clear a backlog of similar analyses (e.g., a series of fatigue assessments across an asset) |
| **Advisory / review** | Independent third-party engineering review on critical deliverables |

I work as a sub on prime-vendor MSAs, or directly as a small-business consultant. I co-sign with a PE when the deliverable requires it.

## Tech foundation

Primary solvers: **OrcaFlex**, **AQWA** (ANSYS), **OrcaWave** (Orcina), **WAMIT**, **BEMRosetta**, **Gmsh**, **OpenFOAM**

Implementation stack: Python 3.9-3.11, NumPy/SciPy, pandas, scikit-learn, FastAPI. ~700+ modules and 1,900+ pytest tests across the in-house engineering libraries.

I work natively in client formats (OrcaFlex YAML, AQWA .DAT/.LIS, Excel workbooks) — no "import everything into our system first" overhead.

## Recent capability additions

- **Subsea jumper lift engineering pipeline** — pipe geometry + bend arc + weight tally automation; 27-section line-type breakdown; multi-crane simultaneous utilization; validated to 6+ decimal places against legacy Excel workflow
- **Unified diffraction framework** — run AQWA and OrcaWave on the same vessel from a single canonical spec; physics-based consensus checks (symmetry, positive semi-definiteness, Kramers-Kronig causality)
- **DynaCard ML rod pump diagnostics** — 18 failure modes, 89% cross-validated accuracy, zero-runtime-dependency model export
- **Citation contract for calc outputs** — every standards-derived constant emits a sidecar citation (publisher / code id / revision) so reviewers can verify provenance without leaving the report

## What I don't do

Not a substitute for: detailed engineering and project management on EPC-scale work; in-house engineering authority sign-off; rig / drillship operational planning; metocean primary data acquisition; ROV intervention planning at the procedure level.

I bring the *analysis* — the engineering authority and procedural ownership stays with your team.

## Standards I implement against

**Mooring**: DNV-OS-E301, API RP 2SK
**Risers**: DNV-OS-F201, API RP 2RD
**Pipelines / Subsea**: DNV-OS-F101, API 17A/B/C/E/J
**Structural**: DNV-ST-0119, ISO 19902, API RP 2A
**Fatigue**: DNV-RP-C203, BS 7608, API RP 2A-WSD
**Hydrodynamic**: DNV-RP-H103, DNV-RP-C205, ISO 19901
**Installation**: DNV-RP-H103, DNV-ST-N001

## Next step

If there's a current scope you'd like me to look at: send a problem statement (1 paragraph is enough) and I'll come back within 2 business days with a scope/schedule/fee response, or a "this isn't the right fit, here's why" note.

If you'd like to vet me before any scope conversation: [`github.com/vamseeachanta/digitalmodel`](https://github.com/vamseeachanta/digitalmodel) is the open-source side of the practice — the code, tests, and standards implementations are public.

---

*A&CE — Analytical & Computational Engineering · `aceengineer.com`*
