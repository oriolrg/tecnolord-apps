"""Markdown subset parsing boundary for SpecLord."""

from __future__ import annotations

import re

from speclord.models import MarkdownHeader


HEADER_RE = re.compile(r"^(#{1,6})\s+(.+)$")
CODE_FENCE_MARKER = "```"


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
