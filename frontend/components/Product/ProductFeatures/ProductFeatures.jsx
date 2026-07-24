import styles from "./ProductFeatures.module.css";

export default function ProductFeatures({ product }) {
  return (
    <section className={styles.section}>
      <h2>What&apos;s Included</h2>

      <div className={styles.grid}>
        {product.details.features.map((feature) => (
          <div key={feature} className={styles.card}>
            <span>✅</span>
            <p>{feature}</p>
          </div>
        ))}
      </div>
    </section>
  );
}