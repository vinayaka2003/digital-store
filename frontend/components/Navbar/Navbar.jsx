"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import { useState, useEffect, useRef } from "react";

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`${styles.navLink} ${isActive ? styles.active : ""}`}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const navRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const count = parseInt(localStorage.getItem("cart_count") || "0");
      setTimeout(() => {
        setIsMounted(true);
        setCartCount(count);
      }, 0);

      const handleCartUpdate = () => {
        setCartCount(parseInt(localStorage.getItem("cart_count") || "0"));
      };

      const handleResize = () => {
        if (window.innerWidth > 768) setOpen(false);
      };

      const handleStorage = (e) => {
        if (e.key === "cart_count") {
          setCartCount(parseInt(e.newValue || "0"));
        }
      };

      const handleOutsideClick = (event) => {
        if (
          navRef.current &&
          buttonRef.current &&
          !navRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      window.addEventListener("cart-update", handleCartUpdate);
      window.addEventListener("resize", handleResize);
      window.addEventListener("storage", handleStorage);
      window.addEventListener("mousedown", handleOutsideClick);
      window.addEventListener("keydown", handleEscape);

      return () => {
        window.removeEventListener("cart-update", handleCartUpdate);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener("mousedown", handleOutsideClick);
        window.removeEventListener("keydown", handleEscape);
      };
    }
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          WaveLabs
        </Link>

        <div className={styles.rightActions}>
          <Link 
            href="/cart"
            className={styles.cartIconWrapper} 
            title="Cart"
          >
            <svg 
              className={styles.cartIcon} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
            {isMounted && cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          <button
            ref={buttonRef}
            className={styles.burger}
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className={styles.burgerBox}>
              <span className={`${styles.burgerInner} ${open ? styles.open : ""}`} />
            </span>
          </button>
        </div>

        <nav 
          ref={navRef}
          className={`${styles.nav} ${open ? styles.open : ""}`}
          onClick={() => setOpen(false)}
        >
          <NavLink href="/">Home</NavLink>

          <NavLink href="/products">Products</NavLink>

          <NavLink href="/contact">Contact</NavLink>
        </nav>
      </div>
    </header>
  );
}