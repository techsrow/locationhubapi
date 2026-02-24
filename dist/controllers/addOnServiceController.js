"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderAddOnServices = exports.deleteAddOnService = exports.updateAddOnService = exports.getAddOnServiceById = exports.getAllAddOnServices = exports.createAddOnService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/* =====================================================
   CREATE ADD ON SERVICE
===================================================== */
const createAddOnService = async (req, res) => {
    try {
        const { title, pageUrl } = req.body;
        const file = req.file;
        if (!title || !file || !pageUrl) {
            return res.status(400).json({
                message: "Title, Page URL and image are required",
            });
        }
        // Check if pageUrl already exists
        const existing = await prisma_1.default.addOnService.findUnique({
            where: { pageUrl },
        });
        if (existing) {
            return res.status(400).json({
                message: "Page URL already exists. Use a different one.",
            });
        }
        const lastItem = await prisma_1.default.addOnService.findFirst({
            orderBy: { displayorder: "desc" },
        });
        const newDisplayOrder = lastItem ? lastItem.displayorder + 1 : 1;
        const newItem = await prisma_1.default.addOnService.create({
            data: {
                title,
                pageUrl,
                imageUrl: `/uploads/${file.filename}`,
                displayorder: newDisplayOrder,
            },
        });
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error("CREATE ERROR:", error);
        res.status(500).json({
            message: error?.message || error,
        });
    }
};
exports.createAddOnService = createAddOnService;
/* =====================================================
   GET ALL (Sorted)
===================================================== */
const getAllAddOnServices = async (req, res) => {
    try {
        const items = await prisma_1.default.addOnService.findMany({
            orderBy: { displayorder: "asc" },
        });
        res.json(items);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching Add On Services" });
    }
};
exports.getAllAddOnServices = getAllAddOnServices;
/* =====================================================
   GET SINGLE
===================================================== */
const getAddOnServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prisma_1.default.addOnService.findUnique({
            where: { id },
        });
        if (!item) {
            return res.status(404).json({ message: "Add On Service not found" });
        }
        res.json(item);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching Add On Service" });
    }
};
exports.getAddOnServiceById = getAddOnServiceById;
/* =====================================================
   UPDATE (With Optional Image Replace)
===================================================== */
const updateAddOnService = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const { pageUrl } = req.body;
        const file = req.file;
        const existingItem = await prisma_1.default.addOnService.findUnique({
            where: { id },
        });
        if (!existingItem) {
            return res.status(404).json({ message: "Add On Service not found" });
        }
        let updatedImageUrl = existingItem.imageUrl;
        // If new image uploaded → delete old file
        if (file) {
            const oldPath = path_1.default.join(__dirname, "..", existingItem.imageUrl);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
            }
            updatedImageUrl = `/uploads/${file.filename}`;
        }
        const updatedItem = await prisma_1.default.addOnService.update({
            where: { id },
            data: {
                title: title ?? existingItem.title,
                pageUrl: pageUrl ?? existingItem.pageUrl,
                imageUrl: updatedImageUrl,
            },
        });
        res.json(updatedItem);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating Add On Service" });
    }
};
exports.updateAddOnService = updateAddOnService;
/* =====================================================
   DELETE (With File Cleanup)
===================================================== */
const deleteAddOnService = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await prisma_1.default.addOnService.findUnique({
            where: { id },
        });
        if (!item) {
            return res.status(404).json({ message: "Add On Service not found" });
        }
        // Remove image file
        const filePath = path_1.default.join(__dirname, "..", item.imageUrl);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        await prisma_1.default.addOnService.delete({
            where: { id },
        });
        res.json({ message: "Add On Service deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting Add On Service" });
    }
};
exports.deleteAddOnService = deleteAddOnService;
/* =====================================================
   REORDER (Drag & Drop)
===================================================== */
const reorderAddOnServices = async (req, res) => {
    try {
        const { items } = req.body;
        // items = [{ id: string, displayorder: number }]
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "Invalid reorder data" });
        }
        const updatePromises = items.map((item) => prisma_1.default.addOnService.update({
            where: { id: item.id },
            data: { displayorder: item.displayorder },
        }));
        await Promise.all(updatePromises);
        res.json({ message: "Reordered successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error reordering Add On Services" });
    }
};
exports.reorderAddOnServices = reorderAddOnServices;
