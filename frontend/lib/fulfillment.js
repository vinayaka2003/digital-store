import crypto from "crypto";
import { Pool, sql } from "./db";
import { sendPurchaseEmail } from "./email";

/**
 * Idempotently fulfills a successful Razorpay payment.
 * Uses a dedicated request-scoped Pool transaction for atomicity.
 */
export async function fulfillOrder({
  razorpay_order_id,
  razorpay_payment_id,
  buyerName,
  buyerEmail,
  buyerPhone,
  purchasedSlugs,
  amountPaid, // In INR
  currency = "INR",
}) {
  console.log(`[Fulfillment] Processing fulfillment for payment ${razorpay_payment_id}...`);

  // Step 1: Check if this payment has already been processed (Deduplication using HTTP sql for speed)
  const existingOrders = await sql`
    SELECT id FROM orders 
    WHERE razorpay_payment_id = ${razorpay_payment_id}
  `;

  if (existingOrders.length > 0) {
    console.log(`[Fulfillment] Payment ${razorpay_payment_id} was already fulfilled.`);
    const orderId = existingOrders[0].id;
    // Fetch associated downloads and products using HTTP sql
    const items = await sql`
      SELECT d.id, p.name, p.slug 
      FROM downloads d
      JOIN products p ON d.product_id = p.id
      WHERE d.order_id = ${orderId}
    `;
    return {
      success: true,
      alreadyProcessed: true,
      orderId,
      items,
    };
  }

  // Fetch active products using HTTP sql
  const products = [];
  for (const slug of purchasedSlugs) {
    const rows = await sql`
      SELECT id, name, slug FROM products 
      WHERE slug = ${slug} AND active = true
    `;
    if (rows.length > 0) {
      products.push(rows[0]);
    }
  }

  if (products.length === 0) {
    throw new Error(`No active products found matching slugs: ${purchasedSlugs.join(", ")}`);
  }

  // Step 2: Open atomic database transaction via WebSocket client connection
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing!");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  let orderId;
  let customerId;
  const tokenPairs = [];

  try {
    console.log("[Fulfillment] BEGIN transaction...");
    await client.query("BEGIN");

    // 1. Find or create customer
    const customerRes = await client.query(
      "SELECT id FROM customers WHERE email = $1",
      [buyerEmail]
    );

    if (customerRes.rows.length > 0) {
      customerId = customerRes.rows[0].id;
      if (buyerPhone) {
        await client.query(
          "UPDATE customers SET phone = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [buyerPhone, customerId]
        );
      }
    } else {
      const insertCustomerRes = await client.query(
        "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id",
        [buyerName || "Customer", buyerEmail, buyerPhone || null]
      );
      customerId = insertCustomerRes.rows[0].id;
    }

    // 2. Insert Order
    const insertOrderRes = await client.query(
      "INSERT INTO orders (customer_id, razorpay_order_id, razorpay_payment_id, amount, currency, status) VALUES ($1, $2, $3, $4, $5, 'captured') RETURNING id",
      [customerId, razorpay_order_id, razorpay_payment_id, amountPaid, currency]
    );
    orderId = insertOrderRes.rows[0].id;

    // Controlled Rollback Test Hook:
    if (process.env.TEST_ROLLBACK === "true") {
      throw new Error("TEST_ROLLBACK: Controlled synthetic error triggered before entitlement inserts!");
    }

    // 3. Create download entitlement records
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    for (const prod of products) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

      await client.query(
        "INSERT INTO downloads (order_id, product_id, token_hash, download_count, max_downloads, expires_at) VALUES ($1, $2, $3, 0, 10, $4)",
        [orderId, prod.id, tokenHash, expiresAt]
      );

      tokenPairs.push({
        slug: prod.slug,
        name: prod.name,
        rawToken,
      });
    }

    await client.query("COMMIT");
    console.log(`[Fulfillment] COMMIT transaction. Order ID: ${orderId}`);
  } catch (error) {
    console.warn("[Fulfillment] Database transaction error. Executing ROLLBACK...", error.message);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Release client back to the pool and close the pool connection
    client.release();
    await pool.end();
    console.log("[Fulfillment] Pool closed and released.");
  }

  // Step 3: Decoupled transactional email dispatch (Outside transaction)
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const downloadDetails = tokenPairs.map((pair) => ({
      productName: pair.name,
      downloadUrl: `${siteUrl}/api/download/${pair.rawToken}`,
    }));

    await sendPurchaseEmail({
      to: buyerEmail,
      name: buyerName || "Customer",
      downloads: downloadDetails,
      amount: amountPaid,
    });
    console.log(`[Fulfillment] Purchase email queued successfully for ${buyerEmail}.`);
  } catch (emailError) {
    console.error("[Fulfillment ERROR] Decoupled email failed:", emailError);
  }

  return {
    success: true,
    alreadyProcessed: false,
    orderId,
    tokens: tokenPairs,
  };
}
