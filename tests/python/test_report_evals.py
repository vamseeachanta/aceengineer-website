"""Report evals: every results.json meets the contract and the offline counts pass."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

EVALS = Path(__file__).resolve().parents[2] / "assets" / "data" / "report-evals"
ALL = sorted(p.name for p in EVALS.iterdir() if (p / "results.json").exists())


def _run(folder: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(EVALS / folder / "eval.py"), *args],
                          capture_output=True, text=True, encoding="utf-8", timeout=300)


@pytest.mark.parametrize("folder", ALL)
def test_results_json_meets_contract(folder):
    out = _run(folder, "--validate-only")
    assert out.returncode == 0, out.stdout + out.stderr


def test_jackup_counts_offline():
    """The accident counts rebuild from the repository copy; network checks are left out."""
    out = _run("issue-002-jackup-site-assessment", "--offline")
    assert "MISMATCH" not in out.stdout and "ERROR" not in out.stdout, out.stdout
    assert out.stdout.count("MATCH ") >= 15, out.stdout
