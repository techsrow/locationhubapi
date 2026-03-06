import express from "express";
import { lockBooking, getBooking } from "../controllers/booking.controller";

const router = express.Router();

router.post("/lock", lockBooking);
router.get("/:bookingId", getBooking);

export default router;