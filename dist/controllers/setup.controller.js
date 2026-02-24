"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSetupGallery = exports.deleteSetupGalleryImage = exports.getSetupById = exports.reorderSetups = exports.deleteSetup = exports.updateSetup = exports.getSetupBySlug = exports.getAllSetups = exports.createSetup = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const slugify_1 = __importDefault(require("slugify"));
/* ================= CREATE ================= */
const createSetup = async (req, res) => {
    try {
        const { title, content, pageUrl } = req.body;
        const files = req.files;
        if (!title || !files?.mainImage?.[0]) {
            return res.status(400).json({ message: "Title and main image required" });
        }
        const slug = (0, slugify_1.default)(title, { lower: true, strict: true });
        // prevent duplicate slug
        const existingSlug = await prisma_1.default.setup.findUnique({
            where: { slug },
        });
        if (existingSlug) {
            return res.status(400).json({ message: "Slug already exists" });
        }
        // auto displayOrder for Setup
        const lastSetup = await prisma_1.default.setup.findFirst({
            orderBy: { displayOrder: "desc" },
        });
        const newOrder = lastSetup ? lastSetup.displayOrder + 1 : 1;
        const setup = await prisma_1.default.setup.create({
            data: {
                title,
                pageUrl,
                slug,
                content,
                mainImage: `/uploads/${files.mainImage[0].filename}`,
                displayOrder: newOrder,
                gallery: {
                    create: files.gallery?.map((file, index) => ({
                        imageUrl: `/uploads/${file.filename}`,
                        displayOrder: index + 1,
                    })) || [],
                },
            },
            include: {
                gallery: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
        res.status(201).json(setup);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.createSetup = createSetup;
/* ================= GET ALL ================= */
const getAllSetups = async (_req, res) => {
    try {
        const setups = await prisma_1.default.setup.findMany({
            orderBy: { displayOrder: "asc" },
            include: {
                gallery: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
        res.json(setups);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAllSetups = getAllSetups;
/* ================= GET BY SLUG ================= */
const getSetupBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const setup = await prisma_1.default.setup.findUnique({
            where: { slug },
            include: {
                gallery: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
        if (!setup) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json(setup);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getSetupBySlug = getSetupBySlug;
/* ================= UPDATE ================= */
const updateSetup = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, pageUrl } = req.body;
        const existing = await prisma_1.default.setup.findUnique({
            where: { id },
            include: { gallery: true },
        });
        if (!existing) {
            return res.status(404).json({ message: "Not found" });
        }
        const files = req.files;
        let updatedMainImage = existing.mainImage;
        /* -------- Replace Main Image -------- */
        if (files?.mainImage?.[0]) {
            const oldPath = path_1.default.join(process.cwd(), existing.mainImage);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
            updatedMainImage = `/uploads/${files.mainImage[0].filename}`;
        }
        /* -------- Add New Gallery Images -------- */
        if (files?.gallery?.length) {
            const lastGallery = await prisma_1.default.setupGallery.findFirst({
                where: { setupId: id },
                orderBy: { displayOrder: "desc" },
            });
            let startOrder = lastGallery ? lastGallery.displayOrder + 1 : 1;
            await prisma_1.default.setupGallery.createMany({
                data: files.gallery.map((file, index) => ({
                    imageUrl: `/uploads/${file.filename}`,
                    setupId: id,
                    displayOrder: startOrder + index,
                })),
            });
        }
        /* -------- Safe Partial Update -------- */
        const updateData = {
            mainImage: updatedMainImage,
        };
        if (title) {
            updateData.title = title;
            updateData.pageUrl = pageUrl;
            updateData.slug = (0, slugify_1.default)(title, { lower: true, strict: true });
        }
        if (content !== undefined) {
            updateData.content = content;
        }
        const updated = await prisma_1.default.setup.update({
            where: { id },
            data: updateData,
            include: {
                gallery: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
        res.json(updated);
    }
    catch (error) {
        console.error("Update Setup Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.updateSetup = updateSetup;
/* ================= DELETE ================= */
const deleteSetup = async (req, res) => {
    try {
        const { id } = req.params;
        const setup = await prisma_1.default.setup.findUnique({
            where: { id },
            include: { gallery: true },
        });
        if (!setup) {
            return res.status(404).json({ message: "Not found" });
        }
        // delete main image
        const mainPath = path_1.default.join(process.cwd(), setup.mainImage);
        if (fs_1.default.existsSync(mainPath)) {
            fs_1.default.unlinkSync(mainPath);
        }
        // delete gallery images
        setup.gallery.forEach((img) => {
            const imgPath = path_1.default.join(process.cwd(), img.imageUrl);
            if (fs_1.default.existsSync(imgPath)) {
                fs_1.default.unlinkSync(imgPath);
            }
        });
        await prisma_1.default.setup.delete({
            where: { id },
        });
        res.json({ message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.deleteSetup = deleteSetup;
/* ================= REORDER SETUPS ================= */
const reorderSetups = async (req, res) => {
    try {
        const { order } = req.body;
        await Promise.all(order.map((item) => prisma_1.default.setup.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
        })));
        res.json({ message: "Reordered successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.reorderSetups = reorderSetups;
const getSetupById = async (req, res) => {
    try {
        const { id } = req.params;
        const setup = await prisma_1.default.setup.findUnique({
            where: { id },
            include: {
                gallery: {
                    orderBy: { displayOrder: "asc" },
                },
            },
        });
        if (!setup) {
            return res.status(404).json({ message: "Not found" });
        }
        res.json(setup);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getSetupById = getSetupById;
const deleteSetupGalleryImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const image = await prisma_1.default.setupGallery.findUnique({
            where: { id: imageId },
        });
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        const imagePath = path_1.default.join(process.cwd(), image.imageUrl);
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlinkSync(imagePath);
        }
        await prisma_1.default.setupGallery.delete({
            where: { id: imageId },
        });
        res.json({ message: "Gallery image deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.deleteSetupGalleryImage = deleteSetupGalleryImage;
const reorderSetupGallery = async (req, res) => {
    try {
        const { order } = req.body;
        await Promise.all(order.map((item) => prisma_1.default.setupGallery.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
        })));
        res.json({ message: "Gallery reordered successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.reorderSetupGallery = reorderSetupGallery;
