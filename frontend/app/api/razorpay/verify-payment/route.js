import { NextResponse } from "next/server";
import crypto from "crypto";
import razorpay from "@/lib/razorpay";
import { fulfillOrder } from "@/lib/fulfillment";

export async function POST(req) {
  console.log("\n==============================");
  console.log("[api/razorpay/verify-payment] POST CALLED");
  console.log("==============================");

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    // Step 1: Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("❌ Missing payment parameters");
      return NextResponse.json(
        { success: false, message: "Missing payment parameters." },
        { status: 400 }
      );
    }

    // Step 2: Verify Cryptographic Signature
    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Signature mismatch");
      return NextResponse.json(
        { success: false, message: "Payment verification failed: Signature mismatch." },
        { status: 400 }
      );
    }

    console.log("✅ Signature verified");

    // Step 3: Fetch Razorpay Order
    console.log("Fetching Razorpay Order details...");
    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    console.log("✅ Razorpay Order fetched");

    // Step 4: Fetch Razorpay Payment
    console.log("Fetching Razorpay Payment details...");
    const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
    console.log("✅ Razorpay Payment fetched");

    // Step 5: Verify Amount matches
    const orderAmount = Number(rzpOrder.amount);
    const paymentAmount = Number(rzpPayment.amount);

    if (paymentAmount < orderAmount) {
      console.log("❌ Amount mismatch");
      return NextResponse.json(
        { success: false, message: "Insufficient payment amount." },
        { status: 402 }
      );
    }

    // Step 6: Verify captured/authorized status
    if (rzpPayment.status !== "captured" && rzpPayment.status !== "authorized") {
      console.log("❌ Payment not capturing");
      return NextResponse.json(
        { success: false, message: `Payment state is: ${rzpPayment.status}` },
        { status: 402 }
      );
    }

    // Step 7: Parse buyer details from Razorpay Notes metadata (Our source of truth)
    const buyerName = rzpOrder.notes?.buyerName || "Customer";
    const buyerEmail = rzpOrder.notes?.buyerEmail || rzpPayment.email;
    const buyerPhone = rzpOrder.notes?.buyerPhone || rzpPayment.contact;
    const purchasedSlugsStr = rzpOrder.notes?.purchasedSlugs || "";
    const purchasedSlugs = purchasedSlugsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!buyerEmail) {
      return NextResponse.json(
        { success: false, message: "Buyer email is required to process digital download entitlement." },
        { status: 400 }
      );
    }

    // Step 8: Idempotent order processing and download token generation
    const result = await fulfillOrder({
      razorpay_order_id,
      razorpay_payment_id,
      buyerName,
      buyerEmail,
      buyerPhone,
      purchasedSlugs,
      amountPaid: paymentAmount / 100, // Conversion from paise to INR
      currency: rzpPayment.currency,
    });

    console.log("✅ Payment successfully fulfilled and verified.");
    return NextResponse.json(result);

  } catch (error) {
    console.error("❌ [api/razorpay/verify-payment] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
