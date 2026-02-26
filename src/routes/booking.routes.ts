import express from "express";
import {
  lockBooking,
   getBooking,
   updateCustomerDetails,
   createPayment,
    webhook,
  // getSummary
} from "../controllers/booking.controller";

const router = express.Router();

router.post("/lock", lockBooking);

router.get("/:bookingId", getBooking);
router.put("/:bookingId/customer", updateCustomerDetails);
router.post("/:bookingId/pay", createPayment);
router.post("/webhook", webhook);




export default router;