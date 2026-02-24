import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      password: hash,
      role: "ADMIN"
    }
  });

  console.log("Admin created");
}

main();
