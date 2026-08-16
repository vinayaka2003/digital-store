import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { getAuthorizedDownload } from "@/lib/storage";

export async function GET(req, { params }) {
  console.log("[api/download/[token]] GET CALLED");

  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Download token is required." },
        { status: 400 }
      );
    }

    // 1. Hash the incoming plaintext token using SHA-256
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Query download record, checking status and constraints
    const rows = await sql`
      SELECT d.id AS download_id, d.download_count, d.max_downloads, d.expires_at,
             o.status AS order_status, p.google_drive_file_id, p.name AS product_name
      FROM downloads d
      JOIN orders o ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      WHERE d.token_hash = ${tokenHash}
    `;

    if (rows.length === 0) {
      console.log("❌ Token not found in database:", tokenHash);
      return NextResponse.json(
        { success: false, message: "Invalid or expired download token." },
        { status: 404 }
      );
    }

    const entitlement = rows[0];

    // 3. Verify order status is fully captured/paid
    if (entitlement.order_status !== "captured") {
      console.log("❌ Order associated with token is not paid. Status:", entitlement.order_status);
      return NextResponse.json(
        { success: false, message: "Unauthorized access: Order has not been paid." },
        { status: 403 }
      );
    }

    // 4. Verify token expiry
    if (entitlement.expires_at && new Date() > new Date(entitlement.expires_at)) {
      console.log("❌ Download token has expired. Expiry:", entitlement.expires_at);
      return NextResponse.json(
        { success: false, message: "This download link has expired (valid for 24 hours)." },
        { status: 403 }
      );
    }

    // 5. Verify download count limits
    if (entitlement.download_count >= entitlement.max_downloads) {
      console.log("❌ Download limit reached. Current:", entitlement.download_count, "Max:", entitlement.max_downloads);
      return NextResponse.json(
        { success: false, message: "Download limit exceeded. Please contact support to reset your links." },
        { status: 403 }
      );
    }

    // 6. Increment download count (Note: represents download/redirect authorization attempts)
    await sql`
      UPDATE downloads 
      SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${entitlement.download_id}
    `;

    console.log(`[Download] Incrementing count for ${entitlement.product_name}. Requesting download link from storage abstraction...`);

    // 7. Retrieve redirect URL from storage abstraction layer
    const mockProduct = {
      name: entitlement.product_name,
      google_drive_file_id: entitlement.google_drive_file_id,
    };
    const mockOrder = {
      id: entitlement.download_id,
    };

    const redirectUrl = getAuthorizedDownload(mockProduct, mockOrder);

    if (!redirectUrl) {
      return NextResponse.json(
        { success: false, message: "Failed to construct download redirect URL." },
        { status: 500 }
      );
    }
    
    return NextResponse.redirect(redirectUrl, 302);

  } catch (error) {
    console.error("❌ [api/download/[token]] Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your download." },
      { status: 500 }
    );
  }
}
