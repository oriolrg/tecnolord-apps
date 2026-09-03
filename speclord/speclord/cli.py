"""Command-line interface boundary for SpecLord."""

from __future__ import annotations

import argparse

from speclord.models import Issue, IssueScope, ProjectResult, SpecResult
from speclord.validator import validate_project


def main(argv: list[str] | None = None) -> int:
    """Run the SpecLord CLI."""

    parser = argparse.ArgumentParser(prog="speclord")
    parser.add_argument("project_path", help="Project path to validate")
    args = parser.parse_args(argv)

    result = validate_project(args.project_path)
    print_project_result(result)
    return 0


def print_project_result(result: ProjectResult) -> None:
    """Print an already computed project result."""

    print(f"specs processed: {result.processed_specs}")
    print(f"errors: {result.error_count}")
    print(f"warnings: {result.warning_count}")
    print(f"status: {result.status.value}")

    for spec_result in result.spec_results:
        print_spec_result(spec_result)

    for issue in result.project_issues:
        print_issue(issue)


def print_spec_result(result: SpecResult) -> None:
    """Print one already computed spec result."""

    print(f"{result.path} {result.status.value}")
    for issue in result.issues:
        print_issue(issue)


def print_issue(issue: Issue) -> None:
    """Print one already computed issue."""

    if issue.scope is IssueScope.PROJECT:
        print(f"[{issue.severity.value}] project: {issue.description}")
        return

    parts = [f"[{issue.severity.value}]", issue.spec_path or ""]
    if issue.section:
        parts.append(issue.section)
    if issue.rf:
        parts.append(issue.rf)
    print(f"{' '.join(parts)}: {issue.description}")
