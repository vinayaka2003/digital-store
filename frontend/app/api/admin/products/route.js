import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!verifyAdminSession(token)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const products = await sql`
      SELECT id, name, slug, description, price, image, google_drive_file_id, active, created_at
      FROM products
      ORDER BY id ASC
    `;

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[api/admin/products] GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!verifyAdminSession(token)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id, active } = await req.json();

    if (id === undefined || active === undefined) {
      return NextResponse.json(
        { success: false, message: "Product ID and active status are required." },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE products 
      SET active = ${active}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, name, active
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product active status updated to ${active}.`,
      product: updated[0],
    });
  } catch (error) {
    console.error("[api/admin/products] POST Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
