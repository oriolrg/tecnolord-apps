import { NextResponse } from "next/server";
import { finalizeTestSession } from "@/lib/opos/repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const result = await finalizeTestSession(params.id, body.answers ?? [], Boolean(body.abandon));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No s'ha pogut tancar la sessio." },
      { status: 400 }
    );
  }
}
