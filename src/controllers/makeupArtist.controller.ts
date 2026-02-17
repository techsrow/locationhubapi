import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

/**
 * ===============================
 * 🔹 Upload Multiple Images
 * ===============================
 */
export const uploadMakeupArtist = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Get last displayOrder
    const lastItem = await prisma.makeupArtist.findFirst({
      orderBy: { displayOrder: "desc" },
    });

    let nextOrder = lastItem ? lastItem.displayOrder + 1 : 1;

    const createdItems = [];

    for (const file of files) {
      const newItem = await prisma.makeupArtist.create({
        data: {
          image: `/uploads/makeupArtist/${file.filename}`,
          displayOrder: nextOrder++,
        },
      });

      createdItems.push(newItem);
    }

    return res.status(201).json({
      message: "Makeup Artist images uploaded successfully",
      data: createdItems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

/**
 * ===============================
 * 🔹 Get All (Sorted)
 * ===============================
 */
export const getAllMakeupArtist = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.makeupArtist.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch data" });
  }
};

/**
 * ===============================
 * 🔹 Get Single
 * ===============================
 */
export const getMakeupArtistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.makeupArtist.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching item" });
  }
};

/**
 * ===============================
 * 🔹 Update (Image Optional)
 * ===============================
 */
export const updateMakeupArtist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    const existing = await prisma.makeupArtist.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    let updatedImage = existing.image;

    // If new image uploaded
    if (file) {
      // Delete old image
      const oldImagePath = path.join(
        process.cwd(),
        existing.image
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      updatedImage = `/uploads/makeupArtist/${file.filename}`;
    }

    const updated = await prisma.makeupArtist.update({
      where: { id },
      data: {
        image: updatedImage,
      },
    });

    return res.status(200).json({
      message: "Updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: "Update failed" });
  }
};

/**
 * ===============================
 * 🔹 Delete
 * ===============================
 */
export const deleteMakeupArtist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.makeupArtist.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    // Delete image from storage
    const imagePath = path.join(process.cwd(), existing.image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await prisma.makeupArtist.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Delete failed" });
  }
};

/**
 * ===============================
 * 🔹 Drag Reorder
 * ===============================
 */
export const reorderMakeupArtist = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid reorder payload" });
    }

    const updatePromises = items.map((item: any) =>
      prisma.makeupArtist.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      message: "Reordered successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Reorder failed" });
  }
};
