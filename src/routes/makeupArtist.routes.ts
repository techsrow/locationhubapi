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

/* =================================
   🔓 Public Routes
================================= */

router.get("/", getAllMakeupArtist);
router.get("/:id", getMakeupArtistById);

/* =================================
   🔐 Protected Routes
================================= */

// 🔥 IMPORTANT: Keep /reorder ABOVE /:id
router.put("/reorder", protect, reorderMakeupArtist);

// Upload multiple images
router.post(
  "/",
  protect,
  upload.array("images", 20),
  uploadMakeupArtist
);

// Update single image
router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateMakeupArtist
);

// Delete
router.delete("/:id", protect, deleteMakeupArtist);

export default router;
