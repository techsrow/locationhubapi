"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderTestimonials = exports.deleteTestimonial = exports.updateTestimonial = exports.getTestimonialById = exports.getTestimonials = exports.createTestimonial = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// ============================
// CREATE TESTIMONIAL
// ============================
const createTestimonial = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (!file) {
            return res.status(400).json({ message: "Image is required" });
        }
        // Get last display order
        const lastItem = await prisma_1.default.testimonial.findFirst({
            orderBy: { displayorder: "desc" },
        });
        const newDisplayOrder = lastItem ? lastItem.displayorder + 1 : 1;
        const testimonial = await prisma_1.default.testimonial.create({
            data: {
                title,
                imageUrl: file.filename,
                displayorder: newDisplayOrder,
            },
        });
        res.status(201).json({
            message: "Testimonial created successfully",
            testimonial,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating testimonial" });
    }
};
exports.createTestimonial = createTestimonial;
// ============================
// GET ALL TESTIMONIALS
// ============================
const getTestimonials = async (req, res) => {
    try {
        const testimonials = await prisma_1.default.testimonial.findMany({
            orderBy: { displayorder: "asc" },
        });
        res.status(200).json(testimonials);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching testimonials" });
    }
};
exports.getTestimonials = getTestimonials;
// ============================
// GET SINGLE TESTIMONIAL
// ============================
const getTestimonialById = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await prisma_1.default.testimonial.findUnique({
            where: { id },
        });
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        res.status(200).json(testimonial);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching testimonial" });
    }
};
exports.getTestimonialById = getTestimonialById;
// ============================
// UPDATE TESTIMONIAL
// ============================
const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const file = req.file;
        const existing = await prisma_1.default.testimonial.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        let updatedImage = existing.imageUrl;
        // If new image uploaded
        if (file) {
            // Delete old image
            const oldPath = path_1.default.join("uploads", existing.imageUrl);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
            updatedImage = file.filename;
        }
        const updated = await prisma_1.default.testimonial.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                imageUrl: updatedImage,
            },
        });
        res.status(200).json({
            message: "Testimonial updated successfully",
            updated,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating testimonial" });
    }
};
exports.updateTestimonial = updateTestimonial;
// ============================
// DELETE TESTIMONIAL
// ============================
const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const testimonial = await prisma_1.default.testimonial.findUnique({
            where: { id },
        });
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonial not found" });
        }
        // 1️⃣ Delete image file
        const filePath = path_1.default.join("uploads", testimonial.imageUrl);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // 2️⃣ Delete testimonial from DB
        await prisma_1.default.testimonial.delete({
            where: { id },
        });
        // 3️⃣ 🔥 Recalculate display order (ADD HERE)
        const remaining = await prisma_1.default.testimonial.findMany({
            orderBy: { displayorder: "asc" },
        });
        await Promise.all(remaining.map((item, index) => prisma_1.default.testimonial.update({
            where: { id: item.id },
            data: { displayorder: index + 1 },
        })));
        res.status(200).json({ message: "Testimonial deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting testimonial" });
    }
};
exports.deleteTestimonial = deleteTestimonial;
// ============================
// REORDER TESTIMONIALS
// ============================
const reorderTestimonials = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid reorder data" });
        }
        await Promise.all(items.map((item, index) => prisma_1.default.testimonial.update({
            where: { id: item.id },
            data: { displayorder: index + 1 },
        })));
        res.status(200).json({ message: "Reordered successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error reordering testimonials" });
    }
};
exports.reorderTestimonials = reorderTestimonials;
