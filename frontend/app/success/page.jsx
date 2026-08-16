"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import styles from "./page.module.css";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const token = searchParams.get("token");

  const [downloadingSlug, setDownloadingSlug] = useState(null);

  // Client-side JWT decoder
  const decodeToken = (jwtToken) => {
    try {
      const base64Url = jwtToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const payload = token ? decodeToken(token) : null;
  // Fallback to single slug if slugs list is empty
  const slugsToDownload = payload
    ? payload.slugs || (payload.slug ? [payload.slug] : [])
    : [];

  // Parse new token structure if available in searchParams
  const rawTokensParam = searchParams.get("tokens") || "";
  const tokenMap = {};
  if (rawTokensParam) {
    rawTokensParam.split(",").forEach((item) => {
      const [slug, rawToken] = item.split(":");
      if (slug && rawToken) {
        tokenMap[slug] = rawToken;
      }
    });
  }

  const isNewTokenFlow = Object.keys(tokenMap).length > 0;
  const displaySlugs = isNewTokenFlow ? Object.keys(tokenMap) : slugsToDownload;

  async function downloadProduct(slug) {
    try {
      setDownloadingSlug(slug);

      if (isNewTokenFlow) {
        const rawToken = tokenMap[slug];
        if (!rawToken) {
          alert("Download link not found for this product.");
          return;
        }
        // Direct browser redirect to download router
        window.location.assign(`/api/download/${rawToken}`);
      } else {
        // Fallback to old JWT token flow
        if (!token) {
          alert("Missing download token.");
          return;
        }
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const response = await fetch(`${BACKEND}/api/download?token=${token}&slug=${slug}`);
        const data = await response.json();

        if (!data.success) {
          alert(data.message || "Failed to get download link.");
          return;
        }

        window.location.assign(data.downloadUrl);
      }
    } catch (error) {
      console.error(error);
      alert("Unable to download product.");
    } finally {
      setDownloadingSlug(null);
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.iconWrapper}>
        ✓
      </div>

      <h1 className={styles.title}>Payment Successful!</h1>
      <p className={styles.subtitle}>
        Thank you for your purchase. Your payment was processed securely.
      </p>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Payment ID</span>
          <span className={styles.detailValue}>{paymentId || "N/A"}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Status</span>
          <span className={styles.detailValue} style={{ color: "var(--success)" }}>Completed</span>
        </div>
      </div>

      <div className={styles.downloadSection}>
        <h2 className={styles.sectionTitle}>Your Digital Downloads</h2>
        {displaySlugs.length === 0 ? (
          <p className={styles.subtitle}>No downloads available for this payment.</p>
        ) : (
          <div className={styles.downloadGrid}>
            {displaySlugs.map((slug) => (
              <div key={slug} className={styles.downloadCard}>
                <div className={styles.downloadInfo}>
                  <span className={styles.downloadIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  </span>
                  <span className={styles.downloadSlug}>{slug.replace(/-/g, " ")}</span>
                </div>
                <button
                  className={styles.miniBtn}
                  onClick={() => downloadProduct(slug)}
                  disabled={downloadingSlug !== null}
                >
                  {downloadingSlug === slug ? "Preparing..." : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className={styles.container}>
        <h1 className={styles.title}>Loading order details...</h1>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}