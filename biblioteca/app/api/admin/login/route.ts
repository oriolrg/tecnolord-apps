import { NextResponse } from "next/server";
import { createSession, isAdminUser, verifyPassword } from "@/lib/biblioteca/auth";
import {
  getRetryAfterSeconds,
  isLoginRateLimited,
  normalizeLoginIdentity,
  recordFailedLoginIdentity,
  runWithLoginIdentityRateLimitLock,
  resetLoginIdentityRateLimit
} from "@/lib/biblioteca/login-rate-limit";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$Hs78GKVbET+H+vLKAPRWZA$qRVtB353/QIgTKKpAGFJgO+/JnJ/egne4hCywJ0F4e0";

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: path
    }
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = normalizeLoginIdentity(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const result = await runWithLoginIdentityRateLimitLock(email, async (tx, rateLimitRecord, now) => {
    if (isLoginRateLimited(rateLimitRecord, now)) {
      return {
        ok: false as const,
        status: 429,
        retryAfterSeconds: getRetryAfterSeconds(rateLimitRecord.blockedUntil!, now)
      };
    }

    const user = await tx.user.findUnique({
      where: { email },
    });

    const passwordMatches = await verifyPassword(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH
    );

    if (
      !user ||
      !isAdminUser(user) ||
      !passwordMatches
    ) {
      await recordFailedLoginIdentity(email, now, tx, rateLimitRecord);
      return {
        ok: false as const,
        status: 303
      };
    }

    await resetLoginIdentityRateLimit(email, tx);
    return {
      ok: true as const,
      userId: user.id
    };
  });

  if (!result.ok && result.status === 429) {
    return new NextResponse("Massa intents de login. Torna-ho a provar mes tard.", {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds)
      }
    });
  }

  if (!result.ok) {
    return redirectTo("/biblioteca/admin/login?error=1");
  }

  await createSession(result.userId);

  return redirectTo("/biblioteca/admin");
}
