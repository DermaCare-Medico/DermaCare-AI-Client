import Link from "next/link";
import { ArrowRight, ImagePlus, ShieldCheck, Sparkles } from "lucide-react";
import styles from "./HeroSection.module.css";

function DermatologistIllustration() {
  return (
    <svg
      className={styles.doctorIllustration}
      viewBox="0 0 510 510"
      role="img"
      aria-label="Friendly dermatologist in a white coat"
    >
      <circle cx="255" cy="255" r="230" fill="#c5e8e1" />
      <circle cx="255" cy="255" r="190" fill="#dff3ef" />
      <path d="M101 430c12-91 73-145 154-145s143 54 154 145" fill="#0f766e" />
      <path d="M162 345c20-26 53-43 93-43s73 17 93 43l-43 34h-99z" fill="#d3ece7" />
      <path d="M171 376c19-20 48-33 84-33s65 13 84 33l34 103H136z" fill="#fff" />
      <path d="m219 346 36 42 36-42-16-21h-40z" fill="#f2b9a5" />
      <path d="m226 368 29 35 29-35-20-12h-18z" fill="#0f766e" />
      <path d="m255 397 19 82h-38z" fill="#0b5c55" />
      <path d="M177 373c-9 17-20 48-24 78l37 28 17-83zM333 373c9 17 20 48 24 78l-37 28-17-83z" fill="#f8fcfb" />
      <path d="M199 181c0-58 26-93 72-93s75 37 75 95v50c0 60-31 96-75 96s-72-39-72-97z" fill="#e9ad91" />
      <path d="M190 203c-24-14-29-54-9-74 1-47 43-76 88-76 55 0 90 35 90 85 0 24-8 43-17 57l-9-41c-29 2-55-11-76-30-11 20-37 36-66 38z" fill="#263d3a" />
      <path d="M216 211c7-5 15-5 22 0M277 211c7-5 15-5 22 0" fill="none" stroke="#263d3a" strokeLinecap="round" strokeWidth="5" />
      <path d="M244 250c7 7 15 7 22 0" fill="none" stroke="#a45e54" strokeLinecap="round" strokeWidth="4" />
      <path d="M193 194c-16-5-22 12-18 28 4 15 13 22 26 20M342 194c16-5 22 12 18 28-4 15-13 22-26 20" fill="#e9ad91" />
      <path d="M290 364c0 27-15 42-35 42s-35-15-35-42" fill="none" stroke="#0f766e" strokeLinecap="round" strokeWidth="5" />
      <circle cx="363" cy="142" r="34" fill="#fff" />
      <path d="M363 126v32M347 142h32" stroke="#0f766e" strokeLinecap="round" strokeWidth="7" />
      <circle cx="129" cy="283" r="22" fill="#99d5cc" />
      <path d="m121 283 6 6 12-13" fill="none" stroke="#0b5c55" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <div className={styles.eyebrow}><Sparkles size={15} /> AI-Powered Skin Health</div>
          <h1>Check your skin early.<br />See the right doctor.</h1>
          <p className={styles.description}>
            Upload a photo, get a preliminary AI screening, book a verified dermatologist and order prescribed medicine in one flow.
          </p>
          <div className={styles.ctas}>
            <Link className={styles.primaryCta} href="/register">
              Start Skin Screening <ArrowRight size={18} />
            </Link>
            <a className={styles.secondaryCta} href="#upload-preview">How It Works</a>
          </div>
          <p className={styles.disclaimer}><ShieldCheck size={16} /> Preliminary screening only. Not a diagnosis.</p>
        </div>

        <div className={styles.visual}>
          <span className={styles.visualDot} aria-hidden="true" />
          <DermatologistIllustration />
          <div className={styles.uploadCard} id="upload-preview">
            <div className={styles.cardHeading}>
              <span className={styles.uploadIcon}><ImagePlus size={20} /></span>
              <div>
                <strong>Upload skin image</strong>
                <span>Preview only</span>
              </div>
            </div>
            <div className={styles.imagePlaceholder} aria-hidden="true">
              <span className={styles.imageSun} />
              <span className={styles.imageHill} />
              <span className={styles.imageHillSecondary} />
            </div>
            <p className={styles.fileHint}>JPG or PNG (max 10 MB)</p>
            <button className={styles.uploadButton} type="button" disabled aria-label="Upload Image, preview only">
              Upload Image
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}