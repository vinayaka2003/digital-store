import express from "express";
import razorpay from "../lib/razorpay.js";
import { getProductBySlug } from "../lib/products.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { slug, items, contact, name, email, whatsapp } = req.body;
    const normalizedContact = typeof contact === "string" ? contact.replace(/\D/g, "") : "";

    let totalAmount = 0;
    let receiptId = "";
    let notes = {};
    let desc = "";

    if (items && Array.isArray(items) && items.length > 0) {
      // Cart checkout
      for (const item of items) {
        const qty = Number(item.quantity);
        if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
          return res.status(400).json({ success: false, message: `Invalid quantity for product "${item.slug}".` });
        }
        const product = getProductBySlug(item.slug);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product "${item.slug}" not found.` });
        }
        totalAmount += product.pricing.salePrice * qty;
      }
      receiptId = `receipt_cart_${Date.now()}`;
      notes = {
        checkoutType: "cart",
        itemsSummary: items.map((i) => `${i.slug} x ${i.quantity}`).join(", "),
        purchasedSlugs: items.map((i) => i.slug).join(","),
        buyerName: name || "",
        buyerEmail: email || "",
        buyerPhone: normalizedContact,
        buyerWhatsapp: whatsapp || "",
      };
      desc = "WaveLabs Cart Purchase";

    } else if (slug) {
      // Single product checkout
      const product = getProductBySlug(slug);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }
      totalAmount = product.pricing.salePrice;
      receiptId = `receipt_${product.slug}_${Date.now()}`;
      notes = {
        checkoutType: "single",
        productSlug: product.slug,
        productTitle: product.title,
        purchasedSlugs: product.slug,
        buyerName: name || "",
        buyerEmail: email || "",
        buyerPhone: normalizedContact,
        buyerWhatsapp: whatsapp || "",
      };
      desc = product.title;

    } else {
      return res.status(400).json({ success: false, message: "Product slug or cart items are required." });
    }

    const options = {
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: receiptId,
      notes,
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      checkoutInfo: { description: desc, amount: totalAmount },
    });

  } catch (error) {
    console.error("[create-order] Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
