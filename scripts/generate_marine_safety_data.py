#!/usr/bin/env python3
"""
Generate sample data for marine safety correlation case study.

This script generates realistic sample data for visualizations showing:
- Incident trends over time by data source
- Source distribution and overlap
- Geographic distribution by region
- Incident type breakdown
- Severity classification

Output: assets/data/marine_safety_correlation.json
"""

import json
from pathlib import Path
from typing import Dict, List

# Data based on actual marine_safety.db statistics
# TSB: 47,385 incidents (1975-2025)
# MAIB: 5,876 incidents (1989-2025)
# Plus integrated USCG, NTSB, ATSB, IMO, EMSA


def generate_incident_trends() -> List[Dict]:
    """Generate incident counts by year and source."""
    trends = []

    # TSB data (1975-2025, 47,385 total)
    tsb_start = 1975
    tsb_baseline = 800
    for year in range(tsb_start, 2026):
        # Increase through 2000, then decrease (modern safety improvements)
        if year < 1990:
            count = tsb_baseline + (year - tsb_start) * 20
        elif year < 2010:
            count = tsb_baseline + 300 + (year - 1990) * 15
        else:
            count = tsb_baseline + 600 - (year - 2010) * 10
        trends.append({"year": year, "source": "TSB_CANADA", "count": max(count, 400)})

    # MAIB data (1989-2025, 5,876 total)
    maib_start = 1989
    maib_baseline = 120
    for year in range(maib_start, 2026):
        if year < 2000:
            count = maib_baseline + (year - maib_start) * 5
        elif year < 2015:
            count = maib_baseline + 55 + (year - 2000) * 3
        else:
            count = maib_baseline + 100 - (year - 2015) * 2
        trends.append({"year": year, "source": "MAIB_UK", "count": max(count, 80)})

    # USCG data (2000-2025, estimated ~8,000)
    uscg_start = 2000
    for year in range(uscg_start, 2026):
        count = 280 + (year - uscg_start) * 5
        trends.append({"year": year, "source": "USCG", "count": max(count, 200)})

    # NTSB data (1980-2025, estimated ~1,500)
    ntsb_start = 1980
    for year in range(ntsb_start, 2026):
        count = 30 + (year - ntsb_start) // 3
        trends.append({"year": year, "source": "NTSB", "count": max(count, 20)})

    # ATSB data (1990-2025, estimated ~800)
    atsb_start = 1990
    for year in range(atsb_start, 2026):
        count = 20 + (year - atsb_start) // 2
        trends.append({"year": year, "source": "ATSB", "count": max(count, 15)})

    # IMO data (1995-2025, estimated ~600)
    imo_start = 1995
    for year in range(imo_start, 2026):
        count = 15 + (year - imo_start) // 2
        trends.append({"year": year, "source": "IMO", "count": max(count, 10)})

    # EMSA data (2002-2025, estimated ~1,200)
    emsa_start = 2002
    for year in range(emsa_start, 2026):
        count = 40 + (year - emsa_start) * 2
        trends.append({"year": year, "source": "EMSA", "count": max(count, 30)})

    return trends


def generate_source_distribution() -> List[Dict]:
    """Generate incident count distribution by source."""
    return [
        {"source": "TSB_CANADA", "count": 47385, "region": "Canada"},
        {"source": "MAIB_UK", "count": 5876, "region": "United Kingdom"},
        {"source": "USCG", "count": 8200, "region": "United States"},
        {"source": "NTSB", "count": 1450, "region": "United States"},
        {"source": "ATSB", "count": 820, "region": "Australia"},
        {"source": "IMO", "count": 650, "region": "Global"},
        {"source": "EMSA", "count": 1180, "region": "European Union"},
    ]


def generate_geographic_distribution() -> List[Dict]:
    """Generate incident counts by geographic region."""
    return [
        {"region": "North America", "count": 56835, "percentage": 87.2},
        {"region": "Europe", "count": 7056, "percentage": 10.8},
        {"region": "Asia-Pacific", "count": 820, "percentage": 1.3},
        {"region": "Global/Multiple", "count": 450, "percentage": 0.7},
    ]


def generate_incident_types() -> List[Dict]:
    """Generate breakdown by incident type."""
    return [
        {"type": "Collision", "count": 12480, "percentage": 19.1},
        {"type": "Grounding", "count": 9750, "percentage": 15.0},
        {"type": "Machinery Failure", "count": 8520, "percentage": 13.1},
        {"type": "Fire/Explosion", "count": 6890, "percentage": 10.6},
        {"type": "Flooding/Sinking", "count": 5340, "percentage": 8.2},
        {"type": "Personnel Injury", "count": 7120, "percentage": 10.9},
        {"type": "Pollution/Environmental", "count": 3260, "percentage": 5.0},
        {"type": "Loss of Control", "count": 4580, "percentage": 7.0},
        {"type": "Mooring/Anchoring", "count": 3890, "percentage": 6.0},
        {"type": "Other", "count": 3331, "percentage": 5.1},
    ]


def generate_severity_distribution() -> List[Dict]:
    """Generate breakdown by severity level."""
    return [
        {"severity": "Low", "count": 32560, "percentage": 50.0},
        {"severity": "Medium", "count": 22300, "percentage": 34.2},
        {"severity": "High", "count": 8480, "percentage": 13.0},
        {"severity": "Critical", "count": 1821, "percentage": 2.8},
    ]


def generate_correlation_statistics() -> Dict:
    """Generate correlation match statistics."""
    return {
        "total_incidents": 65161,
        "unique_incidents_after_dedup": 62861,  # 3.5% deduplication rate
        "cross_source_matches": 2300,
        "high_confidence_matches": 1840,  # >0.9 confidence
        "medium_confidence_matches": 460,  # 0.7-0.9 confidence
        "imo_exact_matches": 920,
        "name_fuzzy_matches": 980,
        "location_proximity_matches": 1150,
        "combined_matches": 550,
        "average_confidence_score": 0.87,
        "manual_verification_required": 460,
        "analyst_hours_saved_per_week": 37,
    }


def generate_vessel_type_distribution() -> List[Dict]:
    """Generate distribution by vessel type."""
    return [
        {"vessel_type": "Fishing Vessel", "count": 18420, "percentage": 28.3},
        {"vessel_type": "Cargo Ship", "count": 14230, "percentage": 21.8},
        {"vessel_type": "Passenger Vessel", "count": 8940, "percentage": 13.7},
        {"vessel_type": "Tanker", "count": 6520, "percentage": 10.0},
        {"vessel_type": "Tug/Workboat", "count": 5890, "percentage": 9.0},
        {"vessel_type": "Recreational", "count": 4230, "percentage": 6.5},
        {"vessel_type": "Other/Unknown", "count": 6931, "percentage": 10.7},
    ]


def main():
    """Generate all data and write to JSON file."""
    data = {
        "metadata": {
            "generated": "2026-02-13",
            "description": "Marine safety incident correlation case study data",
            "sources": [
                "TSB_CANADA",
                "MAIB_UK",
                "USCG",
                "NTSB",
                "ATSB",
                "IMO",
                "EMSA",
            ],
            "total_incidents": 65161,
            "date_range": "1975-2025",
        },
        "trends": generate_incident_trends(),
        "source_distribution": generate_source_distribution(),
        "geographic_distribution": generate_geographic_distribution(),
        "incident_types": generate_incident_types(),
        "severity_distribution": generate_severity_distribution(),
        "correlation_statistics": generate_correlation_statistics(),
        "vessel_types": generate_vessel_type_distribution(),
    }

    # Ensure output directory exists
    output_dir = Path(__file__).parent.parent / "assets" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Write JSON file
    output_file = output_dir / "marine_safety_correlation.json"
    with open(output_file, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Generated marine safety correlation data: {output_file}")
    print(f"  Total data points: {len(data['trends'])} trend records")
    print(f"  Sources: {len(data['source_distribution'])}")
    print(f"  Incident types: {len(data['incident_types'])}")
    print(f"  Total incidents: {data['metadata']['total_incidents']:,}")


if __name__ == "__main__":
    main()
