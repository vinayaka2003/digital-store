"use client";

import { useState } from "react";
import CheckoutModal from "../CheckoutModal/CheckoutModal";
import styles from "./BuyButton.module.css";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function BuyButton({ product }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  async function handleCheckoutSubmit(buyerData) {
    setIsModalOpen(false);
    try {
      setLoading(true);

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        alert("Failed to load Razorpay SDK.");
        return;
      }

      const useExpress = process.env.NEXT_PUBLIC_USE_EXPRESS === "true";
      const createOrderUrl = useExpress ? `${BACKEND_URL}/api/create-order` : "/api/razorpay/create-order";
      const verifyPaymentUrl = useExpress ? `${BACKEND_URL}/api/verify-payment` : "/api/razorpay/verify-payment";

      const response = await fetch(
        createOrderUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug: product.slug,
            contact: buyerData.contact,
            name: buyerData.name,
            email: buyerData.email,
            whatsapp: buyerData.whatsapp,
          }),
        }
      );

      const data = await response.json();

      console.log("Create Order Response:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create order.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,

        name: "WaveLabs",
        description: product.title,

        theme: {
          color: "#2563eb",
        },

        prefill: {
          name: buyerData.name,
          email: buyerData.email,
          contact: buyerData.contact,
        },

        modal: {
          ondismiss() {
            alert("Payment cancelled.");
          },
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              verifyPaymentUrl,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...paymentResponse,
                  slug: product.slug,
                  contact: buyerData.contact,
                }),
              }
            );

            const result = await verifyResponse.json();

            console.log("Verification:", result);

            if (!verifyResponse.ok || !result.success) {
              alert(result.message || "Payment verification failed.");
              return;
            }

            // Redirect using new token map if available
            let successRedirectUrl = `/success?paymentId=${paymentResponse.razorpay_payment_id}`;
            if (result.tokens && result.tokens.length > 0) {
              const tokensStr = result.tokens.map((t) => `${t.slug}:${t.rawToken}`).join(",");
              successRedirectUrl += `&tokens=${tokensStr}`;
            } else if (result.token) {
              successRedirectUrl += `&token=${result.token}`;
            }

            window.location.href = successRedirectUrl;
          } catch (err) {
            console.error(err);
            alert("Payment verification failed.");
          }
        },
      };

      console.log("Opening Razorpay...", options);

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className={styles._btn}
        onClick={() => setIsModalOpen(true)}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Loading..." : "Buy Now"}
      </button>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
        totalAmount={product.pricing.salePrice}
      />
    </>
  );
}