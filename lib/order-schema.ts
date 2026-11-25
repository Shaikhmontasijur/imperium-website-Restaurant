import { z } from "zod";

// Validates Qatar mobile phone numbers (+974 followed by 8 digits or 8 digits starting with 3, 5, 6, 7)
const qatarPhoneRegex = /^(?:\+?974\s?)?[3567]\d{7}$/;

export const OrderItemOptionSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  choiceId: z.string(),
  choiceName: z.string(),
  price: z.number().min(0),
});

export const OrderItemInputSchema = z.object({
  dishId: z.string().min(1, "Dish ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  selectedOptions: z.array(OrderItemOptionSchema).default([]),
  note: z.string().max(300).optional(),
});

export const CreateOrderSchema = z.object({
  orderType: z.enum(["delivery", "pickup"]),
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerPhone: z
    .string()
    .refine((val) => qatarPhoneRegex.test(val.replace(/[\s-]/g, "")), {
      message: "Please enter a valid Qatar phone number (+974 followed by 8 digits).",
    }),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  deliveryArea: z.string().optional(),
  deliveryStreet: z.string().optional(),
  deliveryBuilding: z.string().optional(),
  deliveryLandmark: z.string().optional(),
  gpsLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      mapsUrl: z.string().url(),
    })
    .optional(),
  pickupTime: z.string().optional(),
  orderNotes: z.string().max(500).optional(),
  paymentMethod: z.enum(["cash", "card_on_delivery", "online_card"]).default("cash"),
  items: z.array(OrderItemInputSchema).min(1, "Order must contain at least one item"),
  // Honeypot field for spam prevention
  company_website: z.string().max(0, "Bot detected").optional(),
}).refine(
  (data) => {
    if (data.orderType === "delivery") {
      return (
        !!data.deliveryArea &&
        data.deliveryArea.length > 0 &&
        !!data.deliveryStreet &&
        data.deliveryStreet.length > 0
      );
    }
    return true;
  },
  {
    message: "Delivery area and street address are required for delivery orders.",
    path: ["deliveryStreet"],
  }
);

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export type OrderStatus =
  | "new"
  | "preparing"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface StoredOrderItem {
  dishId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedOptions: Array<{
    groupId: string;
    groupName: string;
    choiceId: string;
    choiceName: string;
    price: number;
  }>;
  note?: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  orderType: "delivery" | "pickup";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryArea?: string;
  deliveryStreet?: string;
  deliveryBuilding?: string;
  deliveryLandmark?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    mapsUrl: string;
  };
  pickupTime?: string;
  orderNotes?: string;
  paymentMethod: "cash" | "card_on_delivery" | "online_card";
  paymentStatus: "pending" | "paid" | "failed";
  items: StoredOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}
