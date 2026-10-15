"use client";

import Footer from "@/components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import { setUser } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { useLoginMutation } from "@/redux/api/authApi";
import {
  DEMO_ACCOUNT,
  createDemoToken,
  isDemoAuthEnabled,
  type DemoUser,
} from "@/src/utils/demoAuth";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const demoMode = isDemoAuthEnabled();
  const [email, setEmail] = useState(
    searchParams.get("email") ?? (demoMode ? DEMO_ACCOUNT.email : "")
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const redirectTarget = searchParams.get("redirect") || "/patient/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both your email and password.");
      return;
    }

    if (demoMode) {
      if (
        trimmedEmail !== DEMO_ACCOUNT.email.toLowerCase() ||
        trimmedPassword !== DEMO_ACCOUNT.password
      ) {
        setError(
          "Demo mode is enabled. Use demo.patient@dermacare.local and the password DemoPass123."
        );
        return;
      }

      const demoUser: DemoUser = {
        id: "demo-patient-1",
        name: DEMO_ACCOUNT.name,
        email: DEMO_ACCOUNT.email,
        role: "PATIENT",
      };

      dispatch(
        setUser({
          token: createDemoToken(demoUser),
          user: demoUser,
        })
      );

      router.push(
        redirectTarget.startsWith("/patient") ? redirectTarget : "/patient/dashboard"
      );
      return;
    }

    try {
      const response = await login({
        email: trimmedEmail,
        password: trimmedPassword,
      }).unwrap();

      const token = response?.token || response?.accessToken || response?.data?.token;
      const user = response?.user || response?.data?.user || {
        email: trimmedEmail,
        name: trimmedEmail.split("@")[0],
        role: "PATIENT",
      };

      if (!token) {
        setError("The server did not return an auth token. Please try again.");
        return;
      }

      dispatch(
        setUser({
          token,
          user,
        })
      );

      router.push(
        redirectTarget.startsWith("/patient") ? redirectTarget : "/patient/dashboard"
      );
    } catch (error: unknown) {
      setError(
        typeof error === "object" && error && "data" in error &&
          typeof (error as { data?: { message?: string } }).data?.message === "string"
          ? (error as { data: { message: string } }).data.message
          : "We couldn’t sign you in right now. Please try again."
      );
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <section className={styles.formCard} aria-labelledby="login-heading">
              <div className={styles.cardHeading}>
                <h1 className={styles.heading} id="login-heading">Welcome back</h1>
                <p className={styles.subheading}>Sign in to continue your skin care journey.</p>
                {demoMode && (
                  <p className={`${styles.notice} ${styles.noticeError}`} role="status">
                    DEMO MODE: Use demo.patient@dermacare.local / DemoPass123. This is not a real authentication backend.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className={styles.fields}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label} htmlFor="login-email">Email address</label>
                    <input
                      autoComplete="email"
                      className={styles.input}
                      id="login-email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>

                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label} htmlFor="login-password">Password</label>
                    <div className={styles.passwordWrap}>
                      <input
                        autoComplete="current-password"
                        className={`${styles.input} ${styles.passwordInput}`}
                        id="login-password"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Your password"
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                      />
                      <button
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className={styles.showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                        type="button"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{error}</p>}

                <button className={styles.submitButton} disabled={isLoading} type="submit">
                  {isLoading ? "Signing in…" : "Log in"}
                  {!isLoading && <ArrowRight size={18} aria-hidden="true" />}
                </button>

                <p className={styles.formFooter}>
                  Need an account? <Link className={styles.textLink} href="/register">Create one</Link>
                </p>
              </form>
            </section>

            <aside className={styles.visualPanel} aria-label="Patient care overview">
              <div className={styles.panelContent}>
                <p className={styles.eyebrow}><ShieldCheck size={15} /> Your care, in one place</p>
                <h2 className={styles.panelTitle}>Stay on top of your skin health.</h2>
                <p className={styles.panelDescription}>
                  Review your screening history, book care when needed, and keep your skin-health updates organized.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
