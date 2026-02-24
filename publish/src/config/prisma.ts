import "dotenv/config";

console.log("DATABASE_URL =", process.env.DATABASE_URL);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
