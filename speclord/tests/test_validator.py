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
from speclord.validator import read_spec, validate_project, validate_spec


SPEC_PATH = "specs/feature/spec.md"


def valid_spec(functional_requirements: str = "- RF-1: EL SISTEMA mostra el resultat") -> str:
    return "\n".join(
        [
            "## Context i objectiu",
            "Text",
            "## Usuaris / actors",
            "Text",
            "## Històries d'usuari",
            "Text",
            "## Requisits funcionals",
            functional_requirements,
            "## Requisits no funcionals",
            "Text",
            "## Casos límit",
            "Text",
            "## Fora d'abast",
            "Text",
            "## Criteris de finalització",
            "Text",
            "## Dubtes oberts",
            "Text",
            "",
        ]
    )


def write_spec(tmp_path, content: str = "") -> DiscoveredSpec:
    spec_path = tmp_path / SPEC_PATH
    spec_path.parent.mkdir(parents=True)
    spec_path.write_text(content, encoding="utf-8")
    return DiscoveredSpec(path=SPEC_PATH)


def write_project_spec(tmp_path, relative_path: str, content: str) -> None:
    spec_path = tmp_path / relative_path
    spec_path.parent.mkdir(parents=True)
    spec_path.write_text(content, encoding="utf-8")


def test_reads_normal_spec_as_utf8(tmp_path):
    spec_path = tmp_path / "specs" / "feature" / "spec.md"
    spec_path.parent.mkdir(parents=True)
    spec_path.write_text("# Títol\n\nContingut\n", encoding="utf-8")

    result = read_spec(tmp_path, DiscoveredSpec(path="specs/feature/spec.md"))

    assert result == SpecReadResult(
        path="specs/feature/spec.md",
        status=SpecReadStatus.READ,
        content="# Títol\n\nContingut\n",
    )


def test_whitespace_only_spec_is_empty(tmp_path):
    spec_path = tmp_path / "specs" / "empty" / "spec.md"
    spec_path.parent.mkdir(parents=True)
    spec_path.write_text(" \t\n\r", encoding="utf-8")

    result = read_spec(tmp_path, DiscoveredSpec(path="specs/empty/spec.md"))

    assert result == SpecReadResult(
        path="specs/empty/spec.md",
        status=SpecReadStatus.EMPTY,
        content=" \t\n\r",
    )


def test_non_utf8_spec_is_unreadable(tmp_path):
    spec_path = tmp_path / "specs" / "broken" / "spec.md"
    spec_path.parent.mkdir(parents=True)
    spec_path.write_bytes(b"\xff\xfe\xfa")

    result = read_spec(tmp_path, DiscoveredSpec(path="specs/broken/spec.md"))

    assert result == SpecReadResult(
        path="specs/broken/spec.md",
        status=SpecReadStatus.UNREADABLE,
        content=None,
    )


def test_empty_and_unreadable_specs_are_distinct(tmp_path):
    empty_path = tmp_path / "specs" / "empty" / "spec.md"
    unreadable_path = tmp_path / "specs" / "broken" / "spec.md"
    empty_path.parent.mkdir(parents=True)
    unreadable_path.parent.mkdir(parents=True)
    empty_path.write_text("\n\t\r ", encoding="utf-8")
    unreadable_path.write_bytes(b"\xff")

    empty_result = read_spec(tmp_path, DiscoveredSpec(path="specs/empty/spec.md"))
    unreadable_result = read_spec(tmp_path, DiscoveredSpec(path="specs/broken/spec.md"))

    assert empty_result.status is SpecReadStatus.EMPTY
    assert unreadable_result.status is SpecReadStatus.UNREADABLE


def test_validate_spec_ok(tmp_path):
    spec = write_spec(tmp_path, valid_spec())

    assert validate_spec(tmp_path, spec) == SpecResult(path=SPEC_PATH, status=Status.OK, issues=())


def test_validate_spec_with_only_warnings_is_warn(tmp_path):
    spec = write_spec(tmp_path, valid_spec("- RF-2: EL SISTEMA mostra el resultat"))

    result = validate_spec(tmp_path, spec)

    assert result.status is Status.WARN
    assert result.issues == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering starts at RF-2 instead of RF-1",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-2",
        ),
    )


def test_validate_spec_with_error_is_fail(tmp_path):
    content = valid_spec().replace("## Dubtes oberts\nText\n", "")
    spec = write_spec(tmp_path, content)

    result = validate_spec(tmp_path, spec)

    assert result.status is Status.FAIL
    assert Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description="Missing required section: Dubtes oberts",
        spec_path=SPEC_PATH,
        section="Dubtes oberts",
    ) in result.issues


def test_validate_spec_accumulates_multiple_errors_and_warnings(tmp_path):
    content = "\n".join(
        [
            valid_spec("- RF-A: invalid\n- RF-1:"),
            "## Dubtes oberts",
            "",
        ]
    )
    spec = write_spec(tmp_path, content)

    result = validate_spec(tmp_path, spec)

    assert result.status is Status.FAIL
    assert any(issue.severity is Severity.ERROR for issue in result.issues)
    assert any(issue.severity is Severity.WARNING for issue in result.issues)
    assert Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description="Invalid RF candidate: - RF-A: invalid",
        spec_path=SPEC_PATH,
        section="Requisits funcionals",
        rf="- RF-A: invalid",
    ) in result.issues
    assert Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description="Duplicate required section: Dubtes oberts",
        spec_path=SPEC_PATH,
        section="Dubtes oberts",
    ) in result.issues


def test_validate_empty_spec_generates_single_issue(tmp_path):
    spec = write_spec(tmp_path, "\n\t ")

    assert validate_spec(tmp_path, spec) == SpecResult(
        path=SPEC_PATH,
        status=Status.FAIL,
        issues=(
            Issue(
                severity=Severity.ERROR,
                scope=IssueScope.SPEC,
                description="Empty spec",
                spec_path=SPEC_PATH,
            ),
        ),
    )


def test_validate_unreadable_spec_generates_single_issue(tmp_path):
    spec_path = tmp_path / SPEC_PATH
    spec_path.parent.mkdir(parents=True)
    spec_path.write_bytes(b"\xff")
    spec = DiscoveredSpec(path=SPEC_PATH)

    assert validate_spec(tmp_path, spec) == SpecResult(
        path=SPEC_PATH,
        status=Status.FAIL,
        issues=(
            Issue(
                severity=Severity.ERROR,
                scope=IssueScope.SPEC,
                description="Unreadable spec",
                spec_path=SPEC_PATH,
            ),
        ),
    )


def test_validate_project_with_multiple_correct_specs_is_ok(tmp_path):
    write_project_spec(tmp_path, "specs/a/spec.md", valid_spec())
    write_project_spec(tmp_path, "specs/b/spec.md", valid_spec())

    assert validate_project(tmp_path) == ProjectResult(
        status=Status.OK,
        processed_specs=2,
        error_count=0,
        warning_count=0,
        spec_results=(
            SpecResult(path="specs/a/spec.md", status=Status.OK, issues=()),
            SpecResult(path="specs/b/spec.md", status=Status.OK, issues=()),
        ),
        project_issues=(),
    )


def test_validate_project_continues_after_defective_spec(tmp_path):
    write_project_spec(tmp_path, "specs/a/spec.md", "\n\t ")
    write_project_spec(tmp_path, "specs/b/spec.md", valid_spec())

    result = validate_project(tmp_path)

    assert result.processed_specs == 2
    assert result.spec_results == (
        SpecResult(
            path="specs/a/spec.md",
            status=Status.FAIL,
            issues=(
                Issue(
                    severity=Severity.ERROR,
                    scope=IssueScope.SPEC,
                    description="Empty spec",
                    spec_path="specs/a/spec.md",
                ),
            ),
        ),
        SpecResult(path="specs/b/spec.md", status=Status.OK, issues=()),
    )


def test_validate_project_with_warning_is_warn(tmp_path):
    write_project_spec(tmp_path, "specs/warn/spec.md", valid_spec("- RF-2: EL SISTEMA mostra el resultat"))

    result = validate_project(tmp_path)

    assert result.status is Status.WARN
    assert result.processed_specs == 1
    assert result.error_count == 0
    assert result.warning_count == 1


def test_validate_project_with_error_is_fail(tmp_path):
    write_project_spec(tmp_path, "specs/fail/spec.md", valid_spec().replace("## Dubtes oberts\nText\n", ""))

    result = validate_project(tmp_path)

    assert result.status is Status.FAIL
    assert result.processed_specs == 1
    assert result.error_count >= 1


def test_validate_project_with_zero_specs_is_fail(tmp_path):
    result = validate_project(tmp_path)

    assert result.status is Status.FAIL
    assert result.processed_specs == 0
    assert result.error_count == 1
    assert result.warning_count == 0
    assert result.spec_results == ()
    assert result.project_issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.PROJECT,
            description="No specifications found",
        ),
    )


def test_validate_project_counts_defective_specs_as_processed(tmp_path):
    write_project_spec(tmp_path, "specs/empty/spec.md", "")
    broken_path = tmp_path / "specs" / "broken" / "spec.md"
    broken_path.parent.mkdir(parents=True)
    broken_path.write_bytes(b"\xff")

    result = validate_project(tmp_path)

    assert result.processed_specs == 2
    assert result.error_count == 2
    assert [spec_result.path for spec_result in result.spec_results] == [
        "specs/broken/spec.md",
        "specs/empty/spec.md",
    ]


def test_validate_project_does_not_modify_analyzed_project_files(tmp_path):
    write_project_spec(tmp_path, "specs/a/spec.md", valid_spec())
    write_project_spec(tmp_path, "specs/b/spec.md", valid_spec("- RF-2: EL SISTEMA mostra el resultat"))
    notes_path = tmp_path / "notes.md"
    notes_path.write_text("Project notes\n", encoding="utf-8")
    before = {
        path.relative_to(tmp_path).as_posix(): path.read_bytes()
        for path in tmp_path.rglob("*")
        if path.is_file()
    }

    validate_project(tmp_path)

    after = {
        path.relative_to(tmp_path).as_posix(): path.read_bytes()
        for path in tmp_path.rglob("*")
        if path.is_file()
    }
    assert after == before
