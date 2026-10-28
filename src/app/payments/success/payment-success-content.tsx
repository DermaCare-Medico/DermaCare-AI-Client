"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { baseApi } from "@/redux/api/baseApi";
import { useLazyGetAppointmentPaymentStatusQuery } from "@/redux/api/paymentApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import styles from "../payment-page.module.css";

const MAX_ATTEMPTS = 10;
const POLL_DELAY_MS = 2500;
type ViewState = "checking" | "delayed" | "error" | "invalid";

function errorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data && "message" in data && typeof data.message === "string") return data.message;
    if (typeof data === "object" && data && "error" in data && typeof data.error === "object" && data.error && "message" in data.error && typeof data.error.message === "string") return data.error.message;
  }
  return "We could not verify this payment. Please try again.";
}

function validAppointmentId(value: string | null): value is string {
  return Boolean(value && value.length <= 160 && /^[A-Za-z0-9_-]+$/.test(value));
}

export default function PaymentSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const sessionId = params.get("session_id");
  const context = params.get("context");
  const appointmentId = params.get("appointmentId");
  const paramsValid = Boolean(sessionId && sessionId.length <= 500 && context === "appointment" && validAppointmentId(appointmentId));
  const [fetchStatus] = useLazyGetAppointmentPaymentStatusQuery();
  const [view, setView] = useState<ViewState>(paramsValid ? "checking" : "invalid");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runId = useRef(0);
  const redirecting = useRef(false);
  const returnPath = useMemo(() => `/payments/success?${params.toString()}`, [params]);

  const verify = useCallback(async () => {
    if (!paramsValid || !appointmentId || redirecting.current) return;
    const currentRun = ++runId.current;
    setView("checking");
    setMessage("");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const response = await fetchStatus(appointmentId, false).unwrap();
        if (currentRun !== runId.current) return;
        const data = response.data;
        if (data.isPaid === true && data.payment?.status === "PAID") {
          if (redirecting.current) return;
          redirecting.current = true;
          dispatch(baseApi.util.invalidateTags(["Appointments"]));
          router.replace(`/patient/appointments/${encodeURIComponent(appointmentId)}`);
          return;
        }
      } catch (error) {
        if (currentRun !== runId.current) return;
        if (attempt === 1) { setMessage(errorMessage(error)); setView("error"); return; }
      }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise<void>((resolve) => { timer.current = setTimeout(resolve, POLL_DELAY_MS); });
        if (currentRun !== runId.current) return;
      }
    }
    if (currentRun === runId.current) setView("delayed");
  }, [appointmentId, dispatch, fetchStatus, paramsValid, router]);

  useEffect(() => {
    if (!paramsValid) return;
    if (!token) { router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`); return; }
    timer.current = setTimeout(() => void verify(), 0);
    return () => { runId.current += 1; if (timer.current) clearTimeout(timer.current); };
  }, [paramsValid, returnPath, router, token, verify]);

  return <main className={styles.page}><section className={styles.card} aria-live="polite"><div className={styles.accent} /><div className={styles.content}>
    {view === "checking" ? <><div className={`${styles.icon} ${styles.pendingIcon}`}><LoaderCircle className={styles.spinner} size={32} /></div><h1 className={styles.title}>Verifying payment...</h1><p className={styles.description}>Waiting for the authenticated backend to confirm your payment. You’ll be returned to the appointment automatically.</p></> : null}
    {view === "delayed" ? <><div className={`${styles.icon} ${styles.pendingIcon}`}><RefreshCw size={30} /></div><h1 className={styles.title}>Confirmation is taking longer</h1><p className={styles.description}>We have not received a paid status from the backend yet. Your payment is not being marked successful until confirmation arrives.</p><div className={styles.actions}><Button onClick={() => void verify()}><RefreshCw /> Check again</Button></div></> : null}
    {view === "error" ? <><div className={`${styles.icon} ${styles.errorIcon}`}><AlertTriangle size={31} /></div><h1 className={styles.title}>Unable to verify payment</h1><p className={styles.description}>{message}</p><div className={styles.actions}><Button onClick={() => void verify()}><RefreshCw /> Try again</Button></div></> : null}
    {view === "invalid" ? <><div className={`${styles.icon} ${styles.errorIcon}`}><AlertTriangle size={31} /></div><h1 className={styles.title}>Invalid payment return</h1><p className={styles.description}>The payment return link is missing required information or contains invalid values. No payment status has been changed.</p></> : null}
  </div></section></main>;
}
