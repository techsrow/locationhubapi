import prisma from "../lib/prisma";
import razorpay from "../utils/razorpay";
import { sendBookingEmails } from "./email.service";

/* =========================
   LOCK BOOKING (FREEZE DATA)
========================= */


export const lockBooking = async (data: {
  productId: string;
  bookingDate: string;
  slotIds: string[];
}) => {
  const { productId, bookingDate, slotIds } = data;

  // Normalize date (remove time)
  const normalizedDate = new Date(bookingDate);
  normalizedDate.setHours(0, 0, 0, 0);

  return await prisma.$transaction(async (tx) => {

    // 1️⃣ Validate product exists
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error("Product not found");

    // 2️⃣ Validate slots belong to product
    const slots = await tx.slot.findMany({
      where: {
        id: { in: slotIds },
        productId,
      },
    });

    if (slots.length !== slotIds.length) {
      throw new Error("Invalid slot selection");
    }

    // 3️⃣ Check availability
    for (const slotId of slotIds) {
      const existing = await tx.booking.findFirst({
        where: {
          productId,
          bookingDate: normalizedDate,
          OR: [
            { paymentStatus: "paid" },
            {
              paymentStatus: "locked",
              lockExpiresAt: { gt: new Date() },
            },
          ],
          slots: {
            some: { slotId },
          },
        },
      });

      if (existing) {
        throw new Error("One of the selected slots is already booked");
      }
    }

    // 4️⃣ Pricing Calculation
    const baseAmount = product.price * slotIds.length;
    const gstAmount = Number((baseAmount * 0.18).toFixed(2));
    const totalAmount = Number((baseAmount + gstAmount).toFixed(2));
    const bookingAmount = Number((totalAmount * 0.5).toFixed(2));

    const bookingId = "LH-" + Date.now();
    const lockExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 5️⃣ Create booking
    const booking = await tx.booking.create({
      data: {
        bookingId,
        productId,
        bookingDate: normalizedDate,
        totalAmount,
        gstAmount,
        bookingAmount,
        paymentStatus: "locked",
        lockExpiresAt,
        slots: {
          create: slotIds.map((slotId) => ({
            slotId,
          })),
        },
      },
    });

    return booking;
  });
};


export const getBookingSummary = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: {
      product: true,
      slots: {
        include: {
          slot: true,
        },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");

  const remaining =
    (booking.totalAmount ?? 0) - (booking.bookingAmount ?? 0);

  return {
    bookingId: booking.bookingId,
    productName: booking.product.name,
    bookingDate: booking.bookingDate,
    paymentStatus: booking.paymentStatus,
    paymentId: booking.razorpayPaymentId,

    customerName: `${booking.firstName ?? ""} ${booking.lastName ?? ""}`,
    email: booking.email,

    slots: booking.slots.map((s) => ({
      label: s.slot.label,
      startTime: s.slot.startTime,
      endTime: s.slot.endTime,
    })),

    totalAmount: booking.totalAmount,
    gstAmount: booking.gstAmount,
    bookingAmount: booking.bookingAmount,
    remainingAmount: remaining,
  };
};


export const updateCustomerDetails = async (
  bookingId: string,
  data: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    phone: string;
    email: string;
    notes?: string;
  }
) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.paymentStatus !== "locked") {
    throw new Error("Cannot update paid booking");
  }

  return await prisma.booking.update({
    where: { bookingId },
    data,
  });
};

export const createPaymentOrder = async (bookingId: string) => {

  const booking = await prisma.booking.findUnique({
    where: { bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.paymentStatus !== "locked") {
    throw new Error("Booking not available for payment");
  }

  if (booking.razorpayOrderId) {
    throw new Error("Payment already initiated");
  }

  const razorOrder = await razorpay.orders.create({
    amount: Math.round((booking.bookingAmount ?? 0) * 100), // paise
    currency: "INR",
    receipt: bookingId,
  });

  await prisma.booking.update({
    where: { bookingId },
    data: {
      razorpayOrderId: razorOrder.id,
    },
  });

  return razorOrder;
};

export const markBookingPaidByWebhook = async (
  razorpayOrderId: string,
  razorpayPaymentId: string
) => {

  const booking = await prisma.booking.findUnique({
    where: { razorpayOrderId },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.paymentStatus === "paid") return booking;

  const updated = await prisma.booking.update({
    where: { razorpayOrderId },
    data: {
      paymentStatus: "paid",
      razorpayPaymentId,
      lockExpiresAt: null,
    },
  });

  // TODO: send email here
  // await sendBookingEmails(updated);

  return updated;
};

