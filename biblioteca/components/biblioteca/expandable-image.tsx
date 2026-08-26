"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  errorClassName?: string;
};

export function ExpandableImage({ src, alt, className, errorClassName }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const triggerRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      triggerRef.current?.focus();
    };
  }, [expanded]);

  if (failed) {
    return (
      <div className={cn("rounded-md border border-brick bg-brick/10 p-3 text-sm text-brick", errorClassName)}>
        <p>No s'ha pogut carregar aquesta imatge.</p>
        <a href={src} target="_blank" rel="noreferrer" className="font-semibold underline">
          Obrir la imatge directament
        </a>
      </div>
    );
  }

  return (
    <>
      <img
        ref={triggerRef}
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("cursor-zoom-in", className)}
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded(true);
          }
        }}
        onError={() => setFailed(true)}
      />

      {expanded ? (
        <div
          className="fixed inset-0 z-50 flex bg-slate-950/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setExpanded(false)}
        >
          <button
            ref={closeRef}
            type="button"
            className="absolute right-4 top-4 z-10 rounded-md bg-white px-3 py-2 text-sm font-semibold text-ink shadow-panel"
            onClick={() => setExpanded(false)}
          >
            Tancar
          </button>
          <div
            className="m-auto max-h-full max-w-full overflow-auto rounded-md bg-white p-2"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="block h-auto w-auto max-w-[calc(100vw-2rem)] rounded-sm"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
