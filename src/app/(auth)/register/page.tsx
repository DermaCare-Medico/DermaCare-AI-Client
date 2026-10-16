"use client";

import Footer from "@/components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import {
  RegistrationRole,
  RegisterRequest,
  useRegisterMutation,
} from "@/redux/api/authApi";
import { isDemoAuthEnabled, persistDemoRegistration } from "@/src/utils/demoAuth";
import { ArrowRight, Eye, EyeOff, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import styles from "../auth.module.css";

interface RegistrationValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RegistrationRole;
  termsAccepted: boolean;
  privacyConsent: boolean;
  marketingUpdates: boolean;
}

type RegistrationField = keyof RegistrationValues;
type FieldErrors = Partial<Record<RegistrationField, string>>;

const initialValues: RegistrationValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "PATIENT",
  termsAccepted: false,
  privacyConsent: false,
  marketingUpdates: false,
};

function validate(values: RegistrationValues): FieldErrors {
  const errors: FieldErrors = {};
  const email = values.email.trim();

  if (!values.name.trim()) errors.name = "Please enter your full name.";
  else if (values.name.trim().length > 120) errors.name = "Name must be 120 characters or fewer.";

  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!values.password) errors.password = "Please enter a password.";
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/.test(values.password)) {
    errors.password = "Use 8–128 characters with an uppercase letter, a lowercase letter, and a number.";
  }

  if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";

  if (!values.termsAccepted) errors.termsAccepted = "You must accept the Terms of Service and Privacy Policy.";
  if (!values.privacyConsent) errors.privacyConsent = "Please confirm you understand how your information is processed.";

  return errors;
}

function apiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
      return data.message.replace(/\b\d{6}\b/g, "[code hidden]");
    }
  }
  return "We couldn’t create your account right now. Please try again.";
}

export default function RegisterPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<RegistrationField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestError, setRequestError] = useState("");
  const submissionInFlight = useRef(false);
  const [register, { isLoading }] = useRegisterMutation();
  const demoMode = isDemoAuthEnabled();

  function updateValue<K extends RegistrationField>(field: K, value: RegistrationValues[K]) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors(validate(nextValues));
    setRequestError("");
  }

  function fieldError(field: RegistrationField) {
    return submitted || touched[field] ? errors[field] : undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    submissionInFlight.current = true;
    setRequestError("");

    const payload: RegisterRequest = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role: values.role,
      termsAccepted: true,
      privacyConsent: true,
      marketingUpdates: values.marketingUpdates,
      consentAcceptedAt: new Date().toISOString(),
    };

    try {
      if (demoMode) {
        persistDemoRegistration(payload.email, payload.name, "PATIENT");
        window.location.assign(`/verify-email?email=${encodeURIComponent(payload.email)}&demo=1`);
        return;
      }

      await register(payload).unwrap();
      window.location.assign(`/verify-email?email=${encodeURIComponent(payload.email)}`);
    } catch (error: unknown) {
      setRequestError(apiErrorMessage(error));
      submissionInFlight.current = false;
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.layout}>
            <section className={styles.formCard} aria-labelledby="register-heading">
              <div className={styles.cardHeading}>
                <h1 className={styles.heading} id="register-heading">Create your account</h1>
                <p className={styles.subheading}>A more thoughtful way to care for your skin starts here.</p>
                {demoMode && (
                  <p className={`${styles.notice} ${styles.noticeError}`} role="status">
                    DEMO MODE: Frontend-only test flow. No backend registration or real email is used. After verification, sign in with the demo account shown on the login screen.
                  </p>
                )}
              </div>

              <form noValidate onSubmit={handleSubmit}>
                <div className={styles.fields}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label} htmlFor="full-name">Full name</label>
                    <input
                      autoComplete="name"
                      className={styles.input}
                      id="full-name"
                      maxLength={120}
                      aria-invalid={Boolean(fieldError("name"))}
                      aria-describedby={fieldError("name") ? "name-error" : undefined}
                      onBlur={() => setTouched((state) => ({ ...state, name: true }))}
                      onChange={(event) => updateValue("name", event.target.value)}
                      placeholder="Your full name"
                      required
                      value={values.name}
                    />
                    {fieldError("name") && <p className={styles.error} id="name-error">{fieldError("name")}</p>}
                  </div>

                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label} htmlFor="email">Email address</label>
                    <input
                      autoComplete="email"
                      className={styles.input}
                      id="email"
                      type="email"
                      aria-invalid={Boolean(fieldError("email"))}
                      aria-describedby={fieldError("email") ? "email-error" : undefined}
                      onBlur={() => setTouched((state) => ({ ...state, email: true }))}
                      onChange={(event) => updateValue("email", event.target.value)}
                      placeholder="you@example.com"
                      required
                      value={values.email}
                    />
                    {fieldError("email") && <p className={styles.error} id="email-error">{fieldError("email")}</p>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">Password</label>
                    <div className={styles.passwordWrap}>
                      <input
                        autoComplete="new-password"
                        className={`${styles.input} ${styles.passwordInput}`}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        aria-invalid={Boolean(fieldError("password"))}
                        aria-describedby={fieldError("password") ? "password-error" : "password-hint"}
                        onBlur={() => setTouched((state) => ({ ...state, password: true }))}
                        onChange={(event) => updateValue("password", event.target.value)}
                        placeholder="Create a password"
                        required
                        value={values.password}
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
                    {fieldError("password")
                      ? <p className={styles.error} id="password-error">{fieldError("password")}</p>
                      : <p className={styles.hint} id="password-hint">8+ characters, upper/lowercase and a number.</p>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="confirm-password">Confirm password</label>
                    <div className={styles.passwordWrap}>
                      <input
                        autoComplete="new-password"
                        className={`${styles.input} ${styles.passwordInput}`}
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        aria-invalid={Boolean(fieldError("confirmPassword"))}
                        aria-describedby={fieldError("confirmPassword") ? "confirm-password-error" : undefined}
                        onBlur={() => setTouched((state) => ({ ...state, confirmPassword: true }))}
                        onChange={(event) => updateValue("confirmPassword", event.target.value)}
                        placeholder="Re-enter password"
                        required
                        value={values.confirmPassword}
                      />
                      <button
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className={styles.showPassword}
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        type="button"
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {fieldError("confirmPassword") && <p className={styles.error} id="confirm-password-error">{fieldError("confirmPassword")}</p>}
                  </div>

                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label} htmlFor="role">I’m joining as a</label>
                    <select
                      className={styles.select}
                      disabled={demoMode}
                      id="role"
                      onChange={(event) => updateValue("role", event.target.value as RegistrationRole)}
                      value={values.role}
                    >
                      <option value="PATIENT">Patient</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="PHARMACY">Pharmacy</option>
                    </select>
                    <p className={styles.hint}>
                      {demoMode
                        ? "Demo registration supports patient accounts only."
                        : "Doctor and pharmacy accounts remain pending until approved by an administrator."}
                    </p>
                  </div>
                </div>

                <div className={styles.consents}>
                  <label className={styles.checkboxRow} htmlFor="terms">
                    <input
                      checked={values.termsAccepted}
                      className={styles.checkbox}
                      id="terms"
                      onChange={(event) => updateValue("termsAccepted", event.target.checked)}
                      type="checkbox"
                      required
                    />
                    <span>
                      I agree to the <Link href="/#legal-links">Terms of Service</Link> and <Link href="/#legal-links">Privacy Policy</Link>.
                      {fieldError("termsAccepted") && <span className={styles.error} id="terms-error"> {fieldError("termsAccepted")}</span>}
                    </span>
                  </label>

                  <label className={styles.checkboxRow} htmlFor="privacy-consent">
                    <input
                      checked={values.privacyConsent}
                      className={styles.checkbox}
                      id="privacy-consent"
                      onChange={(event) => updateValue("privacyConsent", event.target.checked)}
                      type="checkbox"
                      required
                    />
                    <span>
                      I understand how my personal information is used and processed.
                      {fieldError("privacyConsent") && <span className={styles.error} id="privacy-error"> {fieldError("privacyConsent")}</span>}
                    </span>
                  </label>

                  <label className={styles.checkboxRow} htmlFor="marketing">
                    <input
                      checked={values.marketingUpdates}
                      className={styles.checkbox}
                      id="marketing"
                      onChange={(event) => updateValue("marketingUpdates", event.target.checked)}
                      type="checkbox"
                    />
                    <span>Send me occasional product and skin-health updates. (Optional)</span>
                  </label>
                </div>

                {requestError && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{requestError}</p>}

                <button className={styles.submitButton} disabled={isLoading} type="submit">
                  {isLoading ? "Creating your account…" : demoMode ? "Create demo account" : "Create account"}
                  {!isLoading && <ArrowRight size={18} aria-hidden="true" />}
                </button>

                <p className={styles.formFooter}>
                  Already have an account? <Link className={styles.textLink} href="/login">Log in</Link>
                </p>
              </form>
            </section>

            <aside className={styles.visualPanel} aria-label="About DermaCare AI">
              <div className={styles.panelContent}>
                <p className={styles.eyebrow}><HeartPulse size={15} /> Care that starts with you</p>
                <h2 className={styles.panelTitle}>Feel more confident about your skin health.</h2>
                <p className={styles.panelDescription}>
                  Get a thoughtful first step toward care, with helpful screening tools and access to qualified professionals.
                </p>
                <ul className={styles.benefits}>
                  <li className={styles.benefit}><span className={styles.benefitIcon}><Sparkles size={16} /></span>Guided, AI-assisted skin screening</li>
                  <li className={styles.benefit}><span className={styles.benefitIcon}><HeartPulse size={16} /></span>Connect with qualified care teams</li>
                  <li className={styles.benefit}><span className={styles.benefitIcon}><ShieldCheck size={16} /></span>Your account and consent matter</li>
                </ul>
              </div>
              <div className={styles.panelBottom}>
                <p className={styles.panelNote}>AI screening is preliminary and does not replace a diagnosis or advice from a qualified medical professional.</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
