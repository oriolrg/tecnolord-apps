"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FileUp, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sessionStatusLabels, sessionTypeLabels } from "@/lib/domain/labels";
import { importTrainingPlan, loadTrainingPlan, upsertPlannedSession } from "@/lib/domain/services/plan-storage";
import type { PlannedSession, SessionStatus, SessionType, TrainingPlan } from "@/lib/domain/types/training";
import { sessionStatuses, sessionTypes } from "@/lib/domain/types/training";

interface SessionDraft {
  id: string;
  date: string;
  title: string;
  type: SessionType;
  status: SessionStatus;
  plannedDurationMin: string;
  plannedDurationMax: string;
  plannedRpe: string;
  plannedZone: string;
  goal: string;
  notes: string;
}

const emptyDraft: SessionDraft = {
  id: "",
  date: "",
  title: "",
  type: "strength",
  status: "pending",
  plannedDurationMin: "",
  plannedDurationMax: "",
  plannedRpe: "",
  plannedZone: "",
  goal: "",
  notes: ""
};

export function PlanManager() {
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [draft, setDraft] = useState<SessionDraft>(emptyDraft);
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    const sync = () => setPlan(loadTrainingPlan());
    sync();
    window.addEventListener("training-plan-updated", sync as EventListener);
    return () => window.removeEventListener("training-plan-updated", sync as EventListener);
  }, []);

  async function handleImport(file: File) {
    const content = await file.text();
    const nextPlan = importTrainingPlan(content);
    setPlan(nextPlan);
    setImportMessage(`Pla importat: ${nextPlan.metadata.name}`);
  }

  function saveSession() {
    if (!draft.date || !draft.title) {
      return;
    }

    const session: PlannedSession = {
      id: draft.id || `${draft.date}-${slugify(draft.title)}`,
      date: draft.date,
      title: draft.title,
      type: draft.type,
      status: draft.status,
      goal: draft.goal || undefined,
      plannedDurationMin: toOptionalNumber(draft.plannedDurationMin),
      plannedDurationMax: toOptionalNumber(draft.plannedDurationMax),
      plannedRpe: toOptionalNumber(draft.plannedRpe),
      plannedZone: draft.plannedZone || undefined,
      tags: [],
      notes: draft.notes || undefined,
      blocks: [
        {
          id: `${draft.date}-main`,
          title: draft.title,
          blockType: draft.type === "strength" ? "strength" : "cardio",
          activity:
            draft.type === "strength"
              ? undefined
              : {
                  discipline: draft.type,
                  durationMin: toOptionalNumber(draft.plannedDurationMin),
                  durationMax: toOptionalNumber(draft.plannedDurationMax),
                  zone: draft.plannedZone || undefined,
                  notes: draft.notes || undefined
                }
        }
      ],
      alternatives: []
    };

    const nextPlan = upsertPlannedSession(session);
    setPlan(nextPlan);
    setDraft(emptyDraft);
  }

  function loadIntoEditor(session: PlannedSession) {
    setDraft({
      id: session.id,
      date: session.date,
      title: session.title,
      type: session.type,
      status: session.status,
      plannedDurationMin: String(session.plannedDurationMin ?? ""),
      plannedDurationMax: String(session.plannedDurationMax ?? ""),
      plannedRpe: String(session.plannedRpe ?? ""),
      plannedZone: session.plannedZone ?? "",
      goal: session.goal ?? "",
      notes: session.notes ?? ""
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-pine">Pla editable</p>
            <h2 className="mt-3 text-3xl font-semibold">{plan?.metadata.name ?? "Pla actiu"}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pots afegir dies nous, editar sessions existents o carregar un JSON per a un nou periode.
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink">
            <FileUp size={16} />
            Importar JSON
            <input
              className="hidden"
              type="file"
              accept=".json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) {
                  await handleImport(file);
                }
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {importMessage ? <p className="mt-3 text-sm text-emerald-700">{importMessage}</p> : null}
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">Editor de dia</h3>
          <Button variant="secondary" className="gap-2" onClick={() => setDraft(emptyDraft)}>
            <Plus size={16} />
            Nou dia
          </Button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Data">
            <input className="input" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
          </Field>
          <Field label="Titol">
            <input className="input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </Field>
          <Field label="Tipus">
            <select className="input" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as SessionType })}>
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {sessionTypeLabels[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estat">
            <select className="input" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as SessionStatus })}>
              {sessionStatuses.map((status) => (
                <option key={status} value={status}>
                  {sessionStatusLabels[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Durada min">
            <input className="input" type="number" value={draft.plannedDurationMin} onChange={(event) => setDraft({ ...draft, plannedDurationMin: event.target.value })} />
          </Field>
          <Field label="Durada max">
            <input className="input" type="number" value={draft.plannedDurationMax} onChange={(event) => setDraft({ ...draft, plannedDurationMax: event.target.value })} />
          </Field>
          <Field label="RPE">
            <input className="input" type="number" value={draft.plannedRpe} onChange={(event) => setDraft({ ...draft, plannedRpe: event.target.value })} />
          </Field>
          <Field label="Zona">
            <input className="input" value={draft.plannedZone} onChange={(event) => setDraft({ ...draft, plannedZone: event.target.value })} />
          </Field>
        </div>
        <Field label="Objectiu" className="mt-4">
          <input className="input" value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} />
        </Field>
        <Field label="Notes" className="mt-4">
          <textarea className="input min-h-24" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
        </Field>
        <div className="mt-5">
          <Button className="gap-2" onClick={saveSession}>
            <Save size={16} />
            Desar dia
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">Dies actuals</h3>
        <div className="mt-5 space-y-3">
          {plan?.days.map((session) => (
            <button
              key={session.id}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left hover:bg-slate-100"
              onClick={() => loadIntoEditor(session)}
            >
              <span>
                <span className="block text-sm text-slate-500">{session.date}</span>
                <span className="block font-semibold">{session.title}</span>
              </span>
              <span className="text-sm capitalize text-slate-600">{sessionStatusLabels[session.status]}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function toOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
