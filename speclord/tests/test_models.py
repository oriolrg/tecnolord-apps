import pytest

from speclord.models import Issue, IssueScope, ProjectResult, Severity, SpecResult, Status


def test_issue_accepts_only_error_or_warning_severity():
    Issue(severity=Severity.ERROR, scope=IssueScope.PROJECT, description="Missing specs")
    Issue(severity=Severity.WARNING, scope=IssueScope.SPEC, description="Empty section", spec_path="specs/a/spec.md")

    with pytest.raises(ValueError):
        Issue(severity="info", scope=IssueScope.PROJECT, description="Unsupported severity")


def test_issue_accepts_only_project_or_spec_scope():
    Issue(severity=Severity.ERROR, scope=IssueScope.PROJECT, description="Missing specs")
    Issue(severity=Severity.ERROR, scope=IssueScope.SPEC, description="Invalid RF", spec_path="specs/a/spec.md")

    with pytest.raises(ValueError):
        Issue(severity=Severity.ERROR, scope="workspace", description="Unsupported scope")


def test_project_issue_does_not_need_spec_path():
    issue = Issue(severity=Severity.ERROR, scope=IssueScope.PROJECT, description="No specs found")

    assert issue.spec_path is None


def test_spec_issue_requires_spec_path():
    with pytest.raises(ValueError):
        Issue(severity=Severity.ERROR, scope=IssueScope.SPEC, description="Missing section")


def test_results_represent_issues_and_status_without_printing(capsys):
    warning = Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description="Repeated section",
        spec_path="specs/a/spec.md",
        section="Requisits funcionals",
    )
    spec_result = SpecResult(path="specs/a/spec.md", status=Status.WARN, issues=(warning,))
    project_issue = Issue(severity=Severity.ERROR, scope=IssueScope.PROJECT, description="Discovery failed")
    project_result = ProjectResult(
        status=Status.FAIL,
        processed_specs=1,
        error_count=1,
        warning_count=1,
        spec_results=(spec_result,),
        project_issues=(project_issue,),
    )

    captured = capsys.readouterr()

    assert spec_result.issues == (warning,)
    assert project_result.spec_results == (spec_result,)
    assert project_result.project_issues == (project_issue,)
    assert project_result.processed_specs == 1
    assert project_result.error_count == 1
    assert project_result.warning_count == 1
    assert project_result.status is Status.FAIL
    assert captured.out == ""
    assert captured.err == ""


def test_status_represents_ok_warn_and_fail():
    assert {status.value for status in Status} == {"OK", "WARN", "FAIL"}
