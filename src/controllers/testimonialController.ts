import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

// ============================
// CREATE TESTIMONIAL
// ============================
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Get last display order
    const lastItem = await prisma.testimonial.findFirst({
      orderBy: { displayorder: "desc" },
    });

    const newDisplayOrder = lastItem ? lastItem.displayorder + 1 : 1;

    const testimonial = await prisma.testimonial.create({
      data: {
        title,
        imageUrl: file.filename,
        displayorder: newDisplayOrder,
      },
    });

    res.status(201).json({
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating testimonial" });
  }
};

// ============================
// GET ALL TESTIMONIALS
// ============================
export const getTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { displayorder: "asc" },
    });

    res.status(200).json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching testimonials" });
  }
};

// ============================
// GET SINGLE TESTIMONIAL
// ============================
export const getTestimonialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    res.status(200).json(testimonial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching testimonial" });
  }
};

// ============================
// UPDATE TESTIMONIAL
// ============================
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const file = req.file;

    const existing = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    let updatedImage = existing.imageUrl;

    // If new image uploaded
    if (file) {
      // Delete old image
      const oldPath = path.join("uploads", existing.imageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      updatedImage = file.filename;
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        imageUrl: updatedImage,
      },
    });

    res.status(200).json({
      message: "Testimonial updated successfully",
      updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating testimonial" });
  }
};

// ============================
// DELETE TESTIMONIAL
// ============================
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Delete image file
    const filePath = path.join("uploads", testimonial.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting testimonial" });
  }
};

// ============================
// REORDER TESTIMONIALS
// ============================
export const reorderTestimonials = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid reorder data" });
    }

    const updatePromises = items.map((item: any) =>
      prisma.testimonial.update({
        where: { id: item.id },
        data: { displayorder: item.displayorder },
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Reordered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reordering testimonials" });
  }
};
