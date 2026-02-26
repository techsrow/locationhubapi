import express from "express";
import { addProduct, addSlot, getProduct } from "../controllers/product.controller";

const router = express.Router();

router.post("/add", addProduct);
router.post("/add-slot", addSlot);
router.get("/:id", getProduct);

export default router;