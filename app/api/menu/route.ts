export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { getAllMenuItems, updateMenuItem } from "@/lib/menu-store";

export async function GET() {
  try {
    const menu = await getAllMenuItems();
    return NextResponse.json(menu);
  } catch (error: any) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Admin password check
    const authCookie = req.cookies.get("imperium_admin_session");
    const authHeader = req.headers.get("x-admin-key");
    const expectedPassword = process.env.ADMIN_PASSWORD || "imperium2026";

    if (authCookie?.value !== expectedPassword && authHeader !== expectedPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = body.id || body.dishId;
    const { available, price } = body;

    if (!id) {
      return NextResponse.json({ error: "Dish ID is required" }, { status: 400 });
    }

    const updates: { available?: boolean; price?: number } = {};
    if (typeof available === "boolean") updates.available = available;
    if (typeof price === "number") updates.price = price;

    const result = await updateMenuItem(id, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to update dish" }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: result.item });
  } catch (error: any) {
    console.error("PATCH /api/menu error:", error);
    return NextResponse.json({ error: "Failed to update dish" }, { status: 500 });
  }
}
