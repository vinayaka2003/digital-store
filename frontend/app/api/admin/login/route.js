import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const expectedUser = process.env.ADMIN_USER || "admin";
    const expectedPass = process.env.ADMIN_PASS || "change_this_password_123";

    if (username !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = createAdminSession(username);

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
    });

    // Set HTTP-only secure cookie for 12 hours
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 12 * 60 * 60, // 12 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[api/admin/login] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
