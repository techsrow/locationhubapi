"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderMakeupArtist = exports.deleteMakeupArtist = exports.updateMakeupArtist = exports.getMakeupArtistById = exports.getAllMakeupArtist = exports.uploadMakeupArtist = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * ===============================
 * 🔹 Upload Multiple Images
 * ===============================
 */
const uploadMakeupArtist = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Images are required" });
        }
        // Get last displayOrder
        const lastItem = await prisma_1.default.makeupArtist.findFirst({
            orderBy: { displayOrder: "desc" },
        });
        let nextOrder = lastItem ? lastItem.displayOrder + 1 : 1;
        const createdItems = [];
        for (const file of files) {
            const newItem = await prisma_1.default.makeupArtist.create({
                data: {
                    image: `/uploads/${file.filename}`,
                    displayOrder: nextOrder++,
                },
            });
            createdItems.push(newItem);
        }
        return res.status(201).json({
            message: "Makeup Artist images uploaded successfully",
            data: createdItems,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Upload failed" });
    }
};
exports.uploadMakeupArtist = uploadMakeupArtist;
/**
 * ===============================
 * 🔹 Get All (Sorted)
 * ===============================
 */
const getAllMakeupArtist = async (_req, res) => {
    try {
        const data = await prisma_1.default.makeupArtist.findMany({
            orderBy: { displayOrder: "asc" },
        });
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch data" });
    }
};
exports.getAllMakeupArtist = getAllMakeupArtist;
/**
 * ===============================
 * 🔹 Get Single
 * ===============================
 */
const getMakeupArtistById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prisma_1.default.makeupArtist.findUnique({
            where: { id },
        });
        if (!item) {
            return res.status(404).json({ message: "Not found" });
        }
        return res.status(200).json(item);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching item" });
    }
};
exports.getMakeupArtistById = getMakeupArtistById;
/**
 * ===============================
 * 🔹 Update (Image Optional)
 * ===============================
 */
const updateMakeupArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        const existing = await prisma_1.default.makeupArtist.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Not found" });
        }
        let updatedImage = existing.image;
        // If new image uploaded
        if (file) {
            // Delete old image
            const oldImagePath = path_1.default.join(process.cwd(), existing.image);
            if (fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
            updatedImage = `/uploads/${file.filename}`;
        }
        const updated = await prisma_1.default.makeupArtist.update({
            where: { id },
            data: {
                image: updatedImage,
            },
        });
        return res.status(200).json({
            message: "Updated successfully",
            data: updated,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Update failed" });
    }
};
exports.updateMakeupArtist = updateMakeupArtist;
/**
 * ===============================
 * 🔹 Delete
 * ===============================
 */
const deleteMakeupArtist = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.default.makeupArtist.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Not found" });
        }
        // Delete image from storage
        const imagePath = path_1.default.join(process.cwd(), existing.image);
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlinkSync(imagePath);
        }
        await prisma_1.default.makeupArtist.delete({
            where: { id },
        });
        return res.status(200).json({
            message: "Deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteMakeupArtist = deleteMakeupArtist;
/**
 * ===============================
 * 🔹 Drag Reorder
 * ===============================
 */
const reorderMakeupArtist = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid reorder payload" });
        }
        const updatePromises = items.map((item) => prisma_1.default.makeupArtist.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
        }));
        await Promise.all(updatePromises);
        return res.status(200).json({
            message: "Reordered successfully",
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Reorder failed" });
    }
};
exports.reorderMakeupArtist = reorderMakeupArtist;
