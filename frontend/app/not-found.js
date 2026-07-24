import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata = {
  title: "404 - Page Not Found | WaveLabs",
};

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.code}>404</div>
        <h1>Page Not Found</h1>
        <p>
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            Back to Home
          </Link>
          <Link href="/products" className={styles.secondary}>
            Browse Products
          </Link>
        </div>
      </div>
    </main>
  );
}