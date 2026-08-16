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

    // Query customers with aggregation on orders count and spending
    const customers = await sql`
      SELECT c.id, c.name, c.email, c.phone, c.created_at,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(o.amount), 0) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'captured'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("[api/admin/customers] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
