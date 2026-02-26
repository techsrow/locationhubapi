import { Request, Response } from "express";
import crypto from "crypto";
import * as bookingService from "../services/booking.service";

/* =========================
   STEP 1 — LOCK BOOKING
========================= */

export const lockBooking = async (req: Request, res: Response) => {
  try {
    const { productId, bookingDate, slotIds } = req.body;

    if (!productId || !bookingDate || !slotIds?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const booking = await bookingService.lockBooking({
      productId,
      bookingDate,
      slotIds,
    });

    return res.status(201).json({
      success: true,
      bookingId: booking.bookingId,
    });
  } catch (err: any) {
    console.error("LOCK ERROR:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const getBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await bookingService.getBookingSummary(bookingId);

    return res.json({
      success: true,
      booking,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};


export const updateCustomerDetails = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await bookingService.updateCustomerDetails(
      bookingId,
      req.body
    );

    return res.json({
      success: true,
      booking,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const order = await bookingService.createPaymentOrder(bookingId);

    return res.json({
      success: true,
      order,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const webhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

    const signature = req.headers["x-razorpay-signature"] as string;

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
      const orderId = event.payload.payment.entity.order_id;
      const paymentId = event.payload.payment.entity.id;

      await bookingService.markBookingPaidByWebhook(
        orderId,
        paymentId
      );
    }

    return res.json({ status: "ok" });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Webhook error");
  }
};

