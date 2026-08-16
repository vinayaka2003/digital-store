"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={styles.toggle}
        aria-label="Toggle Theme"
        disabled
      >
        <span className={styles.icon}>☀️</span>
      </button>
    );
  }

  return (
    <button
      className={styles.toggle}
      onClick={() =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
      aria-label="Toggle Theme"
    >
      <span className={styles.icon}>
        {resolvedTheme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}