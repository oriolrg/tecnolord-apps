import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("SPEC-B implementation surface", () => {
  test("login no longer uses an in-memory Map rate limiter", () => {
    const route = read("app/api/admin/login/route.ts");

    expect(route).not.toContain("new Map");
    expect(route).not.toContain("canTry");
    expect(route).toContain("runWithLoginIdentityRateLimitLock");
    expect(route).toContain("recordFailedLoginIdentity");
    expect(route).toContain("resetLoginIdentityRateLimit");
  });

  test("login executes dummy Argon2 verification for unknown users", () => {
    const route = read("app/api/admin/login/route.ts");

    expect(route).toContain("DUMMY_PASSWORD_HASH");
    expect(route).toContain("user?.passwordHash ?? DUMMY_PASSWORD_HASH");
    expect(route).toContain("verifyPassword");
  });

  test("login applies rate limiting before password verification and records only failed authentication", () => {
    const route = read("app/api/admin/login/route.ts");
    const checkIndex = route.indexOf("runWithLoginIdentityRateLimitLock");
    const verifyIndex = route.indexOf("const passwordMatches = await verifyPassword");
    const recordIndex = route.indexOf("await recordFailedLoginIdentity");
    const resetIndex = route.indexOf("await resetLoginIdentityRateLimit");

    expect(checkIndex).toBeGreaterThan(-1);
    expect(verifyIndex).toBeGreaterThan(checkIndex);
    expect(recordIndex).toBeGreaterThan(verifyIndex);
    expect(resetIndex).toBeGreaterThan(recordIndex);
  });

  test("persistent rate limit model and migration exist", () => {
    expect(read("prisma/schema.prisma")).toContain("model LoginRateLimit");
    expect(read("prisma/migrations/20260827001000_login_rate_limit/migration.sql")).toContain("CREATE TABLE \"LoginRateLimit\"");
  });

  test("login rate limit helper locks the persistent identity row before mutation", () => {
    const helper = read("lib/biblioteca/login-rate-limit.ts");

    expect(helper).toContain("ON CONFLICT (\"scope\", \"key\") DO NOTHING");
    expect(helper).toContain("FOR UPDATE");
    expect(helper).toContain("runWithLoginIdentityRateLimitLock");
  });

  test("login no longer uses x-forwarded-for as a trusted rate-limit origin", () => {
    const route = read("app/api/admin/login/route.ts");

    expect(route).not.toContain("x-forwarded-for");
  });

  test("session validation checks persistent storage and server-side expiry", () => {
    const auth = read("lib/biblioteca/auth.ts");

    expect(auth).toContain("prisma.session.findUnique");
    expect(auth).toContain("session.expiresAt < new Date()");
    expect(auth).toContain("session.user.status !== \"active\"");
  });

  test("logout invalidates the persistent session and clears cookies with matching options", () => {
    const auth = read("lib/biblioteca/auth.ts");
    const logout = read("app/api/admin/logout/route.ts");

    expect(auth).toContain("prisma.session.deleteMany");
    expect(auth).toContain("getSessionCookieOptions(new Date(0))");
    expect(auth).toContain("getCsrfCookieOptions(new Date(0))");
    expect(logout).toContain("await destroySession()");
    expect(logout).toContain("getCsrfToken()");
  });
});
