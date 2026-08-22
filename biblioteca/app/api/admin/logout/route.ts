import { NextResponse } from "next/server";
import { destroySession, getCsrfToken } from "@/lib/biblioteca/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  if (String(formData.get("csrfToken") ?? "") !== getCsrfToken()) {
    return new NextResponse("CSRF token invalid", { status: 403 });
  }

  await destroySession();
  return NextResponse.redirect(new URL("/biblioteca/admin/login", request.url), 303);
}
