import pytest

from speclord.models import MarkdownHeader, RFCandidate, RecognizedRF, Section
from speclord.parser import parse_headers, parse_recognized_rfs, parse_rf_candidates, parse_sections


def test_recognizes_valid_header():
    assert parse_headers("# Context i objectiu") == (
        MarkdownHeader(level=1, text="Context i objectiu", line_number=1),
    )


def test_ignores_false_headers():
    markdown = "\n".join(
        [
            "#Missing space",
            "####### Too deep",
            "Normal text",
            "# ",
        ]
    )

    assert parse_headers(markdown) == ()


@pytest.mark.parametrize("level", range(1, 7))
def test_recognizes_header_levels_one_to_six(level):
    marker = "#" * level

    assert parse_headers(f"{marker} Heading") == (
        MarkdownHeader(level=level, text="Heading", line_number=1),
    )


def test_ignores_normal_content():
    markdown = "\n".join(
        [
            "Normal text",
            "- list item",
            "not # a heading",
        ]
    )

    assert parse_headers(markdown) == ()


def test_ignores_headers_inside_code_fences_and_resumes_after_closing_fence():
    markdown = "\n".join(
        [
            "```text",
            "# Ignored",
            "```",
            "## Detected",
        ]
    )

    assert parse_headers(markdown) == (
        MarkdownHeader(level=2, text="Detected", line_number=4),
    )


def test_parses_simple_section():
    assert parse_sections("## Context i objectiu\nText") == (
        Section(
            name="Context i objectiu",
            normalized_name="context i objectiu",
            level=2,
            start_line=2,
            end_line=2,
            content="Text",
        ),
    )


def test_parses_consecutive_sections():
    sections = parse_sections("## A\nText A\n## B\nText B")

    assert sections == (
        Section(name="A", normalized_name="a", level=2, start_line=2, end_line=2, content="Text A"),
        Section(name="B", normalized_name="b", level=2, start_line=4, end_line=4, content="Text B"),
    )


def test_normalizes_section_name_case():
    section = parse_sections("## ReQuIsItS FuNcIoNaLs\nText")[0]

    assert section.normalized_name == "requisits funcionals"


def test_normalizes_section_name_surrounding_spaces():
    section = parse_sections("##   Dubtes oberts  \nText")[0]

    assert section.name == "  Dubtes oberts  "
    assert section.normalized_name == "dubtes oberts"


def test_normalizes_straight_and_typographic_apostrophes_as_equivalent():
    straight = parse_sections("## Fora d'abast\nText")[0]
    typographic = parse_sections("## Fora d’abast\nText")[0]

    assert straight.normalized_name == typographic.normalized_name == "fora d'abast"


def test_section_ends_before_next_header_at_same_level():
    sections = parse_sections("## A\nText A\n## B\nText B")

    assert sections[0].content == "Text A"
    assert sections[0].end_line == 2


def test_section_ends_before_next_header_at_higher_level():
    sections = parse_sections("# A\nText A\n## A.1\nText A.1\n# B\nText B")

    assert sections[1] == Section(
        name="A.1",
        normalized_name="a.1",
        level=2,
        start_line=4,
        end_line=4,
        content="Text A.1",
    )


def test_lower_level_subsection_is_inside_parent_content():
    sections = parse_sections("# A\nText A\n## A.1\nText A.1\n# B\nText B")

    assert sections[0].content == "Text A\n## A.1\nText A.1"
    assert sections[0].end_line == 4


def test_header_inside_code_fence_does_not_change_sections():
    markdown = "\n".join(
        [
            "## A",
            "Text A",
            "```",
            "## Not a section",
            "```",
            "More A",
            "## B",
            "Text B",
        ]
    )

    sections = parse_sections(markdown)

    assert sections == (
        Section(
            name="A",
            normalized_name="a",
            level=2,
            start_line=2,
            end_line=6,
            content="Text A\n```\n## Not a section\n```\nMore A",
        ),
        Section(name="B", normalized_name="b", level=2, start_line=8, end_line=8, content="Text B"),
    )


def test_repeated_sections_are_preserved_separately_and_in_order():
    sections = parse_sections("## Dubtes oberts\nPrimer\n## Dubtes oberts\nSegon\n## Dubtes oberts\nTercer")

    assert [section.content for section in sections] == ["Primer", "Segon", "Tercer"]
    assert [section.normalized_name for section in sections] == [
        "dubtes oberts",
        "dubtes oberts",
        "dubtes oberts",
    ]


def test_multiple_functional_requirements_sections_are_preserved():
    sections = parse_sections("## Requisits funcionals\nRF primer\n## Requisits funcionals\nRF segon")

    assert sections == (
        Section(
            name="Requisits funcionals",
            normalized_name="requisits funcionals",
            level=2,
            start_line=2,
            end_line=2,
            content="RF primer",
        ),
        Section(
            name="Requisits funcionals",
            normalized_name="requisits funcionals",
            level=2,
            start_line=4,
            end_line=4,
            content="RF segon",
        ),
    )


def test_parses_rf_1_candidate_and_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF-1: EL SISTEMA fa una cosa")

    assert parse_rf_candidates(sections) == (
        RFCandidate(
            text="- RF-1: EL SISTEMA fa una cosa",
            line_number=2,
            section_name="Requisits funcionals",
        ),
    )
    assert parse_recognized_rfs(parse_rf_candidates(sections)) == (
        RecognizedRF(
            identifier="RF-1",
            number=1,
            content=" EL SISTEMA fa una cosa",
            line_number=2,
            section_name="Requisits funcionals",
        ),
    )


def test_parses_rf_2_candidate_and_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF-2: QUAN passa EL SISTEMA respon")

    assert parse_recognized_rfs(parse_rf_candidates(sections)) == (
        RecognizedRF(
            identifier="RF-2",
            number=2,
            content=" QUAN passa EL SISTEMA respon",
            line_number=2,
            section_name="Requisits funcionals",
        ),
    )


def test_parses_rf_20_candidate_and_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF-20: SI cal EL SISTEMA respon")

    assert parse_recognized_rfs(parse_rf_candidates(sections)) == (
        RecognizedRF(
            identifier="RF-20",
            number=20,
            content=" SI cal EL SISTEMA respon",
            line_number=2,
            section_name="Requisits funcionals",
        ),
    )


def test_rf_0_is_candidate_but_not_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF-0: invalid")
    candidates = parse_rf_candidates(sections)

    assert candidates == (
        RFCandidate(text="- RF-0: invalid", line_number=2, section_name="Requisits funcionals"),
    )
    assert parse_recognized_rfs(candidates) == ()


def test_rf_01_is_candidate_but_not_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF-01: invalid")
    candidates = parse_rf_candidates(sections)

    assert candidates == (
        RFCandidate(text="- RF-01: invalid", line_number=2, section_name="Requisits funcionals"),
    )
    assert parse_recognized_rfs(candidates) == ()


def test_rf1_is_candidate_but_not_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF1: invalid")
    candidates = parse_rf_candidates(sections)

    assert candidates == (
        RFCandidate(text="- RF1: invalid", line_number=2, section_name="Requisits funcionals"),
    )
    assert parse_recognized_rfs(candidates) == ()


def test_rf_a_is_candidate_but_not_recognized_rf():
    sections = parse_sections("## Requisits funcionals\n- RF-A: invalid")
    candidates = parse_rf_candidates(sections)

    assert candidates == (
        RFCandidate(text="- RF-A: invalid", line_number=2, section_name="Requisits funcionals"),
    )
    assert parse_recognized_rfs(candidates) == ()


def test_req_1_is_not_candidate():
    sections = parse_sections("## Requisits funcionals\n- REQ-1: ignored")

    assert parse_rf_candidates(sections) == ()


def test_recognized_rf_preserves_content_after_colon():
    sections = parse_sections("## Requisits funcionals\n- RF-3: contingut del requisit")

    recognized = parse_recognized_rfs(parse_rf_candidates(sections))

    assert recognized[0].content == " contingut del requisit"


def test_recognized_rf_can_have_empty_content():
    sections = parse_sections("## Requisits funcionals\n- RF-3:")

    assert parse_recognized_rfs(parse_rf_candidates(sections)) == (
        RecognizedRF(
            identifier="RF-3",
            number=3,
            content="",
            line_number=2,
            section_name="Requisits funcionals",
        ),
    )


def test_candidate_outside_functional_requirements_is_ignored():
    sections = parse_sections("## Dubtes oberts\n- RF-1: ignored")

    assert parse_rf_candidates(sections) == ()


def test_rf_candidates_are_read_from_all_functional_requirements_sections_in_order():
    sections = parse_sections(
        "## Requisits funcionals\n"
        "- RF-2: segon\n"
        "## Altres\n"
        "- RF-99: ignored\n"
        "## Requisits funcionals\n"
        "- RF-1: primer"
    )

    candidates = parse_rf_candidates(sections)

    assert candidates == (
        RFCandidate(text="- RF-2: segon", line_number=2, section_name="Requisits funcionals"),
        RFCandidate(text="- RF-1: primer", line_number=6, section_name="Requisits funcionals"),
    )
    assert parse_recognized_rfs(candidates) == (
        RecognizedRF(
            identifier="RF-2",
            number=2,
            content=" segon",
            line_number=2,
            section_name="Requisits funcionals",
        ),
        RecognizedRF(
            identifier="RF-1",
            number=1,
            content=" primer",
            line_number=6,
            section_name="Requisits funcionals",
        ),
    )
