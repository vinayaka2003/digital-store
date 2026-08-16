"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav/AdminNav";
import styles from "../page.module.css";
import localStyles from "./products.module.css";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load products.");
      }
      setProducts(data.products);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Failed to toggle product status.");
        return;
      }
      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !currentActive } : p))
      );
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles.adminDashboard}>
      <AdminNav />

      <main className={styles.container}>
        <div className={styles.welcomeRow}>
          <h1>Store Products</h1>
          <p>Manage product visibility, review pricing, and manage Google Drive delivery identifiers.</p>
        </div>

        {error && <div className={styles.noData} style={{ color: "var(--danger)" }}>{error}</div>}

        <div className={styles.sectionCard}>
          {loading ? (
            <p className={styles.noData}>Loading products...</p>
          ) : products.length === 0 ? (
            <p className={styles.noData}>No products found in the database.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Showcase</th>
                    <th>Product Name / Slug</th>
                    <th>Price</th>
                    <th>Google Drive ID</th>
                    <th>Visibility Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className={localStyles.thumbnailWrapper}>
                          {/* Render thumbnail using standard img tag for simplicity */}
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className={localStyles.thumbnail}
                          />
                        </div>
                      </td>
                      <td>
                        <div className={styles.customerInfo}>
                          <span className={styles.custName}>{prod.name}</span>
                          <span className={styles.custEmail}>{prod.slug}</span>
                        </div>
                      </td>
                      <td className={styles.price}>₹{prod.price}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {prod.google_drive_file_id}
                      </td>
                      <td>
                        <span
                          className={`${localStyles.statusBadge} ${
                            prod.active ? localStyles.active : localStyles.inactive
                          }`}
                        >
                          {prod.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`${localStyles.actionBtn} ${
                            prod.active ? localStyles.deactivate : localStyles.activate
                          }`}
                          onClick={() => handleToggleActive(prod.id, prod.active)}
                        >
                          {prod.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
