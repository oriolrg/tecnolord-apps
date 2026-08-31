import pytest

from speclord.models import MarkdownHeader
from speclord.parser import parse_headers


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
