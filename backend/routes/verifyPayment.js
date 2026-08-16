import express from "express";
import crypto from "crypto";
import { createDownloadToken } from "../lib/jwt.js";
import razorpay from "../lib/razorpay.js";
import { getProductBySlug } from "../lib/products.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("\n==============================");
  console.log("VERIFY PAYMENT CALLED");
  console.log("==============================");
  console.log("Request Body:", req.body);

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      slug,
      slugs,
    } = req.body;

    // Step 1: Required fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      console.log("❌ Missing payment details");
      return res.status(400).json({
        success: false,
        message: "Missing payment details.",
      });
    }

    console.log("✅ Payment fields received");

    // Step 2: Verify Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("Expected :", expectedSignature);
    console.log("Received :", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Signature mismatch");

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    console.log("✅ Signature verified");

    // Step 3: Fetch Order
    console.log("Fetching Razorpay Order...");

    const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);

    console.log("✅ Order fetched");
    console.log(rzpOrder);

    // Step 4: Fetch Payment
    console.log("Fetching Razorpay Payment...");

    const rzpPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    console.log("✅ Payment fetched");
    console.log(rzpPayment);

    // Step 5: Amount Check
    const orderAmount = Number(rzpOrder.amount);
    const paymentAmount = Number(rzpPayment.amount);

    console.log("Order Amount :", orderAmount);
    console.log("Paid Amount  :", paymentAmount);

    if (paymentAmount < orderAmount) {
      console.log("❌ Amount mismatch");

      return res.status(402).json({
        success: false,
        message: "Insufficient payment.",
      });
    }

    console.log("✅ Amount verified");

    // Step 6: Status Check
    console.log("Payment Status :", rzpPayment.status);

    if (
      rzpPayment.status !== "captured" &&
      rzpPayment.status !== "authorized"
    ) {
      console.log("❌ Payment not completed");

      return res.status(402).json({
        success: false,
        message: `Payment status is ${rzpPayment.status}`,
      });
    }

    console.log("✅ Payment status verified");

    // Step 7: Order Match
    if (rzpPayment.order_id !== razorpay_order_id) {
      console.log("❌ Order ID mismatch");

      return res.status(400).json({
        success: false,
        message: "Order mismatch.",
      });
    }

    console.log("✅ Order matched");

    // Step 8: Product Validation
    const purchasedSlugsStr = rzpOrder.notes?.purchasedSlugs || "";
    const purchasedSlugs = purchasedSlugsStr.split(",").map((s) => s.trim()).filter(Boolean);

    console.log("Purchased Slugs from Order:", purchasedSlugs);

    if (slug) {
      console.log("Received Slug:", slug);
      if (!purchasedSlugs.includes(slug)) {
        console.log("❌ Product slug mismatch");
        return res.status(400).json({
          success: false,
          message: "Product mismatch.",
        });
      }

      if (!getProductBySlug(slug)) {
        console.log("❌ Product not found");
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }
    }

    if (slugs && Array.isArray(slugs)) {
      console.log("Received Slugs Array:", slugs);
      for (const s of slugs) {
        if (!purchasedSlugs.includes(s)) {
          console.log(`❌ Mismatched slug in slugs array: ${s}`);
          return res.status(400).json({
            success: false,
            message: `Product mismatch: ${s} was not part of this checkout.`,
          });
        }

        if (!getProductBySlug(s)) {
          console.log(`❌ Product ${s} not found`);
          return res.status(404).json({
            success: false,
            message: `${s} not found.`,
          });
        }
      }
    }

    console.log("✅ Product verified");

    // Step 9: Generate Token
    const token = createDownloadToken({
      slug,
      slugs,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    console.log("✅ Download token generated");

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error("❌ VERIFY PAYMENT ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;