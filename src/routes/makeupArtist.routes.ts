import express from "express";
import {
  uploadMakeupArtist,
  getAllMakeupArtist,
  getMakeupArtistById,
  updateMakeupArtist,
  deleteMakeupArtist,
  reorderMakeupArtist,
} from "../controllers/makeupArtist.controller";

import { protect } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";

const router = express.Router();

/**
 * ===============================
 * 🔹 Public Routes
 * ===============================
 */
router.get("/", getAllMakeupArtist);
router.get("/:id", getMakeupArtistById);

/**
 * ===============================
 * 🔹 Protected Routes
 * ===============================
 */

// Upload multiple
router.post(
  "/upload",
  protect,
  upload.array("images", 20),
  uploadMakeupArtist
);

// Update single
router.put(
  "/update/:id",
  protect,
  upload.single("image"),
  updateMakeupArtist
);

// Delete
router.delete(
  "/delete/:id",
  protect,
  deleteMakeupArtist
);

// Reorder
router.put(
  "/reorder",
  protect,
  reorderMakeupArtist
);

export default router;
