import { getAllProducts } from "../lib/products";

export default function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const products = getAllProducts();

  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/privacy`,
    },

    {
      url: `${baseUrl}/terms`,
    },

    {
      url: `${baseUrl}/refund`,
    },

    {
      url: `${baseUrl}/contact`,
    },

    ...productPages,
  ];
}