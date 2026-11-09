"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { baseApi } from "@/redux/api/baseApi";
import { useLazyGetAppointmentPaymentStatusQuery, useLazyGetDoctorPayoutCheckoutStatusQuery } from "@/redux/api/paymentApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "../payment-page.module.css";
const MAX_ATTEMPTS = 10; const POLL_DELAY_MS = 2500;
type ViewState = "checking" | "delayed" | "error" | "invalid" | "paid" | "failed";
function errorMessage(error: unknown) { if (typeof error === "object" && error && "data" in error) { const data = error.data; if (typeof data === "object" && data && "message" in data && typeof data.message === "string") return data.message; } return "We could not verify this payment. Please try again."; }
function validAppointmentId(value: string | null): value is string { return Boolean(value && value.length <= 160 && /^[A-Za-z0-9_-]+$/.test(value)); }
function validUuid(value: string | null): value is string { return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)); }
export default function PaymentSuccessContent() {
  const params = useSearchParams(); const router = useRouter(); const dispatch = useAppDispatch(); const token = useAppSelector((state) => state.auth.token);
  const sessionId = params.get("session_id"); const context = params.get("context"); const appointmentId = params.get("appointmentId"); const doctorPayoutId = params.get("doctorPayoutId");
  const appointmentValid = Boolean(sessionId && sessionId.length <= 500 && context === "appointment" && validAppointmentId(appointmentId));
  const payoutValid = Boolean(sessionId && sessionId.length <= 500 && context === "doctorPayout" && validUuid(doctorPayoutId)); const valid = appointmentValid || payoutValid;
  const [appointmentStatus] = useLazyGetAppointmentPaymentStatusQuery(); const [payoutStatus] = useLazyGetDoctorPayoutCheckoutStatusQuery();
  const [view, setView] = useState<ViewState>(valid ? "checking" : "invalid"); const [message, setMessage] = useState(""); const [countdown, setCountdown] = useState(5); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const run = useRef(0); const redirecting = useRef(false);
  const returnPath = useMemo(() => `/payments/success?${params.toString()}`, [params]);
  const verify = useCallback(async () => { if (!valid || redirecting.current) return; const current = ++run.current; setView("checking"); setMessage(""); for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) { try {
    if (payoutValid && doctorPayoutId && sessionId) { const response = await payoutStatus({ payoutId: doctorPayoutId, sessionId }).unwrap(); if (current !== run.current) return; const status = String(response.data?.status ?? response.data?.paymentStatus ?? "").toUpperCase(); if (status === "PAID") { setView("paid"); return; } if (status === "FAILED") { setView("failed"); return; } }
    else if (appointmentValid && appointmentId) { const response = await appointmentStatus(appointmentId, false).unwrap(); if (current !== run.current) return; if (response.data.isPaid === true && response.data.payment?.status === "PAID") { redirecting.current = true; dispatch(baseApi.util.invalidateTags(["Appointments"])); router.replace(`/patient/appointments/${encodeURIComponent(appointmentId)}`); return; } }
  } catch (error) { if (current !== run.current) return; if (attempt === 1) { setMessage(errorMessage(error)); setView("error"); return; } } if (attempt < MAX_ATTEMPTS) { await new Promise<void>((resolve) => { timer.current = setTimeout(resolve, POLL_DELAY_MS); }); if (current !== run.current) return; } } if (current === run.current) setView("delayed"); }, [appointmentId, appointmentStatus, appointmentValid, dispatch, doctorPayoutId, payoutStatus, payoutValid, router, sessionId, valid]);
  useEffect(() => { if (!valid) return; if (!token) { router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`); return; } timer.current = setTimeout(() => void verify(), 0); return () => { run.current += 1; if (timer.current) clearTimeout(timer.current); }; }, [returnPath, router, token, valid, verify]);
  useEffect(() => { if (view !== "paid" || !payoutValid) return; const interval = setInterval(() => setCountdown((current) => current > 1 ? current - 1 : current), 1000); const redirect = setTimeout(() => router.push("/"), 5000); return () => { clearInterval(interval); clearTimeout(redirect); }; }, [payoutValid, router, view]);
  return <main className={styles.page}><section className={styles.card} aria-live="polite"><div className={styles.accent} /><div className={styles.content}>
    {view === "checking" ? <><div className={`${styles.icon} ${styles.pendingIcon}`}><LoaderCircle className={styles.spinner} size={32} /></div><h1 className={styles.title}>Verifying payment...</h1><p className={styles.description}>Waiting for the authenticated backend to confirm your payment.</p></> : null}
    {view === "paid" ? <><div className={`${styles.icon} ${styles.successIcon}`}><CheckCircle2 size={30} strokeWidth={1.8} /></div><h1 className={styles.title}>TEST PAYOUT Confirmed</h1><p className={styles.description}>The verified Stripe webhook confirmed this doctor payout as PAID.</p><p className={styles.note}>Redirecting to home in {countdown} seconds...</p><div className={styles.actions}><Button variant="outline" onClick={() => router.push("/")}>Go to Home</Button></div></> : null}
    {view === "failed" ? <><div className={`${styles.icon} ${styles.errorIcon}`}><AlertTriangle size={31} /></div><h1 className={styles.title}>TEST PAYOUT failed</h1><p className={styles.description}>The backend reported that this payout payment failed. No frontend status was changed.</p></> : null}
    {view === "delayed" ? <><div className={`${styles.icon} ${styles.pendingIcon}`}><RefreshCw size={30} /></div><h1 className={styles.title}>Awaiting webhook confirmation</h1><p className={styles.description}>The Stripe return was received, but the verified webhook has not marked this payment PAID yet.</p><div className={styles.actions}><Button onClick={() => void verify()}><RefreshCw /> Check again</Button></div></> : null}
    {view === "error" ? <><div className={`${styles.icon} ${styles.errorIcon}`}><AlertTriangle size={31} /></div><h1 className={styles.title}>Unable to verify payment</h1><p className={styles.description}>{message}</p><div className={styles.actions}><Button onClick={() => void verify()}><RefreshCw /> Try again</Button></div></> : null}
    {view === "invalid" ? <><div className={`${styles.icon} ${styles.errorIcon}`}><AlertTriangle size={31} /></div><h1 className={styles.title}>Invalid payment return</h1><p className={styles.description}>The payment return link is missing required information or contains invalid values. No payment status has been changed.</p></> : null}
  </div></section></main>;
}
