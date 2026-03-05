import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { productId, date } = req.query;

    const selectedDate = new Date(date as string);

    const slots = await prisma.slot.findMany({
      where: { productId: productId as string }
    });

    const booked = await prisma.bookingSlot.findMany({
      where: {
        booking: {
          bookingDate: selectedDate,
          paymentStatus: {
            in: ["locked", "paid"]
          }
        }
      },
      include: {
        slot: true
      }
    });

    const bookedSlotIds = booked.map(b => b.slotId);

    res.json({
      slots,
      bookedSlots: bookedSlotIds
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching availability" });
  }
};