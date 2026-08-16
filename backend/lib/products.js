/*
|--------------------------------------------------------------------------
| Products — Backend Copy
|--------------------------------------------------------------------------
| This is the authoritative product data source for the backend.
| The frontend has its own copy for rendering. Both must stay in sync.
*/

const PRODUCT_STATUS = Object.freeze({ ACTIVE: "active", DRAFT: "draft" });

const PRODUCTS = [
  {
    slug: "mad-scientist",
    type: "video-bundle",
    status: PRODUCT_STATUS.ACTIVE,
    featured: true,
    category: "video-bundles",
    title: "1500+ Mad Scientist Viral Videos Bundle",
    shortDescription: "1500+ HD watermark-free viral videos ready for Instagram Reels, YouTube Shorts and Facebook content.",
    pricing: { salePrice: 299, regularPrice: 999, currency: "INR" },
    media: { thumbnail: "/images/mad-scientist/thumbnail.webp", gallery: [] },
    details: { features: ["1500+ HD Videos", "No Watermark", "Instant Download", "Lifetime Access"], specifications: {} },
    faq: [],
    badge: "Best Seller",
    downloadId: "mad-scientist",
    seo: { title: "1500+ Mad Scientist Viral Videos Bundle", description: "", keywords: [] },
  },
  {
    slug: "chatgpt-prompts",
    type: "ai-prompts",
    status: PRODUCT_STATUS.ACTIVE,
    featured: true,
    category: "ai-prompts",
    title: "10,000+ Premium ChatGPT Prompts Bundle",
    shortDescription: "Unlock the full power of ChatGPT with 10k+ copy-paste prompts for marketing, writing, coding and business.",
    pricing: { salePrice: 199, regularPrice: 599, currency: "INR" },
    media: { thumbnail: "/images/chatgpt-prompts/thumbnail.webp", gallery: [] },
    details: { features: ["10,000+ Curated Prompts", "Copy & Paste Ready", "Lifetime Access"], specifications: {} },
    faq: [],
    badge: "Trending",
    downloadId: "chatgpt-prompts",
    seo: { title: "10,000+ Premium ChatGPT Prompts Bundle", description: "", keywords: [] },
  },
  {
    slug: "luts-pack",
    type: "lut",
    status: PRODUCT_STATUS.ACTIVE,
    featured: true,
    category: "presets",
    title: "Cinematic LUTs Pack for Creators",
    shortDescription: "50+ cinematic color grading LUTs for Premiere Pro, DaVinci Resolve, Final Cut, and CapCut.",
    pricing: { salePrice: 399, regularPrice: 1299, currency: "INR" },
    media: { thumbnail: "/images/luts-pack/thumbnail.webp", gallery: [] },
    details: { features: ["50+ Professional LUTs", "Works on all Video Software", "Instant Download"], specifications: {} },
    faq: [],
    badge: "New Release",
    downloadId: "luts-pack",
    seo: { title: "Cinematic LUTs Pack for Creators", description: "", keywords: [] },
  },
  {
    slug: "demo-product",
    type: "demo",
    status: PRODUCT_STATUS.ACTIVE,
    featured: true,
    category: "test-products",
    title: "1 Rupee Test Demo Product",
    shortDescription: "A demo product priced at 1 Rupee to test the Razorpay payment integration and instant download flow.",
    pricing: { salePrice: 1, regularPrice: 10, currency: "INR" },
    media: { thumbnail: "/images/demo-product/thumbnail.webp", gallery: [] },
    details: { features: ["1 Rupee Test", "Instant Verification", "Real-time Checkout Test", "Immediate Download Access"], specifications: {} },
    faq: [],
    badge: "Demo",
    downloadId: "demo-product",
    seo: { title: "1 Rupee Test Demo Product", description: "Demo product for testing payment integration", keywords: ["test", "demo"] },
  },
];

export function getAllProducts() { return [...PRODUCTS]; }
export function getProductBySlug(slug) { return PRODUCTS.find((p) => p.slug === slug) ?? null; }
export function productExists(slug) { return PRODUCTS.some((p) => p.slug === slug); }
export function getActiveProducts() { return PRODUCTS.filter((p) => p.status === PRODUCT_STATUS.ACTIVE); }
