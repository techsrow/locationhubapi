import express from "express";
import { getAvailability } from "../controllers/availability.controller";

const router = express.Router();

router.get("/", getAvailability);

export default router;