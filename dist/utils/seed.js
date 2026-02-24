"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = await bcrypt_1.default.hash("admin123", 10);
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
