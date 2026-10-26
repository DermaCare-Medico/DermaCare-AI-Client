"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, LogIn, Menu, UserPlus, X } from "lucide-react";
import brandLogo from "@/src/favicon.ico";
import styles from "./Navbar.module.css";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { NavUser } from "@/components/shared/nav-user";

const emptySubscribe = () => () => {};

const Navbar = ({ variant = "default" }: { variant?: "default" | "minimal" }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const token = useAppSelector((state) => state.auth.token);
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isAuthenticated = isHydrated && Boolean(token);

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

  if (variant === "minimal") {
    return (
      <header className={`${styles.header} ${styles.minimalHeader}`}>
        <div className={`${styles.inner} ${styles.minimalInner}`}>
          <Link className={styles.brand} href="/" aria-label="DermaCare AI home">
            <span className={styles.brandMark} aria-hidden="true"><Image src={brandLogo} alt="" sizes="38px" priority /></span>
            <span>DermaCare <strong>AI</strong></span>
          </Link>
          <Link className={styles.backHome} href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Home
          </Link>
        </div>
      </header>
    );
  }

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
            {!isHydrated ? (
              <div
                className={`${styles.authActions} size-10 rounded-full bg-slate-100/70 animate-pulse justify-self-end`}
                aria-hidden="true"
              />
            ) : isAuthenticated ? (
              <div className={styles.authActions}>
                <NavUser
                  variant="navbar"
                  onNavigate={() => setMenuOpen(false)}
                />
              </div>
            ) : (
              <>
                <Button asChild variant="cta" size="sm">
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    Log in{" "}
                    <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                      <LogIn className="size-4" />
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="cta" size="sm">
                  <Link href="/register" onClick={() => setMenuOpen(false)}>
                    Register{" "}
                    <span aria-hidden="true" className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                      <UserPlus className="size-4" />
                    </span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
