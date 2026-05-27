"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { CheckCircle2, Save, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sessionStatusLabels, sessionTypeLabels } from "@/lib/domain/labels";
import { createInitialDayLog, loadDayLog, saveDayLog } from "@/lib/domain/services/day-log-storage";
import type {
  ActivityLogEntry,
  DailyWorkoutEntry,
  ExerciseLogEntry,
  ImportedActivityRecord,
  PlannedSession,
  SessionStatus
} from "@/lib/domain/types/training";
import { sessionStatuses } from "@/lib/domain/types/training";
import { parseImportedActivities } from "@/lib/providers";

export function TrainingSessionLogger({ session }: { session: PlannedSession }) {
  const [entry, setEntry] = useState<DailyWorkoutEntry>(() => createInitialDayLog(session));
  const [saveMessage, setSaveMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [importTarget, setImportTarget] = useState("session");

  useEffect(() => {
    setEntry(loadDayLog(session));
  }, [session]);

  const summary = useMemo(
    () => ({
      completedExercises: entry.exerciseLogs.filter((item) => item.done).length,
      totalExercises: entry.exerciseLogs.length,
      completedActivities: entry.activityLogs.filter((item) => item.done).length,
      totalActivities: entry.activityLogs.length
    }),
    [entry]
  );

  function updateTopLevel<K extends keyof DailyWorkoutEntry>(field: K, value: DailyWorkoutEntry[K]) {
    setEntry((current) => ({ ...current, [field]: value }));
  }

  function updateExercise(index: number, updates: Partial<ExerciseLogEntry>) {
    setEntry((current) => ({
      ...current,
      exerciseLogs: current.exerciseLogs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      )
    }));
  }

  function updateActivity(index: number, updates: Partial<ActivityLogEntry>) {
    setEntry((current) => ({
      ...current,
      activityLogs: current.activityLogs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      )
    }));
  }

  function persistEntry() {
    const nextEntry = {
      ...entry,
      updatedAt: new Date().toISOString()
    };

    saveDayLog(nextEntry);
    setEntry(nextEntry);
    setSaveMessage(
      `Desat localment a les ${new Date(nextEntry.updatedAt).toLocaleTimeString("ca-ES", {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    );
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportError("");

    try {
      const content = await file.text();
      const records = parseImportedActivities({
        content,
        filename: file.name
      })
        .filter((item) => item.date === session.date)
        .map((item) => ({
          ...item,
          linkedTo: importTarget
        }));

      setEntry((current) => applyImportedActivities(current, records));
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "No s'ha pogut llegir el fitxer.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Registre real de la sessio</h3>
            <p className="mt-1 text-sm text-slate-600">
              Marca el que has fet, amb pesos, repeticions, km, desnivell, metres de piscina i sensacions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={`${summary.completedExercises}/${summary.totalExercises} exercicis`} tone="mobility" />
            <Badge label={`${summary.completedActivities}/${summary.totalActivities} activitats`} tone="outdoor" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Estat">
            <select
              className="input"
              value={entry.status}
              onChange={(event) => updateTopLevel("status", event.target.value as SessionStatus)}
            >
              {sessionStatuses.map((status) => (
                <option key={status} value={status}>
                  {sessionStatusLabels[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Temps disponible (min)">
            <input
              className="input"
              type="number"
              value={entry.availableTimeMin ?? ""}
              onChange={(event) => updateTopLevel("availableTimeMin", toOptionalNumber(event.target.value))}
            />
          </Field>
          <Field label="Qualitat del son (1-10)">
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={entry.sleepQuality ?? ""}
              onChange={(event) => updateTopLevel("sleepQuality", toOptionalNumber(event.target.value))}
            />
          </Field>
          <Field label="Fatiga (1-10)">
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={entry.fatigueLevel ?? ""}
              onChange={(event) => updateTopLevel("fatigueLevel", toOptionalNumber(event.target.value))}
            />
          </Field>
          <Field label="Dolor (1-10)">
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={entry.painLevel ?? ""}
              onChange={(event) => updateTopLevel("painLevel", toOptionalNumber(event.target.value))}
            />
          </Field>
          <Field label="Estres (1-10)">
            <input
              className="input"
              type="number"
              min={1}
              max={10}
              value={entry.stressLevel ?? ""}
              onChange={(event) => updateTopLevel("stressLevel", toOptionalNumber(event.target.value))}
            />
          </Field>
        </div>
        <Field label="Notes generals" className="mt-4">
          <textarea
            className="input min-h-28"
            value={entry.notes ?? ""}
            onChange={(event) => updateTopLevel("notes", event.target.value)}
            placeholder="Sensacions, temps real, que ha anat be o malament..."
          />
        </Field>
      </Card>

      {entry.exerciseLogs.length > 0 ? (
        <Card>
          <h3 className="text-xl font-semibold">Gimnas i series</h3>
          <div className="mt-5 space-y-4">
            {entry.exerciseLogs.map((log, index) => (
              <div key={`${log.exerciseSlug}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold capitalize">{formatSlug(log.exerciseSlug)}</p>
                    <p className="text-sm text-slate-500">
                      Previst: {log.plannedSets ?? "-"} x {log.plannedReps ?? "-"}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={log.done}
                      onChange={(event) => updateExercise(index, { done: event.target.checked })}
                    />
                    Fet
                  </label>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Series fetes">
                    <input
                      className="input"
                      type="number"
                      value={log.completedSets ?? ""}
                      onChange={(event) => updateExercise(index, { completedSets: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="Repeticions reals">
                    <input
                      className="input"
                      value={log.completedReps ?? ""}
                      onChange={(event) => updateExercise(index, { completedReps: event.target.value })}
                    />
                  </Field>
                  <Field label="Pes (kg)">
                    <input
                      className="input"
                      type="number"
                      step="0.5"
                      value={log.weightKg ?? ""}
                      onChange={(event) => updateExercise(index, { weightKg: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="RPE real">
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={10}
                      value={log.rpe ?? ""}
                      onChange={(event) => updateExercise(index, { rpe: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                </div>
                <Field label="Notes exercici" className="mt-3">
                  <input
                    className="input"
                    value={log.notes ?? ""}
                    onChange={(event) => updateExercise(index, { notes: event.target.value })}
                    placeholder="Tecnica, molesties, facilitat..."
                  />
                </Field>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {entry.activityLogs.length > 0 ? (
        <Card>
          <h3 className="text-xl font-semibold">Activitats i volum real</h3>
          <div className="mt-5 space-y-4">
            {entry.activityLogs.map((log, index) => (
              <div key={`${log.blockId}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold capitalize">{sessionTypeLabels[log.discipline]}</p>
                    <p className="text-sm text-slate-500">Introdueix el que has fet realment.</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={log.done}
                      onChange={(event) => updateActivity(index, { done: event.target.checked })}
                    />
                    Fet
                  </label>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Durada (min)">
                    <input
                      className="input"
                      type="number"
                      value={log.durationMin ?? ""}
                      onChange={(event) => updateActivity(index, { durationMin: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="Distancia (km)">
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      value={log.distanceKm ?? ""}
                      onChange={(event) => updateActivity(index, { distanceKm: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="Desnivell + (m)">
                    <input
                      className="input"
                      type="number"
                      value={log.elevationGainM ?? ""}
                      onChange={(event) => updateActivity(index, { elevationGainM: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="Piscina (m)">
                    <input
                      className="input"
                      type="number"
                      value={log.poolMeters ?? ""}
                      onChange={(event) => updateActivity(index, { poolMeters: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="FC mitjana">
                    <input
                      className="input"
                      type="number"
                      value={log.avgHeartRate ?? ""}
                      onChange={(event) => updateActivity(index, { avgHeartRate: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="FC maxima">
                    <input
                      className="input"
                      type="number"
                      value={log.maxHeartRate ?? ""}
                      onChange={(event) => updateActivity(index, { maxHeartRate: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="Potencia mitjana">
                    <input
                      className="input"
                      type="number"
                      value={log.avgPower ?? ""}
                      onChange={(event) => updateActivity(index, { avgPower: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                  <Field label="Calories">
                    <input
                      className="input"
                      type="number"
                      value={log.calories ?? ""}
                      onChange={(event) => updateActivity(index, { calories: toOptionalNumber(event.target.value) })}
                    />
                  </Field>
                </div>
                <Field label="Notes activitat" className="mt-3">
                  <input
                    className="input"
                    value={log.notes ?? ""}
                    onChange={(event) => updateActivity(index, { notes: event.target.value })}
                    placeholder="Terreny, tecnica, incidencies..."
                  />
                </Field>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Importar fitxer del rellotge</h3>
            <p className="mt-1 text-sm text-slate-600">
              Pots pujar JSON, CSV o GPX. Si la data coincideix amb aquesta sessio, se aprofiten les dades.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select className="input min-w-52" value={importTarget} onChange={(event) => setImportTarget(event.target.value)}>
              <option value="session">Sessio completa</option>
              {session.blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  Bloc: {block.title}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink">
              <Upload size={16} />
              Carregar fitxer
              <input className="hidden" type="file" accept=".json,.csv,.gpx" onChange={handleImport} />
            </label>
          </div>
        </div>
        {importError ? <p className="mt-4 text-sm text-rose-700">{importError}</p> : null}
        {entry.importedActivities.length > 0 ? (
          <div className="mt-5 space-y-3">
            {entry.importedActivities.map((activity, index) => (
              <div key={`${activity.provider}-${activity.externalId ?? index}`} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold capitalize">
                  {activity.provider} - {activity.activityType}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                  vinculat a: {activity.linkedTo ?? "session"}
                </p>
                <p className="mt-1">
                  {activity.durationMin} min
                  {activity.distanceKm ? ` - ${activity.distanceKm} km` : ""}
                  {activity.elevationGainM ? ` - +${activity.elevationGainM} m` : ""}
                  {activity.avgHeartRate ? ` - ${activity.avgHeartRate} bpm` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button className="gap-2" onClick={persistEntry}>
          <Save size={16} />
          Desar entrenament
        </Button>
        {saveMessage ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 size={16} />
            {saveMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function applyImportedActivities(
  entry: DailyWorkoutEntry,
  records: ImportedActivityRecord[]
): DailyWorkoutEntry {
  if (records.length === 0) {
    return {
      ...entry,
      importedActivities: []
    };
  }

  const firstRecord = records[0];
  const targetId = firstRecord.linkedTo;
  const activityLogs = entry.activityLogs.map((log, index) =>
    (targetId && targetId !== "session" ? log.blockId === targetId : index === 0)
      ? {
          ...log,
          durationMin: firstRecord.durationMin ?? log.durationMin,
          distanceKm: firstRecord.distanceKm ?? log.distanceKm,
          elevationGainM: firstRecord.elevationGainM ?? log.elevationGainM,
          poolMeters: firstRecord.activityType === "swim" ? firstRecord.distanceKm ?? log.poolMeters : log.poolMeters,
          avgPace: firstRecord.avgPace ?? log.avgPace,
          avgPower: firstRecord.avgPower ?? log.avgPower,
          avgHeartRate: firstRecord.avgHeartRate ?? log.avgHeartRate,
          maxHeartRate: firstRecord.maxHeartRate ?? log.maxHeartRate,
          calories: firstRecord.calories ?? log.calories,
          done: true
        }
      : log
  );

  return {
    ...entry,
    status: "completed" as SessionStatus,
    importedActivities: [...entry.importedActivities, ...records],
    activityLogs
  };
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function toOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function formatSlug(value: string) {
  return value.replaceAll("-", " ");
}
