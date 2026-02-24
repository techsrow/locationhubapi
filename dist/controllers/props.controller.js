"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderProps = exports.deleteProps = exports.updateProps = exports.getSingleProps = exports.getAllProps = exports.createProps = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * ================================
 * CREATE PROPS
 * ================================
 */
const createProps = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Image is required" });
        }
        const { title, subTitle } = req.body;
        if (!title || !subTitle) {
            return res.status(400).json({ message: "Title and SubTitle are required" });
        }
        // Get last display order
        const lastItem = await prisma_1.default.props.findFirst({
            orderBy: { displayOrder: "desc" },
        });
        const newOrder = lastItem ? lastItem.displayOrder + 1 : 1;
        const props = await prisma_1.default.props.create({
            data: {
                image: file.filename,
                title,
                subTitle,
                displayOrder: newOrder,
            },
        });
        return res.status(201).json({
            message: "Props created successfully",
            data: props,
        });
    }
    catch (error) {
        console.error("Create Props Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.createProps = createProps;
/**
 * ================================
 * GET ALL PROPS (Sorted)
 * ================================
 */
const getAllProps = async (_req, res) => {
    try {
        const props = await prisma_1.default.props.findMany({
            orderBy: { displayOrder: "asc" },
        });
        return res.status(200).json(props);
    }
    catch (error) {
        console.error("Get Props Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getAllProps = getAllProps;
/**
 * ================================
 * GET SINGLE PROPS
 * ================================
 */
const getSingleProps = async (req, res) => {
    try {
        const { id } = req.params;
        const props = await prisma_1.default.props.findUnique({
            where: { id },
        });
        if (!props) {
            return res.status(404).json({ message: "Props not found" });
        }
        return res.status(200).json(props);
    }
    catch (error) {
        console.error("Get Single Props Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getSingleProps = getSingleProps;
/**
 * ================================
 * UPDATE PROPS
 * ================================
 */
const updateProps = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subTitle } = req.body;
        const file = req.file;
        const existing = await prisma_1.default.props.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Props not found" });
        }
        let updatedImage = existing.image;
        // If new image uploaded → delete old image
        if (file) {
            const oldPath = path_1.default.join("uploads", existing.image);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
            updatedImage = file.filename;
        }
        const updated = await prisma_1.default.props.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                subTitle: subTitle ?? existing.subTitle,
                image: updatedImage,
            },
        });
        return res.status(200).json({
            message: "Props updated successfully",
            data: updated,
        });
    }
    catch (error) {
        console.error("Update Props Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateProps = updateProps;
/**
 * ================================
 * DELETE PROPS
 * ================================
 */
const deleteProps = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.default.props.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Props not found" });
        }
        // Delete image file
        const filePath = path_1.default.join(process.cwd(), "uploads", existing.image);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await prisma_1.default.props.delete({
            where: { id },
        });
        // 🔥 NORMALIZE ORDER
        const remaining = await prisma_1.default.props.findMany({
            orderBy: { displayOrder: "asc" },
        });
        const updatePromises = remaining.map((item, index) => prisma_1.default.props.update({
            where: { id: item.id },
            data: { displayOrder: index + 1 },
        }));
        await Promise.all(updatePromises);
        return res.status(200).json({
            message: "Props deleted & order normalized",
        });
    }
    catch (error) {
        console.error("Delete Props Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteProps = deleteProps;
/**
 * ================================
 * REORDER PROPS
 * ================================
 */
const reorderProps = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid reorder data" });
        }
        await prisma_1.default.$transaction(items.map((item, index) => prisma_1.default.props.update({
            where: { id: item.id },
            data: { displayOrder: index + 1 },
        })));
        return res.status(200).json({
            message: "Props reordered successfully",
        });
    }
    catch (error) {
        console.error("Reorder Props Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.reorderProps = reorderProps;
