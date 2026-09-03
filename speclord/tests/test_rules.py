import socket
import tomllib
from pathlib import Path

import pytest

from speclord.models import Issue, IssueScope, RFCandidate, RecognizedRF, Section, Severity
from speclord.parser import parse_recognized_rfs, parse_rf_candidates, parse_sections
from speclord.rules import (
    validate_clarification_markers,
    validate_required_sections,
    validate_ears_patterns,
    validate_rf_basics,
    validate_rf_numbering,
    validate_vague_terms,
)


SPEC_PATH = "specs/feature/spec.md"
REQUIRED_SECTION_NAMES = (
    "Context i objectiu",
    "Usuaris / actors",
    "Històries d'usuari",
    "Requisits funcionals",
    "Requisits no funcionals",
    "Casos límit",
    "Fora d'abast",
    "Criteris de finalització",
    "Dubtes oberts",
)


def section(name: str, content: str = "Content", line: int = 1) -> Section:
    return Section(
        name=name,
        normalized_name=name.strip().lower().replace("’", "'"),
        level=2,
        start_line=line + 1,
        end_line=line + 1,
        content=content,
    )


def all_required_sections() -> tuple[Section, ...]:
    return tuple(section(name, line=index * 2 + 1) for index, name in enumerate(REQUIRED_SECTION_NAMES))


def test_all_required_sections_present_returns_no_issues():
    assert validate_required_sections(all_required_sections(), SPEC_PATH) == ()


def test_missing_required_section_generates_error():
    sections = tuple(current for current in all_required_sections() if current.name != "Dubtes oberts")

    assert validate_required_sections(sections, SPEC_PATH) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Missing required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
    )


def test_multiple_missing_required_sections_generate_errors():
    sections = tuple(
        current
        for current in all_required_sections()
        if current.name not in {"Casos límit", "Fora d'abast"}
    )

    issues = validate_required_sections(sections, SPEC_PATH)

    assert issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Missing required section: Casos límit",
            spec_path=SPEC_PATH,
            section="Casos límit",
        ),
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Missing required section: Fora d'abast",
            spec_path=SPEC_PATH,
            section="Fora d'abast",
        ),
    )


def test_duplicate_required_section_generates_warning_for_later_occurrence():
    sections = all_required_sections() + (section("Dubtes oberts", content="Second", line=99),)

    issues = validate_required_sections(sections, SPEC_PATH)

    assert issues == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Duplicate required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
    )


def test_required_section_present_three_times_generates_two_duplicate_warnings():
    sections = all_required_sections() + (
        section("Dubtes oberts", content="Second", line=99),
        section("Dubtes oberts", content="Third", line=101),
    )

    issues = validate_required_sections(sections, SPEC_PATH)

    assert issues == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Duplicate required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Duplicate required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
    )


def test_empty_required_section_occurrence_generates_warning():
    sections = tuple(
        section("Dubtes oberts", content="") if current.name == "Dubtes oberts" else current
        for current in all_required_sections()
    )

    issues = validate_required_sections(sections, SPEC_PATH)

    assert issues == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Empty required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
    )


def test_multiple_empty_occurrences_generate_warnings():
    sections = all_required_sections() + (
        section("Dubtes oberts", content="", line=99),
        section("Dubtes oberts", content=" ", line=101),
    )

    issues = validate_required_sections(sections, SPEC_PATH)

    assert issues == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Duplicate required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Empty required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Duplicate required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Empty required section: Dubtes oberts",
            spec_path=SPEC_PATH,
            section="Dubtes oberts",
        ),
    )


def test_duplicate_functional_requirements_section_is_reported_as_duplicate_not_missing():
    sections = all_required_sections() + (
        section("Requisits funcionals", content="Second occurrence", line=99),
    )

    issues = validate_required_sections(sections, SPEC_PATH)

    assert issues == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Duplicate required section: Requisits funcionals",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
        ),
    )


def candidate(text: str, line_number: int = 10) -> RFCandidate:
    return RFCandidate(text=text, line_number=line_number, section_name="Requisits funcionals")


def recognized(identifier: str = "RF-1", number: int = 1, content: str = " EL SISTEMA fa una cosa") -> RecognizedRF:
    return RecognizedRF(
        identifier=identifier,
        number=number,
        content=content,
        line_number=10,
        section_name="Requisits funcionals",
    )


def test_valid_candidate_generates_no_format_error():
    assert validate_rf_basics(
        candidates=(candidate("- RF-1: EL SISTEMA fa una cosa"),),
        recognized_rfs=(recognized(),),
        spec_path=SPEC_PATH,
    ) == ()


def test_rf_0_candidate_generates_invalid_format_error():
    issues = validate_rf_basics(
        candidates=(candidate("- RF-0: invalid"), candidate("- RF-1: valid")),
        recognized_rfs=(recognized(),),
        spec_path=SPEC_PATH,
    )

    assert issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Invalid RF candidate: - RF-0: invalid",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="- RF-0: invalid",
        ),
    )


def test_rf_01_candidate_generates_invalid_format_error():
    issues = validate_rf_basics(
        candidates=(candidate("- RF-01: invalid"), candidate("- RF-1: valid")),
        recognized_rfs=(recognized(),),
        spec_path=SPEC_PATH,
    )

    assert issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Invalid RF candidate: - RF-01: invalid",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="- RF-01: invalid",
        ),
    )


def test_rf1_candidate_generates_invalid_format_error():
    issues = validate_rf_basics(
        candidates=(candidate("- RF1: invalid"), candidate("- RF-1: valid")),
        recognized_rfs=(recognized(),),
        spec_path=SPEC_PATH,
    )

    assert issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Invalid RF candidate: - RF1: invalid",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="- RF1: invalid",
        ),
    )


def test_rf_a_candidate_generates_invalid_format_error():
    issues = validate_rf_basics(
        candidates=(candidate("- RF-A: invalid"), candidate("- RF-1: valid")),
        recognized_rfs=(recognized(),),
        spec_path=SPEC_PATH,
    )

    assert issues == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Invalid RF candidate: - RF-A: invalid",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="- RF-A: invalid",
        ),
    )


def test_req_1_generates_no_candidate_format_error_because_it_is_not_a_candidate():
    sections = parse_sections("## Requisits funcionals\n- REQ-1: ignored\n- RF-1: valid")
    candidates = parse_rf_candidates(sections)
    recognized_rfs = parse_recognized_rfs(candidates)

    assert candidates == (RFCandidate(text="- RF-1: valid", line_number=3, section_name="Requisits funcionals"),)
    assert validate_rf_basics(candidates, recognized_rfs, SPEC_PATH) == ()


def test_absence_of_recognized_rfs_generates_error():
    assert validate_rf_basics(candidates=(), recognized_rfs=(), spec_path=SPEC_PATH) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="No recognized RF found",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
        ),
    )


def test_empty_recognized_rf_content_generates_error():
    assert validate_rf_basics(
        candidates=(candidate("- RF-1:"),),
        recognized_rfs=(recognized(content=""),),
        spec_path=SPEC_PATH,
    ) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Empty RF content: RF-1",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def numbered_rf(number: int, line_number: int | None = None) -> RecognizedRF:
    return RecognizedRF(
        identifier=f"RF-{number}",
        number=number,
        content=" EL SISTEMA fa una cosa",
        line_number=line_number if line_number is not None else number + 10,
        section_name="Requisits funcionals",
    )


def test_rf_number_sequence_1_2_3_generates_no_issues():
    assert validate_rf_numbering(
        recognized_rfs=(numbered_rf(1), numbered_rf(2), numbered_rf(3)),
        spec_path=SPEC_PATH,
    ) == ()


def test_duplicate_rf_identifier_generates_error():
    assert validate_rf_numbering(
        recognized_rfs=(numbered_rf(1), numbered_rf(2), numbered_rf(2, line_number=20)),
        spec_path=SPEC_PATH,
    ) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Duplicate RF identifier: RF-2",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-2",
        ),
    )


def test_first_rf_different_from_1_generates_warning():
    assert validate_rf_numbering(
        recognized_rfs=(numbered_rf(2), numbered_rf(3)),
        spec_path=SPEC_PATH,
    ) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering starts at RF-2 instead of RF-1",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-2",
        ),
    )


def test_single_rf_numbering_gap_generates_warning():
    assert validate_rf_numbering(
        recognized_rfs=(numbered_rf(1), numbered_rf(3)),
        spec_path=SPEC_PATH,
    ) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering gap between RF-1 and RF-3",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-3",
        ),
    )


def test_multiple_rf_numbering_gaps_generate_warnings():
    assert validate_rf_numbering(
        recognized_rfs=(numbered_rf(1), numbered_rf(3), numbered_rf(6)),
        spec_path=SPEC_PATH,
    ) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering gap between RF-1 and RF-3",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-3",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering gap between RF-3 and RF-6",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-6",
        ),
    )


def test_duplicates_are_removed_before_gap_analysis():
    assert validate_rf_numbering(
        recognized_rfs=(numbered_rf(1), numbered_rf(3), numbered_rf(3, line_number=30), numbered_rf(5)),
        spec_path=SPEC_PATH,
    ) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Duplicate RF identifier: RF-3",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-3",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering gap between RF-1 and RF-3",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-3",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF numbering gap between RF-3 and RF-5",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-5",
        ),
    )


def test_literal_clarification_marker_generates_error():
    assert validate_clarification_markers("Text [NECESSITA ACLARACIÓ]", SPEC_PATH) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Clarification marker found",
            spec_path=SPEC_PATH,
        ),
    )


def test_clarification_marker_detection_ignores_case():
    assert validate_clarification_markers("Text [necessita aclaració]", SPEC_PATH) == (
        Issue(
            severity=Severity.ERROR,
            scope=IssueScope.SPEC,
            description="Clarification marker found",
            spec_path=SPEC_PATH,
        ),
    )


def test_clarification_marker_inside_code_fence_generates_no_error():
    markdown = "\n".join(
        [
            "```text",
            "[NECESSITA ACLARACIÓ]",
            "```",
        ]
    )

    assert validate_clarification_markers(markdown, SPEC_PATH) == ()


@pytest.mark.parametrize(
    "term",
    [
        "ràpid",
        "ràpidament",
        "fàcil",
        "fàcilment",
        "adequat",
        "eficient",
        "intuïtiu",
        "quan sigui possible",
        "si és necessari",
        "suficient",
    ],
)
def test_each_catalog_vague_term_generates_warning(term: str):
    rf = recognized(content=f" EL SISTEMA ho fa {term}")

    assert validate_vague_terms((rf,), SPEC_PATH) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description=f"Vague term found: {term}",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def test_multiple_different_vague_terms_generate_multiple_warnings():
    rf = recognized(content=" EL SISTEMA ho fa ràpid i quan sigui possible")

    assert validate_vague_terms((rf,), SPEC_PATH) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Vague term found: ràpid",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Vague term found: quan sigui possible",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def test_repeated_vague_term_generates_one_warning():
    rf = recognized(content=" EL SISTEMA ho fa ràpid i molt ràpid")

    assert validate_vague_terms((rf,), SPEC_PATH) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Vague term found: ràpid",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def test_vague_term_detection_ignores_case():
    rf = recognized(content=" EL SISTEMA és EFICIENT")

    assert validate_vague_terms((rf,), SPEC_PATH) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="Vague term found: eficient",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def test_vague_term_partial_match_generates_no_warning():
    rf = recognized(content=" EL SISTEMA té una interfície suficientment documentada")

    assert validate_vague_terms((rf,), SPEC_PATH) == ()


@pytest.mark.parametrize(
    "content",
    [
        " QUAN l'usuari desa EL SISTEMA confirma l'acció",
        " SI la sessió caduca EL SISTEMA demana autenticació",
        " MENTRE hi ha connexió EL SISTEMA sincronitza dades",
        " EL SISTEMA mostra el resultat",
    ],
)
def test_valid_ears_patterns_generate_no_warning(content: str):
    assert validate_ears_patterns((recognized(content=content),), SPEC_PATH) == ()


@pytest.mark.parametrize(
    "content",
    [
        " QUAN   EL SISTEMA confirma l'acció",
        " QUAN l'usuari desa EL SISTEMA   ",
        " SI   EL SISTEMA demana autenticació",
        " MENTRE   EL SISTEMA sincronitza dades",
        " EL SISTEMA   ",
    ],
)
def test_empty_required_ears_fragments_generate_warning(content: str):
    rf = recognized(content=content)

    assert validate_ears_patterns((rf,), SPEC_PATH) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF does not match a recognized EARS pattern: RF-1",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def test_content_that_matches_no_ears_pattern_generates_warning():
    rf = recognized(content=" L'usuari pot exportar el resultat")

    assert validate_ears_patterns((rf,), SPEC_PATH) == (
        Issue(
            severity=Severity.WARNING,
            scope=IssueScope.SPEC,
            description="RF does not match a recognized EARS pattern: RF-1",
            spec_path=SPEC_PATH,
            section="Requisits funcionals",
            rf="RF-1",
        ),
    )


def test_semantically_odd_but_syntactically_valid_ears_pattern_generates_no_extra_warning():
    rf = recognized(content=" EL SISTEMA somia en colors")

    assert validate_ears_patterns((rf,), SPEC_PATH) == ()


def test_syntactically_valid_arbitrary_meaning_gets_no_semantic_issues():
    rf = recognized(content=" EL SISTEMA somia en colors")

    assert validate_vague_terms((rf,), SPEC_PATH) == ()
    assert validate_ears_patterns((rf,), SPEC_PATH) == ()


def test_rules_implemented_until_t15_run_with_network_blocked(monkeypatch):
    def blocked_socket(*args, **kwargs):
        raise AssertionError("Network access is not allowed")

    monkeypatch.setattr(socket, "socket", blocked_socket)
    sections = all_required_sections()
    candidates = (candidate("- RF-1: EL SISTEMA somia en colors"),)
    rfs = (recognized(content=" EL SISTEMA somia en colors"),)

    assert validate_required_sections(sections, SPEC_PATH) == ()
    assert validate_rf_basics(candidates, rfs, SPEC_PATH) == ()
    assert validate_rf_numbering(rfs, SPEC_PATH) == ()
    assert validate_clarification_markers("Text normal", SPEC_PATH) == ()
    assert validate_vague_terms(rfs, SPEC_PATH) == ()
    assert validate_ears_patterns(rfs, SPEC_PATH) == ()


def test_project_declares_no_runtime_dependencies():
    pyproject = tomllib.loads(Path("pyproject.toml").read_text(encoding="utf-8"))

    assert pyproject["project"]["dependencies"] == []
