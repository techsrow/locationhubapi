"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const makeupArtist_controller_1 = require("../controllers/makeupArtist.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = express_1.default.Router();
/* =================================
   🔓 Public Routes
================================= */
router.get("/", makeupArtist_controller_1.getAllMakeupArtist);
router.get("/:id", makeupArtist_controller_1.getMakeupArtistById);
/* =================================
   🔐 Protected Routes
================================= */
// 🔥 IMPORTANT: Keep /reorder ABOVE /:id
router.put("/reorder", auth_middleware_1.protect, makeupArtist_controller_1.reorderMakeupArtist);
// Upload multiple images
router.post("/", auth_middleware_1.protect, upload_1.default.array("images", 20), makeupArtist_controller_1.uploadMakeupArtist);
// Update single image
router.put("/:id", auth_middleware_1.protect, upload_1.default.single("image"), makeupArtist_controller_1.updateMakeupArtist);
// Delete
router.delete("/:id", auth_middleware_1.protect, makeupArtist_controller_1.deleteMakeupArtist);
exports.default = router;
