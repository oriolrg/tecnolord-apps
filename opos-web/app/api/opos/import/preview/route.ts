import { NextResponse } from "next/server";
import { getOposSettings, previewImportJson } from "@/lib/opos/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = await getOposSettings();
    const preview = await previewImportJson(body.rawText, settings.qualityRequiresExplanation);
    return NextResponse.json(preview, { status: preview.errors.length > 0 ? 400 : 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No s'ha pogut validar el JSON." },
      { status: 400 }
    );
  }
}
