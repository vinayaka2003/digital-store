"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getActiveProducts } from "@/lib/products";
import { showToast } from "@/lib/utils";
import CheckoutModal from "@/components/CheckoutModal/CheckoutModal";
import styles from "./page.module.css";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const products = getActiveProducts();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart_items") || "[]");
    setTimeout(() => {
      setIsMounted(true);
      setCartItems(saved);
    }, 0);

    const handleCartUpdate = () => {
      setCartItems(JSON.parse(localStorage.getItem("cart_items") || "[]"));
    };

    window.addEventListener("cart-update", handleCartUpdate);
    return () => window.removeEventListener("cart-update", handleCartUpdate);
  }, []);

  const updateQuantity = (slug, delta) => {
    const updated = cartItems.map((item) => {
      if (item.slug === slug) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeItem = (slug) => {
    const updated = cartItems.filter((item) => item.slug !== slug);
    saveCart(updated);
    showToast("Removed item from cart.");
  };

  const saveCart = (items) => {
    localStorage.setItem("cart_items", JSON.stringify(items));
    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("cart_count", totalCount.toString());
    setCartItems(items);
    window.dispatchEvent(new Event("cart-update"));
  };

  // Resolve cart products
  const cartProducts = cartItems
    .map((item) => {
      const prod = products.find((p) => p.slug === item.slug);
      if (!prod) return null;
      return {
        ...prod,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  const subtotal = cartProducts.reduce(
    (acc, p) => acc + p.pricing.regularPrice * p.quantity,
    0
  );
  const total = cartProducts.reduce(
    (acc, p) => acc + p.pricing.salePrice * p.quantity,
    0
  );
  const savings = subtotal - total;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  function handleCheckout() {
    if (cartProducts.length === 0) {
      console.log("Checkout aborted: cart is empty");
      return;
    }
    setIsModalOpen(true);
  }

  async function handleCheckoutSubmit(buyerData) {
    setIsModalOpen(false);
    try {
      setLoading(true);
      console.log("Starting checkout process. Cart items:", cartItems);

      const isScriptLoaded = await loadRazorpayScript();
      console.log("Razorpay script loaded:", isScriptLoaded);
      if (!isScriptLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        return;
      }

      console.log("Creating Razorpay order on backend...");
      const useExpress = process.env.NEXT_PUBLIC_USE_EXPRESS === "true";
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const createOrderUrl = useExpress ? `${BACKEND}/api/create-order` : "/api/razorpay/create-order";
      const verifyPaymentUrl = useExpress ? `${BACKEND}/api/verify-payment` : "/api/razorpay/verify-payment";

      const response = await fetch(createOrderUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ slug: item.slug, quantity: item.quantity })),
          contact: buyerData.contact,
          name: buyerData.name,
          email: buyerData.email,
          whatsapp: buyerData.whatsapp,
        }),
      });

      const data = await response.json();
      console.log("Backend response data:", data);

      if (!data.success) {
        alert(data.message || "Failed to create order.");
        return;
      }

      console.log("Razorpay Key ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        alert("Razorpay Key ID is missing.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "WaveLabs",
        description: data.checkoutInfo.description,
        order_id: data.order.id,
        theme: {
          color: "#0f1115",
        },
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(verifyPaymentUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                slugs: cartItems.map((item) => item.slug),
                contact: buyerData.contact,
              }),
            });

            const result = await verifyResponse.json();

            if (!verifyResponse.ok || !result.success) {
              alert(result.message || "Payment verification failed.");
              return;
            }

            // Clear Cart after successful checkout
            localStorage.setItem("cart_items", "[]");
            localStorage.setItem("cart_count", "0");
            window.dispatchEvent(new Event("cart-update"));

            // Redirect using new token map if available
            let successRedirectUrl = `/success?paymentId=${response.razorpay_payment_id}`;
            if (result.tokens && result.tokens.length > 0) {
              const tokensStr = result.tokens.map((t) => `${t.slug}:${t.rawToken}`).join(",");
              successRedirectUrl += `&tokens=${tokensStr}`;
            } else if (result.token) {
              successRedirectUrl += `&token=${result.token}`;
            }

            window.location.href = successRedirectUrl;
          } catch (error) {
            console.error(error);
            alert("Payment verification failed.");
          }
        },
        modal: {
          ondismiss() {
            alert("Payment cancelled.");
          },
        },
        prefill: {
          name: buyerData.name,
          email: buyerData.email,
          contact: buyerData.contact,
        },
      };

      console.log("Initializing Razorpay constructor with options:", options);
      const razorpay = new window.Razorpay(options);
      console.log("Opening Razorpay modal...");
      razorpay.open();
    } catch (error) {
      console.error("Checkout Exception Caught:", error);
      alert(`Something went wrong during checkout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    return (
      <main className={styles.cartPage}>
        <h1 className={styles.title}>Loading Your Cart...</h1>
      </main>
    );
  }

  return (
    <main className={styles.cartPage}>
      <h1 className={styles.title}>Your Cart</h1>

      {cartProducts.length === 0 ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <h2>Your cart is empty</h2>
          <p>Explore our premium digital assets to fill it up.</p>
          <Link href="/products" className={styles.shopBtn}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Cart Items List */}
          <div className={styles.itemsList}>
            {cartProducts.map((product) => (
              <div key={product.slug} className={styles.cartItem}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={product.media.thumbnail}
                    alt={product.title}
                    fill
                    sizes="100px"
                    className={styles.image}
                  />
                </div>

                <div className={styles.details}>
                  <div className={styles.headerRow}>
                    <div>
                      <span className={styles.categoryBadge}>{product.category}</span>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className={styles.itemTitle}>{product.title}</h3>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(product.slug)}
                      className={styles.removeBtn}
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>

                  <div className={styles.footerRow}>
                    <div className={styles.qtyControls}>
                      <button onClick={() => updateQuantity(product.slug, -1)}>-</button>
                      <span className={styles.qtyVal}>{product.quantity}</span>
                      <button onClick={() => updateQuantity(product.slug, 1)}>+</button>
                    </div>

                    <div className={styles.priceCol}>
                      <span className={styles.salePrice}>
                        ₹{product.pricing.salePrice * product.quantity}
                      </span>
                      <span className={styles.regPrice}>
                        ₹{product.pricing.regularPrice * product.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className={styles.summaryPanel}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span className={styles.discountVal}>-₹{savings}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery</span>
                <span className={styles.freeBadge}>Instant / Free</span>
              </div>

              <div className={styles.divider}></div>

              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className={styles.checkoutBtn}
            >
              {loading ? "Processing..." : "Proceed to Secure Checkout"}
            </button>

            <p className={styles.securityText}>
              Secure checkout powered by Razorpay. Files will be available for instant download immediately after verification.
            </p>
          </div>
        </div>
      )}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
        totalAmount={total}
      />
    </main>
  );
}
