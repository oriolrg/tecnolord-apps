"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { Plus, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { catalogKindLabels, sessionTypeLabels, trackingFieldLabels } from "@/lib/domain/labels";
import { loadCatalog, upsertCatalogItem } from "@/lib/domain/services/catalog-storage";
import type { CatalogItem, CatalogItemKind, SessionType, TrackingField } from "@/lib/domain/types/training";
import { sessionTypes } from "@/lib/domain/types/training";

const trackingFieldOptions: TrackingField[] = [
  "sets",
  "reps",
  "weightKg",
  "rpe",
  "durationMin",
  "distanceKm",
  "elevationGainM",
  "poolMeters",
  "avgHeartRate",
  "maxHeartRate",
  "avgPower",
  "calories",
  "pace"
];

const emptyItem: CatalogItem = {
  slug: "",
  kind: "exercise",
  sessionType: "strength",
  name: "",
  description: "",
  muscleGroup: "",
  equipment: [],
  technicalCues: [],
  commonErrors: [],
  mediaUrl: "/images/exercises/placeholder.svg",
  trackingFields: ["sets", "reps", "weightKg", "rpe"]
};

export function CatalogManager() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [draft, setDraft] = useState<CatalogItem>(emptyItem);

  useEffect(() => {
    const sync = () => setItems(loadCatalog());
    sync();
    window.addEventListener("catalog-updated", sync as EventListener);
    return () => window.removeEventListener("catalog-updated", sync as EventListener);
  }, []);

  function saveItem() {
    const slug = draft.slug.trim() || slugify(draft.name);
    if (!slug || !draft.name.trim()) {
      return;
    }

    upsertCatalogItem({
      ...draft,
      slug,
      equipment: splitList(Array.isArray(draft.equipment) ? draft.equipment.join(", ") : String(draft.equipment ?? "")),
      technicalCues: splitList(
        Array.isArray(draft.technicalCues) ? draft.technicalCues.join(", ") : String(draft.technicalCues ?? "")
      ),
      commonErrors: splitList(
        Array.isArray(draft.commonErrors) ? draft.commonErrors.join(", ") : String(draft.commonErrors ?? "")
      )
    });

    setDraft(emptyItem);
    setItems(loadCatalog());
  }

  function editItem(item: CatalogItem) {
    setDraft(item);
  }

  async function handleImageUpload(file?: File) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        mediaUrl: typeof reader.result === "string" ? reader.result : current.mediaUrl
      }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-pine">Cataleg editable</p>
            <h2 className="mt-3 text-3xl font-semibold">Exercicis i activitats</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pots crear exercicis de gimnas i plantilles de activitat com piscina, BTT, bici carretera, gravel o trail.
            </p>
          </div>
          <Button variant="secondary" className="gap-2" onClick={() => setDraft(emptyItem)}>
            <Plus size={16} />
            Nou element
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">Editor</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Nom">
            <input className="input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </Field>
          <Field label="Slug">
            <input className="input" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
          </Field>
          <Field label="Tipus element">
            <select
              className="input"
              value={draft.kind}
              onChange={(event) => setDraft({ ...draft, kind: event.target.value as CatalogItemKind })}
            >
              <option value="exercise">{catalogKindLabels.exercise}</option>
              <option value="activity">{catalogKindLabels.activity}</option>
            </select>
          </Field>
          <Field label="Disciplina">
            <select
              className="input"
              value={draft.sessionType}
              onChange={(event) => setDraft({ ...draft, sessionType: event.target.value as SessionType })}
            >
              {sessionTypes.map((sessionType) => (
                <option key={sessionType} value={sessionType}>
                  {sessionTypeLabels[sessionType]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Grup muscular">
            <input
              className="input"
              value={draft.muscleGroup ?? ""}
              onChange={(event) => setDraft({ ...draft, muscleGroup: event.target.value })}
            />
          </Field>
          <Field label="Imatge URL">
            <input
              className="input"
              value={draft.mediaUrl ?? ""}
              onChange={(event) => setDraft({ ...draft, mediaUrl: event.target.value })}
            />
          </Field>
        </div>

        <Field label="Pujar foto" className="mt-4">
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(event) => handleImageUpload(event.target.files?.[0])}
          />
        </Field>

        <Field label="Descripcio" className="mt-4">
          <textarea className="input min-h-24" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        </Field>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Field label="Material coma separada">
            <input
              className="input"
              value={Array.isArray(draft.equipment) ? draft.equipment.join(", ") : String(draft.equipment ?? "")}
              onChange={(event) => setDraft({ ...draft, equipment: event.target.value as unknown as string[] })}
            />
          </Field>
          <Field label="Indicacions coma separada">
            <input
              className="input"
              value={Array.isArray(draft.technicalCues) ? draft.technicalCues.join(", ") : String(draft.technicalCues ?? "")}
              onChange={(event) => setDraft({ ...draft, technicalCues: event.target.value as unknown as string[] })}
            />
          </Field>
          <Field label="Errors comuns coma separada">
            <input
              className="input"
              value={Array.isArray(draft.commonErrors) ? draft.commonErrors.join(", ") : String(draft.commonErrors ?? "")}
              onChange={(event) => setDraft({ ...draft, commonErrors: event.target.value as unknown as string[] })}
            />
          </Field>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-700">Camps registrables</p>
          <div className="flex flex-wrap gap-2">
            {trackingFieldOptions.map((field) => {
              const selected = draft.trackingFields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm ${selected ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      trackingFields: selected
                        ? draft.trackingFields.filter((item) => item !== field)
                        : [...draft.trackingFields, field]
                    })
                  }
                >
                  {trackingFieldLabels[field]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <Button className="gap-2" onClick={saveItem}>
            <Save size={16} />
            Desar element
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <Card key={item.slug} className="overflow-hidden p-0">
            <Image
              src={item.mediaUrl || "/images/exercises/placeholder.svg"}
              alt={item.name}
              width={640}
              height={360}
              className="h-44 w-full object-cover"
            />
            <div className="space-y-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-pine">
                    {catalogKindLabels[item.kind]} - {sessionTypeLabels[item.sessionType]}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{item.name}</h3>
                </div>
                <Button variant="ghost" onClick={() => editItem(item)}>
                  Editar
                </Button>
              </div>
              <p className="text-sm text-slate-600">{item.description}</p>
              <p className="text-sm text-slate-500">
                Seguiment: {item.trackingFields.map((field) => trackingFieldLabels[field]).join(", ")}
              </p>
            </div>
          </Card>
        ))}
      </div>
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

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
