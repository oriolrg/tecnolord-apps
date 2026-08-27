import { NextResponse } from "next/server";
import {
  destroySession,
  getCsrfToken,
  requireAdminApi,
} from "@/lib/biblioteca/auth";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;

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

  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: "/biblioteca/admin/login"
    }
  });
}
