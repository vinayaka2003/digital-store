import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <span className={styles.badge}>
          🚀 Premium Digital Products
        </span>

        <h1>
          Create Better Content with
          <span> WaveLabs</span>
        </h1>

        <p>
          Discover premium AI prompts, viral video bundles,
          templates, presets, LUTs, and digital assets built
          for creators, marketers, and businesses.
        </p>

        <div className={styles.buttons}>
          <Link
            href="/products"
            className={styles.primary}
          >
            Explore Products
          </Link>

          <Link
            href="#preview"
            className={styles.secondary}
          >
            View Preview
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.statsCard}>
            <span className={styles.statsIcon}>🎨</span>
            <h2>1000+</h2>
            <span>Digital Assets</span>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statsIcon}>⚡</span>
            <h2>24/7</h2>
            <span>Instant Access</span>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statsIcon}>🔒</span>
            <h2>Secure</h2>
            <span>Payments</span>
          </div>
        </div>
      </div>
    </section>
  );
}