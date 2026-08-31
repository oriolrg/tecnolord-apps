from pathlib import Path

from speclord.discovery import discover_project_specs, discover_specs
from speclord.models import DiscoveredSpec, Issue, IssueScope, Severity


def discovered_paths(project_path: Path) -> set[Path]:
    return {Path(spec.path) for spec in discover_specs(project_path)}


def test_discovers_spec_directly_inside_specs(tmp_path):
    spec = tmp_path / "specs" / "spec.md"
    spec.parent.mkdir()
    spec.write_text("# Spec\n", encoding="utf-8")

    discovered = discover_specs(tmp_path)

    assert discovered == (DiscoveredSpec(path="specs/spec.md"),)


def test_discovers_specs_at_multiple_nested_levels(tmp_path):
    direct = tmp_path / "specs" / "spec.md"
    nested = tmp_path / "specs" / "feature" / "deep" / "spec.md"
    nested.parent.mkdir(parents=True)
    direct.write_text("# Direct\n", encoding="utf-8")
    nested.write_text("# Nested\n", encoding="utf-8")

    assert discovered_paths(tmp_path) == {
        Path("specs/spec.md"),
        Path("specs/feature/deep/spec.md"),
    }


def test_discovers_multiple_specs(tmp_path):
    first = tmp_path / "specs" / "alpha" / "spec.md"
    second = tmp_path / "specs" / "beta" / "spec.md"
    first.parent.mkdir(parents=True)
    second.parent.mkdir(parents=True)
    first.write_text("# Alpha\n", encoding="utf-8")
    second.write_text("# Beta\n", encoding="utf-8")

    assert discovered_paths(tmp_path) == {
        Path("specs/alpha/spec.md"),
        Path("specs/beta/spec.md"),
    }


def test_ignores_files_with_other_names(tmp_path):
    specs_dir = tmp_path / "specs"
    specs_dir.mkdir()
    (specs_dir / "Spec.md").write_text("# Wrong case\n", encoding="utf-8")
    (specs_dir / "spec.txt").write_text("# Wrong extension\n", encoding="utf-8")
    (specs_dir / "other.md").write_text("# Wrong name\n", encoding="utf-8")

    assert discover_specs(tmp_path) == ()


def test_does_not_recurse_into_symlink_directories(tmp_path):
    target_dir = tmp_path / "outside"
    target_spec = target_dir / "spec.md"
    target_dir.mkdir()
    target_spec.write_text("# Outside\n", encoding="utf-8")

    specs_dir = tmp_path / "specs"
    specs_dir.mkdir()
    (specs_dir / "linked").symlink_to(target_dir, target_is_directory=True)

    assert discover_specs(tmp_path) == ()


def test_does_not_discover_spec_symlink(tmp_path):
    specs_dir = tmp_path / "specs"
    specs_dir.mkdir()
    target = tmp_path / "target.md"
    target.write_text("# Target\n", encoding="utf-8")
    (specs_dir / "spec.md").symlink_to(target)

    assert discover_specs(tmp_path) == ()


def test_missing_specs_directory_returns_project_error(tmp_path):
    result = discover_project_specs(tmp_path)

    assert result.specs == ()
    assert result.project_issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.PROJECT,
            description="No specifications found",
        ),
    )


def test_empty_specs_directory_returns_same_project_error(tmp_path):
    (tmp_path / "specs").mkdir()

    missing_result = discover_project_specs(tmp_path / "missing")
    empty_result = discover_project_specs(tmp_path)

    assert empty_result.specs == ()
    assert empty_result.project_issues == missing_result.project_issues


def test_walk_access_error_returns_project_issue(monkeypatch, tmp_path):
    specs_dir = tmp_path / "specs"
    specs_dir.mkdir()

    def fake_walk(path, followlinks=False, onerror=None):
        if onerror is not None:
            error = PermissionError("permission denied")
            error.filename = str(specs_dir / "closed")
            onerror(error)
        return
        yield

    monkeypatch.setattr("speclord.discovery.os.walk", fake_walk)

    result = discover_project_specs(tmp_path)

    assert result.project_issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.PROJECT,
            description=f"Cannot access directory: {specs_dir / 'closed'}",
        ),
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.PROJECT,
            description="No specifications found",
        ),
    )


def test_walk_access_error_keeps_specs_from_accessible_directories(monkeypatch, tmp_path):
    specs_dir = tmp_path / "specs"
    accessible_dir = specs_dir / "open"
    accessible_spec = accessible_dir / "spec.md"
    accessible_dir.mkdir(parents=True)
    accessible_spec.write_text("# Accessible\n", encoding="utf-8")

    def fake_walk(path, followlinks=False, onerror=None):
        if onerror is not None:
            error = PermissionError("permission denied")
            error.filename = str(specs_dir / "closed")
            onerror(error)
        yield str(accessible_dir), [], ["spec.md"]

    monkeypatch.setattr("speclord.discovery.os.walk", fake_walk)

    result = discover_project_specs(tmp_path)

    assert result.specs == (DiscoveredSpec(path="specs/open/spec.md"),)
    assert result.project_issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.PROJECT,
            description=f"Cannot access directory: {specs_dir / 'closed'}",
        ),
    )


def test_discovered_paths_are_relative_to_project_and_use_forward_slashes(tmp_path):
    specs_dir = tmp_path / "specs"
    nested_dir = specs_dir / "windows"
    nested_spec = nested_dir / "spec.md"
    nested_dir.mkdir(parents=True)
    nested_spec.write_text("# Normalized\n", encoding="utf-8")

    discovered = discover_specs(tmp_path)

    assert discovered == (DiscoveredSpec(path="specs/windows/spec.md"),)
    assert not Path(discovered[0].path).is_absolute()
    assert "/" in discovered[0].path


def test_discovered_paths_are_sorted_by_unicode_value(tmp_path):
    upper = tmp_path / "specs" / "Beta" / "spec.md"
    lower = tmp_path / "specs" / "alpha" / "spec.md"
    direct = tmp_path / "specs" / "spec.md"
    upper.parent.mkdir(parents=True)
    lower.parent.mkdir(parents=True)
    direct.write_text("# Direct\n", encoding="utf-8")
    upper.write_text("# Upper\n", encoding="utf-8")
    lower.write_text("# Lower\n", encoding="utf-8")

    assert discover_specs(tmp_path) == (
        DiscoveredSpec(path="specs/Beta/spec.md"),
        DiscoveredSpec(path="specs/alpha/spec.md"),
        DiscoveredSpec(path="specs/spec.md"),
    )
