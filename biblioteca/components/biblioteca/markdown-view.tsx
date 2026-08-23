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
              <MarkdownImage
                src={src}
                alt={alt ?? ""}
                onExpand={() => setExpandedImage({ src, alt: alt ?? "" })}
              />
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
          <div
            className="m-auto flex max-h-full max-w-full overflow-auto rounded-md bg-white p-2"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={expandedImage.src}
              alt={expandedImage.alt}
              className="m-auto block h-auto max-h-[calc(100vh-5rem)] max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MarkdownImage({
  src,
  alt,
  onExpand
}: {
  src: string;
  alt: string;
  onExpand: () => void;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="markdown-image-error">
        <p>No s'ha pogut carregar aquesta imatge.</p>
        <a href={src} target="_blank" rel="noreferrer">
          Obrir la imatge directament
        </a>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="markdown-image"
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onExpand();
        }
      }}
      onError={() => setFailed(true)}
    />
  );
}
