import { revalidatePath } from "next/cache";
import { SectionHeader } from "@/components/opos/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getImportHistory, revertImportBatch } from "@/lib/opos/repository";

export default async function OposImportsPage() {
  const batches = await getImportHistory();

  async function revertBatch(formData: FormData) {
    "use server";
    const batchId = String(formData.get("batchId"));
    await revertImportBatch(batchId);
    revalidatePath("/opos/imports");
    revalidatePath("/opos/questions");
    revalidatePath("/opos");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Historial"
        title="Importacions registrades"
        description="Cada lot conserva resum, avisos i els canvis fets. Es pot revertir un lot recent si cal desfer creacions o actualitzacions."
      />

      <div className="grid gap-4">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{batch.filename}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {new Date(batch.importedAt).toLocaleString("ca-ES")} · {batch.totalQuestionsDetected} detectades
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {batch.createdCount} creades · {batch.updatedCount} actualitzades · {batch.skippedCount} ignorades · {batch.errorCount} errors
                </p>
              </div>
              <form action={revertBatch}>
                <input type="hidden" name="batchId" value={batch.id} />
                <Button variant="secondary" disabled={Boolean(batch.revertedAt)}>
                  {batch.revertedAt ? "Ja revertida" : "Revertir lot"}
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
