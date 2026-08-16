import Image from "next/image";
import Link from "next/link";
import BuyButton from "@/components/BuyButton/BuyButton";
import { showToast } from "@/lib/utils";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  // Map category code to human readable label
  const categoryLabels = {
    "video-bundles": "Video Bundle",
    "ai-prompts": "AI Prompts",
    "presets": "Presets & LUTs",
    "presets-luts": "Presets & LUTs"
  };
  const categoryLabel = categoryLabels[product.category] || "Digital Asset";

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
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={product.media.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className={styles.image}
        />
        <span className={styles.cardCategory}>{categoryLabel}</span>
      </div>

      <div className={styles.content}>
        <Link href={`/products/${product.slug}`} className={styles.titleLink}>
          <h3>{product.title}</h3>
        </Link>

        <div className={styles.rating}>
          <span className={styles.stars}>★ 5.0</span>
          <span className={styles.reviewsCount}>(1.2k Reviews)</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.sale}>₹{product.pricing.salePrice}</span>
          {product.pricing.regularPrice && (
            <span className={styles.regular}>₹{product.pricing.regularPrice}</span>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
          <div className={styles.buyBtnWrapper}>
            <BuyButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}