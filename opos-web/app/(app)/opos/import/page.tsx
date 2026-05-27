import { SectionHeader } from "@/components/opos/section-header";
import { ImportClient } from "@/components/opos/import-client";
import { getImportHistory } from "@/lib/opos/repository";

export default async function OposImportPage() {
  const history = await getImportHistory();

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Importacio"
        title="Carrega preguntes JSON"
        description="Validacio amb Zod, previsualitzacio abans d'escriure a SQLite i historial de lots importats."
      />
      <ImportClient />
      <section className="rounded-[28px] border border-white/60 bg-white/90 p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-pine">Ultimes importacions</p>
        <div className="mt-4 space-y-3">
          {history.slice(0, 5).map((batch) => (
            <div key={batch.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-ink">{batch.filename}</p>
              <p className="mt-1 text-sm text-slate-600">
                {batch.createdCount} creades · {batch.updatedCount} actualitzades · {batch.errorCount} errors
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
