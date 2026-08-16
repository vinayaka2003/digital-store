"use client";

import { ThemeProvider } from "next-themes";

// Suppress the React 19 / next-themes console warning about inline script tags during dev
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalError.apply(console, args);
  };
}

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}