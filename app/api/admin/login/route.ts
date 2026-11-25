export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = process.env.ADMIN_PASSWORD || "imperium2026";

    if (password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true, message: "Authenticated" });
    // Set HTTP-only secure cookie for admin session
    res.cookies.set("imperium_admin_session", expectedPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.delete("imperium_admin_session");
  return res;
}
