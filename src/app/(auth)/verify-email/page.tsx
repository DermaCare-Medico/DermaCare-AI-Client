"use client";

import Footer from "@/components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import { useLoginMutation, useResendOtpMutation, useVerifyOtpMutation } from "@/redux/api/authApi";
import {
  DEMO_ACCOUNT,
  DEMO_OTP,
  clearDemoRegistration,
  isDemoAuthEnabled,
  readDemoRegistration,
} from "@/src/utils/demoAuth";
import { ArrowLeft, CheckCircle2, Clock3, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import styles from "../auth.module.css";
import { useAppDispatch } from "@/redux/hooks";
import { setSession } from "@/redux/features/authSlice";
import { dashboardForRole, sessionFromResponse } from "@/src/utils/auth";
import { getDoctorOnboarding } from "@/src/utils/doctorOnboarding";
import { useRouter } from "next/navigation";

const OTP_LENGTH = 6;
const RESEND_DELAY_SECONDS = 60;

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;
  const visiblePrefix = localPart.slice(0, 1);
  return `${visiblePrefix}${"•".repeat(Math.max(3, Math.min(localPart.length - 1, 7)))}@${domain}`;
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
      return data.message.replace(/\b\d{6}\b/g, "[code hidden]");
    }
  }
  return fallback;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const demoMode = isDemoAuthEnabled();
  const [email, setEmail] = useState("");
  const [registrationRole, setRegistrationRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [digits, setDigits] = useState(Array<string>(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_DELAY_SECONDS);
  const [requestError, setRequestError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submissionInFlight = useRef(false);
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedEmail = params.get("email")?.trim().toLowerCase() ?? "";
    setRegistrationRole(params.get("role") === "DOCTOR" ? "DOCTOR" : "PATIENT");
    const demoRegistration = readDemoRegistration();
    const resolvedEmail = requestedEmail || demoRegistration?.email || DEMO_ACCOUNT.email;

    if (demoMode) {
      setEmail(resolvedEmail);
      setRequestError("");
      return;
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
      setEmail(resolvedEmail);
      return;
    }

    setRequestError("We couldn’t find a valid email address to verify. Please return to registration.");
  }, [demoMode]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join("");
  const canVerify = Boolean(email) && code.length === OTP_LENGTH && !successMessage;
  const isCompletingVerification = isVerifying || isLoggingIn;

  function setDigitAt(index: number, value: string) {
    const numeric = value.replace(/\D/g, "");
    const nextDigits = [...digits];
    if (numeric.length > 1) {
      for (let offset = 0; offset < numeric.length && index + offset < OTP_LENGTH; offset += 1) {
        nextDigits[index + offset] = numeric[offset];
      }
      setDigits(nextDigits);
      setInputError("");
      inputRefs.current[Math.min(index + numeric.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    nextDigits[index] = numeric;
    setDigits(nextDigits);
    setInputError("");
    if (numeric && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigitAt(index, pasted);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleVerify();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      const nextDigits = [...digits];
      if (nextDigits[index]) {
        nextDigits[index] = "";
        setDigits(nextDigits);
      } else if (index > 0) {
        nextDigits[index - 1] = "";
        setDigits(nextDigits);
        inputRefs.current[index - 1]?.focus();
      }
      setInputError("");
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  async function handleVerify() {
    if (!email || submissionInFlight.current || isCompletingVerification) return;

    if (demoMode) {
      if (code !== DEMO_OTP) {
        setInputError(`Demo code mismatch. Use ${DEMO_OTP} to continue.`);
        inputRefs.current[0]?.focus();
        return;
      }

      clearDemoRegistration();
      setSuccessMessage("Demo email verification complete. You can now log in.");
      setRequestError("");
      setResendMessage("");
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      window.setTimeout(() => {
        window.location.assign("/login?demo=1");
      }, 500);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setInputError("Enter all 6 digits from the email.");
      inputRefs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }

    submissionInFlight.current = true;
    setRequestError("");
    setResendMessage("");
    setInputError("");
    try {
      const response = await verifyEmail({ email, otp: code }).unwrap();
      let session = sessionFromResponse(response);
      const onboarding = registrationRole === "DOCTOR" ? getDoctorOnboarding() : null;
      if (!session && onboarding?.email === email && onboarding.password) {
        session = sessionFromResponse(
          await login({ email, password: onboarding.password }).unwrap(),
        );
      }
      if (session) {
        dispatch(setSession({
          ...session,
          user: registrationRole === "DOCTOR"
            ? { ...(session.user ?? {}), isDoctorApplicant: true }
            : session.user,
        }));
      }
      if (registrationRole === "DOCTOR" && !session) {
        setSuccessMessage("Your email was verified. Please sign in to resume your doctor application.");
        setDigits(Array<string>(OTP_LENGTH).fill(""));
        window.setTimeout(() => {
          router.push("/login?redirect=%2Fdoctor%2Fapplication");
        }, 500);
        return;
      }
      setSuccessMessage("Your email has been verified.");
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      window.setTimeout(() => {
        router.push(
          registrationRole === "DOCTOR" && session
            ? "/doctor/application"
            : session
              ? dashboardForRole(session.user?.role)
              : "/login",
        );
      }, 500);
    } catch (error: unknown) {
      setRequestError(apiErrorMessage(error, "We couldn’t verify that code. Please try again."));
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      submissionInFlight.current = false;
    }
  }

  async function handleResend() {
    if (!email || isResending || successMessage) return;

    if (demoMode) {
      setRequestError("");
      setResendMessage(`DEMO MODE: Use the fixed OTP ${DEMO_OTP}. No real email is sent in this frontend-only flow.`);
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      return;
    }

    if (secondsLeft > 0) return;
    setRequestError("");
    setResendMessage("");
    try {
      await resendOtp({ email }).unwrap();
      setDigits(Array<string>(OTP_LENGTH).fill(""));
      setSecondsLeft(RESEND_DELAY_SECONDS);
      setRequestError("");
      setResendMessage("A new verification code has been sent. It expires in 5 minutes.");
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      setRequestError(apiErrorMessage(error, "We couldn’t send another code. Please try again later."));
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={`${styles.container} ${styles.layout} ${styles.verifyLayout}`}>
          <section className={`${styles.formCard} ${styles.verifyCard}`} aria-labelledby="verify-heading">
            <div className={styles.mailIcon} aria-hidden="true"><MailCheck size={25} /></div>
            <h1 className={styles.heading} id="verify-heading">Verify your email</h1>
            <p className={styles.subheading}>
              {demoMode
                ? "Demo-only verification for local UI testing. No real email is sent."
                : "One quick step to keep your DermaCare AI account secure."}
            </p>

            {demoMode && (
              <p className={`${styles.notice} ${styles.noticeError}`} role="status">
                DEMO MODE: Enter the fixed OTP {DEMO_OTP} to continue. The code is shown here for local testing only.
              </p>
            )}

            {email ? (
              <div className={styles.emailNotice}>
                {demoMode ? "Demo verification is being checked for" : "We sent a 6-digit verification code to"}
                <strong>{maskEmail(email)}</strong>
                <span>
                  {demoMode
                    ? "Use the fixed demo code shown above. This flow does not send a real email."
                    : "The code expires in 5 minutes. Check your spam folder if you don’t see it."}
                </span>
              </div>
            ) : (
              <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
                {requestError || "A valid email address is required to verify your account."}
              </p>
            )}

            {successMessage ? (
              <div className={styles.notice} role="status">
                <CheckCircle2 size={17} aria-hidden="true" /> {successMessage}
                <p className={styles.hint}>Doctor and pharmacy accounts may still require administrator approval.</p>
              </div>
            ) : (
              <>
                {email && (
                  <div>
                    <label className={styles.otpLabel} id="otp-label">Enter your 6-digit code</label>
                    <div className={styles.otpInputs} role="group" aria-labelledby="otp-label" aria-describedby={inputError ? "otp-error" : undefined}>
                      {digits.map((digit, index) => (
                        <input
                          aria-label={`Verification code digit ${index + 1} of ${OTP_LENGTH}`}
                          aria-invalid={Boolean(inputError || requestError)}
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          className={styles.otpInput}
                          key={index}
                          inputMode="numeric"
                          maxLength={OTP_LENGTH}
                          onChange={(event) => setDigitAt(index, event.target.value)}
                          onKeyDown={(event) => handleKeyDown(event, index)}
                          onPaste={(event) => handlePaste(event, index)}
                          ref={(element) => {
                            inputRefs.current[index] = element;
                          }}
                          type="text"
                          value={digit}
                        />
                      ))}
                    </div>
                    {inputError && <p className={styles.error} id="otp-error" role="alert">{inputError}</p>}
                  </div>
                )}

                {requestError && email && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{requestError}</p>}
                {resendMessage && <p className={styles.notice} role="status">{resendMessage}</p>}

                <button
                  className={styles.submitButton}
                  disabled={!canVerify || isCompletingVerification}
                  onClick={handleVerify}
                  type="button"
                >
                  {isCompletingVerification ? "Verifying…" : demoMode ? "Verify demo code" : "Verify email"}
                  {!isCompletingVerification && <ShieldCheck size={18} aria-hidden="true" />}
                </button>

                <div className={styles.resendRow}>
                  <span>Didn’t receive the code?</span>
                  <button className={styles.resendButton} disabled={!email || isResending || secondsLeft > 0} onClick={handleResend} type="button">
                    {isResending ? "Sending…" : demoMode ? "Use demo code instead" : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
                  </button>
                </div>
              </>
            )}

            <p className={styles.formFooter}>
              <Link className={styles.textLink} href="/register"><ArrowLeft size={14} aria-hidden="true" /> Use a different email</Link>
            </p>
          </section>

          <aside className={`${styles.visualPanel} ${styles.verifyAside}`} aria-label="Email verification information">
            <div className={styles.panelContent}>
              <p className={styles.eyebrow}><ShieldCheck size={15} /> A safer start</p>
              <h2 className={styles.panelTitle}>Your privacy is part of your care.</h2>
              <p className={styles.panelDescription}>
                Verifying your email helps protect your account and keeps important care updates in the right hands.
              </p>
              <ul className={styles.benefits}>
                <li className={styles.benefit}><span className={styles.benefitIcon}><Clock3 size={16} /></span>Codes expire after 5 minutes</li>
                <li className={styles.benefit}><span className={styles.benefitIcon}><ShieldCheck size={16} /></span>Each code can be used once</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
