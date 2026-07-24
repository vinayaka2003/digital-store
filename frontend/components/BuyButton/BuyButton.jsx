"use client";

import { useState } from "react";
import styles from "./BuyButton.module.css";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
export default function BuyButton({ product }) {
  const [loading, setLoading] = useState(false);

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

  async function handleBuy() {
    try {
      setLoading(true);

      const loaded = await loadRazorpayScript();

      if (!loaded) {
        alert("Failed to load Razorpay SDK.");
        return;
      }

      const phoneInput = window.prompt(
        "Enter your bank-linked phone number for UPI payment (10 digits):",
        ""
      );

      if (phoneInput === null) {
        alert("Phone number is required to continue.");
        return;
      }

      const contact = phoneInput.replace(/\D/g, "");

      if (!/^\d{10}$/.test(contact)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slug: product.slug,
            contact,
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
          name: "",
          email: "",
          contact,
        },

        modal: {
          ondismiss() {
            alert("Payment cancelled.");
          },
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${BACKEND_URL}/api/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...paymentResponse,
                  slug: product.slug,
                  contact,
                }),
              }
            );

            const result = await verifyResponse.json();

            console.log("Verification:", result);

            if (!verifyResponse.ok || !result.success) {
              alert(result.message || "Payment verification failed.");
              return;
            }

            window.location.href = `/success?paymentId=${paymentResponse.razorpay_payment_id}&token=${result.token}`;
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
    <button
      className={styles._btn}
      onClick={handleBuy}
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? "Loading..." : "Buy Now"}
    </button>
  );
}