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
const groom_controller_1 = require("../controllers/groom.controller");
const router = (0, express_1.Router)();
// ================= Upload Folder =================
const uploadPath = path_1.default.resolve(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
// ================= Multer Config =================
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + ext);
    },
});
const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".cr2",
];
const fileFilter = (_req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type"));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
// ================= Routes =================
router.get("/", groom_controller_1.getGroom);
router.post("/", auth_middleware_1.protect, upload.array("image", 20), groom_controller_1.uploadGroom);
router.delete("/:id", auth_middleware_1.protect, groom_controller_1.deleteGroomImage);
router.put("/reorder", auth_middleware_1.protect, groom_controller_1.reorderGroom);
exports.default = router;
