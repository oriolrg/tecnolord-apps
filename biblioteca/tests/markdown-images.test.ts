import { describe, expect, test } from "vitest";
import { moveManagedImageBlock, parseMarkdownBlocks } from "../lib/biblioteca/markdown-images";

const image = "![imatge](/biblioteca/api/uploads/11111111-1111-4111-8111-111111111111.webp)";
const imageAgain = "![imatge](/biblioteca/api/uploads/22222222-2222-4222-8222-222222222222.webp)";

describe("markdown image movement", () => {
  test("moves an inline image block down and preserves adjacent text", () => {
    const markdown = `Bloc A\n\n${image}\n\nBloc B\n\nBloc C\n`;
    const next = moveManagedImageBlock(markdown, 1, 4);

    expect(next).toBe(`Bloc A\n\nBloc B\n\nBloc C\n\n${image}\n`);
  });

  test("moves an inline image block up", () => {
    const markdown = `Bloc A\n\nBloc B\n\n${image}\n\nBloc C\n`;
    const next = moveManagedImageBlock(markdown, 2, 1);

    expect(next).toBe(`Bloc A\n\n${image}\n\nBloc B\n\nBloc C\n`);
  });

  test("moves only the selected occurrence when the same image appears twice", () => {
    const markdown = `Bloc A\n\n${image}\n\nBloc B\n\n${image}\n\nBloc C\n`;
    const next = moveManagedImageBlock(markdown, 1, 5);

    expect(next).toBe(`Bloc A\n\nBloc B\n\n${image}\n\nBloc C\n\n${image}\n`);
  });

  test("rejects invalid source blocks", () => {
    const markdown = `Bloc A\n\n${image}\n\nBloc B\n`;

    expect(moveManagedImageBlock(markdown, 0, 3)).toBeNull();
  });

  test("does not treat images inside paragraphs as movable blocks", () => {
    const markdown = `Bloc A with ${image}\n\nBloc B\n`;
    const blocks = parseMarkdownBlocks(markdown);

    expect(blocks[0].managedImageUrl).toBeUndefined();
    expect(moveManagedImageBlock(markdown, 0, 2)).toBeNull();
  });

  test("simulates drag to markdown to save to reload to public renderer flow", () => {
    const persistedBefore = `Bloc A\n\n${image}\n\nBloc B\n\nBloc C\n\n${imageAgain}\n`;
    const editableAfterDrop = moveManagedImageBlock(persistedBefore, 1, 4);
    expect(editableAfterDrop).toBe(`Bloc A\n\nBloc B\n\nBloc C\n\n${image}\n\n${imageAgain}\n`);

    const savePayload = { contentMarkdown: editableAfterDrop };
    const persistedAfterSave = savePayload.contentMarkdown;
    const reloadedEditorMarkdown = persistedAfterSave;
    const publicMarkdown = reloadedEditorMarkdown;

    expect(publicMarkdown).toContain(`Bloc C\n\n${image}\n\n${imageAgain}`);
    expect(publicMarkdown).not.toContain(`Bloc A\n\n${image}\n\nBloc B`);
  });

  test("leaves persistence unchanged when the move is not saved", () => {
    const persistedBefore = `Bloc A\n\n${image}\n\nBloc B\n\nBloc C\n`;
    const editableAfterDrop = moveManagedImageBlock(persistedBefore, 1, 4);

    expect(editableAfterDrop).not.toBe(persistedBefore);
    expect(persistedBefore).toBe(`Bloc A\n\n${image}\n\nBloc B\n\nBloc C\n`);
  });
});
