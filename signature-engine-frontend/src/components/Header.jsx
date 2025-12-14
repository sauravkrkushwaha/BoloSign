import React from "react";

/**
 * Header
 *
 * Purpose:
 * - Branding
 * - Context ("Signature Injection Engine")
 * - Fixed, clean, professional
 */
export default function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <span className="logo">✍️</span>
        <span className="title">Signature Injection Engine</span>
      </div>

      <div className="header-right">
        <span className="subtitle">Secure • Responsive • Reliable</span>
      </div>
    </header>
  );
}
