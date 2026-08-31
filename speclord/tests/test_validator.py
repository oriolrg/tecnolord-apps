from speclord.models import DiscoveredSpec, SpecReadResult, SpecReadStatus
from speclord.validator import read_spec


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
