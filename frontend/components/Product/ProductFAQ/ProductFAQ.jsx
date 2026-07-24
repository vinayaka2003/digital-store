"use client";

import { useState } from "react";
import styles from "./ProductFAQ.module.css";

export default function ProductFAQ({ product }) {
  const [open, setOpen] = useState(null);

  return (
    <section className={styles.section}>
      <h2>Frequently Asked Questions</h2>

      {product.faq.map((item, index) => (
        <div key={index} className={styles.item}>
          <button
            onClick={() =>
              setOpen(open === index ? null : index)
            }
            className={styles.question}
          >
            {item.question}
          </button>

          {open === index && (
            <p className={styles.answer}>
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}