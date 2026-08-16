import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import Script from "next/script";
import Providers from "@/components/ThemeProvider";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "WaveLabs",
    template: "%s | WaveLabs",
  },

  description:
    "Premium digital templates, printable resources, and instant download products for creators, students, and professionals.",

  applicationName: "WaveLabs",

  keywords: [
    "WaveLabs",
    "digital products",
    "printables",
    "templates",
    "instant download",
    "worksheets",
    "pdf templates",
    "planner templates",
    "digital assets",
    "creator resources",
  ],

  authors: [
    {
      name: "WaveLabs",
    },
  ],

  creator: "WaveLabs",

  publisher: "WaveLabs",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "WaveLabs",
    description:
      "Premium digital templates and printable resources with instant download.",

    url:
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://your-domain.com",

    siteName: "WaveLabs",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WaveLabs",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "WaveLabs",
    description:
      "Premium digital templates and printable resources.",

    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
          <ScrollToTop />

          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />
        </Providers>
      </body>
    </html>
  );
}