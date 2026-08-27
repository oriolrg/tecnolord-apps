SET search_path TO "biblioteca";

CREATE TABLE "LoginRateLimit" (
  "id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "windowStartedAt" TIMESTAMP(3) NOT NULL,
  "blockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LoginRateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoginRateLimit_scope_key_key" ON "LoginRateLimit"("scope", "key");
CREATE INDEX "LoginRateLimit_blockedUntil_idx" ON "LoginRateLimit"("blockedUntil");
