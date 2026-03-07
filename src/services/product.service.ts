import prisma from "../lib/prisma";
import slugify from "slugify";

interface CreateProductInput {
  name: string;
  price: number;
  bookingAmount: number;
  slots?: {
    label: string;
    startTime: string;
    endTime: string;
  }[];
}

export const createProduct = async (data: CreateProductInput) => {

  const slug = slugify(data.name, { lower: true });

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: slug,
      price: data.price,
      bookingAmount: data.bookingAmount,

      slots: data.slots
        ? {
            create: data.slots.map((slot) => ({
              label: slot.label,
              startTime: slot.startTime,
              endTime: slot.endTime
            }))
          }
        : undefined
    },

    include: {
      slots: true
    }
  });

  return product;
};


export const createSlot = async (data: {
  productId: string;
  label: string;
  startTime: string;
  endTime: string;
}) => {

  const product = await prisma.product.findUnique({
    where: { id: data.productId }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return prisma.slot.create({
    data: {
      productId: data.productId,
      label: data.label,
      startTime: data.startTime,
      endTime: data.endTime
    }
  });
};


export const getProductById = async (id: string) => {

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      slots: true
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};