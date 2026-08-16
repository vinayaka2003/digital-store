import Link from "next/link";
import styles from "./Pricing.module.css";

export default function Pricing() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <span className={styles.badge}>
          Limited Time Offer
        </span>

        <h2>Get Instant Access Today</h2>

        <p>
          One payment. Lifetime access. Instant delivery after
          successful payment.
        </p>

        <div className={styles.card}>
          <div className={styles.discount}>
            Save 70%
          </div>

          <h3>1500+ Mad Scientist Bundle</h3>

          <div className={styles.price}>
            <span className={styles.sale}>₹299</span>

            <span className={styles.old}>
              ₹999
            </span>
          </div>

          <ul className={styles.list}>
            <li>✓ 1500+ HD Videos</li>
            <li>✓ No Watermark</li>
            <li>✓ Instant Download</li>
            <li>✓ Secure Razorpay Payment</li>
            <li>✓ Lifetime Access</li>
          </ul>

          <Link
            href="/products/mad-scientist"
            className={styles.button}
          >
            Buy Now
          </Link>

          <p className={styles.note}>
            Payments secured by Razorpay
          </p>
        </div>
      </div>
    </section>
  );
}