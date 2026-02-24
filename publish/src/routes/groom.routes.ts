import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middlewares/auth.middleware";
import {
  uploadGroom,
  getGroom,
  deleteGroomImage,
  reorderGroom,
} from "../controllers/groom.controller";

const router = Router();

// ================= Upload Folder =================
const uploadPath = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ================= Multer Config =================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
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

const fileFilter = (_req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ================= Routes =================

router.get("/", getGroom);

router.post(
  "/",
  protect,
  upload.array("image", 20),
  uploadGroom
);

router.delete("/:id", protect, deleteGroomImage);

router.put("/reorder", protect, reorderGroom);

export default router;
