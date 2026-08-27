import { NextResponse } from "next/server";
import { assertCsrf, requireAdminApi } from "@/lib/biblioteca/auth";
import { createArticle } from "@/lib/biblioteca/repository";
import { articleSchema, normalizeArticleInput } from "@/lib/biblioteca/validation";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;
    assertCsrf(request);
    const json = await request.json();
    const input = normalizeArticleInput(articleSchema.parse(json));
    const article = await createArticle(input, admin.user.id);

    return NextResponse.json({ id: article.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
}
