"use client";

import styles from "./ProductInfo.module.css";
import BuyButton from "@/components/BuyButton/BuyButton";
import { showToast } from "@/lib/utils";

export default function ProductInfo({ product }) {
  const {
    badge,
    title,
    shortDescription,
    pricing,
  } = product;

  const discount = Math.round(
    ((pricing.regularPrice - pricing.salePrice) /
      pricing.regularPrice) *
      100
  );

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem("cart_items") || "[]");
    const existing = cartItems.find(item => item.slug === product.slug);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ slug: product.slug, quantity: 1 });
    }
    localStorage.setItem("cart_items", JSON.stringify(cartItems));
    
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    localStorage.setItem("cart_count", totalCount.toString());
    
    window.dispatchEvent(new Event("cart-update"));
    showToast(`Added "${product.title}" to cart.`);
  };

  return (
    <section className={styles.info}>
      {badge && (
        <span className={styles.badge}>
          {badge}
        </span>
      )}

      <h1>{title}</h1>

      <p className={styles.description}>
        {shortDescription}
      </p>

      <div className={styles.priceBox}>
        <span className={styles.sale}>
          ₹{pricing.salePrice}
        </span>

        <span className={styles.regular}>
          ₹{pricing.regularPrice}
        </span>

        <span className={styles.discount}>
          {discount}% OFF
        </span>
      </div>

      <div className={styles.features}>
        <p>✓ Instant Download</p>
        <p>✓ Secure Razorpay Payment</p>
        <p>✓ Lifetime Access</p>
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
        <div className={styles.buyBtnWrapper}>
          <BuyButton product={product} />
        </div>
      </div>

      <p className={styles.note}>
        Secure payment powered by Razorpay
      </p>
    </section>
  );
}