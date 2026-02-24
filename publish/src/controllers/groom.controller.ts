import { Request, Response } from "express";
import prisma from "../config/prisma";
import path from "path";
import fs from "fs";

// ================= Upload =================
export const uploadGroom = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    const createdImages = await Promise.all(
      files.map((file) =>
        prisma.groomGallery.create({
          data: {
            imageUrl: `/uploads/${file.filename}`,
            displayorder: 0,
          },
        })
      )
    );

    return res.status(201).json({
      message: "Groom images uploaded successfully",
      data: createdImages,
    });

  } catch (error) {
    console.error("Upload Groom Error:", error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

// ================= Get =================
export const getGroom = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.groomGallery.findMany({
      orderBy: { displayorder: "asc" },
    });

    return res.status(200).json(data);

  } catch (error) {
    console.error("Fetch Groom Error:", error);
    return res.status(500).json({ message: "Fetch failed" });
  }
};

// ================= Delete =================
export const deleteGroomImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await prisma.groomGallery.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Extract filename from /uploads/filename.jpg
    const filename = image.imageUrl.replace("/uploads/", "");

    const uploadsPath = path.resolve(process.cwd(), "uploads");
    const filePath = path.join(uploadsPath, filename);

    // Delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.groomGallery.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Groom image deleted successfully",
    });

  } catch (error) {
    console.error("Delete Groom Error:", error);
    return res.status(500).json({ message: "Delete failed" });
  }
};

// ================= Reorder =================
export const reorderGroom = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        message: "Invalid reorder payload",
      });
    }

    await Promise.all(
      items.map((item: { id: string; displayorder: number }) =>
        prisma.groomGallery.update({
          where: { id: item.id },
          data: { displayorder: item.displayorder },
        })
      )
    );

    return res.status(200).json({
      message: "Reordered successfully",
    });

  } catch (error) {
    console.error("Reorder Groom Error:", error);
    return res.status(500).json({ message: "Reorder failed" });
  }
};
