import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { POST } from "../app/api/admin/login/route";
import {
  LOGIN_IDENTITY_RATE_LIMIT_SCOPE,
  normalizeLoginIdentity,
  resetLoginIdentityRateLimit
} from "../lib/biblioteca/login-rate-limit";

const runIntegration = process.env.BIBLIOTECA_INTEGRATION_TESTS === "1";
const describeIntegration = runIntegration ? describe : describe.skip;

const prisma = new PrismaClient();
const email = "spec-b-admin@example.test";
const password = "correct horse battery staple";
const wrongPassword = "wrong password";

function loginRequest(loginEmail: string, loginPassword: string) {
  const formData = new FormData();
  formData.set("email", loginEmail);
  formData.set("password", loginPassword);

  return new Request("http://localhost:3000/biblioteca/api/admin/login", {
    method: "POST",
    body: formData,
    headers: {
      host: "localhost:3000"
    }
  });
}

async function getRateLimit(identity: string) {
  const records = await prisma.$queryRaw<
    Array<{ failedCount: number; blockedUntil: Date | null }>
  >`
    SELECT "failedCount", "blockedUntil"
    FROM "biblioteca"."LoginRateLimit"
    WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
      AND "key" = ${identity}
    LIMIT 1
  `;
  return records[0] ?? null;
}

async function clearIdentity(identity: string) {
  await prisma.$executeRaw`
    DELETE FROM "biblioteca"."LoginRateLimit"
    WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
      AND "key" = ${identity}
  `;
}

describeIntegration("SPEC-B integration", () => {
  beforeAll(async () => {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        name: "SPEC-B Admin",
        status: "active",
        role: "admin"
      },
      create: {
        email,
        passwordHash,
        name: "SPEC-B Admin",
        status: "active",
        role: "admin"
      }
    });
    await clearIdentity(email);
    await clearIdentity("missing@example.test");
  });

  afterAll(async () => {
    await clearIdentity(email);
    await clearIdentity("missing@example.test");
    await prisma.session.deleteMany({
      where: {
        user: {
          email
        }
      }
    });
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  test("concurrent failed login attempts do not bypass the identity rate limit", async () => {
    await clearIdentity(email);

    const responses = await Promise.all(
      Array.from({ length: 10 }, () => POST(loginRequest(email, wrongPassword)))
    );
    const statuses = responses.map((response) => response.status).sort();
    const acceptedFailures = statuses.filter((status) => status === 303).length;
    const rejectedByRateLimit = statuses.filter((status) => status === 429).length;
    const persisted = await getRateLimit(email);

    expect(acceptedFailures).toBe(5);
    expect(rejectedByRateLimit).toBe(5);
    expect(persisted?.failedCount).toBe(5);
    expect(persisted?.blockedUntil).toBeInstanceOf(Date);
  });

  test("direct API login attempts persist rate limit state for missing users", async () => {
    const missingIdentity = normalizeLoginIdentity("Missing@Example.Test");
    await clearIdentity(missingIdentity);
    await clearIdentity(email);

    const missingResponse = await POST(loginRequest("Missing@Example.Test", "anything"));
    const existingResponse = await POST(loginRequest(email, wrongPassword));
    const persisted = await getRateLimit(missingIdentity);

    expect(missingResponse.status).toBe(303);
    expect(existingResponse.status).toBe(303);
    expect(missingResponse.headers.get("location")).toContain("/biblioteca/admin/login?error=1");
    expect(existingResponse.headers.get("location")).toContain("/biblioteca/admin/login?error=1");
    expect(persisted?.failedCount).toBe(1);
  });

  test("identity rate limit reset removes persisted failed state", async () => {
    await clearIdentity(email);
    await POST(loginRequest(email, wrongPassword));
    expect((await getRateLimit(email))?.failedCount).toBe(1);

    await resetLoginIdentityRateLimit(email);
    expect(await getRateLimit(email)).toBeNull();
  });
});
