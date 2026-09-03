"""Deterministic validation rules for SpecLord."""

from __future__ import annotations

import re

from speclord.models import Issue, IssueScope, RFCandidate, RecognizedRF, Section, Severity


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
VALID_RF_CANDIDATE_RE = re.compile(r"^- RF-[1-9][0-9]*:.*$")
CLARIFICATION_MARKER = "[necessita aclaració]"
CODE_FENCE_MARKER = "```"
VAGUE_TERMS = (
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
)


def validate_required_sections(sections: tuple[Section, ...], spec_path: str) -> tuple[Issue, ...]:
    """Validate required section presence, duplicates, and empty occurrences."""

    issues: list[Issue] = []

    for required_name in REQUIRED_SECTION_NAMES:
        occurrences = [
            section
            for section in sections
            if section.normalized_name == _normalize_required_section_name(required_name)
        ]

        if not occurrences:
            issues.append(_missing_section_issue(spec_path, required_name))
            continue

        for occurrence_index, section in enumerate(occurrences):
            if occurrence_index > 0:
                issues.append(_duplicate_section_issue(spec_path, required_name))
            if section.content.strip() == "":
                issues.append(_empty_section_issue(spec_path, required_name))

    return tuple(issues)


def validate_rf_basics(
    candidates: tuple[RFCandidate, ...],
    recognized_rfs: tuple[RecognizedRF, ...],
    spec_path: str,
) -> tuple[Issue, ...]:
    """Validate basic RF candidate format and recognized RF content."""

    issues: list[Issue] = []

    for candidate in candidates:
        if VALID_RF_CANDIDATE_RE.match(candidate.text.lstrip()) is None:
            issues.append(_invalid_rf_candidate_issue(spec_path, candidate))

    if not recognized_rfs:
        issues.append(_no_recognized_rf_issue(spec_path))

    for recognized in recognized_rfs:
        if recognized.content.strip(" ") == "":
            issues.append(_empty_rf_content_issue(spec_path, recognized))

    return tuple(issues)


def validate_rf_numbering(
    recognized_rfs: tuple[RecognizedRF, ...],
    spec_path: str,
) -> tuple[Issue, ...]:
    """Validate duplicate RF identifiers and numeric sequence gaps."""

    issues: list[Issue] = []
    first_by_identifier: dict[str, RecognizedRF] = {}
    duplicate_identifiers: list[str] = []

    for recognized in recognized_rfs:
        if recognized.identifier in first_by_identifier:
            if recognized.identifier not in duplicate_identifiers:
                duplicate_identifiers.append(recognized.identifier)
            continue
        first_by_identifier[recognized.identifier] = recognized

    for identifier in duplicate_identifiers:
        issues.append(_duplicate_rf_identifier_issue(spec_path, first_by_identifier[identifier]))

    unique_rfs = sorted(first_by_identifier.values(), key=lambda recognized: recognized.number)
    if not unique_rfs:
        return tuple(issues)

    first = unique_rfs[0]
    if first.number != 1:
        issues.append(_rf_numbering_start_issue(spec_path, first))

    for previous, current in zip(unique_rfs, unique_rfs[1:]):
        if current.number != previous.number + 1:
            issues.append(_rf_numbering_gap_issue(spec_path, previous, current))

    return tuple(issues)


def validate_clarification_markers(markdown: str, spec_path: str) -> tuple[Issue, ...]:
    """Validate clarification markers outside fenced code blocks."""

    inside_code_fence = False

    for line in markdown.splitlines():
        if line.startswith(CODE_FENCE_MARKER):
            inside_code_fence = not inside_code_fence
            continue

        if inside_code_fence:
            continue

        if CLARIFICATION_MARKER in line.lower():
            return (_clarification_marker_issue(spec_path),)

    return ()


def validate_vague_terms(
    recognized_rfs: tuple[RecognizedRF, ...],
    spec_path: str,
) -> tuple[Issue, ...]:
    """Validate closed-catalog vague terms inside recognized RF content."""

    issues: list[Issue] = []

    for recognized in recognized_rfs:
        for term in VAGUE_TERMS:
            if _contains_complete_term(recognized.content, term):
                issues.append(_vague_term_issue(spec_path, recognized, term))

    return tuple(issues)


def validate_ears_patterns(
    recognized_rfs: tuple[RecognizedRF, ...],
    spec_path: str,
) -> tuple[Issue, ...]:
    """Validate recognized RF content against the specified EARS patterns."""

    issues: list[Issue] = []

    for recognized in recognized_rfs:
        if recognized.content.strip() == "":
            continue
        if not _matches_ears_pattern(recognized.content):
            issues.append(_ears_pattern_issue(spec_path, recognized))

    return tuple(issues)


def _contains_complete_term(text: str, term: str) -> bool:
    pattern = re.compile(rf"(?<!\w){re.escape(term)}(?!\w)", re.IGNORECASE)
    return pattern.search(text) is not None


def _matches_ears_pattern(content: str) -> bool:
    text = content.strip()
    return (
        _matches_keyword_system_pattern(text, "QUAN")
        or _matches_keyword_system_pattern(text, "SI")
        or _matches_keyword_system_pattern(text, "MENTRE")
        or _matches_system_pattern(text)
    )


def _matches_keyword_system_pattern(text: str, keyword: str) -> bool:
    match = re.fullmatch(rf"{keyword}\s+(.+?)\s+EL SISTEMA\s+(.+)", text, re.IGNORECASE)
    if match is None:
        return False

    condition, response = match.groups()
    return condition.strip() != "" and response.strip() != ""


def _matches_system_pattern(text: str) -> bool:
    match = re.fullmatch(r"EL SISTEMA\s+(.+)", text, re.IGNORECASE)
    if match is None:
        return False

    (response,) = match.groups()
    return response.strip() != ""


def _normalize_required_section_name(name: str) -> str:
    return name.strip().lower().replace("’", "'")


def _missing_section_issue(spec_path: str, section_name: str) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description=f"Missing required section: {section_name}",
        spec_path=spec_path,
        section=section_name,
    )


def _duplicate_section_issue(spec_path: str, section_name: str) -> Issue:
    return Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description=f"Duplicate required section: {section_name}",
        spec_path=spec_path,
        section=section_name,
    )


def _empty_section_issue(spec_path: str, section_name: str) -> Issue:
    return Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description=f"Empty required section: {section_name}",
        spec_path=spec_path,
        section=section_name,
    )


def _invalid_rf_candidate_issue(spec_path: str, candidate: RFCandidate) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description=f"Invalid RF candidate: {candidate.text}",
        spec_path=spec_path,
        section=candidate.section_name,
        rf=candidate.text,
    )


def _no_recognized_rf_issue(spec_path: str) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description="No recognized RF found",
        spec_path=spec_path,
        section="Requisits funcionals",
    )


def _empty_rf_content_issue(spec_path: str, recognized: RecognizedRF) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description=f"Empty RF content: {recognized.identifier}",
        spec_path=spec_path,
        section=recognized.section_name,
        rf=recognized.identifier,
    )


def _duplicate_rf_identifier_issue(spec_path: str, recognized: RecognizedRF) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description=f"Duplicate RF identifier: {recognized.identifier}",
        spec_path=spec_path,
        section=recognized.section_name,
        rf=recognized.identifier,
    )


def _rf_numbering_start_issue(spec_path: str, recognized: RecognizedRF) -> Issue:
    return Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description=f"RF numbering starts at {recognized.identifier} instead of RF-1",
        spec_path=spec_path,
        section=recognized.section_name,
        rf=recognized.identifier,
    )


def _rf_numbering_gap_issue(
    spec_path: str,
    previous: RecognizedRF,
    current: RecognizedRF,
) -> Issue:
    return Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description=f"RF numbering gap between {previous.identifier} and {current.identifier}",
        spec_path=spec_path,
        section=current.section_name,
        rf=current.identifier,
    )


def _clarification_marker_issue(spec_path: str) -> Issue:
    return Issue(
        severity=Severity.ERROR,
        scope=IssueScope.SPEC,
        description="Clarification marker found",
        spec_path=spec_path,
    )


def _vague_term_issue(spec_path: str, recognized: RecognizedRF, term: str) -> Issue:
    return Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description=f"Vague term found: {term}",
        spec_path=spec_path,
        section=recognized.section_name,
        rf=recognized.identifier,
    )


def _ears_pattern_issue(spec_path: str, recognized: RecognizedRF) -> Issue:
    return Issue(
        severity=Severity.WARNING,
        scope=IssueScope.SPEC,
        description=f"RF does not match a recognized EARS pattern: {recognized.identifier}",
        spec_path=spec_path,
        section=recognized.section_name,
        rf=recognized.identifier,
    )
