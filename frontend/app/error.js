"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "520px",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "2rem",
          }}
        >
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={reset}
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "10px",
            fontWeight: 600,
          }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}