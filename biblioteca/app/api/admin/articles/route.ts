import { NextResponse } from "next/server";
import { assertCsrf, requireAdmin } from "@/lib/biblioteca/auth";
import { createArticle } from "@/lib/biblioteca/repository";
import { articleSchema, normalizeArticleInput } from "@/lib/biblioteca/validation";

export async function POST(request: Request) {
  try {
    assertCsrf(request);
    const user = await requireAdmin();
    const json = await request.json();
    const input = normalizeArticleInput(articleSchema.parse(json));
    const article = await createArticle(input, user.id);

    return NextResponse.json({ id: article.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
