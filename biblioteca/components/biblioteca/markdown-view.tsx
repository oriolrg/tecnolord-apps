"use client";

import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-biblioteca">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
