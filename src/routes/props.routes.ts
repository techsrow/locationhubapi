import express from "express";
import { protect } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";
import {
  createProps,
  getAllProps,
  updateProps,
  deleteProps,
  reorderProps,
} from "../controllers/props.controller";

const router = express.Router();

router.post("/", protect, upload.single("image"), createProps);
router.get("/", getAllProps);
router.put("/:id", protect, upload.single("image"), updateProps);
router.delete("/:id", protect, deleteProps);
router.put("/reorder", protect, reorderProps);

export default router;
