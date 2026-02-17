import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";
import slugify from "slugify";

/* ================= CREATE ================= */

export const createSetup = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    const files = req.files as {
      mainImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    if (!title || !files?.mainImage?.[0]) {
      return res.status(400).json({ message: "Title and main image required" });
    }

    const slug = slugify(title, { lower: true, strict: true });

    // prevent duplicate slug
    const existingSlug = await prisma.setup.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(400).json({ message: "Slug already exists" });
    }

    // auto displayOrder for Setup
    const lastSetup = await prisma.setup.findFirst({
      orderBy: { displayOrder: "desc" },
    });

    const newOrder = lastSetup ? lastSetup.displayOrder + 1 : 1;

    const setup = await prisma.setup.create({
      data: {
        title,
        slug,
        content,
        mainImage: `/uploads/${files.mainImage[0].filename}`,
        displayOrder: newOrder,
        gallery: {
          create:
            files.gallery?.map((file, index) => ({
              imageUrl: `/uploads/${file.filename}`,
              displayOrder: index + 1,
            })) || [],
        },
      },
      include: {
        gallery: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    res.status(201).json(setup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= GET ALL ================= */

export const getAllSetups = async (_req: Request, res: Response) => {
  try {
    const setups = await prisma.setup.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        gallery: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    res.json(setups);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= GET BY SLUG ================= */

export const getSetupBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const setup = await prisma.setup.findUnique({
      where: { slug },
      include: {
        gallery: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!setup) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(setup);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= UPDATE ================= */

export const updateSetup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const existing = await prisma.setup.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Not found" });
    }

    const files = req.files as {
      mainImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    };

    let updatedMainImage = existing.mainImage;

    /* -------- Replace Main Image -------- */
    if (files?.mainImage?.[0]) {
      const oldPath = path.join(process.cwd(), existing.mainImage);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      updatedMainImage = `/uploads/${files.mainImage[0].filename}`;
    }

    /* -------- Add New Gallery Images -------- */
    if (files?.gallery?.length) {
      const lastGallery = await prisma.setupGallery.findFirst({
        where: { setupId: id },
        orderBy: { displayOrder: "desc" },
      });

      let startOrder = lastGallery ? lastGallery.displayOrder + 1 : 1;

      await prisma.setupGallery.createMany({
        data: files.gallery.map((file, index) => ({
          imageUrl: `/uploads/${file.filename}`,
          setupId: id,
          displayOrder: startOrder + index,
        })),
      });
    }

    /* -------- Safe Partial Update -------- */
    const updateData: any = {
      mainImage: updatedMainImage,
    };

    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true, strict: true });
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    const updated = await prisma.setup.update({
      where: { id },
      data: updateData,
      include: {
        gallery: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update Setup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ================= DELETE ================= */

export const deleteSetup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const setup = await prisma.setup.findUnique({
      where: { id },
      include: { gallery: true },
    });

    if (!setup) {
      return res.status(404).json({ message: "Not found" });
    }

    // delete main image
    const mainPath = path.join(process.cwd(), setup.mainImage);
    if (fs.existsSync(mainPath)) {
      fs.unlinkSync(mainPath);
    }

    // delete gallery images
    setup.gallery.forEach((img) => {
      const imgPath = path.join(process.cwd(), img.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    });

    await prisma.setup.delete({
      where: { id },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= REORDER SETUPS ================= */

export const reorderSetups = async (req: Request, res: Response) => {
  try {
    const { order } = req.body;

    await Promise.all(
      order.map((item: any) =>
        prisma.setup.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    res.json({ message: "Reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getSetupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const setup = await prisma.setup.findUnique({
      where: { id },
      include: {
        gallery: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!setup) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(setup);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


export const deleteSetupGalleryImage = async (
  req: Request,
  res: Response
) => {
  try {
    const { imageId } = req.params;

    const image = await prisma.setupGallery.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imagePath = path.join(process.cwd(), image.imageUrl);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await prisma.setupGallery.delete({
      where: { id: imageId },
    });

    res.json({ message: "Gallery image deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const reorderSetupGallery = async (
  req: Request,
  res: Response
) => {
  try {
    const { order } = req.body;

    await Promise.all(
      order.map((item: any) =>
        prisma.setupGallery.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    res.json({ message: "Gallery reordered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
