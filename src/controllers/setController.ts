import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

/* ================================
   CREATE SET
================================ */
export const createSet = async (req: Request, res: Response) => {
  try {
    const { title, content, pageUrl } = req.body;
    const file = req.file;

    if (!title || !pageUrl || !file) {
      return res.status(400).json({
        message: "Title, Page URL & Main Image are required",
      });
    }

    // Check duplicate pageUrl
    const existingSlug = await prisma.set.findUnique({
      where: { pageUrl },
    });

    if (existingSlug) {
      return res.status(400).json({
        message: "Page URL already exists",
      });
    }

    const newSet = await prisma.set.create({
      data: {
        title,
        content,
        pageUrl,
        mainImage: `/uploads/${file.filename}`,
      },
    });

    res.status(201).json(newSet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Create set failed" });
  }
};

/* ================================
   GET ALL SETS
================================ */
export const getAllSets = async (_req: Request, res: Response) => {
  try {
    const sets = await prisma.set.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(sets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ================================
   GET SINGLE SET BY pageUrl
================================ */
// export const getSingleSet = async (req: Request, res: Response) => {
//   try {
//     const { pageUrl } = req.params;

//     const set = await prisma.set.findUnique({
//       where: { pageUrl },
//       include: {
//         gallery: {
//           orderBy: { displayorder: "asc" },
//         },
//       },
//     });

//     if (!set) {
//       return res.status(404).json({ message: "Set not found" });
//     }

//     res.json(set);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Fetch failed" });
//   }
// };


export const getSingleSet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const set = await prisma.set.findUnique({
      where: { id },
      include: {
        gallery: {
          orderBy: { displayorder: "asc" },
        },
      },
    });

    if (!set) {
      return res.status(404).json({ message: "Set not found" });
    }

    res.json(set);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ================================
   UPDATE SET
================================ */
export const updateSet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, pageUrl } = req.body;
    const file = req.file;

    const existing = await prisma.set.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Set not found" });
    }

    // If pageUrl changed, check duplicate
    if (pageUrl && pageUrl !== existing.pageUrl) {
      const slugExists = await prisma.set.findUnique({
        where: { pageUrl },
      });

      if (slugExists) {
        return res.status(400).json({
          message: "Page URL already exists",
        });
      }
    }

    const data: any = {
      title,
      content,
      pageUrl,
    };

    if (file) {
      // Delete old image
      const oldPath = path.join(
        __dirname,
        "../../",
        existing.mainImage.replace("/", "")
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      data.mainImage = `/uploads/${file.filename}`;
    }

    const updated = await prisma.set.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ================================
   DELETE SET (WITH FILE CLEANUP)
================================ */
export const deleteSet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.set.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Set not found" });
    }

    // Delete main image
    const mainPath = path.join(
      __dirname,
      "../../",
      existing.mainImage.replace("/", "")
    );

    if (fs.existsSync(mainPath)) {
      fs.unlinkSync(mainPath);
    }

    // Delete gallery images
    existing.gallery.forEach((img) => {
      const imgPath = path.join(
        __dirname,
        "../../",
        img.imageUrl.replace("/", "")
      );

      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    await prisma.set.delete({
      where: { id },
    });

    res.json({ message: "Set deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================================
   ADD GALLERY IMAGE
================================ */
export const addSetGalleryImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image required" });
    }

    const lastImage = await prisma.setGallery.findFirst({
      where: { setId: id },
      orderBy: { displayorder: "desc" },
    });

    const newOrder = lastImage ? lastImage.displayorder + 1 : 1;

    const image = await prisma.setGallery.create({
      data: {
        imageUrl: `/uploads/${file.filename}`,
        setId: id,
        displayorder: newOrder,
      },
    });

    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
};

/* ================================
   DELETE GALLERY IMAGE
================================ */
export const deleteSetGalleryImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.setGallery.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imgPath = path.join(
      __dirname,
      "../../",
      existing.imageUrl.replace("/", "")
    );

    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }

    await prisma.setGallery.delete({
      where: { id },
    });

    res.json({ message: "Gallery image deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
};



/* ================================
   REORDER GALLERY
================================ */
export const reorderSetGallery = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    await Promise.all(
      updates.map((item: any) =>
        prisma.setGallery.update({
          where: { id: item.id },
          data: { displayorder: item.displayorder },
        })
      )
    );

    res.json({ message: "Gallery reordered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reorder failed" });
  }
};

/* ================================
   GET GALLERY BY SET ID
================================ */
export const getSetGallery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const images = await prisma.setGallery.findMany({
      where: { setId: id },
      orderBy: { displayorder: "asc" },
    });

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fetch gallery failed" });
  }
};

