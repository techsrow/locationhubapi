import express from "express";
import {
  lockBooking,
  getBooking,
  getAllBookings,
  getCalendarBookings,
  lockDateByAdmin,
  getLockedDates
} from "../controllers/booking.controller";

const router = express.Router();

/* CREATE BOOKING LOCK */
router.post("/lock", lockBooking);

/* CALENDAR BOOKINGS */
router.get("/calendar", getCalendarBookings);

/* ADMIN DATE LOCK */
router.post("/admin/lock-date", lockDateByAdmin);

/* GET LOCKED DATES */
router.get("/locked-dates", getLockedDates);

/* GET ALL BOOKINGS */
router.get("/", getAllBookings);

/* GET SINGLE BOOKING (KEEP LAST) */
router.get("/:bookingId", getBooking);

export default router;