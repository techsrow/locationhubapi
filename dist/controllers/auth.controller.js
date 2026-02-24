"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_1.default.user.findUnique({
        where: { email }
    });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existing = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashed
            }
        });
        res.json({
            message: "User registered successfully",
            user: { id: user.id, email: user.email }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Register failed" });
    }
};
exports.register = register;
