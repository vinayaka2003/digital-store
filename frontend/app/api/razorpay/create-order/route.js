import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { sql } from "@/lib/db";

export async function POST(req) {
  try {
    const { slug, items, contact, name, email, whatsapp } = await req.json();
    const normalizedContact = typeof contact === "string" ? contact.replace(/\D/g, "") : "";

    let totalAmount = 0;
    let receiptId = "";
    let notes = {};
    let desc = "";

    if (items && Array.isArray(items) && items.length > 0) {
      // Cart checkout: Retrieve exact product prices from Neon database
      for (const item of items) {
        const qty = Number(item.quantity);
        if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
          return NextResponse.json(
            { success: false, message: `Invalid quantity for product "${item.slug}".` },
            { status: 400 }
          );
        }

        // Query product details from database
        const rows = await sql`
          SELECT id, price, name FROM products 
          WHERE slug = ${item.slug} AND active = true
        `;
        if (rows.length === 0) {
          return NextResponse.json(
            { success: false, message: `Product "${item.slug}" not found or inactive.` },
            { status: 404 }
          );
        }

        const product = rows[0];
        totalAmount += product.price * qty;
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
      // Single product checkout: Retrieve exact product details from Neon database
      const rows = await sql`
        SELECT id, price, name, slug FROM products 
        WHERE slug = ${slug} AND active = true
      `;
      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Product not found or inactive." },
          { status: 404 }
        );
      }

      const product = rows[0];
      totalAmount = product.price;
      receiptId = `receipt_${product.slug}_${Date.now()}`;
      notes = {
        checkoutType: "single",
        productSlug: product.slug,
        productTitle: product.name,
        purchasedSlugs: product.slug,
        buyerName: name || "",
        buyerEmail: email || "",
        buyerPhone: normalizedContact,
        buyerWhatsapp: whatsapp || "",
      };
      desc = product.name;

    } else {
      return NextResponse.json(
        { success: false, message: "Product slug or cart items are required." },
        { status: 400 }
      );
    }

    const options = {
      amount: totalAmount * 100, // Razorpay amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: receiptId,
      notes,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order,
      checkoutInfo: { description: desc, amount: totalAmount },
    });

  } catch (error) {
    console.error("[api/razorpay/create-order] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
