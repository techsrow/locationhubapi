import express from "express";
import multer from "multer";
import path from "path";

import {
  createSet,
  getAllSets,
  getSingleSet,
  updateSet,
  deleteSet,
  addSetGalleryImage,
  deleteSetGalleryImage,
  reorderSetGallery,
  getSetGallery,
} from "../controllers/setController";

const router = express.Router();

/* ================================
   MULTER CONFIG
================================ */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ================================
   SET ROUTES
================================ */

router.post("/", upload.single("mainImage"), createSet);
router.get("/", getAllSets);


router.get("/:id", getSingleSet);
router.get("/:id/gallery", getSetGallery);


router.put("/:id", upload.single("mainImage"), updateSet);
router.delete("/:id", deleteSet);

/* ================================
   GALLERY ROUTES
================================ */

router.post("/:id/gallery", upload.single("image"), addSetGalleryImage);
router.delete("/gallery/:id", deleteSetGalleryImage);
router.put("/gallery/reorder", reorderSetGallery);

export default router;
