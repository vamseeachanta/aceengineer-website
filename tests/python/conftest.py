"""Shared fixtures for AceEngineer website script tests."""

import sys
from pathlib import Path

import pytest

# Add scripts directory to sys.path so we can import the scripts as modules
SCRIPTS_DIR = Path(__file__).parent.parent.parent / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


@pytest.fixture
def valid_keywords_yaml(tmp_path):
    """Create a valid keywords.yaml config file."""
    config_file = tmp_path / "keywords.yaml"
    config_file.write_text(
        "keywords:\n"
        "  primary:\n"
        '    - "orcaflex automation"\n'
        '    - "fatigue analysis software"\n'
        "  secondary:\n"
        '    - "S-N curve calculator"\n'
        '    - "mooring analysis software"\n'
        "  long_tail:\n"
        '    - "orcaflex python scripting"\n'
        "competitors:\n"
        "  - dnv.com\n"
        "  - wood.com\n"
        "settings:\n"
        "  report_frequency: weekly\n"
    )
    return config_file


@pytest.fixture
def minimal_keywords_yaml(tmp_path):
    """Create a keywords.yaml with only primary keywords."""
    config_file = tmp_path / "keywords.yaml"
    config_file.write_text(
        "keywords:\n"
        "  primary:\n"
        '    - "test keyword"\n'
    )
    return config_file


@pytest.fixture
def empty_keywords_yaml(tmp_path):
    """Create a keywords.yaml with no keyword categories."""
    config_file = tmp_path / "keywords.yaml"
    config_file.write_text("keywords: {}\n")
    return config_file


@pytest.fixture
def invalid_yaml_file(tmp_path):
    """Create an invalid YAML file."""
    config_file = tmp_path / "bad.yaml"
    config_file.write_text("{{invalid: yaml: [broken")
    return config_file


@pytest.fixture
def valid_content_sync_yaml(tmp_path):
    """Create a valid content-sync.yaml config file."""
    config_file = tmp_path / "content-sync.yaml"
    config_file.write_text(
        "sources:\n"
        "  digitalmodel:\n"
        '    description: "Test Digital Model"\n'
        '    base_path: "../digitalmodel"\n'
        "    sync_rules:\n"
        '      - source: "src/digitalmodel/data/sn_curves/"\n'
        '        action: "count"\n'
        '        target_stat: "sn_curves"\n'
        "output:\n"
        '  statistics_file: "assets/data/statistics.json"\n'
        "settings:\n"
        "  ignore_patterns:\n"
        '    - "*.pyc"\n'
        '    - "__pycache__"\n'
    )
    return config_file


@pytest.fixture
def digitalmodel_tree(tmp_path):
    """Create a mock digitalmodel repository directory structure.

    Structure:
        tmp_path/digitalmodel/
            src/digitalmodel/
                __init__.py
                module_a.py
                module_b.py
                utils/
                    __init__.py
                    helpers.py
                    __pycache__/
                        helpers.cpython-310.pyc
                data/sn_curves/
                    curve_a.yaml
                    curve_b.yml
                    curve_c.json
    """
    repo = tmp_path / "digitalmodel"
    src = repo / "src" / "digitalmodel"
    src.mkdir(parents=True)

    # Python modules
    (src / "__init__.py").write_text("")
    (src / "module_a.py").write_text("# Module A")
    (src / "module_b.py").write_text("# Module B")

    utils = src / "utils"
    utils.mkdir()
    (utils / "__init__.py").write_text("")
    (utils / "helpers.py").write_text("# Helpers")

    # __pycache__ (should be excluded from count)
    pycache = utils / "__pycache__"
    pycache.mkdir()
    (pycache / "helpers.cpython-310.pyc").write_text("")

    # S-N curve data files
    sn_dir = src / "data" / "sn_curves"
    sn_dir.mkdir(parents=True)
    (sn_dir / "curve_a.yaml").write_text("name: curve_a")
    (sn_dir / "curve_b.yml").write_text("name: curve_b")
    (sn_dir / "curve_c.json").write_text('{"name": "curve_c"}')

    return repo


@pytest.fixture
def demo_source_dir(tmp_path):
    """Create a source directory with demo files for sync testing."""
    source = tmp_path / "source"
    source.mkdir()
    (source / "report.html").write_text("<h1>Report</h1>")
    (source / "chart.png").write_bytes(b"\x89PNG")
    (source / "diagram.svg").write_text("<svg></svg>")
    (source / "cache.pyc").write_text("compiled")
    (source / ".DS_Store").write_text("")
    return source
