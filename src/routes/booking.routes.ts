import express from "express";
import {
  lockBooking,
  getBooking,
  getAllBookings,
  getCalendarBookings
} from "../controllers/booking.controller";

const router = express.Router();

router.post("/lock", lockBooking);

router.get("/calendar", getCalendarBookings);

router.get("/", getAllBookings);

router.get("/:bookingId", getBooking);



export default router;