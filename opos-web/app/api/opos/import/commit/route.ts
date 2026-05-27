import { NextResponse } from "next/server";
import { getOposSettings, importQuestionsFromPayload } from "@/lib/opos/repository";
import { validateImportPayload } from "@/lib/opos/import-validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = JSON.parse(body.rawText);
    const settings = await getOposSettings();
    const preview = validateImportPayload(parsed, settings.qualityRequiresExplanation);

    if (!preview.payload || preview.errors.length > 0) {
      return NextResponse.json(
        {
          message: "El fitxer te errors de validacio i no es pot importar.",
          errors: preview.errors,
          warnings: preview.warnings
        },
        { status: 400 }
      );
    }

    const batch = await importQuestionsFromPayload({
      filename: body.filename || "import.json",
      payload: preview.payload,
      allowUpdates: Boolean(body.allowUpdates)
    });

    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Importacio fallida." },
      { status: 400 }
    );
  }
}
