"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const addOnServiceController_1 = require("../controllers/addOnServiceController");
const router = express_1.default.Router();
/* =====================================================
   MULTER CONFIG
===================================================== */
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);
        if (extName && mimeType) {
            cb(null, true);
        }
        else {
            cb(new Error("Only images are allowed (jpeg, jpg, png, webp)"));
        }
    },
});
/* =====================================================
   ROUTES
===================================================== */
// CREATE
router.post("/", upload.single("image"), addOnServiceController_1.createAddOnService);
// GET ALL
router.get("/", addOnServiceController_1.getAllAddOnServices);
// 🔥 REORDER (must be before :id)
router.put("/reorder", addOnServiceController_1.reorderAddOnServices);
// GET SINGLE
router.get("/:id", addOnServiceController_1.getAddOnServiceById);
// UPDATE
router.put("/:id", upload.single("image"), addOnServiceController_1.updateAddOnService);
// DELETE
router.delete("/:id", addOnServiceController_1.deleteAddOnService);
exports.default = router;
