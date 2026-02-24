import { Request, Response } from "express";
import prisma from "../config/prisma";
import path from "path";
import fs from "fs";

// ===============================
// ✅ Upload Multiple Images
// ===============================
export const uploadBride = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Images required" });
    }

    const createdImages = [];

    for (let file of files) {
      const imageUrl = `/uploads/${file.filename}`;

      const data = await prisma.brideGallery.create({
        data: {
          imageUrl,
          displayorder: 0,
        },
      });

      createdImages.push(data);
    }

    return res.json({
      message: "Images uploaded successfully",
      data: createdImages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

// ===============================
// ✅ Get Ordered Images
// ===============================
export const getBride = async (_req: Request, res: Response) => {
  try {
    const data = await prisma.brideGallery.findMany({
      orderBy: { displayorder: "asc" },
    });

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Fetch failed" });
  }
};

// ===============================
// ✅ Delete Image (DB + File)
// ===============================
export const deleteBrideImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const image = await prisma.brideGallery.findUnique({
      where: { id },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // imageUrl stored like: "/uploads/abc123.jpg"
    // We only need the filename
    const filename = image.imageUrl.replace("/uploads/", "");

    const uploadsPath = path.resolve(process.cwd(), "uploads");
    const filePath = path.join(uploadsPath, filename);

    // Delete physical file safely
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete DB record
    await prisma.brideGallery.delete({
      where: { id },
    });

    return res.json({ message: "Bride image deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Delete failed" });
  }
};

// ===============================
// ✅ Reorder Images
// ===============================
export const reorderBride = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    /*
      Expected body:
      {
        items: [
          { id: "uuid1", displayorder: 1 },
          { id: "uuid2", displayorder: 2 }
        ]
      }
    */

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid reorder payload" });
    }

    for (let item of items) {
      await prisma.brideGallery.update({
        where: { id: item.id },
        data: { displayorder: item.displayorder },
      });
    }

    return res.json({ message: "Reordered successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Reorder failed" });
  }
};
