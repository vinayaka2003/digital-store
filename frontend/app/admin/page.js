import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import AdminNav from "@/components/AdminNav/AdminNav";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  // 1. Session verification
  if (!verifyAdminSession(token)) {
    redirect("/admin/login");
  }

  // 2. Fetch database metrics directly (Server-side rendering)
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalCustomers = 0;
  let recentOrders = [];

  try {
    const revenueRes = await sql`
      SELECT COALESCE(SUM(amount), 0) AS val FROM orders WHERE status = 'captured'
    `;
    totalRevenue = Number(revenueRes[0].val);

    const ordersRes = await sql`
      SELECT COUNT(id) AS val FROM orders WHERE status = 'captured'
    `;
    totalOrders = Number(ordersRes[0].val);

    const customerRes = await sql`
      SELECT COUNT(id) AS val FROM customers
    `;
    totalCustomers = Number(customerRes[0].val);

    recentOrders = await sql`
      SELECT o.id, o.razorpay_payment_id, o.amount, o.created_at,
             c.name AS customer_name, c.email AS customer_email,
             p.name AS product_name,
             d.download_count
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN downloads d ON d.order_id = o.id
      JOIN products p ON d.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;
  } catch (error) {
    console.error("[Dashboard] Database metrics query failed:", error);
  }

  return (
    <div className={styles.adminDashboard}>
      <AdminNav />

      <main className={styles.container}>
        <div className={styles.welcomeRow}>
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back. Here is how your store is performing today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <span className={styles.label}>Total Revenue</span>
            <h2 className={styles.value}>₹{totalRevenue.toLocaleString()}</h2>
            <span className={styles.subtext}>From captured orders</span>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.label}>Total Sales</span>
            <h2 className={styles.value}>{totalOrders}</h2>
            <span className={styles.subtext}>Completed transactions</span>
          </div>

          <div className={styles.statsCard}>
            <span className={styles.label}>Customers</span>
            <h2 className={styles.value}>{totalCustomers}</h2>
            <span className={styles.subtext}>Unique buyer profiles</span>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2>Recent Transactions</h2>
            <p>The latest 5 purchases made on your store.</p>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.noData}>No orders recorded yet.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Downloads</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={`${order.id}-${idx}`}>
                      <td>
                        <div className={styles.customerInfo}>
                          <span className={styles.custName}>{order.customer_name}</span>
                          <span className={styles.custEmail}>{order.customer_email}</span>
                        </div>
                      </td>
                      <td>{order.product_name}</td>
                      <td className={styles.price}>₹{order.amount}</td>
                      <td>
                        <span className={styles.countBadge}>{order.download_count}</span>
                      </td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString(undefined, {
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
