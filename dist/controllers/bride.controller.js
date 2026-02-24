"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderBride = exports.deleteBrideImage = exports.getBride = exports.uploadBride = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// ===============================
// ✅ Upload Multiple Images
// ===============================
const uploadBride = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Images required" });
        }
        const createdImages = [];
        for (let file of files) {
            const imageUrl = `/uploads/${file.filename}`;
            const data = await prisma_1.default.brideGallery.create({
                data: {
                    imageUrl,
                    displayorder: 0,
                },
            });
            createdImages.push(data);
        }
        return res.json({
            message: "Images uploaded successfully",
            data: createdImages,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Upload failed" });
    }
};
exports.uploadBride = uploadBride;
// ===============================
// ✅ Get Ordered Images
// ===============================
const getBride = async (_req, res) => {
    try {
        const data = await prisma_1.default.brideGallery.findMany({
            orderBy: { displayorder: "asc" },
        });
        return res.json(data);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Fetch failed" });
    }
};
exports.getBride = getBride;
// ===============================
// ✅ Delete Image (DB + File)
// ===============================
const deleteBrideImage = async (req, res) => {
    try {
        const { id } = req.params;
        const image = await prisma_1.default.brideGallery.findUnique({
            where: { id },
        });
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
        // imageUrl stored like: "/uploads/abc123.jpg"
        // We only need the filename
        const filename = image.imageUrl.replace("/uploads/", "");
        const uploadsPath = path_1.default.resolve(process.cwd(), "uploads");
        const filePath = path_1.default.join(uploadsPath, filename);
        // Delete physical file safely
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete DB record
        await prisma_1.default.brideGallery.delete({
            where: { id },
        });
        return res.json({ message: "Bride image deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Delete failed" });
    }
};
exports.deleteBrideImage = deleteBrideImage;
// ===============================
// ✅ Reorder Images
// ===============================
const reorderBride = async (req, res) => {
    try {
        const { items } = req.body;
        /*
          Expected body:
          {
            items: [
              { id: "uuid1", displayorder: 1 },
              { id: "uuid2", displayorder: 2 }
            ]
          }
        */
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid reorder payload" });
        }
        for (let item of items) {
            await prisma_1.default.brideGallery.update({
                where: { id: item.id },
                data: { displayorder: item.displayorder },
            });
        }
        return res.json({ message: "Reordered successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Reorder failed" });
    }
};
exports.reorderBride = reorderBride;
