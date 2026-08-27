import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "./db";

export const LOGIN_IDENTITY_RATE_LIMIT_SCOPE = "login:identity";

export const LOGIN_IDENTITY_RATE_LIMIT_POLICY = {
  maxFailures: 5,
  windowMs: 15 * 60 * 1000,
  blockMs: 15 * 60 * 1000
};

type RateLimitPolicy = typeof LOGIN_IDENTITY_RATE_LIMIT_POLICY;

export type LoginRateLimitRecord = {
  id: string;
  scope: string;
  key: string;
  failedCount: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
};

type RateLimitClient = PrismaClient | Prisma.TransactionClient;

export function normalizeLoginIdentity(email: string) {
  return email.toLowerCase().trim();
}

export function getRetryAfterSeconds(blockedUntil: Date, now: Date) {
  return Math.max(1, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000));
}

export function isLoginRateLimited(record: Pick<LoginRateLimitRecord, "blockedUntil"> | null, now: Date) {
  if (!record?.blockedUntil) return false;
  return record.blockedUntil.getTime() > now.getTime();
}

export function nextFailedLoginState(
  record: Pick<LoginRateLimitRecord, "failedCount" | "windowStartedAt" | "blockedUntil"> | null,
  now: Date,
  policy: RateLimitPolicy = LOGIN_IDENTITY_RATE_LIMIT_POLICY
) {
  if (isLoginRateLimited(record, now)) {
    return {
      failedCount: record!.failedCount,
      windowStartedAt: record!.windowStartedAt,
      blockedUntil: record!.blockedUntil
    };
  }

  const windowExpired =
    !record ||
    now.getTime() - record.windowStartedAt.getTime() >= policy.windowMs;

  const failedCount = windowExpired ? 1 : record.failedCount + 1;
  const blockedUntil =
    failedCount >= policy.maxFailures
      ? new Date(now.getTime() + policy.blockMs)
      : null;

  return {
    failedCount,
    windowStartedAt: windowExpired ? now : record.windowStartedAt,
    blockedUntil
  };
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2002" ||
      (error.code === "P2010" && typeof error.meta?.code === "string" && error.meta.code === "23505"))
  );
}

export async function checkLoginIdentityRateLimit(identity: string, now = new Date()) {
  const records = await prisma.$queryRaw<LoginRateLimitRecord[]>`
    SELECT "id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil"
    FROM "biblioteca"."LoginRateLimit"
    WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
      AND "key" = ${identity}
    LIMIT 1
  `;
  const record = records[0] ?? null;

  if (isLoginRateLimited(record, now)) {
    return {
      ok: false as const,
      retryAfterSeconds: getRetryAfterSeconds(record!.blockedUntil!, now)
    };
  }

  return { ok: true as const };
}

export async function lockLoginIdentityRateLimit(
  identity: string,
  now = new Date(),
  db: RateLimitClient = prisma
) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const id = randomUUID();
      await db.$executeRaw`
        INSERT INTO "biblioteca"."LoginRateLimit"
          ("id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil", "createdAt", "updatedAt")
        VALUES
          (${id}, ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}, ${identity}, 0, ${now}, NULL, ${now}, ${now})
        ON CONFLICT ("scope", "key") DO NOTHING
      `;

      const records = await db.$queryRaw<LoginRateLimitRecord[]>`
        SELECT "id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil"
        FROM "biblioteca"."LoginRateLimit"
        WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
          AND "key" = ${identity}
        FOR UPDATE
      `;

      if (records[0]) return records[0];
    } catch (error) {
      if (attempt === 0 && isUniqueConflict(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No s'ha pogut bloquejar el limit d'intents de login");
}

export async function runWithLoginIdentityRateLimitLock<T>(
  identity: string,
  callback: (db: Prisma.TransactionClient, record: LoginRateLimitRecord, now: Date) => Promise<T>,
  now = new Date()
) {
  return prisma.$transaction(async (tx) => {
    const record = await lockLoginIdentityRateLimit(identity, now, tx);
    return callback(tx, record, now);
  });
}

export async function recordFailedLoginIdentity(
  identity: string,
  now = new Date(),
  db: RateLimitClient = prisma,
  lockedRecord?: LoginRateLimitRecord
) {
  if (lockedRecord) {
    const next = nextFailedLoginState(lockedRecord, now);
    await db.$executeRaw`
      UPDATE "biblioteca"."LoginRateLimit"
      SET "failedCount" = ${next.failedCount},
          "windowStartedAt" = ${next.windowStartedAt},
          "blockedUntil" = ${next.blockedUntil},
          "updatedAt" = ${now}
      WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
        AND "key" = ${identity}
    `;
    return {
      ...lockedRecord,
      ...next
    };
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const records = await tx.$queryRaw<LoginRateLimitRecord[]>`
          SELECT "id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil"
          FROM "biblioteca"."LoginRateLimit"
          WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
            AND "key" = ${identity}
          FOR UPDATE
        `;
        const record = records[0] ?? null;
        const next = nextFailedLoginState(record, now);

        if (record) {
          await tx.$executeRaw`
            UPDATE "biblioteca"."LoginRateLimit"
            SET "failedCount" = ${next.failedCount},
                "windowStartedAt" = ${next.windowStartedAt},
                "blockedUntil" = ${next.blockedUntil},
                "updatedAt" = ${now}
            WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
              AND "key" = ${identity}
          `;
          return {
            ...record,
            ...next
          };
        }

        const id = randomUUID();
        await tx.$executeRaw`
          INSERT INTO "biblioteca"."LoginRateLimit"
            ("id", "scope", "key", "failedCount", "windowStartedAt", "blockedUntil", "createdAt", "updatedAt")
          VALUES
            (${id}, ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}, ${identity}, ${next.failedCount}, ${next.windowStartedAt}, ${next.blockedUntil}, ${now}, ${now})
        `;
        return {
          id,
          scope: LOGIN_IDENTITY_RATE_LIMIT_SCOPE,
          key: identity,
          ...next
        };
      });
    } catch (error) {
      if (attempt === 0 && isUniqueConflict(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No s'ha pogut actualitzar el limit d'intents de login");
}

export async function resetLoginIdentityRateLimit(identity: string, db: RateLimitClient = prisma) {
  await db.$executeRaw`
    DELETE FROM "biblioteca"."LoginRateLimit"
    WHERE "scope" = ${LOGIN_IDENTITY_RATE_LIMIT_SCOPE}
      AND "key" = ${identity}
  `;
}
