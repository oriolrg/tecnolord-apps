from speclord.cli import main
from speclord.models import Issue, IssueScope, ProjectResult, Severity, SpecResult, Status


def test_package_can_be_imported():
    import speclord

    assert speclord is not None


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


def write_project_spec(tmp_path, relative_path: str, content: str) -> None:
    spec_path = tmp_path / relative_path
    spec_path.parent.mkdir(parents=True)
    spec_path.write_text(content, encoding="utf-8")


def test_cli_accepts_project_path_and_shows_summary_and_specs(tmp_path, capsys):
    write_project_spec(tmp_path, "specs/a/spec.md", valid_spec())

    exit_code = main([str(tmp_path)])

    output = capsys.readouterr().out
    assert exit_code == 0
    assert "specs processed: 1" in output
    assert "errors: 0" in output
    assert "warnings: 0" in output
    assert "status: OK" in output
    assert "specs/a/spec.md OK" in output


def test_cli_shows_spec_issues(tmp_path, capsys):
    write_project_spec(tmp_path, "specs/warn/spec.md", valid_spec("- RF-2: EL SISTEMA mostra el resultat"))

    main([str(tmp_path)])

    output = capsys.readouterr().out
    assert "specs/warn/spec.md WARN" in output
    assert "[warning] specs/warn/spec.md Requisits funcionals RF-2: RF numbering starts at RF-2 instead of RF-1" in output


def test_cli_respects_core_spec_order(monkeypatch, capsys):
    def fake_validate_project(project_path):
        assert project_path == "project-root"
        return ProjectResult(
            status=Status.OK,
            processed_specs=2,
            spec_results=(
                SpecResult(path="specs/A/spec.md", status=Status.OK),
                SpecResult(path="specs/a/spec.md", status=Status.OK),
            ),
        )

    monkeypatch.setattr("speclord.cli.validate_project", fake_validate_project)

    main(["project-root"])

    output = capsys.readouterr().out
    assert output.index("specs/A/spec.md OK") < output.index("specs/a/spec.md OK")


def test_cli_shows_zero_specs_case(tmp_path, capsys):
    main([str(tmp_path)])

    output = capsys.readouterr().out
    assert "specs processed: 0" in output
    assert "errors: 1" in output
    assert "warnings: 0" in output
    assert "status: FAIL" in output
    assert "[error] project: No specifications found" in output


def test_cli_delegates_validation_to_core(monkeypatch, capsys):
    calls = []

    def fake_validate_project(project_path):
        calls.append(project_path)
        return ProjectResult(
            status=Status.FAIL,
            processed_specs=0,
            error_count=1,
            project_issues=(
                Issue(
                    severity=Severity.ERROR,
                    scope=IssueScope.PROJECT,
                    description="No specifications found",
                ),
            ),
        )

    monkeypatch.setattr("speclord.cli.validate_project", fake_validate_project)

    main(["delegated-project"])

    assert calls == ["delegated-project"]
