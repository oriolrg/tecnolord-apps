"use client";

import { useMemo, useRef, useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { ImageManager } from "./image-manager";
import { MarkdownView } from "./markdown-view";
import type { ArticleWithRelations } from "@/lib/biblioteca/repository";

type Props = {
  article?: ArticleWithRelations;
  csrfToken: string;
};

type EditableSource = {
  title: string;
  url: string;
  note: string;
};

const defaultMarkdown = `## Objectiu\n\nEscriu aqui el contingut principal.\n\n## Passos\n\n- Primer punt\n- Segon punt\n\n## Fonts\n\nAfegeix les fonts al formulari lateral.`;

function dateInput(value?: Date | null) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export function ArticleForm({ article, csrfToken }: Props) {
  const [content, setContent] = useState(article?.contentMarkdown ?? defaultMarkdown);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [sources, setSources] = useState<EditableSource[]>(
    article?.sources.length
      ? article.sources.map((source) => ({
          title: source.title,
          url: source.url ?? "",
          note: source.note ?? ""
        }))
      : [
          {
            title: "",
            url: "",
            note: ""
          }
        ]
  );
  const endpoint = article ? `/biblioteca/api/admin/articles/${article.id}` : "/biblioteca/api/admin/articles";
  const method = article ? "PUT" : "POST";
  const [message, setMessage] = useState("");

  const initialTags = useMemo(() => article?.tags.map(({ tag }) => tag.name).join(", ") ?? "", [article]);
  const initialKeywords = article?.keywords.join(", ") ?? "";

  async function submit(formData: FormData) {
    setMessage("Desant...");
    const payload = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      contentMarkdown: content,
      status: String(formData.get("status") ?? "draft"),
      topicName: String(formData.get("topicName") ?? ""),
      tags: String(formData.get("tags") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      keywords: String(formData.get("keywords") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      sources,
      createdWithAi: formData.get("createdWithAi") === "on",
      verificationStatus: String(formData.get("verificationStatus") ?? "pending"),
      scope: String(formData.get("scope") ?? "notes"),
      reviewedAt: String(formData.get("reviewedAt") ?? ""),
      publishedAt: String(formData.get("publishedAt") ?? "")
    };

    const response = await fetch(endpoint, {
      method,
      headers: {
        "content-type": "application/json",
        "x-csrf-token": csrfToken
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setMessage("No s'ha pogut desar. Revisa els camps.");
      return;
    }

    const data = (await response.json()) as { id: string };
    setMessage("Desat.");
    if (!article) {
      window.location.href = `/biblioteca/admin/articles/${data.id}`;
    }
  }

  async function remove() {
    if (!article || !confirm("Eliminar aquest article definitivament?")) return;
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: { "x-csrf-token": csrfToken }
    });
    if (response.ok) window.location.href = "/biblioteca/admin";
  }

  function insertMarkdownAtCursor(markdown: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((current) => `${current}\n\n${markdown}\n`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n\n";
    const suffix = after.startsWith("\n") || after.length === 0 ? "" : "\n\n";
    const nextContent = `${before}${prefix}${markdown}${suffix}${after}`;
    const nextCursor = before.length + prefix.length + markdown.length;

    setContent(nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,42%)]">
      <form action={submit} className="space-y-4">
        <div className="rounded-md border border-line bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="label">Titol</span>
              <input className="field" name="title" defaultValue={article?.title} required />
            </label>
            <label className="space-y-1">
              <span className="label">Slug</span>
              <input className="field" name="slug" defaultValue={article?.slug} placeholder="automatic si queda buit" />
            </label>
            <label className="space-y-1">
              <span className="label">Tema principal</span>
              <input className="field" name="topicName" defaultValue={article?.topic.name} required />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="label">Resum</span>
              <textarea className="field min-h-24" name="summary" defaultValue={article?.summary} required />
            </label>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-sm">
          <label className="space-y-1">
            <span className="label">Markdown</span>
            <textarea
              ref={textareaRef}
              className="field min-h-[460px] font-mono text-sm"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
        </div>

        {article ? (
          <ImageManager
            articleId={article.id}
            csrfToken={csrfToken}
            initialAttachments={article.attachments}
            content={content}
            onInsert={insertMarkdownAtCursor}
            onContentChange={setContent}
          />
        ) : null}

        <div className="rounded-md border border-line bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="label">Estat</span>
              <select className="field" name="status" defaultValue={article?.status ?? "draft"}>
                <option value="draft">Esborrany</option>
                <option value="published">Publicat</option>
                <option value="archived">Arxivat</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="label">Verificacio</span>
              <select className="field" name="verificationStatus" defaultValue={article?.verificationStatus ?? "pending"}>
                <option value="pending">Pendent</option>
                <option value="reviewed">Revisat</option>
                <option value="verified">Contrastat</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="label">Ambit</span>
              <select className="field" name="scope" defaultValue={article?.scope ?? "notes"}>
                <option value="notes">Apunts</option>
                <option value="tutorial">Tutorial</option>
                <option value="project">Projecte</option>
                <option value="regulation">Normativa</option>
                <option value="opinion">Opinio</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="label">Publicacio</span>
              <input className="field" type="date" name="publishedAt" defaultValue={dateInput(article?.publishedAt)} />
            </label>
            <label className="space-y-1">
              <span className="label">Revisio</span>
              <input className="field" type="date" name="reviewedAt" defaultValue={dateInput(article?.reviewedAt)} />
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
              <input type="checkbox" name="createdWithAi" defaultChecked={article?.createdWithAi} />
              Contingut elaborat o assistit amb IA
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="label">Etiquetes</span>
              <input className="field" name="tags" defaultValue={initialTags} placeholder="linux, ciberseguretat" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="label">Paraules clau</span>
              <input className="field" name="keywords" defaultValue={initialKeywords} placeholder="paginacio, memoria virtual" />
            </label>
          </div>
        </div>

        <div className="rounded-md border border-line bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Fonts</h2>
            <button
              type="button"
              className="rounded-md border border-line px-3 py-2 text-sm hover:border-teal"
              onClick={() => setSources((items) => [...items, { title: "", url: "", note: "" }])}
            >
              Afegir font
            </button>
          </div>
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div key={index} className="grid gap-2 rounded-md border border-line p-3">
                <input
                  className="field"
                  placeholder="Titol de la font"
                  value={source.title}
                  onChange={(event) =>
                    setSources((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)))
                  }
                />
                <input
                  className="field"
                  placeholder="https://..."
                  value={source.url ?? ""}
                  onChange={(event) =>
                    setSources((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, url: event.target.value } : item)))
                  }
                />
                <input
                  className="field"
                  placeholder="Nota"
                  value={source.note ?? ""}
                  onChange={(event) =>
                    setSources((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, note: event.target.value } : item)))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-md bg-teal px-4 py-2 font-semibold text-white hover:bg-teal/90">
            <Save className="h-4 w-4" aria-hidden="true" />
            Desar
          </button>
          {article ? (
            <button
              type="button"
              onClick={remove}
              className="flex items-center gap-2 rounded-md border border-brick px-4 py-2 font-semibold text-brick hover:bg-brick hover:text-white"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Eliminar
            </button>
          ) : null}
          <span className="text-sm text-slate-600">{message}</span>
        </div>
      </form>

      <aside className="rounded-md border border-line bg-white p-5 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-auto">
        <div className="mb-4 border-b border-line pb-3">
          <p className="label">Previsualitzacio</p>
        </div>
        <MarkdownView content={content} onContentChange={setContent} />
      </aside>
    </div>
  );
}
