import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase";
import menuDataRaw from "@/config/menu-data.json";
import businessConfig from "@/config/business-config.json";
import {
  CreateOrderInput,
  StoredOrder,
  StoredOrderItem,
  OrderStatus,
} from "./order-schema";

// Generate unique order number (e.g. IMP-4821)
function generateOrderNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return "IMP-" + random;
}

export interface PriceCalculationResult {
  valid: boolean;
  error?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: StoredOrderItem[];
}

/**
 * Load the authoritative menu from Supabase when configured,
 * falling back to the bundled JSON otherwise.
 */
async function getAuthoritativeMenu(): Promise<
  Array<{
    id: string;
    price: number;
    available: boolean;
    name_en: string;
    options?: any[];
  }>
> {
  if (!isSupabaseConfigured()) {
    return menuDataRaw as any[];
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, price, available, name_en, options");

    if (error || !data || data.length === 0) {
      console.warn(
        "Could not fetch menu from Supabase for price verification, using bundled menu:",
        error?.message
      );
      return menuDataRaw as any[];
    }

    return data.map((row: any) => ({
      id: row.id,
      price: Number(row.price),
      available: Boolean(row.available),
      name_en: row.name_en,
      options: (row.options as any[]) || [],
    }));
  } catch (err: any) {
    console.warn("Exception fetching authoritative menu:", err.message);
    return menuDataRaw as any[];
  }
}

/**
 * Server-side price recalculation:
 * Always calculates prices from authoritative source so client cannot tamper.
 */
export async function recalculateOrderPrices(
  rawItems: CreateOrderInput["items"],
  orderType: "delivery" | "pickup"
): Promise<PriceCalculationResult> {
  const menuData = await getAuthoritativeMenu();
  const menuMap = new Map(menuData.map((dish) => [dish.id, dish]));
  const verifiedItems: StoredOrderItem[] = [];
  let subtotal = 0;

  for (const item of rawItems) {
    const dish = menuMap.get(item.dishId);
    if (!dish) {
      return {
        valid: false,
        error: "Dish with ID " + item.dishId + " does not exist in the menu.",
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        items: [],
      };
    }

    if (!dish.available) {
      return {
        valid: false,
        error: '"' + dish.name_en + '" is currently sold out today.',
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        items: [],
      };
    }

    // Verify and calculate options price strictly from menu data
    let optionsPrice = 0;
    const verifiedOptions: StoredOrderItem["selectedOptions"] = [];

    if (item.selectedOptions && item.selectedOptions.length > 0) {
      for (const sel of item.selectedOptions) {
        const optionGroup = dish.options?.find((g: any) => g.id === sel.groupId);
        if (optionGroup) {
          const choice = optionGroup.choices.find((c: any) => c.id === sel.choiceId);
          if (choice) {
            optionsPrice += choice.price;
            verifiedOptions.push({
              groupId: optionGroup.id,
              groupName: optionGroup.name,
              choiceId: choice.id,
              choiceName: choice.name,
              price: choice.price,
            });
          }
        }
      }
    }

    const unitPrice = dish.price + optionsPrice;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      dishId: dish.id,
      name: dish.name_en,
      unitPrice,
      quantity: item.quantity,
      totalPrice: itemTotal,
      selectedOptions: verifiedOptions,
      note: item.note || "",
    });
  }

  // Minimum order validation
  if (subtotal < businessConfig.ordering.minimumOrderAmount) {
    return {
      valid: false,
      error:
        "Minimum order amount is QAR " +
        businessConfig.ordering.minimumOrderAmount +
        ". Current subtotal is QAR " +
        subtotal +
        ".",
      subtotal,
      deliveryFee: 0,
      total: 0,
      items: verifiedItems,
    };
  }

  // Calculate delivery fee
  let deliveryFee = 0;
  if (orderType === "delivery") {
    if (subtotal < businessConfig.ordering.freeDeliveryThreshold) {
      deliveryFee = businessConfig.ordering.deliveryFee;
    }
  }

  const total = subtotal + deliveryFee;

  return {
    valid: true,
    subtotal,
    deliveryFee,
    total,
    items: verifiedItems,
  };
}

/**
 * Maps Supabase orders row to StoredOrder model.
 */
function mapRowToStoredOrder(row: any): StoredOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as OrderStatus,
    orderType: row.order_type as "delivery" | "pickup",
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    deliveryArea: row.zone || undefined,
    deliveryStreet: row.address || undefined,
    orderNotes: row.notes || undefined,
    paymentMethod: (row.payment_method || "cash") as any,
    paymentStatus: row.payment_method === "online_card" ? "paid" : "pending",
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee || 0),
    total: Number(row.total),
    currency: businessConfig.restaurant.currency,
  };
}

/**
 * Check rate limit for a phone number (max 5 orders per phone per hour).
 */
export async function checkRateLimitForPhone(phone: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return true; // allow if no db configured
  }

  try {
    const supabase = getSupabaseServerClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("customer_phone", phone.trim())
      .gte("created_at", oneHourAgo);

    if (error) {
      console.warn("Error checking order rate limit:", error.message);
      return true; // Fail open so customers are not blocked by transient db errors
    }

    return (count ?? 0) < 5;
  } catch (err: any) {
    console.warn("Exception during rate limit check:", err.message);
    return true;
  }
}

/**
 * Create a new order in Supabase with server-side price recalculation.
 * Gracefully falls back if Supabase is unconfigured (returns order object so WhatsApp still works).
 */
export async function createOrder(input: CreateOrderInput): Promise<{
  success: boolean;
  order?: StoredOrder;
  error?: string;
  isDbConnected?: boolean;
}> {
  const calculation = await recalculateOrderPrices(input.items, input.orderType);
  if (!calculation.valid) {
    return { success: false, error: calculation.error };
  }

  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  // Combine full address
  const fullAddress = [
    input.deliveryBuilding ? "Building: " + input.deliveryBuilding : "",
    input.deliveryStreet,
    input.deliveryLandmark ? "(Near " + input.deliveryLandmark + ")" : "",
  ]
    .filter(Boolean)
    .join(", ");

  const combinedNotes = [
    input.orderNotes,
    input.pickupTime ? "Pickup Time: " + input.pickupTime : "",
    input.gpsLocation?.mapsUrl ? "Maps: " + input.gpsLocation.mapsUrl : "",
  ]
    .filter(Boolean)
    .join(" | ");

  const fallbackOrder: StoredOrder = {
    id: "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    orderNumber,
    createdAt: now,
    updatedAt: now,
    status: "new",
    orderType: input.orderType,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerEmail: input.customerEmail?.trim() || undefined,
    deliveryArea: input.deliveryArea?.trim() || undefined,
    deliveryStreet: fullAddress || input.deliveryStreet?.trim() || undefined,
    deliveryBuilding: input.deliveryBuilding?.trim() || undefined,
    deliveryLandmark: input.deliveryLandmark?.trim() || undefined,
    gpsLocation: input.gpsLocation,
    pickupTime: input.pickupTime || undefined,
    orderNotes: combinedNotes || undefined,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "online_card" ? "paid" : "pending",
    items: calculation.items,
    subtotal: calculation.subtotal,
    deliveryFee: calculation.deliveryFee,
    total: calculation.total,
    currency: businessConfig.restaurant.currency,
  };

  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured — order will only be sent via WhatsApp");
    return {
      success: true,
      order: fallbackOrder,
      isDbConnected: false,
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    const insertPayload = {
      order_number: orderNumber,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      order_type: input.orderType,
      address: fullAddress || input.deliveryStreet || null,
      zone: input.deliveryArea || null,
      items: calculation.items,
      subtotal: calculation.subtotal,
      delivery_fee: calculation.deliveryFee,
      total: calculation.total,
      payment_method: input.paymentMethod,
      status: "new",
      notes: combinedNotes || null,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert order error:", error);
      // Still return the constructed order so WhatsApp flow doesn't fail the customer
      return {
        success: true,
        order: fallbackOrder,
        isDbConnected: false,
        error: "Database write warning: " + error.message,
      };
    }

    return {
      success: true,
      order: mapRowToStoredOrder(data),
      isDbConnected: true,
    };
  } catch (err: any) {
    console.error("Exception in createOrder:", err);
    return {
      success: true,
      order: fallbackOrder,
      isDbConnected: false,
      error: err.message,
    };
  }
}

/**
 * Fetch a single order by order number from Supabase.
 */
export async function getOrderByNumber(orderNumber: string): Promise<StoredOrder | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("order_number", orderNumber.trim())
      .single();

    if (error || !data) {
      return null;
    }

    return mapRowToStoredOrder(data);
  } catch (err: any) {
    console.error("Exception in getOrderByNumber:", err);
    return null;
  }
}

/**
 * Update order status by order number in Supabase.
 */
export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus
): Promise<StoredOrder | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured — unable to update order status in DB");
    return null;
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .ilike("order_number", orderNumber.trim())
      .select("*")
      .single();

    if (error || !data) {
      console.error("Supabase updateOrderStatus error:", error);
      return null;
    }

    return mapRowToStoredOrder(data);
  } catch (err: any) {
    console.error("Exception in updateOrderStatus:", err);
    return null;
  }
}

/**
 * List orders for admin dashboard with optional status filter and limit.
 */
export async function listOrders(options?: {
  status?: string;
  limit?: number;
}): Promise<{ orders: StoredOrder[]; isDbConnected: boolean }> {
  if (!isSupabaseConfigured()) {
    return { orders: [], isDbConnected: false };
  }

  try {
    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(options?.limit || 100);

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase listOrders error:", error);
      return { orders: [], isDbConnected: false };
    }

    return {
      orders: (data || []).map(mapRowToStoredOrder),
      isDbConnected: true,
    };
  } catch (err: any) {
    console.error("Exception in listOrders:", err);
    return { orders: [], isDbConnected: false };
  }
}
