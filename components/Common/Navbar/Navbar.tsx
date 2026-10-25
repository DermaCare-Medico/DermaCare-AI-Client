"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import brandLogo from "@/src/favicon.ico";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const links = [
    { label: "Home", href: "/#home" },
    { label: "Doctors", href: "/doctors" },
    { label: "Store", href: "/store" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About", href: "/about-us" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Disclaimer", href: "/disclaimer" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="DermaCare AI home">
          <span className={styles.brandMark} aria-hidden="true"><Image src={brandLogo} alt="" sizes="38px" priority /></span>
          <span>DermaCare <strong>AI</strong></span>
        </Link>

        <button
          ref={menuToggleRef}
          className={styles.menuToggle}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`}
          id="primary-navigation"
          aria-label="Main navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuOpen) {
              setMenuOpen(false);
              menuToggleRef.current?.focus();
            }
          }}
        >
          <div className={styles.linkList}>
            {links.map((link) => (
              <Link
                className={styles.navLink}
                href={link.href}
                key={link.label}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className={styles.actions}>
            <Link className={styles.loginButton} href="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
            <Link className={styles.registerButton} href="/register" onClick={() => setMenuOpen(false)}>
              Register
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
