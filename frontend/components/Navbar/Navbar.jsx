"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";

import styles from "./Navbar.module.css";

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
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>
            Wave<span className={styles.logoTextAccent}>Labs</span>
          </span>
        </Link>

        <div className={styles.rightActions}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Cart */}
          <Link
            href="/cart"
            className={styles.cartIconWrapper}
            title="Shopping Cart"
          >
            <svg
              className={styles.cartIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>

            {isMounted && cartCount > 0 && (
              <span className={styles.cartBadge}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <button
            ref={buttonRef}
            className={styles.burger}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label={open ? "Close Menu" : "Open Menu"}
          >
            <span className={styles.burgerBox}>
              <span
                className={`${styles.burgerInner} ${
                  open ? styles.open : ""
                }`}
              />
            </span>
          </button>
        </div>

        {/* Navigation */}
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