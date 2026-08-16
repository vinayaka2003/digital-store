"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminNav.module.css";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className={styles.navHeader}>
      <div className={styles.container}>
        <Link href="/admin" className={styles.brand}>
          Wave<span>Labs</span> <span className={styles.badge}>Admin</span>
        </Link>

        <nav className={styles.links}>
          <Link
            href="/admin"
            className={pathname === "/admin" ? styles.active : ""}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className={pathname === "/admin/orders" ? styles.active : ""}
          >
            Orders
          </Link>
          <Link
            href="/admin/customers"
            className={pathname === "/admin/customers" ? styles.active : ""}
          >
            Customers
          </Link>
          <Link
            href="/admin/products"
            className={pathname === "/admin/products" ? styles.active : ""}
          >
            Products
          </Link>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
