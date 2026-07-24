"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({ product }) {
  const gallery = product.media.gallery;

  const [selected, setSelected] = useState({
    type: "image",
    src: product.media.thumbnail,
  });

  return (
    <section className={styles.gallery}>
      <div className={styles.preview}>
        {selected.type === "image" ? (
          <Image
            src={selected.src}
            alt={product.title}
            fill
            priority
            className={styles.image}
          />
        ) : (
          <video
            controls
            className={styles.video}
          >
            <source src={selected.src} />
          </video>
        )}
      </div>

      <div className={styles.thumbnails}>
        <button
          className={`${styles.thumb} ${selected.src === product.media.thumbnail ? styles.activeThumb : ""}`}
          onClick={() =>
            setSelected({
              type: "image",
              src: product.media.thumbnail,
            })
          }
        >
          <Image
            src={product.media.thumbnail}
            alt={product.title}
            width={80}
            height={80}
            className={styles.thumbImage}
          />
        </button>

        {gallery.map((item, index) => (
          <button
            key={index}
            className={`${styles.thumb} ${selected.src === item.src ? styles.activeThumb : ""}`}
            onClick={() => setSelected(item)}
          >
            {item.type === "image" ? (
              <Image
                src={item.src}
                alt=""
                width={80}
                height={80}
                className={styles.thumbImage}
              />
            ) : (
              <span className={styles.videoThumb}>🎥 Preview</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}