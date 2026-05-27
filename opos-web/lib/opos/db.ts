import path from "node:path";
import { PrismaClient } from "@/lib/generated/opos-client";

declare global {
  // eslint-disable-next-line no-var
  var __oposPrisma: PrismaClient | undefined;
}

export const oposDb =
  global.__oposPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolveOposDatabaseUrl()
      }
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__oposPrisma = oposDb;
}

function resolveOposDatabaseUrl() {
  const configured = process.env.OPOS_DATABASE_URL?.trim();

  if (!configured || configured === "file:./opos.db") {
    return toFileUrl(path.resolve(process.cwd(), "opos.db"));
  }

  if (configured.startsWith("file:./")) {
    return toFileUrl(path.resolve(process.cwd(), configured.slice("file:./".length)));
  }

  return configured;
}

function toFileUrl(absolutePath: string) {
  return `file:${absolutePath.replaceAll("\\", "/")}`;
}
