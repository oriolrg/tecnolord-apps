"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ExpandableImage } from "./expandable-image";
import { moveManagedImageBlock, parseMarkdownBlocks } from "@/lib/biblioteca/markdown-images";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  onContentChange?: (content: string) => void;
};

export function MarkdownView({ content, onContentChange }: Props) {
  if (onContentChange) {
    return <EditableMarkdownPreview content={content} onContentChange={onContentChange} />;
  }

  return (
    <div className="prose-biblioteca">
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

const markdownComponents = {
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    if (!src) return null;

    return (
      <ExpandableImage
        src={src}
        alt={alt ?? ""}
        className="markdown-image"
        errorClassName="markdown-image-error"
      />
    );
  }
};

function EditableMarkdownPreview({ content, onContentChange }: Required<Props>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const blocks = parseMarkdownBlocks(content);

  function moveImage(targetIndex: number) {
    if (draggedIndex === null) return;
    const block = blocks[draggedIndex];
    if (!block?.managedImageUrl) {
      setMessage("Moviment invalid: aquesta imatge no es pot reordenar.");
      return;
    }

    const nextContent = moveManagedImageBlock(content, draggedIndex, targetIndex);
    if (!nextContent) {
      setMessage("Moviment invalid.");
      return;
    }

    onContentChange(nextContent);
    setMessage("Imatge moguda al Markdown.");
  }

  return (
    <div className="prose-biblioteca">
      {blocks.map((block, index) => (
        <div key={`${index}-${block.text.slice(0, 16)}`}>
          <DropZone
            active={dropIndex === index}
            onDragEnter={() => setDropIndex(index)}
            onDrop={() => moveImage(index)}
          />
          <div
            draggable={Boolean(block.managedImageUrl)}
            className={cn(block.managedImageUrl && "rounded-md outline outline-1 outline-transparent hover:outline-teal")}
            onDragStart={(event) => {
              if (!block.managedImageUrl) return;
              setDraggedIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", block.managedImageUrl);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDropIndex(null);
            }}
          >
            <ReactMarkdown components={markdownComponents}>{block.text}</ReactMarkdown>
          </div>
        </div>
      ))}
      <DropZone
        active={dropIndex === blocks.length}
        onDragEnter={() => setDropIndex(blocks.length)}
        onDrop={() => moveImage(blocks.length)}
      />
      {message ? <p className="rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}

function DropZone({
  active,
  onDragEnter,
  onDrop
}: {
  active: boolean;
  onDragEnter: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      className={cn("my-2 h-3 rounded border border-dashed border-transparent", active && "border-teal bg-teal/10")}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    />
  );
}
