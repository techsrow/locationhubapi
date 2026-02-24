"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const bride_controller_1 = require("../controllers/bride.controller");
/* ===============================
   Upload Folder (Production Safe)
=================================*/
// Always use project root
const uploadPath = path_1.default.resolve(process.cwd(), "uploads");
// Ensure folder exists
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
/* ===============================
   Storage Config
=================================*/
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadPath);
    },
    filename: function (_req, file, cb) {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + ext);
    },
});
/* ===============================
   Extension-Based Validation
=================================*/
const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".cr2",
];
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Only image files allowed. Received extension: ${ext}`));
    }
};
/* ===============================
   Multer Setup
=================================*/
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // ✅ 5MB limit
    },
});
/* ===============================
   Routes
=================================*/
const router = (0, express_1.Router)();
// Public
router.get("/", bride_controller_1.getBride);
// Protected
router.post("/", auth_middleware_1.protect, upload.array("image", 20), bride_controller_1.uploadBride);
router.delete("/:id", auth_middleware_1.protect, bride_controller_1.deleteBrideImage);
router.put("/reorder", auth_middleware_1.protect, bride_controller_1.reorderBride);
exports.default = router;
