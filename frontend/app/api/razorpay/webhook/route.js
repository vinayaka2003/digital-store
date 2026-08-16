import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { fulfillOrder } from "@/lib/fulfillment";

export async function POST(req) {
  console.log("\n==============================");
  console.log("[api/razorpay/webhook] WEBHOOK TRIGGERED");
  console.log("==============================");

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const eventId = req.headers.get("x-razorpay-event-id");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing signature header." }, { status: 400 });
    }
    if (!eventId) {
      return NextResponse.json({ success: false, message: "Missing event ID header." }, { status: 400 });
    }

    // 1. Verify Webhook Signature using dedicated Webhook Secret
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Webhook ERROR] RAZORPAY_WEBHOOK_SECRET is not configured on server.");
      return NextResponse.json({ success: false, message: "Server misconfiguration." }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.log("❌ Webhook signature verification failed");
      return NextResponse.json({ success: false, message: "Invalid webhook signature." }, { status: 400 });
    }

    console.log("✅ Webhook signature verified successfully.");

    // 2. Deduplicate Event processing using event_id
    const existingEvents = await sql`
      SELECT id FROM razorpay_webhook_events WHERE event_id = ${eventId}
    `;
    if (existingEvents.length > 0) {
      console.log(`[Webhook] Event ${eventId} was already processed. Ignoring.`);
      return NextResponse.json({ success: true, message: "Event already processed." });
    }

    // Insert event id first to lock processing
    await sql`
      INSERT INTO razorpay_webhook_events (event_id, event_type)
      VALUES (${eventId}, 'unknown')
    `;

    const eventData = JSON.parse(rawBody);
    const eventType = eventData.event;
    console.log(`[Webhook] Event ID: ${eventId}, Event Type: ${eventType}`);

    // Update event type in logs
    await sql`
      UPDATE razorpay_webhook_events SET event_type = ${eventType}
      WHERE event_id = ${eventId}
    `;

    // 3. Process Events
    if (eventType === "payment.captured" || eventType === "order.paid") {
      let paymentEntity;

      if (eventType === "payment.captured") {
        paymentEntity = eventData.payload.payment.entity;
      } else if (eventType === "order.paid") {
        // Find the captured payment from order payload if available
        paymentEntity = eventData.payload.payment?.entity || eventData.payload.order.entity;
      }

      if (!paymentEntity) {
        return NextResponse.json({ success: true, message: "Ignored: No payment entity found." });
      }

      const razorpay_order_id = paymentEntity.order_id;
      const razorpay_payment_id = paymentEntity.id;

      if (!razorpay_order_id || !razorpay_payment_id) {
        console.log("[Webhook] Missing order_id or payment_id in payment entity. Skipping.");
        return NextResponse.json({ success: true, message: "Missing identifiers." });
      }

      // Parse metadata notes
      const notes = paymentEntity.notes || {};
      const buyerName = notes.buyerName || "Customer";
      const buyerEmail = notes.buyerEmail || paymentEntity.email;
      const buyerPhone = notes.buyerPhone || paymentEntity.contact;
      const purchasedSlugsStr = notes.purchasedSlugs || "";
      const purchasedSlugs = purchasedSlugsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!buyerEmail) {
        console.warn("[Webhook] Unable to fulfill payment: buyerEmail missing.");
        return NextResponse.json({ success: true, message: "Missing email for order entitlement." });
      }

      // Idempotently process purchase fulfillment
      await fulfillOrder({
        razorpay_order_id,
        razorpay_payment_id,
        buyerName,
        buyerEmail,
        buyerPhone,
        purchasedSlugs,
        amountPaid: Number(paymentEntity.amount) / 100, // paise to INR
        currency: paymentEntity.currency || "INR",
      });

      console.log(`[Webhook] Order ${razorpay_order_id} fulfilled successfully via webhook.`);
    } else {
      console.log(`[Webhook] Event type ${eventType} ignored.`);
    }

    return NextResponse.json({ success: true, message: "Processed successfully." });

  } catch (error) {
    console.error("❌ [api/razorpay/webhook] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
