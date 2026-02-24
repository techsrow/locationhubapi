"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const upload_1 = __importDefault(require("../middlewares/upload"));
const props_controller_1 = require("../controllers/props.controller");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.protect, upload_1.default.single("image"), props_controller_1.createProps);
router.get("/", props_controller_1.getAllProps);
router.put("/reorder", auth_middleware_1.protect, props_controller_1.reorderProps); // ✅ ABOVE :id
router.put("/:id", auth_middleware_1.protect, upload_1.default.single("image"), props_controller_1.updateProps);
router.delete("/:id", auth_middleware_1.protect, props_controller_1.deleteProps);
exports.default = router;
