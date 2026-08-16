import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import AdminNav from "@/components/AdminNav/AdminNav";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  // 1. Session verification
  if (!verifyAdminSession(token)) {
    redirect("/admin/login");
  }

  // 2. Fetch all orders (Server-side rendering)
  let orders = [];

  try {
    orders = await sql`
      SELECT o.id, o.razorpay_order_id, o.razorpay_payment_id, o.amount, o.currency, o.status, o.created_at,
             c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
             p.name AS product_name,
             d.download_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN downloads d ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      ORDER BY o.created_at DESC
    `;
  } catch (error) {
    console.error("[Orders] Database query failed:", error);
  }

  return (
    <div className={styles.adminDashboard}>
      <AdminNav />

      <main className={styles.container}>
        <div className={styles.welcomeRow}>
          <h1>Store Orders</h1>
          <p>Browse and audit customer transactions and download entitlements.</p>
        </div>

        <div className={styles.sectionCard}>
          {orders.length === 0 ? (
            <p className={styles.noData}>No orders recorded yet.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Payment ID / Order ID</th>
                    <th>Customer Details</th>
                    <th>Product Purchased</th>
                    <th>Amount</th>
                    <th>Downloads</th>
                    <th>Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={`${order.id}-${idx}`}>
                      <td>
                        <div className={styles.customerInfo}>
                          <span className={styles.custName}>{order.razorpay_payment_id}</span>
                          <span className={styles.custEmail}>{order.razorpay_order_id}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.customerInfo}>
                          <span className={styles.custName}>{order.customer_name}</span>
                          <span className={styles.custEmail}>{order.customer_email}</span>
                          {order.customer_phone && (
                            <span className={styles.custEmail} style={{ fontSize: '0.75rem' }}>📞 {order.customer_phone}</span>
                          )}
                        </div>
                      </td>
                      <td>{order.product_name}</td>
                      <td className={styles.price}>₹{order.amount}</td>
                      <td>
                        <span className={styles.countBadge}>{order.download_count} downloads</span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
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
