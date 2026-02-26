import { Request, Response } from "express";
import crypto from "crypto";
import * as bookingService from "../services/booking.service";

/* =========================
   STEP 1 — LOCK BOOKING
========================= */

export const lockBooking = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      slotIds,
      bookingDate,
      customerName,
      phone,
      email
    } = req.body;

    if (
      !productId ||
      !slotIds ||
      !bookingDate ||
      !customerName ||
      !phone ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "slotIds must be a non-empty array"
      });
    }

    const booking = await bookingService.lockBooking({
      productId,
      slotIds,
      bookingDate,
      customerName,
      phone,
      email
    });

    return res.status(201).json({
      success: true,
      booking
    });

  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/* =========================
   STEP 2 — GET BOOKING
========================= */

export const getBooking = async (req: Request, res: Response) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.bookingId
    );

    return res.json({
      success: true,
      booking
    });

  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
};


/* =========================
   STEP 3 — CREATE ADVANCE PAYMENT
========================= */

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const razorOrder =
      await bookingService.createPaymentOrder(bookingId);

    return res.json({
      success: true,
      razorOrder
    });

  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};


/* =========================
   RAZORPAY WEBHOOK
========================= */

export const webhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

    const signature =
      req.headers["x-razorpay-signature"] as string;

    const rawBody = (req as any).rawBody;

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).send("Invalid webhook signature");
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === "payment.captured") {
      const orderId =
        event.payload.payment.entity.order_id;

      await bookingService.markBookingPaidByWebhook(
        orderId
      );
    }

    return res.json({ status: "ok" });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Webhook error");
  }
};


/* =========================
   SUMMARY API
========================= */

export const getSummary = async (req: Request, res: Response) => {
  try {
    const summary =
      await bookingService.getBookingSummary(
        req.params.bookingId
      );

    return res.json({
      success: true,
      data: summary
    });

  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
};