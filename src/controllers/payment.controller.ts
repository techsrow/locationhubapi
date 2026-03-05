import Razorpay from "razorpay";
import prisma from "../lib/prisma";
import { Request, Response } from "express";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export const createOrder = async (req: Request, res: Response) => {

  try {

    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: { product: true }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

   const productPrice = Number(booking.product.price);

const bookingAmount = productPrice * 0.5;

const gstAmount = bookingAmount * 0.18;

const totalPay = bookingAmount + gstAmount;

const razorAmount = Math.round(totalPay * 100);

  const order = await razorpay.orders.create({
  amount: razorAmount,
  currency: "INR",
  receipt: booking.bookingId
});

    await prisma.booking.update({
  where: { id: booking.id },
  data: {
    bookingAmount,
    gstAmount,
    totalAmount: totalPay,
    razorpayOrderId: order.id
  }
});

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: "Order creation failed" });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const booking = await prisma.booking.findFirst({
      where: { razorpayOrderId: razorpay_order_id }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "paid"
      }
    });

    res.json({
      success: true
    });

  } catch (error) {
    res.status(500).json({
      message: "Verification failed"
    });
  }
};