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

    // Query all orders with customer details, product name and download count
    const orders = await sql`
      SELECT o.id, o.razorpay_order_id, o.razorpay_payment_id, o.amount, o.currency, o.status, o.created_at,
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             p.name AS product_name,
             d.download_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN downloads d ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("[api/admin/orders] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
