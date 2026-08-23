"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";

type Attachment = {
  id: string;
  filename: string;
  originalName: string | null;
  storageName: string | null;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  kind: string;
  altText: string | null;
};

type Props = {
  articleId: string;
  csrfToken: string;
  initialAttachments: Attachment[];
  onInsert: (markdown: string) => void;
};

function formatBytes(value?: number | null) {
  if (!value) return "Mida desconeguda";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function markdownFor(attachment: Attachment) {
  return `![${attachment.altText || attachment.originalName || "Imatge"}](${attachment.url})`;
}

export function ImageManager({ articleId, csrfToken, initialAttachments, onInsert }: Props) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [coverAlt, setCoverAlt] = useState(initialAttachments.find((item) => item.kind === "cover")?.altText ?? "");
  const [inlineAlt, setInlineAlt] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  const cover = attachments.find((item) => item.kind === "cover");
  const inlineImages = attachments.filter((item) => item.kind !== "cover");

  async function readError(response: Response) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    return data?.error || "Operacio no completada";
  }

  async function upload(kind: "cover" | "inline", file: File | undefined, altText: string) {
    if (!file) {
      setMessage("Selecciona una imatge.");
      return;
    }

    setBusy(true);
    setMessage("Pujant imatge...");
    const formData = new FormData();
    formData.set("file", file);
    formData.set("kind", kind);
    formData.set("altText", altText);

    const response = await fetch(`/biblioteca/api/admin/articles/${articleId}/attachments`, {
      method: "POST",
      headers: { "x-csrf-token": csrfToken },
      body: formData
    });

    setBusy(false);
    if (!response.ok) {
      setMessage(await readError(response));
      return;
    }

    const data = (await response.json()) as { attachment: Attachment };
    setAttachments((items) => (kind === "cover" ? [data.attachment, ...items.filter((item) => item.kind !== "cover")] : [data.attachment, ...items]));
    setInlineAlt("");
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (inlineInputRef.current) inlineInputRef.current.value = "";
    setMessage("Imatge pujada.");
  }

  async function update(attachment: Attachment, file: File | undefined, altText: string) {
    setBusy(true);
    setMessage("Actualitzant imatge...");
    const formData = new FormData();
    formData.set("altText", altText);
    if (file) formData.set("file", file);

    const response = await fetch(`/biblioteca/api/admin/articles/${articleId}/attachments/${attachment.id}`, {
      method: "PATCH",
      headers: { "x-csrf-token": csrfToken },
      body: formData
    });

    setBusy(false);
    if (!response.ok) {
      setMessage(await readError(response));
      return;
    }

    const data = (await response.json()) as { attachment: Attachment };
    setAttachments((items) => items.map((item) => (item.id === attachment.id ? data.attachment : item)));
    setMessage("Imatge actualitzada.");
  }

  async function remove(attachment: Attachment) {
    if (!confirm("Eliminar aquesta imatge?")) return;

    setBusy(true);
    setMessage("Eliminant imatge...");
    const response = await fetch(`/biblioteca/api/admin/articles/${articleId}/attachments/${attachment.id}`, {
      method: "DELETE",
      headers: { "x-csrf-token": csrfToken }
    });

    setBusy(false);
    if (!response.ok) {
      setMessage(await readError(response));
      return;
    }

    setAttachments((items) => items.filter((item) => item.id !== attachment.id));
    setMessage("Imatge eliminada.");
  }

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Imatges</h2>
          <p className="text-sm text-slate-600">Portada opcional i imatges per inserir al Markdown.</p>
        </div>
        {busy ? <span className="text-sm text-slate-600">Processant...</span> : null}
      </div>

      <div className="grid gap-5">
        <div className="rounded-md border border-line p-3">
          <h3 className="text-sm font-semibold">Portada</h3>
          {cover ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr]">
              <img src={cover.url} alt={cover.altText || ""} className="h-28 w-full rounded-md object-cover" />
              <div className="space-y-2">
                <p className="text-sm text-slate-700">{cover.originalName || cover.filename}</p>
                <p className="text-xs text-slate-500">{formatBytes(cover.sizeBytes)}</p>
                <input className="field" value={coverAlt} onChange={(event) => setCoverAlt(event.target.value)} placeholder="Text alternatiu" />
                <input ref={coverInputRef} className="field" type="file" accept="image/jpeg,image/png,image/webp" />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:border-teal"
                    onClick={() => update(cover, coverInputRef.current?.files?.[0], coverAlt)}
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Substituir
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-brick px-3 py-2 text-sm text-brick hover:bg-brick hover:text-white"
                    onClick={() => remove(cover)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-2">
              <input className="field" value={coverAlt} onChange={(event) => setCoverAlt(event.target.value)} placeholder="Text alternatiu" />
              <input ref={coverInputRef} className="field" type="file" accept="image/jpeg,image/png,image/webp" />
              <button
                type="button"
                className="flex w-fit items-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal/90"
                onClick={() => upload("cover", coverInputRef.current?.files?.[0], coverAlt)}
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                Pujar portada
              </button>
            </div>
          )}
        </div>

        <div className="rounded-md border border-line p-3">
          <h3 className="text-sm font-semibold">Imatges del contingut</h3>
          <div className="mt-3 grid gap-2">
            <input className="field" value={inlineAlt} onChange={(event) => setInlineAlt(event.target.value)} placeholder="Text alternatiu" />
            <input ref={inlineInputRef} className="field" type="file" accept="image/jpeg,image/png,image/webp" />
            <button
              type="button"
              className="flex w-fit items-center gap-2 rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal/90"
              onClick={() => upload("inline", inlineInputRef.current?.files?.[0], inlineAlt)}
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Pujar imatge
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {inlineImages.map((attachment) => (
              <InlineImageRow
                key={attachment.id}
                attachment={attachment}
                onInsert={() => onInsert(markdownFor(attachment))}
                onUpdate={update}
                onRemove={remove}
              />
            ))}
          </div>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-md border border-line bg-slate-50 p-3 text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}

function InlineImageRow({
  attachment,
  onInsert,
  onUpdate,
  onRemove
}: {
  attachment: Attachment;
  onInsert: () => void;
  onUpdate: (attachment: Attachment, file: File | undefined, altText: string) => void;
  onRemove: (attachment: Attachment) => void;
}) {
  const [altText, setAltText] = useState(attachment.altText ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-[120px_1fr]">
      <img src={attachment.url} alt={attachment.altText || ""} className="h-24 w-full rounded-md object-cover" />
      <div className="space-y-2">
        <p className="text-sm text-slate-700">{attachment.originalName || attachment.filename}</p>
        <p className="text-xs text-slate-500">{formatBytes(attachment.sizeBytes)}</p>
        <input className="field" value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Text alternatiu" />
        <input ref={fileRef} className="field" type="file" accept="image/jpeg,image/png,image/webp" />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-md border border-line px-3 py-2 text-sm hover:border-teal" onClick={onInsert}>
            Inserir al Markdown
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:border-teal"
            onClick={() => onUpdate(attachment, fileRef.current?.files?.[0], altText)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Substituir
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-brick px-3 py-2 text-sm text-brick hover:bg-brick hover:text-white"
            onClick={() => onRemove(attachment)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
