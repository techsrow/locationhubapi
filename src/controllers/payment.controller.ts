import Razorpay from "razorpay";
import prisma from "../lib/prisma";
import { Request, Response } from "express";
import crypto from "crypto";
import transporter from "../services/email.service";
import { customerBookingEmail } from "../emails/customerBookingEmail";
import { adminBookingEmail } from "../emails/adminBookingEmail";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});


/* ------------------------------------------------
   CREATE RAZORPAY ORDER
------------------------------------------------ */

export const createOrder = async (req: Request, res: Response) => {

  try {

    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
      include: {
        product: true,
        slots: {
          include: { slot: true }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ===============================
       FIXED PAYMENT CALCULATION
       Advance = ₹5000 + GST
    =============================== */

    const bookingAmount = 5000;
    const gstAmount = Number((bookingAmount * 0.18).toFixed(2));
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
        bookingAmount: bookingAmount,
        gstAmount: gstAmount,
        totalAmount: totalPay,
        razorpayOrderId: order.id
      }
    });

    res.json(order);

  } catch (error) {

    console.error("Create order error:", error);

    res.status(500).json({
      message: "Order creation failed"
    });

  }

};


/* ------------------------------------------------
   VERIFY PAYMENT
------------------------------------------------ */

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

      return res.status(400).json({
        message: "Invalid signature"
      });

    }

    const booking = await prisma.booking.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        product: true,
        slots: {
          include: { slot: true }
        }
      }
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


    /* ------------------------------------------------
       PREPARE EMAIL DATA
    ------------------------------------------------ */

    const slotText = booking.slots
      .map((s: any) => s.slot.label)
      .join(", ");

    const bookingDate = new Date(booking.bookingDate).toLocaleDateString();


    /* ------------------------------------------------
       SEND CUSTOMER EMAIL
    ------------------------------------------------ */

    try {

      if (booking.email) {

        await transporter.sendMail({

          from: process.env.EMAIL_USER,

          to: booking.email,

          subject: `Booking Confirmed - ${booking.bookingId}`,

          html: customerBookingEmail({
            bookingId: booking.bookingId,
            firstName: booking.firstName || "Customer",
            product: booking.product.name,
            date: bookingDate,
            slots: slotText
          })

        });

      }

    } catch (err) {

      console.error("Customer email failed:", err);

    }


    /* ------------------------------------------------
       SEND ADMIN EMAIL
    ------------------------------------------------ */

    try {

      await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,

        subject: `New Booking ${booking.bookingId}`,

        html: adminBookingEmail({
          bookingId: booking.bookingId,
          name: `${booking.firstName || ""} ${booking.lastName || ""}`.trim(),
          email: booking.email || "Not Provided",
          date: bookingDate,
          package: booking.product.name,
          slots: slotText,
          cost: booking.product.price,
          total: booking.totalAmount,
          advance: booking.bookingAmount, // ✅ FIXED
          due: Number(booking.product.price) - Number(booking.bookingAmount),
          paymentMethod: "Razorpay",
          address: booking.address || "-",
          city: booking.city || "-",
          postcode: booking.postcode || "-",
          state: booking.state || "-",
          phone: booking.phone || "-"
        })

      });

    } catch (err) {

      console.error("Admin email failed:", err);

    }


    res.json({
      success: true
    });

  } catch (error) {

    console.log("Verify Payment Request:", req.body);
    console.error("Payment verification error:", error);

    res.status(500).json({
      message: "Verification failed"
    });

  }

};