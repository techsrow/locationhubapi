import express from "express";
import {
  getProducts,
  getProductById,
  getProductBySlug,
  addProduct,
  addSlot,
  updateProduct,
  deleteProduct,
  deleteSlot
} from "../controllers/product.controller";

const router = express.Router();

router.get("/", getProducts);

router.get("/id/:id", getProductById);

// router.get("/slug/:slug", getProductBySlug);

router.get("/:slug", getProductBySlug);

router.post("/add", addProduct);

router.post("/add-slot", addSlot);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

router.delete("/slot/:id", deleteSlot);

export default router;