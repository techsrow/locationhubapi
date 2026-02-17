import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middlewares/auth.middleware";
import {
  uploadBride,
  getBride,
  deleteBrideImage,
  reorderBride,
} from "../controllers/bride.controller";

/* ===============================
   Upload Folder (Production Safe)
=================================*/

// Always use project root
const uploadPath = path.resolve(process.cwd(), "uploads");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* ===============================
   Storage Config
=================================*/
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadPath);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

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

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Only image files allowed. Received extension: ${ext}`
      )
    );
  }
};

/* ===============================
   Multer Setup
=================================*/
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ 5MB limit
  },
});

/* ===============================
   Routes
=================================*/
const router = Router();

// Public
router.get("/", getBride);

// Protected
router.post(
  "/",
  protect,
  upload.array("image", 20),
  uploadBride
);

router.delete("/:id", protect, deleteBrideImage);

router.put("/reorder", protect, reorderBride);

export default router;
