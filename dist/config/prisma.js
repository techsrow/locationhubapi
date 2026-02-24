"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
console.log("DATABASE_URL =", process.env.DATABASE_URL);
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = prisma;
