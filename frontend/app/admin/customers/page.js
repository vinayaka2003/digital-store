import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import AdminNav from "@/components/AdminNav/AdminNav";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  // 1. Session verification
  if (!verifyAdminSession(token)) {
    redirect("/admin/login");
  }

  // 2. Fetch all customers (Server-side rendering)
  let customers = [];

  try {
    customers = await sql`
      SELECT c.id, c.name, c.email, c.phone, c.created_at,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(o.amount), 0) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'captured'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
  } catch (error) {
    console.error("[Customers] Database query failed:", error);
  }

  return (
    <div className={styles.adminDashboard}>
      <AdminNav />

      <main className={styles.container}>
        <div className={styles.welcomeRow}>
          <h1>Customer Database</h1>
          <p>View profiles and lifetime statistics of customers who purchased on your store.</p>
        </div>

        <div className={styles.sectionCard}>
          {customers.length === 0 ? (
            <p className={styles.noData}>No customers registered yet.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Total Orders</th>
                    <th>Lifetime Spent</th>
                    <th>Registered Since</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((cust) => (
                    <tr key={cust.id}>
                      <td style={{ fontWeight: '600' }}>{cust.name}</td>
                      <td>{cust.email}</td>
                      <td>{cust.phone || "N/A"}</td>
                      <td>
                        <span className={styles.countBadge}>{cust.total_orders} purchases</span>
                      </td>
                      <td className={styles.price} style={{ color: "var(--accent)" }}>₹{cust.total_spent}</td>
                      <td>
                        {new Date(cust.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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
