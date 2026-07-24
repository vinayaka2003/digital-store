"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./PreviewGallery.module.css";

const previews = [
  "/images/mad-scientist/gallery-1.webp",
  "/images/mad-scientist/gallery-2.webp",
  "/images/mad-scientist/gallery-3.webp",
  "/images/mad-scientist/gallery-4.webp",
  "/images/mad-scientist/thumbnail.webp",
];

export default function PreviewGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section id="preview" className={styles.section}>
      <div className={styles.container}>
        <span className={styles.badge}>Preview</span>

        <h2>See What&apos;s Inside</h2>

        <p>
          Get a quick look at the premium content included in this bundle.
        </p>

        <div className={styles.grid}>
          {previews.map((image, index) => (
            <div 
              key={index} 
              className={styles.card}
              onClick={() => setSelectedImage(image)}
              title="Click to expand preview"
            >
              <Image
                src={image}
                alt={`Preview ${index + 1}`}
                fill
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
                className={styles.image}
              />
              <div className={styles.hoverOverlay}>
                <span>🔍 Click to Expand</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className={styles.lightbox} 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className={styles.closeBtn} 
            onClick={() => setSelectedImage(null)}
            aria-label="Close preview"
          >
            ✕
          </button>
          
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImageWrapper}>
              <Image
                src={selectedImage}
                alt="Expanded Preview"
                fill
                sizes="(max-width: 1200px) 90vw, 1200px"
                className={styles.lightboxImage}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}