import prisma from "../lib/prisma";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

/* =========================
   LOCK BOOKING
========================= */

export const lockBooking = async (req: Request, res: Response) => {

  try {

    const {
      productId,
      date,
      slotIds,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postcode
    } = req.body;

    if (!productId || !date || !slotIds || !Array.isArray(slotIds)) {
      return res.status(400).json({
        message: "Invalid booking request"
      });
    }

    const bookingDate = new Date(date);

    /* Check slot conflicts */

    const existing = await prisma.bookingSlot.findFirst({
      where: {
        slotId: { in: slotIds },
        booking: {
          bookingDate,
          OR: [
            { paymentStatus: "paid" },
            {
              paymentStatus: "locked",
              lockExpiresAt: { gt: new Date() }
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

        productId,

        bookingDate,

        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postcode,

        paymentStatus: "locked",

        lockExpiresAt: lockExpires,

        slots: {
          create: slotIds.map((slotId: string) => ({
            slotId
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



/* =========================
   GET ALL BOOKINGS
========================= */

export const getAllBookings = async (req: Request, res: Response) => {

  try {

    const bookings = await prisma.booking.findMany({

      orderBy: {
        createdAt: "desc"
      },

      include: {

        product: true,

        slots: {
          include: {
            slot: true
          }
        }

      }

    });

    res.json(bookings);

  } catch (error) {

    console.error("Fetch bookings error:", error);

    res.status(500).json({
      message: "Error fetching bookings"
    });

  }

};


/* =========================
   GET BOOKING
========================= */

/* =========================
   GET BOOKING DETAILS
========================= */

export const getBooking = async (req: Request, res: Response) => {

  try {

    const { bookingId } = req.params;

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

    if (!booking) {

      return res.status(404).json({
        message: "Booking not found"
      });

    }

    res.json(booking);

  } catch (error) {

    console.error("Booking details error:", error);

    res.status(500).json({
      message: "Error fetching booking"
    });

  }

};

export const getCalendarBookings = async (req: Request, res: Response) => {
  try {

    const bookings = await prisma.booking.findMany({
      include: {
        product: true,
        slots: {
          include: { slot: true }
        }
      }
    });

    const events = bookings.flatMap((booking) =>
      booking.slots.map((s) => {

        const date = new Date(booking.bookingDate);

        const start = new Date(date);
        const end = new Date(date);

        const [sh, sm] = s.slot.startTime.split(":");
        const [eh, em] = s.slot.endTime.split(":");

        start.setHours(Number(sh), Number(sm), 0, 0);
        end.setHours(Number(eh), Number(em), 0, 0);

        const customerName =
          `${booking.firstName ?? ""} ${booking.lastName ?? ""}`.trim() || "Customer";

        return {
          title: `${booking.product.name} - ${customerName}`,
          start,
          end,
          bookingId: booking.bookingId
        };

      })
    );

    res.json(events);

  } catch (error) {

    console.error("Calendar booking error:", error);

    res.status(500).json({
      message: "Error loading calendar bookings"
    });

  }
};