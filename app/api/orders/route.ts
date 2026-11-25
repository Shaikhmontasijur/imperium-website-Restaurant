export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { CreateOrderSchema } from "@/lib/order-schema";
import { createOrder, listOrders, checkRateLimitForPhone } from "@/lib/order-store";
import { sendOrderNotificationEmail } from "@/lib/email";
import { getWhatsAppOrderUrl } from "@/lib/whatsapp";
import { getQatarOperatingStatus } from "@/lib/opening-hours";
import businessConfig from "@/config/business-config.json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check honeypot spam protection
    if (body.company_website && body.company_website.length > 0) {
      return NextResponse.json({ error: "Spam detected." }, { status: 400 });
    }

    // Validate request schema with Zod
    const validationResult = CreateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Invalid order details.";
      return NextResponse.json({ error: firstError }, { status: 422 });
    }

    const input = validationResult.data;

    // Rate limiting: max 5 orders per phone per hour
    const isAllowed = await checkRateLimitForPhone(input.customerPhone);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Too many orders placed from this phone number. Please wait before ordering again or contact the restaurant directly.",
        },
        { status: 429 }
      );
    }

    // Check operating hours & pre-order policy
    const status = getQatarOperatingStatus();
    if (!status.isOpen && !businessConfig.ordering.allowPreordersWhenClosed) {
      return NextResponse.json(
        {
          error:
            "The restaurant is currently closed (Reopens at " +
            (status.nextOpenTime || "11:00 AM") +
            "). Orders are currently paused.",
        },
        { status: 400 }
      );
    }

    // Create and verify order server-side in Supabase
    const creationResult = await createOrder(input);
    if (!creationResult.success || !creationResult.order) {
      return NextResponse.json(
        { error: creationResult.error || "Failed to process order." },
        { status: 400 }
      );
    }

    const order = creationResult.order;

    // Fire email notification asynchronously
    sendOrderNotificationEmail(order).catch((err) =>
      console.error("Order notification email error:", err)
    );

    // Generate WhatsApp direct link
    const whatsappUrl = getWhatsAppOrderUrl(order);

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      order,
      whatsappUrl,
      redirectUrl: "/order/" + order.orderNumber,
      isDbConnected: creationResult.isDbConnected,
    });
  } catch (error: any) {
    console.error("Order creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error while creating your order." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Simple admin auth check via cookie or auth header
  const authCookie = req.cookies.get("imperium_admin_session");
  const authHeader = req.headers.get("x-admin-key");
  const expectedPassword = process.env.ADMIN_PASSWORD || "imperium2026";

  if (authCookie?.value !== expectedPassword && authHeader !== expectedPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusParam = req.nextUrl.searchParams.get("status") || "all";
  const limitParam = Number(req.nextUrl.searchParams.get("limit")) || 100;

  const result = await listOrders({ status: statusParam, limit: limitParam });
  return NextResponse.json({
    orders: result.orders,
    isDbConnected: result.isDbConnected,
  });
}
