"use client";

import { useState } from "react";
import { getActiveProducts } from "@/lib/products";
import ProductCard from "@/components/Product/ProductCard/ProductCard";
import styles from "./page.module.css";

export default function ProductsPage() {
  const allProducts = getActiveProducts();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Products" },
    { id: "video-bundles", label: "Video Bundles" },
    { id: "ai-prompts", label: "AI Prompts" },
    { id: "presets", label: "Presets & LUTs" },
  ];

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className={styles.products}>
      {/* Shop Banner Header */}
      <section className={styles.shopBanner}>
        <div className={styles.bannerBackground}>
          <h1 className={styles.bannerTitle}>Shop</h1>
        </div>
        <div className={styles.bannerFooter}>
          <h2 className={styles.bannerSubtitle}>Give All You Need</h2>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search in WaveLabs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchBtn}>Search</button>
          </div>
        </div>
      </section>

      {/* Main Content Area: Sidebar + Grid */}
      <div className={styles.mainLayout}>
<div className={styles.filterRow}>
          <div className={styles.filterField}>
            <label htmlFor="categorySelect" className={styles.filterLabel}>
              Category
            </label>
            <select
              id="categorySelect"
              className={styles.categorySelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Content Area: Grid */}
        <div className={styles.contentGrid}>
          <div className={styles.metaRow}>
            <p className={styles.resultsCount}>
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No products found</h3>
              <p>Try adjusting your search keywords or switching filters.</p>
            </div>
          ) : (
            <section className={styles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                />
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}