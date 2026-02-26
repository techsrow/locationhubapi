import express from "express";
import { addProduct, addSlot } from "../controllers/product.controller";

const router = express.Router();

router.post("/add", addProduct);
router.post("/add-slot", addSlot);

export default router;