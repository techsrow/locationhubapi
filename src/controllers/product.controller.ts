import { Request, Response } from "express";
import prisma from "../lib/prisma";
import * as productService from "../services/product.service";


/* ---------------------------------------------------
   GET ALL PRODUCTS
--------------------------------------------------- */

export const getProducts = async (req: Request, res: Response) => {
  try {

    const products = await prisma.product.findMany({
      include: {
        slots: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(products);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


/* ---------------------------------------------------
   GET PRODUCT BY ID (ADMIN USE)
--------------------------------------------------- */

export const getProductById = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        slots: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


/* ---------------------------------------------------
   GET PRODUCT BY SLUG (PUBLIC WEBSITE)
--------------------------------------------------- */

export const getProductBySlug = async (req: Request, res: Response) => {

  try {

    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        slots: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json(product);

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};


/* ---------------------------------------------------
   ADD PRODUCT
--------------------------------------------------- */

export const addProduct = async (req: Request, res: Response) => {

  try {

    const { name, price, bookingAmount, slots } = req.body;

    if (!name || !price || !bookingAmount) {
      return res.status(400).json({
        success: false,
        message: "Name, price and bookingAmount are required"
      });
    }

    const product = await productService.createProduct({
      name,
      price: Number(price),
      bookingAmount: Number(bookingAmount),
      slots
    });

    res.status(201).json({
      success: true,
      product
    });

  } catch (err: any) {

    res.status(400).json({
      success: false,
      message: err.message
    });

  }

};


/* ---------------------------------------------------
   ADD SLOT
--------------------------------------------------- */

export const addSlot = async (req: Request, res: Response) => {

  try {

    const { productId, label, startTime, endTime } = req.body;

    if (!productId || !label || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time"
      });
    }

    /* CHECK OVERLAPPING SLOTS */

    const existingSlots = await prisma.slot.findMany({
      where: { productId }
    });

    const overlap = existingSlots.some((slot) => {
      return startTime < slot.endTime && endTime > slot.startTime;
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: "Slot overlaps with existing slot"
      });
    }

    const slot = await productService.createSlot({
      productId,
      label,
      startTime,
      endTime
    });

    res.status(201).json({
      success: true,
      slot
    });

  } catch (err: any) {

    res.status(400).json({
      success: false,
      message: err.message
    });

  }

};


/* ---------------------------------------------------
   UPDATE PRODUCT
--------------------------------------------------- */

export const updateProduct = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;
    const { name, price, bookingAmount } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        bookingAmount
      }
    });

    res.json({
      success: true,
      product
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to update product"
    });

  }

};


/* ---------------------------------------------------
   DELETE PRODUCT
--------------------------------------------------- */

export const deleteProduct = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    /* DELETE ALL SLOTS FIRST */

    await prisma.slot.deleteMany({
      where: { productId: id }
    });

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });

  }

};


/* ---------------------------------------------------
   DELETE SLOT
--------------------------------------------------- */

export const deleteSlot = async (req: Request, res: Response) => {

  try {

    const { id } = req.params;

    await prisma.slot.delete({
      where: { id }
    });

    res.json({
      success: true
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to delete slot"
    });

  }

};