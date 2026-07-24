import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.brand}>
          <h2>WaveLabs</h2>

          <p>
            Premium digital products for creators,
            marketers and businesses.
          </p>
        </div>

        <div className={styles.links}>
          <h3>Company</h3>

          <Link href="/">Home</Link>

          <Link href="/contact">
            Contact
          </Link>

          <Link href="/privacy">
            Privacy Policy
          </Link>

          <Link href="/terms">
            Terms & Conditions
          </Link>

          <Link href="/refund">
            Refund Policy
          </Link>
        </div>

        <div className={styles.support}>
          <h3>Support</h3>

          <p>Email</p>

          <a href="mailto:support@wavelabs.in">
            support@wavelabs.in
          </a>

          <p className={styles.delivery}>
            Instant Digital Delivery
          </p>

          <p>
            Secure Payments via Razorpay
          </p>
        </div>

      </div>

      <div className={styles.bottom}>
        © {year} WaveLabs. All rights reserved.
      </div>
    </footer>
  );
}