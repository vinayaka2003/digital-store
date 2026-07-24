import styles from "./Testimonials.module.css";

const testimonials = [
  {
    name: "Arjun Sharma",
    handle: "@arjun_creates",
    avatar: "AS",
    avatarColor: "#6366f1",
    rating: 5,
    text: "The Mad Scientist prompt pack is absolutely insane. My Midjourney outputs went from generic to cinematic overnight. Worth every rupee and more.",
    product: "Mad Scientist Bundle",
    verified: true,
  },
  {
    name: "Priya Nair",
    handle: "@priya.social",
    avatar: "PN",
    avatarColor: "#10b981",
    rating: 5,
    text: "I use the ChatGPT prompts daily for my content agency. It cut my writing time in half and the outputs are incredibly professional. Best digital purchase this year.",
    product: "ChatGPT Prompts Pack",
    verified: true,
  },
  {
    name: "Rahul Verma",
    handle: "@rahul.edits",
    avatar: "RV",
    avatarColor: "#f59e0b",
    rating: 5,
    text: "The Cinematic LUTs Pack is fire. I applied the Cyberpunk City LUT to my entire Reels series and the engagement literally doubled. Highly recommend!",
    product: "Cinematic LUTs Pack",
    verified: true,
  },
  {
    name: "Sneha Patel",
    handle: "@snehapatel_art",
    avatar: "SP",
    avatarColor: "#ec4899",
    rating: 5,
    text: "Instant download, no watermark, works perfectly in Premiere Pro. The quality is top-notch. Support was also super quick when I had a question.",
    product: "Cinematic LUTs Pack",
    verified: true,
  },
  {
    name: "Mohammed Faiz",
    handle: "@faiz.ai.studio",
    avatar: "MF",
    avatarColor: "#3b82f6",
    rating: 5,
    text: "As a freelancer, these AI prompts save me hours every week. The variety is amazing - from product descriptions to YouTube scripts. Game-changing value.",
    product: "ChatGPT Prompts Pack",
    verified: true,
  },
  {
    name: "Kavya Reddy",
    handle: "@kavya.lens",
    avatar: "KR",
    avatarColor: "#14b8a6",
    rating: 5,
    text: "The payment was instant and the download link came right away. The files are exactly as described. Clean, professional, and zero hassle. Will buy again!",
    product: "Mad Scientist Bundle",
    verified: true,
  },
  {
    name: "Vikram Singh",
    handle: "@vikram.studio",
    avatar: "VS",
    avatarColor: "#8b5cf6",
    rating: 5,
    text: "I was skeptical at first but these LUTs genuinely transformed my wedding videography. Clients keep asking what my secret is. It's WaveLabs!",
    product: "Cinematic LUTs Pack",
    verified: true,
  },
  {
    name: "Ananya Krishnan",
    handle: "@ananya.writes",
    avatar: "AK",
    avatarColor: "#f43f5e",
    rating: 5,
    text: "These ChatGPT prompts unlocked a whole new level of output quality. I used to struggle with blog intros — now I write 5 articles a day. Incredible.",
    product: "ChatGPT Prompts Pack",
    verified: true,
  },
  {
    name: "Rohan Mehta",
    handle: "@rohan.fx",
    avatar: "RM",
    avatarColor: "#06b6d4",
    rating: 5,
    text: "I've bought prompt packs elsewhere but nothing compares to this. The Mad Scientist bundle has styles I've never seen anywhere else. Pure gold.",
    product: "Mad Scientist Bundle",
    verified: true,
  },
  {
    name: "Divya Joshi",
    handle: "@divyaj.creative",
    avatar: "DJ",
    avatarColor: "#d97706",
    rating: 5,
    text: "Running a YouTube channel about travel, and these LUTs make every video look like a Netflix documentary. My subscriber growth tripled after using them.",
    product: "Cinematic LUTs Pack",
    verified: true,
  },
  {
    name: "Siddharth Rao",
    handle: "@sid.aitools",
    avatar: "SR",
    avatarColor: "#64748b",
    rating: 5,
    text: "The prompts are carefully crafted — not just random fillers. Each one has a clear use case and the results are consistent. Highly valuable for any AI creator.",
    product: "ChatGPT Prompts Pack",
    verified: true,
  },
  {
    name: "Meera Iyer",
    handle: "@meeradesigns",
    avatar: "MI",
    avatarColor: "#0ea5e9",
    rating: 5,
    text: "Super simple checkout, instant delivery to my inbox. The Mad Scientist visuals are exactly what my dark-fantasy book cover project needed. Love it!",
    product: "Mad Scientist Bundle",
    verified: true,
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <span className={styles.badge}>❤️ What Customers Say</span>

        <h2>Trusted by 1000+ Creators</h2>

        <p>
          Real reviews from creators, marketers, and businesses who have leveled up their content with WaveLabs products.
        </p>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.header}>
                <div
                  className={styles.avatar}
                  style={{ background: t.avatarColor }}
                >
                  {t.avatar}
                </div>
                <div className={styles.authorInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{t.name}</span>
                    {t.verified && (
                      <span className={styles.verifiedBadge} title="Verified Purchase">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className={styles.handle}>{t.handle}</span>
                </div>
                <div className={styles.stars}>
                  {"★".repeat(t.rating)}
                </div>
              </div>

              <p className={styles.text}>&ldquo;{t.text}&rdquo;</p>

              <div className={styles.productTag}>
                📦 {t.product}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
