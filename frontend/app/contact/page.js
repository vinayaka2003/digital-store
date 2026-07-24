"use client";

import { useState } from "react";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate async send (replace with real API call if needed)
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>📬 Contact</span>
          <h1>Get in Touch</h1>
          <p>
            Have a question about your purchase or need help? We&apos;ll get
            back to you within 24–48 hours.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Info Panel */}
          <div className={styles.info}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✉️</div>
              <h3>Email Us</h3>
              <a href="mailto:wavelabsofficial@gmail.com">
                wavelabsofficial@gmail.com
              </a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>⏱️</div>
              <h3>Response Time</h3>
              <p>Within 24–48 hours on business days</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📦</div>
              <h3>Instant Delivery</h3>
              <p>All products are delivered digitally right after payment</p>
            </div>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            {status === "sent" ? (
              <div className={styles.successBox}>
                <span className={styles.successIcon}>✓</span>
                <h3>Message Sent!</h3>
                <p>
                  Thanks for reaching out. We&apos;ll reply to your email
                  shortly.
                </p>
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => setStatus(null)}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className={styles.field}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Describe your issue or question..."
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <span className={styles.spinner} />
                  ) : (
                    "Send Message →"
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}