"""Validation orchestration boundary for SpecLord."""

from __future__ import annotations

from pathlib import Path

from speclord.discovery import discover_project_specs
from speclord.models import (
    DiscoveredSpec,
    Issue,
    IssueScope,
    ProjectResult,
    Severity,
    SpecReadResult,
    SpecReadStatus,
    SpecResult,
    Status,
)
from speclord.parser import parse_recognized_rfs, parse_rf_candidates, parse_sections
from speclord.rules import (
    validate_clarification_markers,
    validate_ears_patterns,
    validate_required_sections,
    validate_rf_basics,
    validate_rf_numbering,
    validate_vague_terms,
)


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


def validate_spec(project_path: str | Path, spec: DiscoveredSpec) -> SpecResult:
    """Validate one discovered spec and calculate its status."""

    read_result = read_spec(project_path, spec)
    if read_result.status is SpecReadStatus.EMPTY:
        return SpecResult(path=spec.path, status=Status.FAIL, issues=(_empty_spec_issue(spec.path),))
    if read_result.status is SpecReadStatus.UNREADABLE:
        return SpecResult(path=spec.path, status=Status.FAIL, issues=(_unreadable_spec_issue(spec.path),))

    content = read_result.content or ""
    sections = parse_sections(content)
    candidates = parse_rf_candidates(sections)
    recognized_rfs = parse_recognized_rfs(candidates)

    issues = (
        validate_required_sections(sections, spec.path)
        + validate_rf_basics(candidates, recognized_rfs, spec.path)
        + validate_rf_numbering(recognized_rfs, spec.path)
        + validate_clarification_markers(content, spec.path)
        + validate_vague_terms(recognized_rfs, spec.path)
        + validate_ears_patterns(recognized_rfs, spec.path)
    )

    return SpecResult(path=spec.path, status=_status_for_issues(issues), issues=issues)


def validate_project(project_path: str | Path) -> ProjectResult:
    """Validate all discovered specs in one project."""

    discovery_result = discover_project_specs(project_path)
    spec_results = tuple(validate_spec(project_path, spec) for spec in discovery_result.specs)
    spec_issues = tuple(issue for spec_result in spec_results for issue in spec_result.issues)
    all_issues = discovery_result.project_issues + spec_issues

    return ProjectResult(
        status=_status_for_issues(all_issues),
        processed_specs=len(spec_results),
        error_count=sum(1 for issue in all_issues if issue.severity is Severity.ERROR),
        warning_count=sum(1 for issue in all_issues if issue.severity is Severity.WARNING),
        spec_results=spec_results,
        project_issues=discovery_result.project_issues,
    )


def _status_for_issues(issues: tuple[Issue, ...]) -> Status:
    if any(issue.severity is Severity.ERROR for issue in issues):
        return Status.FAIL
    if any(issue.severity is Severity.WARNING for issue in issues):
        return Status.WARN
    return Status.OK


def _empty_spec_issue(spec_path: str) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description="Empty spec",
        spec_path=spec_path,
    )


def _unreadable_spec_issue(spec_path: str) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description="Unreadable spec",
        spec_path=spec_path,
    )
