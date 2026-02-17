import express from "express";
import upload from "../middlewares/upload";
import {
  createTestimonial,
  getTestimonials,
  deleteTestimonial,
  reorderTestimonials,
} from "../controllers/testimonialController";

const router = express.Router();

router.post("/", upload.single("image"), createTestimonial);
router.get("/", getTestimonials);
router.delete("/:id", deleteTestimonial);
router.put("/reorder", reorderTestimonials);

export default router;
