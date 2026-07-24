import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "Digital Store",
    template: "%s | Digital Store",
  },

  description:
    "Premium digital bundles for creators. Instant download after secure payment.",

  applicationName: "Digital Store",

  keywords: [
    "digital products",
    "video bundles",
    "creator assets",
    "templates",
    "instant download",
  ],

  authors: [
    {
      name: "Digital Store",
    },
  ],

  creator: "Digital Store",

  publisher: "Digital Store",

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Navbar />
        {children}
        <Footer />
        <ScrollToTop />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}