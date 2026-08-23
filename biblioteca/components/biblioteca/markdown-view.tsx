"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="prose-biblioteca">
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => {
            if (!src) return null;

            return (
              <button
                type="button"
                className="markdown-image-button"
                onClick={() => setExpandedImage({ src, alt: alt ?? "" })}
                aria-label="Ampliar imatge"
              >
                <img src={src} alt={alt ?? ""} loading="lazy" />
              </button>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>

      {expandedImage ? (
        <div
          className="fixed inset-0 z-50 flex bg-slate-950/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpandedImage(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink shadow-panel"
            onClick={() => setExpandedImage(null)}
          >
            Tancar
          </button>
          <div className="m-auto max-h-full max-w-full overflow-auto rounded-md bg-white p-2" onClick={(event) => event.stopPropagation()}>
            <img src={expandedImage.src} alt={expandedImage.alt} className="block h-auto max-w-none" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
