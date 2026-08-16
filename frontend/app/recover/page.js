"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./recover.module.css";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus("error");
        setMessage(data.message || "Failed to process recovery request.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Order Recovery</span>
          <h1>Recover Purchases</h1>
          <p>
            Enter the email address you used during checkout. If we find any completed purchases under this email, we will instantly send fresh download links to your inbox.
          </p>
        </div>

        <div className={styles.box}>
          {status === "success" ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✓</div>
              <h3>Recovery Request Sent</h3>
              <p className={styles.successMessage}>{message}</p>
              <p className={styles.infoText}>
                Please check your spam/junk folder if you do not receive the email within a couple of minutes.
              </p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => setStatus(null)}
              >
                Enter Another Email
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="recovery-email">Email Address</label>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={status === "error" ? styles.inputError : ""}
                />
              </div>

              {status === "error" && (
                <div className={styles.errorText}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Processing..." : "Email Download Links"}
              </button>

              <div className={styles.backLink}>
                <Link href="/products">← Back to Catalog</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
