import { Request, Response } from "express";
import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

// ================= GET ALL =================
export const getSliders = async (req: Request, res: Response) => {
  try {
    const sliders = await prisma.homeSlider.findMany({
      orderBy: { displayorder: "asc" },
    });

    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

// ================= CREATE =================
export const createSlider = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { title } = req.body;

    console.log("FILES:", files);
    console.log("TITLE:", title);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Image required" });
    }

    const lastSlider = await prisma.homeSlider.findFirst({
      orderBy: { displayorder: "desc" },
    });

    let nextOrder = lastSlider ? lastSlider.displayorder + 1 : 1;

    const created = [];

    for (const file of files) {
      const slider = await prisma.homeSlider.create({
        data: {
          title: title || "",   // safe fallback
          imageUrl: `/uploads/${file.filename}`,
          displayorder: nextOrder++,
        },
      });

      created.push(slider);
    }

    res.status(201).json(created);
  } catch (error) {
    console.error("🔥 CREATE SLIDER ERROR:", error);
    res.status(500).json({ message: "Create failed" });
  }
};



// ================= DELETE =================
export const deleteSlider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const slider = await prisma.homeSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      return res.status(404).json({ message: "Not found" });
    }

    const cleanPath = slider.imageUrl.replace("/uploads/", "");
    const filePath = path.join(__dirname, "../../uploads", cleanPath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.homeSlider.delete({
      where: { id },
    });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= REORDER =================
export const reorderSlider = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    await Promise.all(
      items.map((item: any) =>
        prisma.homeSlider.update({
          where: { id: item.id },
          data: { displayorder: item.displayorder },
        })
      )
    );

    res.json({ message: "Reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Reorder failed" });
  }
};
