import express from "express";
import multer from "multer";
import path from "path";
import {
  createAddOnService,
  getAllAddOnServices,
  getAddOnServiceById,
  updateAddOnService,
  deleteAddOnService,
  reorderAddOnServices,
} from "../controllers/addOnServiceController";

const router = express.Router();

/* =====================================================
   MULTER CONFIG
===================================================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
    }
  },
});

/* =====================================================
   ROUTES
===================================================== */

// CREATE
router.post("/", upload.single("image"), createAddOnService);

// GET ALL
router.get("/", getAllAddOnServices);

// 🔥 REORDER (must be before :id)
router.put("/reorder", reorderAddOnServices);

// GET SINGLE
router.get("/:id", getAddOnServiceById);

// UPDATE
router.put("/:id", upload.single("image"), updateAddOnService);

// DELETE
router.delete("/:id", deleteAddOnService);


export default router;
