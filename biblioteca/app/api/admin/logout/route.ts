import { NextResponse } from "next/server";
import {
  destroySession,
  getCsrfToken,
} from "@/lib/biblioteca/auth";

function getPublicOrigin(request: Request) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();

  const host =
    forwardedHost ??
    request.headers.get("host")?.split(",")[0].trim();

  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();

  const protocol =
    forwardedProtocol ??
    new URL(request.url).protocol.replace(":", "");

  if (!host) {
    return new URL(request.url).origin;
  }

  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  if (
    String(formData.get("csrfToken") ?? "") !==
    getCsrfToken()
  ) {
    return new NextResponse("CSRF token invalid", {
      status: 403,
    });
  }

  await destroySession();

  return NextResponse.redirect(
    new URL(
      "/biblioteca/admin/login",
      getPublicOrigin(request)
    ),
    303
  );
}