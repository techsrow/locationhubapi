import express from "express";
import {
  lockBooking,
  getBooking,
  createPayment,
  webhook,
  getSummary
} from "../controllers/booking.controller";

const router = express.Router();

router.post("/lock", lockBooking);
router.get("/:bookingId", getBooking);
router.post("/payment/:bookingId", createPayment);
router.get("/summary/:bookingId", getSummary);

// ⚠ Webhook must use express.raw
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

export default router;