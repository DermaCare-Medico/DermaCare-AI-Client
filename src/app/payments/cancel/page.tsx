import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "../payment-page.module.css";

export default function PaymentCancelPage() {
  return <main className={styles.page}><section className={styles.card}><div className={styles.accent} /><div className={styles.content}>
    <div className={`${styles.icon} ${styles.errorIcon}`}><X size={34} /></div>
    <h1 className={styles.title}>Checkout cancelled</h1>
    <p className={styles.description}>You left Stripe checkout before completing payment. No success is assumed, and your appointment payment status remains unchanged.</p>
    <div className={styles.actions}><Button asChild><Link href="/patient/appointments"><ArrowLeft /> Return to appointments</Link></Button><Button asChild variant="outline"><Link href="/patient/dashboard">Patient dashboard</Link></Button></div>
    <p className={styles.note}>You can reopen the appointment and try payment again whenever you’re ready.</p>
  </div></section></main>;
}
