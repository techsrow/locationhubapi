"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetGallery = exports.reorderSetGallery = exports.deleteSetGalleryImage = exports.addSetGalleryImage = exports.deleteSet = exports.updateSet = exports.getSingleSet = exports.getAllSets = exports.createSet = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/* ================================
   CREATE SET
================================ */
const createSet = async (req, res) => {
    try {
        const { title, content, pageUrl } = req.body;
        const file = req.file;
        if (!title || !pageUrl || !file) {
            return res.status(400).json({
                message: "Title, Page URL & Main Image are required",
            });
        }
        // Check duplicate pageUrl
        const existingSlug = await prisma_1.default.set.findUnique({
            where: { pageUrl },
        });
        if (existingSlug) {
            return res.status(400).json({
                message: "Page URL already exists",
            });
        }
        const newSet = await prisma_1.default.set.create({
            data: {
                title,
                content,
                pageUrl,
                mainImage: `/uploads/${file.filename}`,
            },
        });
        res.status(201).json(newSet);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Create set failed" });
    }
};
exports.createSet = createSet;
/* ================================
   GET ALL SETS
================================ */
const getAllSets = async (_req, res) => {
    try {
        const sets = await prisma_1.default.set.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(sets);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Fetch failed" });
    }
};
exports.getAllSets = getAllSets;
/* ================================
   GET SINGLE SET BY pageUrl
================================ */
// export const getSingleSet = async (req: Request, res: Response) => {
//   try {
//     const { pageUrl } = req.params;
//     const set = await prisma.set.findUnique({
//       where: { pageUrl },
//       include: {
//         gallery: {
//           orderBy: { displayorder: "asc" },
//         },
//       },
//     });
//     if (!set) {
//       return res.status(404).json({ message: "Set not found" });
//     }
//     res.json(set);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Fetch failed" });
//   }
// };
const getSingleSet = async (req, res) => {
    try {
        const { id } = req.params;
        const set = await prisma_1.default.set.findUnique({
            where: { id },
            include: {
                gallery: {
                    orderBy: { displayorder: "asc" },
                },
            },
        });
        if (!set) {
            return res.status(404).json({ message: "Set not found" });
        }
        res.json(set);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Fetch failed" });
    }
};
exports.getSingleSet = getSingleSet;
/* ================================
   UPDATE SET
================================ */
const updateSet = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, pageUrl } = req.body;
        const file = req.file;
        const existing = await prisma_1.default.set.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Set not found" });
        }
        // If pageUrl changed, check duplicate
        if (pageUrl && pageUrl !== existing.pageUrl) {
            const slugExists = await prisma_1.default.set.findUnique({
                where: { pageUrl },
            });
            if (slugExists) {
                return res.status(400).json({
                    message: "Page URL already exists",
                });
            }
        }
        const data = {
            title,
            content,
            pageUrl,
        };
        if (file) {
            // Delete old image
            const oldPath = path_1.default.join(__dirname, "../../", existing.mainImage.replace("/", ""));
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
            data.mainImage = `/uploads/${file.filename}`;
        }
        const updated = await prisma_1.default.set.update({
            where: { id },
            data,
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Update failed" });
    }
};
exports.updateSet = updateSet;
/* ================================
   DELETE SET (WITH FILE CLEANUP)
================================ */
const deleteSet = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.default.set.findUnique({
            where: { id },
            include: { gallery: true },
        });
        if (!existing) {
            return res.status(404).json({ message: "Set not found" });
        }
        // Delete main image
        const mainPath = path_1.default.join(__dirname, "../../", existing.mainImage.replace("/", ""));
        if (fs_1.default.existsSync(mainPath)) {
            fs_1.default.unlinkSync(mainPath);
        }
        // Delete gallery images
        existing.gallery.forEach((img) => {
            const imgPath = path_1.default.join(__dirname, "../../", img.imageUrl.replace("/", ""));
            if (fs_1.default.existsSync(imgPath)) {
                fs_1.default.unlinkSync(imgPath);
            }
        });
        await prisma_1.default.set.delete({
            where: { id },
        });
        res.json({ message: "Set deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteSet = deleteSet;
/* ================================
   ADD GALLERY IMAGE
================================ */
const addSetGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Image required" });
        }
        const lastImage = await prisma_1.default.setGallery.findFirst({
            where: { setId: id },
            orderBy: { displayorder: "desc" },
        });
        const newOrder = lastImage ? lastImage.displayorder + 1 : 1;
        const image = await prisma_1.default.setGallery.create({
            data: {
                imageUrl: `/uploads/${file.filename}`,
                setId: id,
                displayorder: newOrder,
            },
        });
        res.json(image);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
};
exports.addSetGalleryImage = addSetGalleryImage;
/* ================================
   DELETE GALLERY IMAGE
================================ */
const deleteSetGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma_1.default.setGallery.findUnique({
            where: { id },
        });
        if (!existing) {
            return res.status(404).json({ message: "Image not found" });
        }
        const imgPath = path_1.default.join(__dirname, "../../", existing.imageUrl.replace("/", ""));
        if (fs_1.default.existsSync(imgPath)) {
            fs_1.default.unlinkSync(imgPath);
        }
        await prisma_1.default.setGallery.delete({
            where: { id },
        });
        res.json({ message: "Gallery image deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteSetGalleryImage = deleteSetGalleryImage;
/* ================================
   REORDER GALLERY
================================ */
const reorderSetGallery = async (req, res) => {
    try {
        const updates = req.body;
        await Promise.all(updates.map((item) => prisma_1.default.setGallery.update({
            where: { id: item.id },
            data: { displayorder: item.displayorder },
        })));
        res.json({ message: "Gallery reordered successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Reorder failed" });
    }
};
exports.reorderSetGallery = reorderSetGallery;
/* ================================
   GET GALLERY BY SET ID
================================ */
const getSetGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const images = await prisma_1.default.setGallery.findMany({
            where: { setId: id },
            orderBy: { displayorder: "asc" },
        });
        res.json(images);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Fetch gallery failed" });
    }
};
exports.getSetGallery = getSetGallery;
