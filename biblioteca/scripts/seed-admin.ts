import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BIBLIOTECA_ADMIN_EMAIL;
  const password = process.env.BIBLIOTECA_ADMIN_PASSWORD;
  const name = process.env.BIBLIOTECA_ADMIN_NAME ?? "Tecnolord";

  if (!email || !password) {
    throw new Error("Defineix BIBLIOTECA_ADMIN_EMAIL i BIBLIOTECA_ADMIN_PASSWORD.");
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, name, status: "active", role: "admin" },
    create: {
      email: email.toLowerCase(),
      name,
      passwordHash,
      status: "active",
      role: "admin"
    }
  });

  console.log(`Administrador preparat: ${email.toLowerCase()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
