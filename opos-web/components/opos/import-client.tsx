"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileJson, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PreviewResponse {
  payload: {
    metadata?: Record<string, string>;
    questions: Array<{
      id: string;
      topicNumber: number;
      topicTitle: string;
      section: string;
      status?: string;
    }>;
  } | null;
  errors: Array<{ externalId: string; message: string; level: string }>;
  warnings: Array<{ externalId: string; message: string; level: string }>;
  existingIds: string[];
  creatableIds: string[];
}

export function ImportClient() {
  const router = useRouter();
  const [filename, setFilename] = useState("");
  const [rawText, setRawText] = useState("");
  const [allowUpdates, setAllowUpdates] = useState(true);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasBlockingErrors = useMemo(() => Boolean(preview && preview.errors.length > 0), [preview]);

  async function loadFile(file: File) {
    setFilename(file.name);
    setRawText(await file.text());
    setPreview(null);
    setMessage(null);
  }

  async function requestPreview() {
    setMessage(null);
    const response = await fetch("/api/opos/import/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, rawText })
    });
    const data = await response.json();
    setPreview(data);
    if (!response.ok) {
      setMessage(data.message ?? "No s'ha pogut validar el fitxer.");
    }
  }

  async function confirmImport() {
    startTransition(async () => {
      setMessage(null);
      const response = await fetch("/api/opos/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, rawText, allowUpdates })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "La importacio ha fallat.");
        return;
      }
      setMessage(`Importacio completada: ${data.createdCount} creades, ${data.updatedCount} actualitzades, ${data.skippedCount} ignorades.`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <FileJson className="mx-auto text-pine" size={28} />
          <p className="mt-3 text-sm text-slate-600">Arrossega un JSON o selecciona'l des del disc.</p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
            <Upload size={16} />
            Seleccionar fitxer
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void loadFile(file);
                }
              }}
            />
          </label>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Nom del fitxer</label>
          <input className="input mt-2" value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="preguntes.json" />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Contingut JSON</label>
          <textarea
            className="mt-2 min-h-[280px] w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder='{"questions":[...]}'
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={allowUpdates} onChange={(event) => setAllowUpdates(event.target.checked)} />
          Permetre actualitzar preguntes ja existents
        </label>

        <div className="flex gap-3">
          <Button onClick={() => void requestPreview()} disabled={!rawText.trim()}>
            Validar i previsualitzar
          </Button>
          <Button variant="secondary" onClick={() => void confirmImport()} disabled={!preview || hasBlockingErrors || isPending}>
            Confirmar importacio
          </Button>
        </div>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-pine">Previsualitzacio</p>
            <h2 className="mt-2 text-2xl font-semibold">Resultat de la validacio</h2>
          </div>
          {preview?.payload ? <CheckCircle2 className="text-emerald-600" size={24} /> : <AlertTriangle className="text-amber-600" size={24} />}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Noves</p>
            <p className="mt-2 text-3xl font-semibold">{preview?.creatableIds.length ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Existents</p>
            <p className="mt-2 text-3xl font-semibold">{preview?.existingIds.length ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Errors</p>
            <p className="mt-2 text-3xl font-semibold">{preview?.errors.length ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Avisos</p>
            <p className="mt-2 text-3xl font-semibold">{preview?.warnings.length ?? 0}</p>
          </div>
        </div>

        <div className="space-y-3">
          {(preview?.errors ?? []).map((item) => (
            <div key={`${item.externalId}-${item.message}`} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <strong>{item.externalId}</strong>: {item.message}
            </div>
          ))}
          {(preview?.warnings ?? []).map((item) => (
            <div key={`${item.externalId}-${item.message}`} className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <strong>{item.externalId}</strong>: {item.message}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {(preview?.payload?.questions ?? []).slice(0, 8).map((question) => (
            <div key={question.id} className="rounded-2xl border border-slate-200 p-3">
              <p className="text-sm font-semibold text-ink">{question.id}</p>
              <p className="mt-1 text-sm text-slate-600">
                Tema {question.topicNumber} · {question.topicTitle} · {question.section}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
