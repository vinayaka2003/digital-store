import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from frontend/.env.local or backend/.env
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: path.resolve(__dirname, "../../backend/.env") });
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing!");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Authoritative initial product data
const PRODUCTS_SEED = [
  {
    name: "1500+ Mad Scientist Viral Videos Bundle",
    slug: "mad-scientist",
    description: "1500+ HD watermark-free viral videos ready for Instagram Reels, YouTube Shorts and Facebook content.",
    price: 299,
    image: "/images/mad-scientist/thumbnail.webp",
    google_drive_file_id: "1-2hJ3k4l5m6n7o8p9q0r_mad_scientist_bundle",
    active: true,
  },
  {
    name: "10,000+ Premium ChatGPT Prompts Bundle",
    slug: "chatgpt-prompts",
    description: "Unlock the full power of ChatGPT with 10k+ copy-paste prompts for marketing, writing, coding and business.",
    price: 199,
    image: "/images/chatgpt-prompts/thumbnail.webp",
    google_drive_file_id: "2-3hJ4k5l6m7n8o9p0q1r_chatgpt_prompts_bundle",
    active: true,
  },
  {
    name: "Cinematic LUTs Pack for Creators",
    slug: "luts-pack",
    description: "50+ cinematic color grading LUTs for Premiere Pro, DaVinci Resolve, Final Cut, and CapCut.",
    price: 399,
    image: "/images/luts-pack/thumbnail.webp",
    google_drive_file_id: "3-4hJ5k6l7m8n9o0p1q2r_luts_pack_bundle",
    active: true,
  },
  {
    name: "1 Rupee Test Demo Product",
    slug: "demo-product",
    description: "A demo product priced at 1 Rupee to test the Razorpay payment integration and instant download flow.",
    price: 1,
    image: "/images/demo-product/thumbnail.webp",
    google_drive_file_id: "4-5hJ6k7l8m9n0o1p2q3r_demo_product_bundle",
    active: true,
  },
];

async function seed() {
  try {
    console.log("Connecting to Neon Database and creating tables...");

    // Create Products Table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image VARCHAR(255) NOT NULL,
        google_drive_file_id VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log("✓ products table ready");

    // Create Customers Table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log("✓ customers table ready");

    // Create Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
        razorpay_order_id VARCHAR(255) NOT NULL,
        razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        status VARCHAR(50) DEFAULT 'captured' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log("✓ orders table ready");

    // Create Downloads Table
    await sql`
      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        download_count INTEGER DEFAULT 0 NOT NULL,
        max_downloads INTEGER DEFAULT 10 NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log("✓ downloads table ready");

    // Create Webhook Events Table
    await sql`
      CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) UNIQUE NOT NULL,
        event_type VARCHAR(255) NOT NULL,
        processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log("✓ razorpay_webhook_events table ready");

    // Create Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_downloads_token_hash ON downloads(token_hash);`;
    console.log("✓ database indexes ready");

    console.log("Seeding products...");
    for (const p of PRODUCTS_SEED) {
      await sql`
        INSERT INTO products (name, slug, description, price, image, google_drive_file_id, active)
        VALUES (${p.name}, ${p.slug}, ${p.description}, ${p.price}, ${p.image}, ${p.google_drive_file_id}, ${p.active})
        ON CONFLICT (slug) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          image = EXCLUDED.image,
          google_drive_file_id = EXCLUDED.google_drive_file_id,
          active = EXCLUDED.active,
          updated_at = CURRENT_TIMESTAMP;
      `;
      console.log(`  - seeded/updated product: ${p.slug}`);
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
