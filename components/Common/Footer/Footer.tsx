import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.columns}>
          <div className={styles.brandColumn}>
            <Link className={styles.brand} href="/">
              <span className={styles.brandMark} aria-hidden="true"><Plus size={22} strokeWidth={3} /></span>
              <span>DermaCare <strong>AI</strong></span>
            </Link>
            <p>AI-assisted skin screening and teleconsultation. Preliminary screening, doctor-led care.</p>
          </div>
          <nav className={styles.column} id="product-links" aria-label="Product links">
            <h2>Product</h2>
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/doctors">Doctors</Link>
            <Link href="/store">Store</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
          <nav className={styles.column} id="company-links" aria-label="Company links">
            <h2>Company</h2>
            <Link href="/about-us">About Us</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav className={styles.column} id="legal-links" aria-label="Legal links">
            <h2>Legal</h2>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/disclaimer">Medical Disclaimer</Link>
          </nav>
        </div>
        <div className={styles.legal}>
          <p id="medical-disclaimer" className={styles.medicalDisclaimer}>
            Preliminary AI screening is not a diagnosis and does not replace a qualified medical professional.
          </p>
          <p className={styles.copyright}>
            © 2026 DermaCare AI. Educational prototype with simulated orders and payments. No real medicine is sold and no real money is charged.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
