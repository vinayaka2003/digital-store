import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <span className={styles.badge}>
          Premium Digital Products
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
            <span className={styles.statsIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-10 5 10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
            </span>
            <h2>1000+</h2>
            <span>Digital Assets</span>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statsIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </span>
            <h2>24/7</h2>
            <span>Instant Access</span>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.statsIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <h2>Secure</h2>
            <span>Payments</span>
          </div>
        </div>
      </div>
    </section>
  );
}