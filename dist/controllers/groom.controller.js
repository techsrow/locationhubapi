"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderGroom = exports.deleteGroomImage = exports.getGroom = exports.uploadGroom = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ================= Upload =================
const uploadGroom = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Images required" });
        }
        const createdImages = await Promise.all(files.map((file) => prisma_1.default.groomGallery.create({
            data: {
                imageUrl: `/uploads/${file.filename}`,
                displayorder: 0,
            },
        })));
        return res.status(201).json({
            message: "Groom images uploaded successfully",
            data: createdImages,
        });
    }
    catch (error) {
        console.error("Upload Groom Error:", error);
        return res.status(500).json({ message: "Upload failed" });
    }
};
exports.uploadGroom = uploadGroom;
// ================= Get =================
const getGroom = async (_req, res) => {
    try {
        const data = await prisma_1.default.groomGallery.findMany({
            orderBy: { displayorder: "asc" },
        });
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Fetch Groom Error:", error);
        return res.status(500).json({ message: "Fetch failed" });
    }
};
exports.getGroom = getGroom;
// ================= Delete =================
const deleteGroomImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await prisma_1.default.groomGallery.findUnique({
            where: { id },
        });
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        // Extract filename from /uploads/filename.jpg
        const filename = image.imageUrl.replace("/uploads/", "");
        const uploadsPath = path_1.default.resolve(process.cwd(), "uploads");
        const filePath = path_1.default.join(uploadsPath, filename);
        // Delete file if exists
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await prisma_1.default.groomGallery.delete({
            where: { id },
        });
        return res.status(200).json({
            message: "Groom image deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete Groom Error:", error);
        return res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteGroomImage = deleteGroomImage;
// ================= Reorder =================
const reorderGroom = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                message: "Invalid reorder payload",
            });
        }
        await Promise.all(items.map((item) => prisma_1.default.groomGallery.update({
            where: { id: item.id },
            data: { displayorder: item.displayorder },
        })));
        return res.status(200).json({
            message: "Reordered successfully",
        });
    }
    catch (error) {
        console.error("Reorder Groom Error:", error);
        return res.status(500).json({ message: "Reorder failed" });
    }
};
exports.reorderGroom = reorderGroom;
