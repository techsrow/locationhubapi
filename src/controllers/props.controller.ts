import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

/**
 * ================================
 * CREATE PROPS
 * ================================
 */
export const createProps = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const { title, subTitle } = req.body;

    if (!title || !subTitle) {
      return res.status(400).json({ message: "Title and SubTitle are required" });
    }

    // Get last display order
    const lastItem = await prisma.props.findFirst({
      orderBy: { displayOrder: "desc" },
    });

    const newOrder = lastItem ? lastItem.displayOrder + 1 : 1;

    const props = await prisma.props.create({
      data: {
        image: file.filename,
        title,
        subTitle,
        displayOrder: newOrder,
      },
    });

    return res.status(201).json({
      message: "Props created successfully",
      data: props,
    });
  } catch (error) {
    console.error("Create Props Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ================================
 * GET ALL PROPS (Sorted)
 * ================================
 */
export const getAllProps = async (_req: Request, res: Response) => {
  try {
    const props = await prisma.props.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return res.status(200).json(props);
  } catch (error) {
    console.error("Get Props Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ================================
 * GET SINGLE PROPS
 * ================================
 */
export const getSingleProps = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const props = await prisma.props.findUnique({
      where: { id },
    });

    if (!props) {
      return res.status(404).json({ message: "Props not found" });
    }

    return res.status(200).json(props);
  } catch (error) {
    console.error("Get Single Props Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ================================
 * UPDATE PROPS
 * ================================
 */
export const updateProps = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subTitle } = req.body;
    const file = req.file;

    const existing = await prisma.props.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Props not found" });
    }

    let updatedImage = existing.image;

    // If new image uploaded → delete old image
    if (file) {
      const oldPath = path.join("uploads", existing.image);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      updatedImage = file.filename;
    }

    const updated = await prisma.props.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        subTitle: subTitle ?? existing.subTitle,
        image: updatedImage,
      },
    });

    return res.status(200).json({
      message: "Props updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Props Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ================================
 * DELETE PROPS
 * ================================
 */
export const deleteProps = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.props.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Props not found" });
    }

    // Delete image file
    const filePath = path.join("uploads", existing.image);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.props.delete({
      where: { id },
    });

    return res.status(200).json({
      message: "Props deleted successfully",
    });
  } catch (error) {
    console.error("Delete Props Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ================================
 * REORDER PROPS
 * ================================
 */
export const reorderProps = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid reorder data" });
    }

    const updatePromises = items.map((item: any, index: number) =>
      prisma.props.update({
        where: { id: item.id },
        data: { displayOrder: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      message: "Props reordered successfully",
    });
  } catch (error) {
    console.error("Reorder Props Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
