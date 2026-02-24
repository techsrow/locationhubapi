"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSlider = exports.deleteSlider = exports.createSlider = exports.getSliders = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ================= GET ALL =================
const getSliders = async (req, res) => {
    try {
        const sliders = await prisma_1.default.homeSlider.findMany({
            orderBy: { displayorder: "asc" },
        });
        res.json(sliders);
    }
    catch (error) {
        res.status(500).json({ message: "Fetch failed" });
    }
};
exports.getSliders = getSliders;
// ================= CREATE =================
const createSlider = async (req, res) => {
    try {
        const files = req.files;
        const { title } = req.body;
        console.log("FILES:", files);
        console.log("TITLE:", title);
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Image required" });
        }
        const lastSlider = await prisma_1.default.homeSlider.findFirst({
            orderBy: { displayorder: "desc" },
        });
        let nextOrder = lastSlider ? lastSlider.displayorder + 1 : 1;
        const created = [];
        for (const file of files) {
            const slider = await prisma_1.default.homeSlider.create({
                data: {
                    title: title || "", // safe fallback
                    imageUrl: `/uploads/${file.filename}`,
                    displayorder: nextOrder++,
                },
            });
            created.push(slider);
        }
        res.status(201).json(created);
    }
    catch (error) {
        console.error("🔥 CREATE SLIDER ERROR:", error);
        res.status(500).json({ message: "Create failed" });
    }
};
exports.createSlider = createSlider;
// ================= DELETE =================
const deleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const slider = await prisma_1.default.homeSlider.findUnique({
            where: { id },
        });
        if (!slider) {
            return res.status(404).json({ message: "Not found" });
        }
        const cleanPath = slider.imageUrl.replace("/uploads/", "");
        const filePath = path_1.default.join(__dirname, "../../uploads", cleanPath);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await prisma_1.default.homeSlider.delete({
            where: { id },
        });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteSlider = deleteSlider;
// ================= REORDER =================
const reorderSlider = async (req, res) => {
    try {
        const { items } = req.body;
        await Promise.all(items.map((item) => prisma_1.default.homeSlider.update({
            where: { id: item.id },
            data: { displayorder: item.displayorder },
        })));
        res.json({ message: "Reordered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Reorder failed" });
    }
};
exports.reorderSlider = reorderSlider;
