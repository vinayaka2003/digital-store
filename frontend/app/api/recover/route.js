import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { sendRecoveryEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Locate customer in database
    const customers = await sql`
      SELECT id, name FROM customers WHERE email = ${normalizedEmail}
    `;

    // Security best practice: If customer is not found, return success immediately to prevent username harvesting
    if (customers.length === 0) {
      console.log(`[Recovery] Recovery requested for ${normalizedEmail} but no customer record exists.`);
      return NextResponse.json({
        success: true,
        message: "If a purchase was made under this email, fresh download links have been sent.",
      });
    }

    const customer = customers[0];

    // 2. Fetch all orders that have successful payment status
    const orders = await sql`
      SELECT id FROM orders 
      WHERE customer_id = ${customer.id} AND status = 'captured'
    `;

    if (orders.length === 0) {
      console.log(`[Recovery] Customer found for ${normalizedEmail} but has no captured orders.`);
      return NextResponse.json({
        success: true,
        message: "If a purchase was made under this email, fresh download links have been sent.",
      });
    }

    const orderIds = orders.map((o) => o.id);

    // 3. Query all download entitlements for these orders
    const entitlements = await sql`
      SELECT d.id, d.product_id, p.name 
      FROM downloads d
      JOIN products p ON d.product_id = p.id
      WHERE d.order_id = ANY(${orderIds})
    `;

    if (entitlements.length === 0) {
      console.log(`[Recovery] Customer found for ${normalizedEmail} but no download rows exist.`);
      return NextResponse.json({
        success: true,
        message: "If a purchase was made under this email, fresh download links have been sent.",
      });
    }

    // 4. Generate new download tokens, store hashes, and set expiry to 24h from now
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const downloadDetails = [];
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24);

    for (const ent of entitlements) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      // Update the download record with the new token hash, reset download count & extend expiry
      await sql`
        UPDATE downloads 
        SET token_hash = ${tokenHash}, 
            download_count = 0, 
            expires_at = ${newExpiresAt}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${ent.id}
      `;

      downloadDetails.push({
        productName: ent.name,
        downloadUrl: `${siteUrl}/api/download/${rawToken}`,
      });
    }

    // 5. Dispatch email containing fresh links
    await sendRecoveryEmail({
      to: normalizedEmail,
      name: customer.name,
      downloads: downloadDetails,
    });

    console.log(`[Recovery] Recovery email successfully sent to ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "If a purchase was made under this email, fresh download links have been sent.",
    });

  } catch (error) {
    console.error("❌ [api/recover] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
