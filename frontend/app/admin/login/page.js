"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid username or password.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An error occurred during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Owner Portal</span>
          <h1>Admin Control Panel</h1>
          <p>Please authenticate to access store orders and configuration.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error && <div className={styles.errorText}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Authenticating..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
