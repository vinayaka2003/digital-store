import Link from "next/link";
import styles from "./cancelled.module.css";

export const metadata = {
  title: "Payment Cancelled | WaveLabs",
};

export default function CancelledPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.icon}>✕</div>
        <h1>Payment Cancelled</h1>
        <p>
          Your payment was cancelled and you have not been charged. You can go
          back and try again whenever you&apos;re ready.
        </p>
        <div className={styles.actions}>
          <Link href="/products" className={styles.primary}>
            Browse Products
          </Link>
          <Link href="/cart" className={styles.secondary}>
            Back to Cart
          </Link>
        </div>
        <p className={styles.note}>
          Having trouble? Email us at{" "}
          <a href="mailto:wavelabsofficial@gmail.com">
            wavelabsofficial@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
