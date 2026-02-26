import { Request, Response } from "express";
import * as productService from "../services/product.service";
import prisma from "../lib/prisma";

/* =========================
   ADD PRODUCT (WITH SLOTS)
========================= */

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, slots } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required",
      });
    }

    const product = await productService.createProduct({
      name,
      price: Number(price),
      slots,
    });

    return res.status(201).json({
      success: true,
      product,
    });

  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   ADD SLOT SEPARATELY
========================= */

export const addSlot = async (req: Request, res: Response) => {
  try {
    const { productId, label, startTime, endTime } = req.body;

    if (!productId || !label || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const slot = await productService.createSlot({
      productId,
      label,
      startTime,
      endTime,
    });

    return res.status(201).json({
      success: true,
      slot,
    });

  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};