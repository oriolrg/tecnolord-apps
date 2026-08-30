"""Internal data models for SpecLord."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class Severity(StrEnum):
    """Issue severity."""

    ERROR = "error"
    WARNING = "warning"


class IssueScope(StrEnum):
    """Issue scope."""

    PROJECT = "project"
    SPEC = "spec"


class Status(StrEnum):
    """Validation status."""

    OK = "OK"
    WARN = "WARN"
    FAIL = "FAIL"


@dataclass(frozen=True)
class DiscoveredSpec:
    """A spec discovered inside a project."""

    path: str


@dataclass(frozen=True)
class Section:
    """A parsed Markdown section."""

    name: str
    normalized_name: str
    level: int
    start_line: int
    end_line: int
    content: str


@dataclass(frozen=True)
class RFCandidate:
    """A functional requirement candidate line."""

    text: str
    line_number: int
    section_name: str


@dataclass(frozen=True)
class RecognizedRF:
    """A recognized functional requirement."""

    identifier: str
    number: int
    content: str
    line_number: int
    section_name: str


@dataclass(frozen=True)
class Issue:
    """A validation issue."""

    severity: Severity
    scope: IssueScope
    description: str
    spec_path: str | None = None
    section: str | None = None
    rf: str | None = None

    def __post_init__(self) -> None:
        if not isinstance(self.severity, Severity):
            raise ValueError("severity must be 'error' or 'warning'")
        if not isinstance(self.scope, IssueScope):
            raise ValueError("scope must be 'project' or 'spec'")
        if self.scope is IssueScope.SPEC and self.spec_path is None:
            raise ValueError("spec issues must include spec_path")


@dataclass(frozen=True)
class SpecResult:
    """The result for one spec."""

    path: str
    status: Status
    issues: tuple[Issue, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class ProjectResult:
    """The result for a project."""

    status: Status
    processed_specs: int = 0
    error_count: int = 0
    warning_count: int = 0
    spec_results: tuple[SpecResult, ...] = field(default_factory=tuple)
    project_issues: tuple[Issue, ...] = field(default_factory=tuple)
