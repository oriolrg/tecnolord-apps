"""Spec discovery boundary for SpecLord."""

from __future__ import annotations

import os
from pathlib import Path

from speclord.models import DiscoveredSpec


def discover_specs(project_path: str | Path) -> tuple[DiscoveredSpec, ...]:
    """Discover regular files named exactly spec.md below project/specs."""

    specs_dir = Path(project_path) / "specs"
    if not specs_dir.is_dir() or specs_dir.is_symlink():
        return ()

    discovered: list[DiscoveredSpec] = []
    for dirpath, dirnames, filenames in os.walk(specs_dir, followlinks=False):
        current_dir = Path(dirpath)
        dirnames[:] = [
            dirname
            for dirname in dirnames
            if not (current_dir / dirname).is_symlink()
        ]

        for filename in filenames:
            candidate = current_dir / filename
            if filename == "spec.md" and candidate.is_file() and not candidate.is_symlink():
                discovered.append(DiscoveredSpec(path=str(candidate)))

    return tuple(discovered)
