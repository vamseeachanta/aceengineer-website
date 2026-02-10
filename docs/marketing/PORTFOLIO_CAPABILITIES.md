# A&CE Portfolio Capabilities

> Last Updated: 2026-02-09
> Source: Workspace-Hub Repository Analysis

## Executive Summary

Analytical & Computational Engineering (A&CE) has developed a comprehensive engineering software ecosystem with **704+ Python modules**, **221 fatigue curves** from international standards, **24,000+ lines of hydrodynamic diffraction code**, **18-mode ML rod pump diagnostics**, and deep expertise across offshore, subsea, and energy domains.

---

## Core Technical Capabilities

### 1. Structural & Fatigue Analysis (digitalmodel)

**Primary Capabilities:**
- **Fatigue Analysis**: 221 S-N curves from 17 international standards (DNV, API, BS 7608, ABS, BP, Norsok, Bureau Veritas)
- **Stress Analysis**: Von Mises calculations, multiaxial stress states, stress concentration factors
- **Structural Analysis**: Plate buckling, ultimate strength, stiffened panel analysis
- **Time-Series Analysis**: FFT processing, peak energy frequency identification

**Industry Standards:** DNV-RP-C203, API RP 2A, BS 7608, ABS, Norsok

**Software Integrations:** OrcaFlex automation, WAMIT/AQWA processing, BEMRosetta

### 2. Hydrodynamic Diffraction Analysis Suite (digitalmodel)

**Primary Capabilities:**
- **Unified Diffraction Framework**: ~24,000 LOC ecosystem supporting AQWA and OrcaWave with a single DiffractionResults schema (6-DOF RAOs, 6x6 added mass and damping matrices)
- **Multi-Solver Comparison**: Run AQWA and OrcaWave on the same vessel, statistical comparison with consensus metrics and interactive benchmark plots
- **Canonical Specification**: Define analysis once in spec.yml, generate inputs for any solver; reverse parsers convert existing models back to spec
- **Physics-Based Validation**: 8+ automated checks (coefficient symmetry, positive semi-definiteness, Kramers-Kronig causality, RAO quality, geometry validation, resonance detection)
- **Batch Processing**: Parallel execution of parametric sweeps across frequencies, headings, and loading conditions with automated postprocessing
- **Mesh Pipeline**: PanelMesh common format with GDF, DAT, STL, OBJ conversion and GMSH integration for parametric generation

**Industry Standards:** DNV-RP-H103, IMO, ISO 19901, DNV-RP-C205

**Software Integrations:** AQWA (ANSYS), OrcaWave (Orcina), OrcaFlex, BEMRosetta, GMSH

**Export Formats:** OrcaFlex YAML, CSV, Excel, JSON, HTML (Plotly interactive reports)

**Brochure:** [Diffraction Analysis Brochure](../../digitalmodel/docs/marketing/diffraction-analysis-brochure.md)

### 3. DynaCard AI Rod Pump Diagnostics (digitalmodel)

**Primary Capabilities:**
- **ML-Based Classification**: GradientBoosting classifier (100 estimators, depth 4) trained on 5,400 synthetic cards with 89.4% cross-validated accuracy
- **18 Failure Modes**: Three-tier coverage -- Core conditions (7), field failures (5), mechanical issues (6)
- **Feature Extraction**: Bezerra vertical projection method producing 16-dimensional feature vectors from dynamometer cards
- **Portable Model**: JSON model export with zero sklearn runtime dependency; legacy threshold fallback preserved
- **SVG Diagnostic Gallery**: Engineering-quality visualizations including rod pump schematics, 18-card diagnostic gallery, and annotated examples

**Industry Standards:** API 11E, API RP 11AR

**Software Integrations:** scikit-learn (training), Plotly (interactive reports), SVG (GitHub-compatible schematics)

**Brochure:** [DynaCard AI Diagnostics Brochure](../../digitalmodel/docs/marketing/dynacard-ai-diagnostics-brochure.md)

### 4. Vessel Motion Analysis

**Capabilities:**
- Wave load calculations (DNV-RP-H103)
- Drag/inertia coefficient determination
- RAO processing and response analysis
- Vessel motion analysis
- Wave-structure interaction

**Applications:** Platform motion studies, vessel operability, wave loading on risers

### 5. Riser Engineering

**Systems Supported:**
- Steel Catenary Risers (SCR)
- Steel Lazy Wave Risers (SLWR)
- Flexible risers and umbilicals
- Jumper design and analysis

**Analysis Types:**
- Stack-up calculations
- VIV analysis and prediction
- Fatigue life assessment
- Installation engineering

### 6. Mooring Systems

**Capabilities:**
- SALM (Single Anchor Leg Mooring) design
- Buoy systems (CALM, tanker)
- Anchor design and verification
- Catenary analysis
- Environmental loading assessment

### 7. Subsea Infrastructure

**Systems:**
- Pipeline design and analysis
- On-bottom stability calculations
- Span analysis and mitigation
- Flexibles and umbilicals
- Subsea jumpers

**Specializations:**
- Installation engineering
- Free span assessment
- Thermal analysis
- Expansion/contraction

### 8. Vessel Analysis

**Vessel Types:**
- Light Service Vessels (LSVs)
- Intervention Vessels
- Construction Vessels
- FPSOs/FSOs

**Analysis:**
- Operability studies
- Motion analysis
- Deck load optimization
- Crane operations

### 9. Energy Data & Economics (worldenergydata)

**Data Integration:**
- BSEE production and incident data
- SODIR (Norwegian Petroleum Directorate)
- Wind resource databases
- Field development data

**Economic Analysis:**
- NPV analysis with numpy-financial
- Production forecasting
- Timeline visualization
- Resource valuation

### 10. Manufacturing Engineering (OGManufacturing)

**Capabilities:**
- Riser design verification
- Manufacturing process engineering
- Component design validation
- Quality assurance documentation

---

## Software Integrations

| Software | Integration Level | Capabilities |
|----------|------------------|--------------|
| **OrcaFlex** | Full API | Model generation, batch analysis, results extraction |
| **AQWA** | Full API | Native .LIS/.DAT parsing, batch execution, input generation, RAO extraction |
| **OrcaWave** | Full API | Diffraction/radiation solver orchestration, batch processing, result validation |
| **WAMIT** | Output Processing | RAO conversion, response analysis |
| **BEMRosetta** | Integration | Boundary element processing |
| **Gmsh** | Full API | Mesh generation, quality control |
| **Blender** | Scripting | 3D animation, visualization |
| **FreeCAD** | Scripting | CAD generation, parametric modeling |

---

## Industry Standards Library

### Fatigue Standards (221 curves)
- **DNV**: RP-C203, GL-2005, GL-2010
- **API**: RP 2A-WSD, RP 2A-LRFD
- **BS 7608**: 2014 edition
- **ABS**: Multiple editions
- **BP**: Corporate standards
- **Norsok**: N-004, N-006
- **Bureau Veritas**: Current editions

### Design Standards
- **Structural**: API RP 2A, DNV-ST-0119, ISO 19902
- **Subsea**: API 17A/B/C/E/J, DNV-OS-F101
- **Mooring**: API RP 2SK, DNV-OS-E301
- **Risers**: API RP 2RD, DNV-OS-F201

---

## Technical Stack

### Languages & Frameworks
- **Python**: 3.9-3.11 (primary)
- **NumPy/SciPy**: Scientific computing
- **Pandas**: Data analysis
- **scikit-learn**: Machine learning
- **statsmodels**: Statistical analysis
- **FastAPI/uvicorn**: Web APIs

### Data & Visualization
- **Plotly**: Interactive charts
- **Matplotlib/Seaborn**: Static plots
- **SQLAlchemy**: Database ORM
- **PostgreSQL/SQLite**: Data storage

### Quality & Testing
- **pytest**: Test framework (1,971+ tests)
- **pytest-cov**: Coverage analysis
- **hypothesis**: Property-based testing
- **black/ruff/mypy**: Code quality

---

## Project Experience Indicators

| Domain | Projects | Key Deliverables |
|--------|----------|------------------|
| Deepwater Fields | Anchor, Julia, Jack, St. Malo | Field analysis, production forecasting |
| Subsea Cables | B1512, B1516, B1522 | Cable/armor analysis, AQWA modeling |
| Risers | RII Manufacturing | Design verification, manufacturing engineering |
| Installation | YELLOWTAIL-Project | Umbilical installation analysis |
| Field Operations | Rock Oil Field | Operational analysis, workflows |

---

## Development Metrics

| Metric | Value |
|--------|-------|
| Python Modules | 704+ |
| Test Files | 1,971+ |
| Fatigue Curves | 221 |
| Working Examples | 12+ |
| Documentation Files | 352+ |
| Commits (digitalmodel) | 305+ |

---

## Client Value Propositions

### For Engineering Firms
1. **Ready-to-Use Modules**: Structural, fatigue, and mooring analysis modules
2. **Standards Compliance**: Industry-validated against DNV, API, ABS
3. **Automation**: OrcaFlex/AQWA automation reducing analysis time by 60-80%
4. **Transparency**: Open-source examples demonstrating methodology

### For Energy Companies
1. **Unified Data Access**: BSEE, SODIR, wind databases
2. **Economic Analysis**: NPV with production forecasting
3. **Field-Specific Analysis**: Gulf of Mexico deepwater expertise
4. **Integrated Solutions**: End-to-end from data to decisions

### For Contractors & Fabricators
1. **Asset Lifecycle Management**: Design through operations
2. **Manufacturing Verification**: Engineering validation
3. **Installation Planning**: Pre-engineering and analysis
4. **Production Automation**: Batch processing for repetitive analysis
