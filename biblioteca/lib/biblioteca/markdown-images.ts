export type MarkdownBlock = {
  text: string;
  start: number;
  end: number;
  managedImageUrl?: string;
};

const managedImagePattern = /^!\[[^\]]*]\((\/biblioteca\/api\/uploads\/[^)\s]+)\)\s*$/;

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < normalized.length) {
    while (index < normalized.length && normalized[index] === "\n") {
      index++;
    }

    if (index >= normalized.length) break;

    const start = index;
    const nextSeparator = normalized.slice(index).search(/\n{2,}/);
    const end = nextSeparator === -1 ? normalized.length : index + nextSeparator;
    const text = normalized.slice(start, end);
    const trimmed = text.trim();
    const match = trimmed.match(managedImagePattern);

    blocks.push({
      text,
      start,
      end,
      managedImageUrl: match?.[1]
    });

    index = end;
  }

  return blocks;
}

export function moveManagedImageBlock(markdown: string, sourceIndex: number, targetIndex: number) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const blocks = parseMarkdownBlocks(normalized);

  if (sourceIndex < 0 || sourceIndex >= blocks.length) return null;
  if (targetIndex < 0 || targetIndex > blocks.length) return null;
  if (sourceIndex === targetIndex || sourceIndex + 1 === targetIndex) return null;

  const source = blocks[sourceIndex];
  if (!source.managedImageUrl) return null;

  const movingFragment = normalized.slice(source.start, source.end).trim();
  const remainingBlocks = blocks.filter((_, index) => index !== sourceIndex);
  const insertionIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
  const nextBlocks = [...remainingBlocks];
  nextBlocks.splice(insertionIndex, 0, {
    ...source,
    text: movingFragment,
    start: 0,
    end: movingFragment.length
  });

  return `${nextBlocks.map((block) => block.text.trim()).join("\n\n")}\n`;
}
