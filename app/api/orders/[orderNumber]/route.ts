export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { getOrderByNumber, updateOrderStatus } from "@/lib/order-store";
import { OrderStatus } from "@/lib/order-schema";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const { orderNumber } = params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  const authCookie = req.cookies.get("imperium_admin_session");
  const authHeader = req.headers.get("x-admin-key");
  const expectedPassword = process.env.ADMIN_PASSWORD || "imperium2026";

  if (authCookie?.value !== expectedPassword && authHeader !== expectedPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderNumber } = params;
  const body = await req.json();
  const { status } = body as { status: OrderStatus };

  const validStatuses: OrderStatus[] = [
    "new",
    "preparing",
    "out_for_delivery",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  const updated = await updateOrderStatus(orderNumber, status);
  if (!updated) {
    return NextResponse.json({ error: "Order not found or database update failed" }, { status: 404 });
  }

  return NextResponse.json({ success: true, order: updated });
}
