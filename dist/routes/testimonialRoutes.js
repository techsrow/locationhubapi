"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../middlewares/upload"));
const testimonialController_1 = require("../controllers/testimonialController");
const router = express_1.default.Router();
router.post("/", upload_1.default.single("image"), testimonialController_1.createTestimonial);
router.get("/", testimonialController_1.getTestimonials);
router.put("/reorder", testimonialController_1.reorderTestimonials); // MUST BE ABOVE
router.delete("/:id", testimonialController_1.deleteTestimonial);
exports.default = router;
