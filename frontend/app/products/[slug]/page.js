import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";

import ProductGallery from "@/components/Product/ProductGallery/ProductGallery";
import ProductInfo from "@/components/Product/ProductInfo/ProductInfo";
import ProductFeatures from "@/components/Product/ProductFeatures/ProductFeatures";
import ProductSpecifications from "@/components/Product/ProductSpecifications/ProductSpecifications";
import ProductFAQ from "@/components/Product/ProductFAQ/ProductFAQ";

import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const product = getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.seo.title,
    description: product.seo.description,
    keywords: product.seo.keywords,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="container">
      <section className={styles.hero}>
        <ProductGallery product={product} />
        <ProductInfo product={product} />
      </section>

      <ProductFeatures product={product} />

      <ProductSpecifications product={product} />

      <ProductFAQ product={product} />
    </main>
  );
}