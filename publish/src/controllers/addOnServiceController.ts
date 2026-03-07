import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

/* =====================================================
   CREATE ADD ON SERVICE
===================================================== */
export const createAddOnService = async (req: Request, res: Response) => {
  try {
    const { title, pageUrl } = req.body;
    const file = req.file;

    if (!title || !file || !pageUrl) {
      return res.status(400).json({
        message: "Title, Page URL and image are required",
      });
    }

    // Check if pageUrl already exists
    const existing = await prisma.addOnService.findUnique({
      where: { pageUrl },
    });

    if (existing) {
      return res.status(400).json({
        message: "Page URL already exists. Use a different one.",
      });
    }

    const lastItem = await prisma.addOnService.findFirst({
      orderBy: { displayorder: "desc" },
    });

    const newDisplayOrder = lastItem ? lastItem.displayorder + 1 : 1;

    const newItem = await prisma.addOnService.create({
      data: {
        title,
        pageUrl,
        imageUrl: `/uploads/${file.filename}`,
        displayorder: newDisplayOrder,
      },
    });

    res.status(201).json(newItem);

  } catch (error: any) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({
     message: error?.message || error,
    });
  }
};
/* =====================================================
   GET ALL (Sorted)
===================================================== */
export const getAllAddOnServices = async (req: Request, res: Response) => {
  try {
    const items = await prisma.addOnService.findMany({
      orderBy: { displayorder: "asc" },
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching Add On Services" });
  }
};

/* =====================================================
   GET SINGLE
===================================================== */
export const getAddOnServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.addOnService.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Add On Service not found" });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching Add On Service" });
  }
};

/* =====================================================
   UPDATE (With Optional Image Replace)
===================================================== */
export const updateAddOnService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
     const { pageUrl } = req.body;
    const file = req.file;

    const existingItem = await prisma.addOnService.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return res.status(404).json({ message: "Add On Service not found" });
    }

    let updatedImageUrl = existingItem.imageUrl;

    // If new image uploaded → delete old file
    if (file) {
      const oldPath = path.join(__dirname, "..", existingItem.imageUrl);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      updatedImageUrl = `/uploads/${file.filename}`;
    }

    const updatedItem = await prisma.addOnService.update({
      where: { id },
      data: {
        title: title ?? existingItem.title,
        pageUrl: pageUrl ?? existingItem.pageUrl,
        imageUrl: updatedImageUrl,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Add On Service" });
  }
};

/* =====================================================
   DELETE (With File Cleanup)
===================================================== */
export const deleteAddOnService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await prisma.addOnService.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ message: "Add On Service not found" });
    }

    // Remove image file
    const filePath = path.join(__dirname, "..", item.imageUrl);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.addOnService.delete({
      where: { id },
    });

    res.json({ message: "Add On Service deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting Add On Service" });
  }
};

/* =====================================================
   REORDER (Drag & Drop)
===================================================== */
export const reorderAddOnServices = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    // items = [{ id: string, displayorder: number }]

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid reorder data" });
    }

    const updatePromises = items.map((item: any) =>
      prisma.addOnService.update({
        where: { id: item.id },
        data: { displayorder: item.displayorder },
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: "Reordered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reordering Add On Services" });
  }
};
