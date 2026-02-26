import prisma from "../lib/prisma";
import razorpay from "../utils/razorpay";
import { sendBookingEmails } from "./email.service";

/* =========================
   LOCK BOOKING (FREEZE DATA)
========================= */

export const lockBooking = async (data: {
  productId: string;
  slotIds: string[];
  bookingDate: string;
  customerName: string;
  phone: string;
  email: string;
}) => {

  const { productId, slotIds, bookingDate, customerName, phone, email } = data;

  return await prisma.$transaction(async (tx) => {

    // 1️⃣ Check availability
    for (const slotId of slotIds) {
      const existing = await tx.booking.findFirst({
        where: {
          productId,
          bookingDate: new Date(bookingDate),
          OR: [
            { paymentStatus: "paid" },
            {
              paymentStatus: "locked",
              lockExpiresAt: { gt: new Date() }
            }
          ],
          slots: { some: { slotId } }
        }
      });

      if (existing) {
        throw new Error("One of the selected slots is already booked");
      }
    }

    // 2️⃣ Get product
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) throw new Error("Product not found");

    // 3️⃣ Calculate FULL amount (multi-slot)
    const baseAmount = product.price * slotIds.length;
    const gstAmount = Number((baseAmount * 0.18).toFixed(2));
    const totalAmount = Number((baseAmount + gstAmount).toFixed(2));
    const bookingAmount = Number((totalAmount * 0.5).toFixed(2));

    const bookingId = "LH-" + Date.now();
    const lockTime = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await tx.booking.create({
      data: {
        bookingId,
        productId,
        bookingDate: new Date(bookingDate),
        customerName,
        phone,
        email,
        totalAmount,
        bookingAmount,
        gstAmount,
        paymentStatus: "locked",
        lockExpiresAt: lockTime,
        slots: {
          create: slotIds.map((slotId) => ({ slotId }))
        }
      },
      include: {
        product: true,
        slots: { include: { slot: true } }
      }
    });

    return booking;
  });
};


/* =========================
   GET BOOKING
========================= */

export const getBookingById = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: {
      product: true,
      slots: {
        include: {
          slot: true
        }
      }
    }
  });

  if (!booking) throw new Error("Booking not found");

  const remaining =
    (booking.totalAmount ?? 0) - (booking.bookingAmount ?? 0);

  return {
    bookingId: booking.bookingId,
    productName: booking.product.name,
    bookingDate: booking.bookingDate,
    customerName: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    totalAmount: booking.totalAmount,
    gstAmount: booking.gstAmount,
    advancePaid: booking.bookingAmount,
    remainingAmount: remaining,
    paymentStatus: booking.paymentStatus,
    slots: booking.slots.map((s) => ({
      slotId: s.slotId,
      label: s.slot?.label,
      startTime: s.slot?.startTime,
      endTime: s.slot?.endTime
    }))
  };
};


/* =========================
   CREATE ADVANCE PAYMENT
========================= */

export const createPaymentOrder = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId }
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.paymentStatus === "paid")
    throw new Error("Already paid");
  if (booking.razorpayOrderId)
    throw new Error("Payment already initiated");

  const razorOrder = await razorpay.orders.create({
    amount: Math.round((booking.bookingAmount ?? 0) * 100),
    currency: "INR",
    receipt: bookingId
  });

  await prisma.booking.update({
    where: { bookingId },
    data: { razorpayOrderId: razorOrder.id }
  });

  return razorOrder;
};


/* =========================
   WEBHOOK
========================= */

export const markBookingPaidByWebhook = async (
  razorpayOrderId: string
) => {

  const booking = await prisma.booking.findUnique({
    where: { razorpayOrderId }
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.paymentStatus === "paid") return booking;

  const updated = await prisma.booking.update({
    where: { razorpayOrderId },
    data: {
      paymentStatus: "paid",
      lockExpiresAt: null
    }
  });

  await sendBookingEmails(updated);

  return updated;
};


/* =========================
   PAY REMAINING
========================= */

export const payRemaining = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId }
  });

  if (!booking) throw new Error("Booking not found");

  const remaining =
    (booking.totalAmount ?? 0) - (booking.bookingAmount ?? 0);

  const razorOrder = await razorpay.orders.create({
    amount: Math.round(remaining * 100),
    currency: "INR",
    receipt: bookingId + "-remaining"
  });

  await prisma.booking.update({
    where: { bookingId },
    data: { razorpayOrderId: razorOrder.id }
  });

  return razorOrder;
};


/* =========================
   SUMMARY (NO RECALCULATION)
========================= */

export const getBookingSummary = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: { product: true }
  });

  if (!booking) throw new Error("Booking not found");

  const remaining =
    (booking.totalAmount ?? 0) - (booking.bookingAmount ?? 0);

  return {
    bookingId: booking.bookingId,
    productName: booking.product.name,
    totalAmount: booking.totalAmount,
    gstAmount: booking.gstAmount,
    advancePaid: booking.bookingAmount,
    remainingAmount: remaining,
    paymentStatus: booking.paymentStatus
  };
};


/* =========================
   CANCEL
========================= */

export const cancelBooking = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId }
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.paymentStatus !== "paid")
    throw new Error("Only paid booking can be cancelled");

  return await prisma.booking.update({
    where: { bookingId },
    data: { paymentStatus: "cancelled" }
  });
};