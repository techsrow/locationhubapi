import { Router } from "express";
import {
  createSetup,
  getAllSetups,
  getSetupBySlug,
  updateSetup,
  deleteSetup,
  reorderSetups,
  getSetupById,
  deleteSetupGalleryImage,
  reorderSetupGallery,
} from "../controllers/setup.controller";

import upload from "../middlewares/upload";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

const setupUpload = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "gallery", maxCount: 20 },
]);

/* ================= PUBLIC ROUTES ================= */

router.get("/", getAllSetups);

// ADMIN FETCH BY ID (must be before slug)
router.get("/id/:id", getSetupById);

/* ================= GALLERY ROUTES (PROTECTED) ================= */

// Delete single gallery image
router.delete(
  "/gallery/:imageId",
  protect,
  deleteSetupGalleryImage
);

// Reorder gallery images
router.patch(
  "/gallery/reorder",
  protect,
  reorderSetupGallery
);

/* ================= PROTECTED SETUP ROUTES ================= */

router.post("/", protect, setupUpload, createSetup);

router.put("/:id", protect, setupUpload, updateSetup);

router.delete("/:id", protect, deleteSetup);

// Reorder parent setups
router.patch("/reorder", protect, reorderSetups);

/* ================= PUBLIC SLUG ROUTE (ALWAYS LAST) ================= */

router.get("/:slug", getSetupBySlug);

export default router;
