"""Validation orchestration boundary for SpecLord."""

from __future__ import annotations

from pathlib import Path

from speclord.models import DiscoveredSpec, SpecReadResult, SpecReadStatus


EMPTY_SPEC_CHARS = frozenset({" ", "\t", "\n", "\r"})


def read_spec(project_path: str | Path, spec: DiscoveredSpec) -> SpecReadResult:
    """Read one discovered spec as UTF-8 and classify the read result."""

    try:
        with (Path(project_path) / spec.path).open(encoding="utf-8", newline="") as spec_file:
            content = spec_file.read()
    except (OSError, UnicodeError):
        return SpecReadResult(path=spec.path, status=SpecReadStatus.UNREADABLE)

    if all(character in EMPTY_SPEC_CHARS for character in content):
        return SpecReadResult(path=spec.path, status=SpecReadStatus.EMPTY, content=content)

    return SpecReadResult(path=spec.path, status=SpecReadStatus.READ, content=content)
