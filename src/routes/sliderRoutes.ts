import express from "express";
import multer from "multer";
import {
  getSliders,
  createSlider,
  deleteSlider,
  reorderSlider,
} from "../controllers/sliderController";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", getSliders);
router.post(
  "/",
  protect,
  upload.array("image"),   // 🔥 MUST MATCH FRONTEND
  createSlider
);
router.delete("/:id", deleteSlider);
router.put("/reorder", reorderSlider);

export default router;
