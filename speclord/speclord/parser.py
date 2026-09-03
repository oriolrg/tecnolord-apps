"""Markdown subset parsing boundary for SpecLord."""

from __future__ import annotations

import re

from speclord.models import MarkdownHeader, RFCandidate, RecognizedRF, Section


HEADER_RE = re.compile(r"^(#{1,6}) (.+)$")
RECOGNIZED_RF_RE = re.compile(r"^- (RF-([1-9][0-9]*)):(.*)$")
CODE_FENCE_MARKER = "```"
FUNCTIONAL_REQUIREMENTS_SECTION = "Requisits funcionals"


def parse_headers(markdown: str) -> tuple[MarkdownHeader, ...]:
    """Recognize Markdown headers outside fenced code blocks."""

    headers: list[MarkdownHeader] = []
    inside_code_fence = False

    for line_number, line in enumerate(markdown.splitlines(), start=1):
        if line.startswith(CODE_FENCE_MARKER):
            inside_code_fence = not inside_code_fence
            continue

        if inside_code_fence:
            continue

        match = HEADER_RE.match(line)
        if match is None:
            continue

        marker, text = match.groups()
        headers.append(MarkdownHeader(level=len(marker), text=text, line_number=line_number))

    return tuple(headers)


def parse_sections(markdown: str) -> tuple[Section, ...]:
    """Parse Markdown sections without producing validation issues."""

    lines = markdown.splitlines()
    headers = parse_headers(markdown)
    sections: list[Section] = []

    for index, header in enumerate(headers):
        end_line = len(lines)
        for next_header in headers[index + 1 :]:
            if next_header.level <= header.level:
                end_line = next_header.line_number - 1
                break

        content_lines = lines[header.line_number : end_line]
        sections.append(
            Section(
                name=header.text,
                normalized_name=normalize_section_name(header.text),
                level=header.level,
                start_line=header.line_number + 1,
                end_line=end_line,
                content="\n".join(content_lines),
            )
        )

    return tuple(sections)


def normalize_section_name(name: str) -> str:
    """Normalize a section name for comparison according to the spec."""

    return name.strip().lower().replace("’", "'")


def parse_rf_candidates(sections: tuple[Section, ...]) -> tuple[RFCandidate, ...]:
    """Parse RF candidate lines from functional requirements sections."""

    candidates: list[RFCandidate] = []
    functional_requirements_name = normalize_section_name(FUNCTIONAL_REQUIREMENTS_SECTION)

    for section in sections:
        if section.normalized_name != functional_requirements_name:
            continue

        inside_code_fence = False
        for offset, line in enumerate(section.content.splitlines()):
            if line.startswith(CODE_FENCE_MARKER):
                inside_code_fence = not inside_code_fence
                continue

            if inside_code_fence:
                continue

            if line.lstrip().startswith("- RF"):
                candidates.append(
                    RFCandidate(
                        text=line,
                        line_number=section.start_line + offset,
                        section_name=section.name,
                    )
                )

    return tuple(candidates)


def parse_recognized_rfs(candidates: tuple[RFCandidate, ...]) -> tuple[RecognizedRF, ...]:
    """Parse recognized RFs from candidate lines without validating them."""

    recognized: list[RecognizedRF] = []

    for candidate in candidates:
        match = RECOGNIZED_RF_RE.match(candidate.text.lstrip())
        if match is None:
            continue

        identifier, number, content = match.groups()
        recognized.append(
            RecognizedRF(
                identifier=identifier,
                number=int(number),
                content=content,
                line_number=candidate.line_number,
                section_name=candidate.section_name,
            )
        )

    return tuple(recognized)
