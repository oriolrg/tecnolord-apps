import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import { NextResponse } from "next/server";
import { authorizeAdmin } from "./authorization";
import { prisma } from "./db";

const SESSION_COOKIE = "biblioteca_session";
const CSRF_COOKIE = "biblioteca_csrf";
const SESSION_DAYS = 14;
const COOKIE_PATH = "/biblioteca";

export function hashSessionTokenForStorage(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: COOKIE_PATH,
    expires
  };
}

export function getCsrfCookieOptions(expires: Date) {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: COOKIE_PATH,
    expires
  };
}

export function verifyPassword(password: string, hash: string) {
  return argon2.verify(hash, password);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const csrf = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash: hashSessionTokenForStorage(token),
      userId,
      expiresAt
    }
  });

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, token, getSessionCookieOptions(expiresAt));
  cookieStore.set(CSRF_COOKIE, csrf, getCsrfCookieOptions(expiresAt));

  return { token, csrf, expiresAt };
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashSessionTokenForStorage(token) } });
  }
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, "", getSessionCookieOptions(new Date(0)));
  cookieStore.set(CSRF_COOKIE, "", getCsrfCookieOptions(new Date(0)));
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionTokenForStorage(token) },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date() || session.user.status !== "active") {
    return null;
  }

  return session.user;
}

export function isAdminUser(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  return authorizeAdmin(user).ok;
}

export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isAdminUser(user)) {
    redirect("/admin/forbidden");
  }
  return user;
}

export type AdminApiResult =
  | { ok: true; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>> }
  | { ok: false; response: NextResponse };

export async function requireAdminApi(): Promise<AdminApiResult> {
  const user = await getCurrentUser();
  const authorization = authorizeAdmin(user);

  if (!authorization.ok) {
    return {
      ok: false,
      response: NextResponse.json({ error: authorization.error }, { status: authorization.status })
    };
  }

  return { ok: true, user: user! };
}

export function getCsrfToken() {
  return cookies().get(CSRF_COOKIE)?.value ?? "";
}

export function assertCsrf(request: Request) {
  const cookieToken = cookies().get(CSRF_COOKIE)?.value ?? "";
  const headerToken = request.headers.get("x-csrf-token") ?? "";
  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    !cookieToken ||
    !headerToken ||
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    throw new Error("CSRF token invalid");
  }
}
