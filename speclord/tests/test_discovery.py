from pathlib import Path

from speclord.discovery import discover_specs
from speclord.models import DiscoveredSpec


def discovered_paths(project_path: Path) -> set[Path]:
    return {Path(spec.path) for spec in discover_specs(project_path)}


def test_discovers_spec_directly_inside_specs(tmp_path):
    spec = tmp_path / "specs" / "spec.md"
    spec.parent.mkdir()
    spec.write_text("# Spec\n", encoding="utf-8")

    discovered = discover_specs(tmp_path)

    assert discovered == (DiscoveredSpec(path=str(spec)),)


def test_discovers_specs_at_multiple_nested_levels(tmp_path):
    direct = tmp_path / "specs" / "spec.md"
    nested = tmp_path / "specs" / "feature" / "deep" / "spec.md"
    nested.parent.mkdir(parents=True)
    direct.write_text("# Direct\n", encoding="utf-8")
    nested.write_text("# Nested\n", encoding="utf-8")

    assert discovered_paths(tmp_path) == {direct, nested}


def test_discovers_multiple_specs(tmp_path):
    first = tmp_path / "specs" / "alpha" / "spec.md"
    second = tmp_path / "specs" / "beta" / "spec.md"
    first.parent.mkdir(parents=True)
    second.parent.mkdir(parents=True)
    first.write_text("# Alpha\n", encoding="utf-8")
    second.write_text("# Beta\n", encoding="utf-8")

    assert discovered_paths(tmp_path) == {first, second}


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
