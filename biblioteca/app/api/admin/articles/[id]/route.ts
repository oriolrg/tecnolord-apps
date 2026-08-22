import { NextResponse } from "next/server";
import { assertCsrf, requireAdmin } from "@/lib/biblioteca/auth";
import { deleteArticle, updateArticle } from "@/lib/biblioteca/repository";
import { articleSchema, normalizeArticleInput } from "@/lib/biblioteca/validation";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    assertCsrf(request);
    await requireAdmin();
    const json = await request.json();
    const input = normalizeArticleInput(articleSchema.parse(json));
    await updateArticle(params.id, input);

    return NextResponse.json({ id: params.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    assertCsrf(request);
    await requireAdmin();
    await deleteArticle(params.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
