import { z } from "zod";

export const posSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, "Customer Name is required"),
  phoneNo: z.string().min(1, "Phone Number is required"),
  email: z.string().optional(),
  gst: z.string().optional(),
  method: z.enum(["UPI", "Online", "Cash", "COD", "Mixed"]).default("Cash"),
  paymentMode: z.enum(["complete", "parcel"]).default("complete"),
  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  country: z.string().default("India"),
  subtotal: z.number().min(0),
  discount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return 0;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().default(0)),
  deliveryCharge: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return 0;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().default(0)),
  orderAmount: z.number().min(0),
  comments: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        variantName: z.string().optional(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0),
        discountPercent: z.preprocess((val) => {
          if (val === "" || val === null || val === undefined) return 0;
          return typeof val === "string" ? Number(val) : val;
        }, z.number().default(0)),
      })
    )
    .min(1, "At least one item is required"),
});

export const manualOrderSchema = z.object({
  userId: z.string().optional(),

  name: z.string().min(1, "Customer Name is required"),
  phoneNo: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email").optional(),

  address: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),

  gst: z.string().optional(),

  method: z.enum(["COD", "Online"]).default("Online"),

  subtotal: z.number().min(0, "Subtotal must be 0 or more"),

  deliveryCharge: z.preprocess(
    (val) => (val === "" ? 0 : typeof val === "string" ? Number(val) : val),
    z.number().min(0, "Delivery charge must be 0 or more").optional()
  ),

  discount: z.preprocess(
    (val) =>
      val === "" ? undefined : typeof val === "string" ? Number(val) : val,
    z.number().min(0, "Discount must be 0 or more").optional()
  ),

  orderAmount: z.number().min(0, "Order amount must be 0 or more"),
  comments: z.string().optional(),

  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        variantName: z.string().optional(),
        isScratchy: z.boolean().optional(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be 0 or more"),
      })
    )
    .min(1, "At least one item is required"),
});
