"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const sliderController_1 = require("../controllers/sliderController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: "uploads/" });
router.get("/", sliderController_1.getSliders);
router.post("/", auth_middleware_1.protect, upload.array("image"), // 🔥 MUST MATCH FRONTEND
sliderController_1.createSlider);
router.delete("/:id", sliderController_1.deleteSlider);
router.put("/reorder", sliderController_1.reorderSlider);
exports.default = router;
