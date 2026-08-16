"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./CheckoutModal.module.css";

export default function CheckoutModal({ isOpen, onClose, onSubmit, totalAmount }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [errors, setErrors] = useState({});
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (sameAsPhone) {
      setWhatsapp(phone);
    }
  }, [phone, sameAsPhone]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address.";
    
    const cleanPhone = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleanWhatsapp)) {
      newErrors.whatsapp = "Please enter a valid 10-digit WhatsApp number.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      contact: cleanPhone,
      whatsapp: cleanWhatsapp,
    });
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    if (checked) {
      setWhatsapp(phone);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close Checkout">
          ✕
        </button>
        <div className={styles.header}>
          <h2>Checkout Information</h2>
          <p>Please enter your contact details to proceed with the secure payment.</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="checkout-name">Full Name</label>
            <input
              ref={nameInputRef}
              id="checkout-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={errors.name ? styles.inputError : ""}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="checkout-email">Email Address</label>
            <input
              id="checkout-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className={errors.email ? styles.inputError : ""}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="checkout-phone">Phone Number (UPI Linked)</label>
            <input
              id="checkout-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className={errors.phone ? styles.inputError : ""}
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.checkboxGroup}>
            <input
              id="checkout-same-whatsapp"
              type="checkbox"
              checked={sameAsPhone}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="checkout-same-whatsapp">WhatsApp number is the same as Phone number</label>
          </div>

          {!sameAsPhone && (
            <div className={styles.inputGroup}>
              <label htmlFor="checkout-whatsapp">WhatsApp Number</label>
              <input
                id="checkout-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 9876543210"
                className={errors.whatsapp ? styles.inputError : ""}
              />
              {errors.whatsapp && <span className={styles.errorText}>{errors.whatsapp}</span>}
            </div>
          )}

          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span>Total Amount:</span>
              <span className={styles.amount}>₹{totalAmount}</span>
            </div>
            <button type="submit" className={styles.submitBtn}>
              Proceed to Pay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
