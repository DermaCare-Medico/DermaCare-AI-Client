import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Button, ButtonArrow } from "@/components/ui/button";
import styles from "./HeroSection.module.css";

const cards = [
  { title: "AI Skin Screening", image: "/images/hero-skin-screening.png", alt: "A patient checking the skin on her cheek", href: "/register", position: "center 48%" },
  { title: "Doctor Consultations", image: "/images/hero-doctor-consultation.png", alt: "A dermatologist reviewing a treatment plan with a patient", href: "/doctors", position: "center 48%" },
  { title: "Facial Skin Exams", image: "/images/doctor1.jpg", alt: "A dermatologist performing a facial skin examination", href: "/doctors", position: "center 36%" },
  { title: "Prescription Support", image: "/images/hero-prescription-support.png", alt: "A healthcare professional giving medicine to a patient", href: "/store", position: "center 44%" },
  { title: "Medicine Delivery", image: "/images/doctor.jpg", alt: "A dermatologist supporting a patient during a consultation", href: "/store", position: "45% center" },
] as const;

export default function HeroSection() {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <div className={styles.socialProof} aria-label="Trusted by more than 5,000 patients">
            <div className={styles.avatars} aria-hidden="true">
              <Image alt="" height={28} src="/images/hero-skin-screening.png" width={28} />
              <Image alt="" height={28} src="/images/doctor1.jpg" width={28} />
              <Image alt="" height={28} src="/images/hero-doctor-consultation.png" width={28} />
            </div>
            <span><Star size={13} fill="currentColor" aria-hidden="true" /> Trusted by 5,000+ patients</span>
          </div>
          <h1>Better skin insights.<br />Better care. Better you.</h1>
          <p className={styles.description}>AI-assisted skin screening and trusted doctor consultations, brought together to help you understand your skin and choose the right next step.</p>
          <div className={styles.ctas}>
            <Button asChild variant="cta" size="lg" className={styles.heroCta}><Link href="/register">Start Skin Screening <ButtonArrow /></Link></Button>
            <Button asChild variant="ctaOutline" size="lg" className={styles.heroCta}><Link href="/doctors">Find a Doctor <ButtonArrow /></Link></Button>
          </div>
        </div>

        <div className={styles.cardViewport}>
          <div className={styles.cardRow}>
            {cards.map((card, index) => (
              <article className={`${styles.imageCard} ${styles[`card${index + 1}`]}`} key={card.title}>
                <Link aria-label={`Explore ${card.title}`} className={styles.cardAction} href={card.href}><ArrowUpRight size={16} aria-hidden="true" /></Link>
                <div className={styles.imageWrap}>
                  <Image alt={card.alt} fill priority={index < 2} sizes="(max-width: 639px) 82vw, (max-width: 980px) 46vw, 22vw" src={card.image} style={{ objectPosition: card.position }} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
