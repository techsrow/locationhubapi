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
router.put("/reorder", reorderTestimonials); // MUST BE ABOVE
router.delete("/:id", deleteTestimonial);



export default router;
