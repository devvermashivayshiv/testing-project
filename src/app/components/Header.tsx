"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import "../../cssdesign/header.css";

export default function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [protectedOpen, setProtectedOpen] = useState(false);

  const handleMenuToggle = () => setMenuOpen((open) => !open);
  const handleNavClick = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header__logo">AdSense Automation</div>
      <button className="header__menu-btn" onClick={handleMenuToggle} aria-label="Toggle menu">
        {menuOpen ? "✕" : "☰"}
      </button>
      <nav className={`header__nav${menuOpen ? " open" : ""}`}>
        <Link href="/" onClick={handleNavClick}>Home</Link>
        <Link href="/contact-us" onClick={handleNavClick}>Contact</Link>
        {/* Legal Dropdown */}
        <div className="header-dropdown" onMouseEnter={() => setLegalOpen(true)} onMouseLeave={() => setLegalOpen(false)}>
          <button className="header-dropdown-btn">Legal <span style={{fontSize: '0.8em', marginLeft: 4}}>▼</span></button>
          {legalOpen && (
            <div className="header-dropdown-content">
              <Link href="/privacy" onClick={handleNavClick}>Privacy</Link>
              <Link href="/refund" onClick={handleNavClick}>Refund</Link>
              <Link href="/terms-condition" onClick={handleNavClick}>Terms</Link>
            </div>
          )}
        </div>
        {/* Tools Dropdown */}
        <div className="header-dropdown" onMouseEnter={() => setProtectedOpen(true)} onMouseLeave={() => setProtectedOpen(false)}>
          <button className="header-dropdown-btn">Tools <span style={{fontSize: '0.8em', marginLeft: 4}}>▼</span></button>
          {protectedOpen && (
            <div className="header-dropdown-content">
              <Link href="/protected/tool" onClick={handleNavClick}>Protected Tool</Link>
              <Link href="/protected/admin-panel" onClick={handleNavClick}>Admin Panel</Link>
              <Link href="/protected/dashboard" onClick={handleNavClick}>Dashboard</Link>
              <Link href="/protected/onboarding" onClick={handleNavClick}>Onboarding</Link>
            </div>
          )}
        </div>
        {session ? (
          <button onClick={() => { signOut(); handleNavClick(); }} className="header-btn">Logout</button>
        ) : (
          <Link href="/login" onClick={handleNavClick} className="header-btn">Login</Link>
        )}
      </nav>
    </header>
  );
} 