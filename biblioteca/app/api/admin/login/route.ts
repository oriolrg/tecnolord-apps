import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/biblioteca/auth";
import { prisma } from "@/lib/biblioteca/db";

const attempts = new Map<string, { count: number; resetAt: number }>();

function canTry(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= 8;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const key = `${request.headers.get("x-forwarded-for") ?? "local"}:${email}`;

  if (!canTry(key)) {
    return NextResponse.redirect(new URL("/biblioteca/admin/login?error=rate", request.url), 303);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "active" || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/biblioteca/admin/login?error=1", request.url), 303);
  }

  attempts.delete(key);
  await createSession(user.id);
  return NextResponse.redirect(new URL("/biblioteca/admin", request.url), 303);
}
