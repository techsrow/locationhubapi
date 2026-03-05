// import { Request, Response } from "express";
// import crypto from "crypto";
// import * as bookingService from "../services/booking.service";

// /* =========================
//    STEP 1 — LOCK BOOKING
// ========================= */

// export const lockBooking = async (req: Request, res: Response) => {
//   try {
//     const { productId, bookingDate, slotIds } = req.body;

//     if (!productId || !bookingDate || !slotIds?.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     const booking = await bookingService.lockBooking({
//       productId,
//       bookingDate,
//       slotIds,
//     });

//     return res.status(201).json({
//       success: true,
//       bookingId: booking.bookingId,
//     });
//   } catch (err: any) {
//     console.error("LOCK ERROR:", err);
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// export const getBooking = async (req: Request, res: Response) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await bookingService.getBookingSummary(bookingId);

//     return res.json({
//       success: true,
//       booking,
//     });
//   } catch (err: any) {
//     return res.status(404).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


// export const updateCustomerDetails = async (req: Request, res: Response) => {
//   try {
//     const { bookingId } = req.params;

//     const booking = await bookingService.updateCustomerDetails(
//       bookingId,
//       req.body
//     );

//     return res.json({
//       success: true,
//       booking,
//     });
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// export const createPayment = async (req: Request, res: Response) => {
//   try {
//     const { bookingId } = req.params;

//     const order = await bookingService.createPaymentOrder(bookingId);

//     return res.json({
//       success: true,
//       order,
//     });
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

// export const webhook = async (req: Request, res: Response) => {
//   try {
//     const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

//     const signature = req.headers["x-razorpay-signature"] as string;

//     const rawBody = (req as any).rawBody;

//     const generatedSignature = crypto
//       .createHmac("sha256", secret)
//       .update(rawBody)
//       .digest("hex");

//     if (generatedSignature !== signature) {
//       return res.status(400).send("Invalid webhook signature");
//     }

//     const event = JSON.parse(rawBody.toString());

//     if (event.event === "payment.captured") {
//       const orderId = event.payload.payment.entity.order_id;
//       const paymentId = event.payload.payment.entity.id;

//       await bookingService.markBookingPaidByWebhook(
//         orderId,
//         paymentId
//       );
//     }

//     return res.json({ status: "ok" });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).send("Webhook error");
//   }
// };

import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const lockBooking = async (req: Request, res: Response) => {

  try {

    const { productId, date, slotIds } = req.body;

    if (!productId || !date || !slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({
        message: "Invalid booking request"
      });
    }

    const bookingDate = new Date(date);

    const existing = await prisma.bookingSlot.findFirst({
      where: {
        slotId: {
          in: slotIds
        },
        booking: {
          bookingDate: bookingDate,
          OR: [
            {
              paymentStatus: "paid"
            },
            {
              paymentStatus: "locked",
              lockExpiresAt: {
                gt: new Date()
              }
            }
          ]
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        message: "One of the selected slots is already booked"
      });
    }

    const lockExpires = new Date(Date.now() + 10 * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        bookingId: uuidv4(),
        productId: productId,
        bookingDate: bookingDate,
        paymentStatus: "locked",
        lockExpiresAt: lockExpires,

        slots: {
          create: slotIds.map((slotId: string) => ({
            slotId: slotId
          }))
        }

      }
    });

    return res.json({
      success: true,
      bookingId: booking.bookingId
    });

  } catch (error) {

    console.error("Lock booking error:", error);

    return res.status(500).json({
      message: "Booking lock failed"
    });

  }

};