"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { TrainingSessionLogger } from "@/components/forms/training-session-logger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { catalogKindLabels, sessionStatusLabels, sessionTypeLabels } from "@/lib/domain/labels";
import { loadCatalog } from "@/lib/domain/services/catalog-storage";
import { findPlannedSessionByDate, loadTrainingPlan, upsertPlannedSession } from "@/lib/domain/services/plan-storage";
import type { CatalogItem, PlannedSession, SessionStatus, SessionType } from "@/lib/domain/types/training";
import { sessionStatuses, sessionTypes } from "@/lib/domain/types/training";

interface SessionEditorDraft {
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
  blocks: PlannedSession["blocks"];
}

export function DaySessionClient({
  date,
  fallbackSession
}: {
  date: string;
  fallbackSession?: PlannedSession;
}) {
  const [session, setSession] = useState<PlannedSession | undefined>(fallbackSession);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCatalogSlug, setSelectedCatalogSlug] = useState("");
  const [draft, setDraft] = useState<SessionEditorDraft | null>(null);

  useEffect(() => {
    const sync = () => {
      setSession(findPlannedSessionByDate(date) ?? fallbackSession);
      setCatalog(loadCatalog());
    };
    sync();
    window.addEventListener("training-plan-updated", sync as EventListener);
    window.addEventListener("day-log-updated", sync as EventListener);
    window.addEventListener("catalog-updated", sync as EventListener);
    return () => {
      window.removeEventListener("training-plan-updated", sync as EventListener);
      window.removeEventListener("day-log-updated", sync as EventListener);
      window.removeEventListener("catalog-updated", sync as EventListener);
    };
  }, [date, fallbackSession]);

  useEffect(() => {
    if (session) {
      setDraft(toDraft(session));
    }
  }, [session]);

  const selectableCatalog = useMemo(
    () => catalog.filter((item) => item.kind === "exercise" || item.kind === "activity"),
    [catalog]
  );

  if (!session || !draft) {
    const plan = loadTrainingPlan();
    return (
      <Card>
        <h2 className="text-2xl font-semibold">No hi ha sessio per a aquest dia</h2>
        <p className="mt-3 text-sm text-slate-600">
          Crea el dia des del calendari o importa un nou pla JSON. Pla actiu: {plan.metadata.name}
        </p>
      </Card>
    );
  }

  function saveSessionChanges() {
    if (!draft || !session) {
      return;
    }

    const nextSession: PlannedSession = {
      id: draft.id,
      date: draft.date,
      title: draft.title,
      type: draft.type,
      status: draft.status,
      plannedDurationMin: toOptionalNumber(draft.plannedDurationMin),
      plannedDurationMax: toOptionalNumber(draft.plannedDurationMax),
      plannedRpe: toOptionalNumber(draft.plannedRpe),
      plannedZone: draft.plannedZone || undefined,
      goal: draft.goal || undefined,
      notes: draft.notes || undefined,
      tags: session.tags ?? [],
      alternatives: session.alternatives ?? [],
      blocks: draft.blocks
    };

    upsertPlannedSession(nextSession);
    setSession(nextSession);
    setDraft(toDraft(nextSession));
    setIsEditing(false);
  }

  function addCatalogItemToSession() {
    if (!draft) {
      return;
    }

    const item = selectableCatalog.find((entry) => entry.slug === selectedCatalogSlug);
    if (!item) {
      return;
    }

    const newBlock =
      item.kind === "exercise"
        ? {
            id: `${draft.date}-${item.slug}-${draft.blocks.length + 1}`,
            title: item.name,
            blockType: "strength" as const,
            exercises: [
              {
                exerciseSlug: item.slug,
                sets: 3,
                reps: "8",
                rpe: 6
              }
            ]
          }
        : {
            id: `${draft.date}-${item.slug}-${draft.blocks.length + 1}`,
            title: item.name,
            blockType: "cardio" as const,
            activity: {
              discipline: item.sessionType,
              durationMin: toOptionalNumber(draft.plannedDurationMin) ?? 45,
              durationMax: toOptionalNumber(draft.plannedDurationMax) ?? undefined,
              zone: draft.plannedZone || undefined,
              notes: item.description
            }
          };

    setDraft((current) =>
      current
        ? {
            ...current,
            blocks: [...current.blocks, newBlock]
          }
        : current
    );
    setSelectedCatalogSlug("");
  }

  function removeBlock(blockId: string) {
    setDraft((current) =>
      current
        ? {
            ...current,
            blocks: current.blocks.filter((block) => block.id !== blockId)
          }
        : current
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-pine">{session.date}</p>
            <h2 className="mt-2 text-3xl font-semibold">{session.title}</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              {session.notes ?? session.goal ?? "Sense notes addicionals."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={sessionStatusLabels[session.status]} tone={session.status} />
            <Badge label={sessionTypeLabels[session.type]} tone={session.type} />
            <Button variant="secondary" className="gap-2" onClick={() => setIsEditing((value) => !value)}>
              <Pencil size={16} />
              {isEditing ? "Tancar edicio" : "Editar dia"}
            </Button>
          </div>
        </div>
      </Card>

      {isEditing ? (
        <Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <Field label="Zona">
              <input className="input" value={draft.plannedZone} onChange={(event) => setDraft({ ...draft, plannedZone: event.target.value })} />
            </Field>
            <Field label="Durada min">
              <input className="input" type="number" value={draft.plannedDurationMin} onChange={(event) => setDraft({ ...draft, plannedDurationMin: event.target.value })} />
            </Field>
            <Field label="Durada max">
              <input className="input" type="number" value={draft.plannedDurationMax} onChange={(event) => setDraft({ ...draft, plannedDurationMax: event.target.value })} />
            </Field>
            <Field label="RPE previst">
              <input className="input" type="number" value={draft.plannedRpe} onChange={(event) => setDraft({ ...draft, plannedRpe: event.target.value })} />
            </Field>
          </div>
          <Field label="Objectiu" className="mt-4">
            <input className="input" value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} />
          </Field>
          <Field label="Notes" className="mt-4">
            <textarea className="input min-h-24" value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          </Field>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Afegir des de la biblioteca" className="flex-1">
                <select className="input" value={selectedCatalogSlug} onChange={(event) => setSelectedCatalogSlug(event.target.value)}>
                  <option value="">Selecciona un exercici o activitat</option>
                  {selectableCatalog.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name} · {catalogKindLabels[item.kind]} · {sessionTypeLabels[item.sessionType]}
                    </option>
                  ))}
                </select>
              </Field>
              <Button className="gap-2" onClick={addCatalogItemToSession}>
                <Plus size={16} />
                Afegir bloc
              </Button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {draft.blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{block.blockType}</p>
                  <p className="font-semibold">{block.title}</p>
                </div>
                <Button variant="ghost" className="gap-2" onClick={() => removeBlock(block.id)}>
                  <Trash2 size={16} />
                  Treure
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Button className="gap-2" onClick={saveSessionChanges}>
              <Save size={16} />
              Desar canvis del dia
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <h3 className="text-xl font-semibold">Blocs de la sessio</h3>
          <div className="mt-5 space-y-4">
            {session.blocks.map((block) => (
              <div key={block.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{block.blockType}</p>
                <h4 className="mt-1 text-lg font-semibold">{block.title}</h4>
                {block.exercises ? (
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {block.exercises.map((exercise) => (
                      <li key={exercise.exerciseSlug}>
                        {exercise.exerciseSlug}: {exercise.sets} x {exercise.reps}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {block.activity ? (
                  <p className="mt-3 text-sm text-slate-600">
                    {sessionTypeLabels[block.activity.discipline]} - {block.activity.durationMin}
                    {block.activity.durationMax ? `-${block.activity.durationMax}` : ""} min
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-semibold">Alternatives previstes</h3>
            <div className="mt-5 space-y-4">
              {session.alternatives?.length ? (
                session.alternatives.map((alternative) => (
                  <div key={alternative.label} className="rounded-2xl bg-sand p-4">
                    <p className="text-sm font-semibold">{alternative.label}</p>
                    <p className="mt-2 text-sm text-slate-700">{alternative.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No hi ha alternatives definides.</p>
              )}
            </div>
          </Card>

          <TrainingSessionLogger session={session} />
        </div>
      </div>
    </div>
  );
}

function toDraft(session: PlannedSession): SessionEditorDraft {
  return {
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
    notes: session.notes ?? "",
    blocks: session.blocks
  };
}

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function toOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
