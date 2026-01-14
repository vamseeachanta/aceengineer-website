# A&CE Portfolio Capabilities

> Last Updated: 2026-01-14
> Source: Workspace-Hub Repository Analysis

## Executive Summary

Analytical & Computational Engineering (A&CE) has developed a comprehensive engineering software ecosystem with **704+ Python modules**, **221 fatigue curves** from international standards, and deep expertise across offshore, subsea, and energy domains.

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

### 2. Hydrodynamics & Motion Analysis

**Capabilities:**
- Wave load calculations (DNV-RP-H103)
- Drag/inertia coefficient determination
- RAO processing and response analysis
- Vessel motion analysis
- Wave-structure interaction

**Applications:** Platform motion studies, vessel operability, wave loading on risers

### 3. Riser Engineering

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

### 4. Mooring Systems

**Capabilities:**
- SALM (Single Anchor Leg Mooring) design
- Buoy systems (CALM, tanker)
- Anchor design and verification
- Catenary analysis
- Environmental loading assessment

### 5. Subsea Infrastructure

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

### 6. Vessel Analysis

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

### 7. Energy Data & Economics (worldenergydata)

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

### 8. Manufacturing Engineering (OGManufacturing)

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
| **AQWA** | Full API | Hydrodynamic models, post-processing |
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
