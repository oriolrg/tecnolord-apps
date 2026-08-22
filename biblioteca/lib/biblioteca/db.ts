import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  bibliotecaPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.bibliotecaPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.bibliotecaPrisma = prisma;
}
