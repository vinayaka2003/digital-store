import styles from "./ProductSpecifications.module.css";

export default function ProductSpecifications({ product }) {
  return (
    <section className={styles.section}>
      <h2>Specifications</h2>

      <div className={styles.table}>
        {Object.entries(product.details.specifications).map(([key, value]) => (
          <div key={key} className={styles.row}>
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}