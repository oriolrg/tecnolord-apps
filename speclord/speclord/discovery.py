"""Spec discovery boundary for SpecLord."""

from __future__ import annotations

import os
from pathlib import Path

from speclord.models import DiscoveredSpec, DiscoveryResult, Issue, IssueScope, Severity


NO_SPECS_FOUND_MESSAGE = "No specifications found"


def discover_specs(project_path: str | Path) -> tuple[DiscoveredSpec, ...]:
    """Discover regular files named exactly spec.md below project/specs."""

    return discover_project_specs(project_path).specs


def discover_project_specs(project_path: str | Path) -> DiscoveryResult:
    """Discover specs and project-level discovery issues."""

    project_root = Path(project_path)
    specs_dir = project_root / "specs"
    if not specs_dir.is_dir() or specs_dir.is_symlink():
        return DiscoveryResult(project_issues=(_no_specs_found_issue(),))

    discovered: list[DiscoveredSpec] = []
    project_issues: list[Issue] = []

    def on_walk_error(error: OSError) -> None:
        path = error.filename or str(specs_dir)
        project_issues.append(
            Issue(
                severity=Severity.ERROR,
                scope=IssueScope.PROJECT,
                description=f"Cannot access directory: {path}",
            )
        )

    for dirpath, dirnames, filenames in os.walk(specs_dir, followlinks=False, onerror=on_walk_error):
        current_dir = Path(dirpath)
        dirnames[:] = [
            dirname
            for dirname in dirnames
            if not (current_dir / dirname).is_symlink()
        ]

        for filename in filenames:
            candidate = current_dir / filename
            if filename == "spec.md" and candidate.is_file() and not candidate.is_symlink():
                discovered.append(DiscoveredSpec(path=_normalized_relative_path(candidate, project_root)))

    if not discovered:
        project_issues.append(_no_specs_found_issue())

    return DiscoveryResult(specs=tuple(sorted(discovered, key=lambda spec: spec.path)), project_issues=tuple(project_issues))


def _no_specs_found_issue() -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.PROJECT,
        description=NO_SPECS_FOUND_MESSAGE,
    )


def _normalized_relative_path(path: Path, project_root: Path) -> str:
    return path.relative_to(project_root).as_posix()
