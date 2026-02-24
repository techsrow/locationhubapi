"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const setController_1 = require("../controllers/setController");
const router = express_1.default.Router();
/* ================================
   MULTER CONFIG
================================ */
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path_1.default.extname(file.originalname);
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({ storage });
/* ================================
   SET ROUTES
================================ */
router.post("/", upload.single("mainImage"), setController_1.createSet);
router.get("/", setController_1.getAllSets);
router.get("/:id", setController_1.getSingleSet);
router.get("/:id/gallery", setController_1.getSetGallery);
router.put("/:id", upload.single("mainImage"), setController_1.updateSet);
router.delete("/:id", setController_1.deleteSet);
/* ================================
   GALLERY ROUTES
================================ */
router.post("/:id/gallery", upload.single("image"), setController_1.addSetGalleryImage);
router.delete("/gallery/:id", setController_1.deleteSetGalleryImage);
router.put("/gallery/reorder", setController_1.reorderSetGallery);
exports.default = router;
