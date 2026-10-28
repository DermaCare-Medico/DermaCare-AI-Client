"use client";

import Footer from "@/components/Common/Footer/Footer";
import Navbar from "@/components/Common/Navbar/Navbar";
import {
  type RegistrationRole,
  type RegisterRequest,
  useRegisterMutation,
} from "@/redux/api/authApi";
import { isDemoAuthEnabled, persistDemoRegistration } from "@/src/utils/demoAuth";
import { Eye, EyeOff, FileCheck2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "../auth.module.css";
import { setDoctorOnboarding } from "@/src/utils/doctorOnboarding";
import { useRouter } from "next/navigation";
import { useGetSpecializationsQuery } from "@/redux/api/doctorApi";
import { specializationList } from "@/src/utils/specializations";

type Role = Extract<RegistrationRole, "PATIENT" | "DOCTOR">;
type CoreField =
  | "name"
  | "email"
  | "password"
  | "confirmPassword"
  | "termsAccepted"
  | "privacyConsent"
  | "healthConsent";
type CoreValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyConsent: boolean;
  healthConsent: boolean;
};
type Errors = Partial<Record<CoreField, string>>;
type UploadKey = "license" | "supporting";
type Upload = { name: string; size: string; file: File; previewUrl?: string };

const initialValues: CoreValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
  privacyConsent: false,
  healthConsent: false,
};

const emptyProfile = {
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  allergies: "",
  conditions: "",
  medicines: "",
  licenseNumber: "",
  experience: "",
  fee: "",
  qualifications: "",
  institution: "",
};

function validate(values: CoreValues): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) errors.name = "Please enter your full name.";
  else if (name.length < 2 || name.length > 150)
    errors.name = "Name must be between 2 and 150 characters.";

  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";

  if (!values.password) errors.password = "Please enter a password.";
  else if (
    values.password.length < 8 ||
    values.password.length > 128 ||
    !/[A-Za-z]/.test(values.password) ||
    !/[0-9]/.test(values.password)
  ) {
    errors.password = "Use 8–128 characters with at least one letter and one number.";
  }

  if (!values.confirmPassword)
    errors.confirmPassword = "Please confirm your password.";
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Passwords do not match.";

  if (!values.termsAccepted)
    errors.termsAccepted = "You must accept the Terms of Service.";
  if (!values.privacyConsent)
    errors.privacyConsent = "You must accept the Privacy Policy.";
  if (!values.healthConsent)
    errors.healthConsent = "Health consent is required.";

  return errors;
}

function apiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message.replace(/\b\d{6}\b/g, "[code hidden]");
    }
  }
  return "We couldn’t create your account right now. Please try again.";
}

export default function RegisterPage() {
  const router = useRouter();
  const demoMode = isDemoAuthEnabled();
  const [role, setRole] = useState<Role>("PATIENT");
  const [values, setValues] = useState<CoreValues>(initialValues);
  const [profile, setProfile] = useState(emptyProfile);
  const [specializationIds, setSpecializationIds] = useState<string[]>([]);
  const [uploads, setUploads] = useState<Partial<Record<UploadKey, Upload>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<CoreField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestError, setRequestError] = useState("");
  const submitting = useRef(false);
  const [register, { isLoading }] = useRegisterMutation();
  const { data: specializationResponse, isLoading: specializationsLoading, isError: specializationsError, refetch: refetchSpecializations } = useGetSpecializationsQuery(undefined, { skip: role !== "DOCTOR" });
  const specializations = specializationList(specializationResponse);

  useEffect(() => {
    return () => {
      Object.values(uploads).forEach((file) => {
        if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [uploads]);

  function updateCore<K extends CoreField>(field: K, value: CoreValues[K]) {
    const next = { ...values, [field]: value };
    setValues(next);
    setErrors(validate(next));
    setRequestError("");
  }

  function updateProfile(field: keyof typeof emptyProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function fieldError(field: CoreField) {
    return submitted || touched[field] ? errors[field] : undefined;
  }

  function selectRole(next: Role) {
    if (demoMode && next === "DOCTOR") return;
    setRole(next);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next: Role =
      event.key === "Home"
        ? "PATIENT"
        : event.key === "End"
          ? "DOCTOR"
          : role === "PATIENT"
            ? "DOCTOR"
            : "PATIENT";
    if (demoMode && next === "DOCTOR") return;
    selectRole(next);
    document.getElementById(`register-tab-${next.toLowerCase()}`)?.focus();
  }

  function selectFile(key: UploadKey, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const validType = ["image/jpeg", "image/png"].includes(file.type);
    if (!validType || file.size > 10 * 1024 * 1024) {
      setRequestError("Upload a JPG or PNG image no larger than 10 MB.");
      event.target.value = "";
      return;
    }
    setRequestError("");
    setUploads((current) => ({
      ...current,
      [key]: {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      },
    }));
    event.target.value = "";
  }

  function removeFile(key: UploadKey) {
    setUploads((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || isLoading) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    if (role === "DOCTOR") {
      const experienceYears = Number(profile.experience);
      const consultationFee = Number(profile.fee);
      if (specializationIds.length === 0 || !profile.licenseNumber.trim() || !profile.qualifications.trim()) {
        setRequestError("Complete the required professional information.");
        return;
      }
      if (!profile.experience.trim() || !Number.isInteger(experienceYears) || experienceYears < 0) {
        setRequestError("Enter valid years of experience.");
        return;
      }
      if (!profile.fee.trim() || !Number.isFinite(consultationFee) || consultationFee < 0) {
        setRequestError("Enter a valid consultation fee.");
        return;
      }
      if (!uploads.license) {
        setRequestError("Upload your medical license image.");
        return;
      }
    }

    submitting.current = true;
    setRequestError("");

    // Match the upstream API contract. Profile fields and document previews
    // are intentionally NOT sent until the backend supports those endpoints.
    const payload: RegisterRequest = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role,
      acceptTerms: true,
      acceptPrivacy: true,
      acceptHealthConsent: true,
    };

    try {
      if (demoMode) {
        persistDemoRegistration(payload.email, payload.name, "PATIENT");
        window.location.assign(
          `/verify-email?email=${encodeURIComponent(payload.email)}&role=${role}&demo=1`,
        );
        return;
      }
      await register(payload).unwrap();
      if (role === "DOCTOR") {
        setDoctorOnboarding({
          email: payload.email,
          password: payload.password,
          licenseNumber: profile.licenseNumber.trim(),
          qualifications: profile.qualifications,
          experienceYears: profile.experience,
          consultationFee: profile.fee,
          specializationIds,
          bio: profile.institution.trim(),
          documents: [uploads.license?.file, uploads.supporting?.file].filter(
            (file): file is File => Boolean(file),
          ),
          documentReferences: [],
        });
      }
      router.push(`/verify-email?email=${encodeURIComponent(payload.email)}&role=${role}`);
    } catch (error: unknown) {
      setRequestError(apiErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  }

  return (
    <>
      <Navbar variant="minimal" />
      <main className={`${styles.page} ${styles.registerPage}`}>
        <section className={styles.registerCard} aria-labelledby="register-heading">
          <div className={styles.registerTabs} role="tablist" aria-label="Choose account type">
            <RoleTab roleValue="PATIENT" current={role} disabled={false} onSelect={selectRole} onKeyDown={handleTabKeyDown} />
            <RoleTab roleValue="DOCTOR" current={role} disabled={demoMode} onSelect={selectRole} onKeyDown={handleTabKeyDown} />
          </div>

          <header className={styles.registerHeader}>
            <h1 className={styles.heading} id="register-heading">Create your account</h1>
            <p className={styles.registerDescription}>
              {role === "DOCTOR"
                ? "Create your professional account to begin the doctor verification process."
                : "Create your patient account to access personalized skin-care services."}
            </p>
            {demoMode && (
              <p className={`${styles.notice} ${styles.noticeError}`} role="status">
                Demo mode supports patient accounts only.
              </p>
            )}
          </header>

          <form noValidate onSubmit={handleSubmit}>
            <section className={styles.formSection} aria-labelledby="account-details">
              <h2 id="account-details">Account details</h2>
              <div className={styles.fields}>
                <InputField id="full-name" label="Full name" value={values.name} onChange={(v) => updateCore("name", v)} onBlur={() => setTouched((s) => ({ ...s, name: true }))} error={fieldError("name")} autoComplete="name" required full />
                <InputField id="email" label="Email" type="email" value={values.email} onChange={(v) => updateCore("email", v)} onBlur={() => setTouched((s) => ({ ...s, email: true }))} error={fieldError("email")} autoComplete="email" required full />
                <InputField id="phone" label={`Phone${role === "PATIENT" ? " (optional)" : ""}`} type="tel" value={profile.phone} onChange={(v) => updateProfile("phone", v)} autoComplete="tel" />
                {role === "PATIENT" && (
                  <>
                    <InputField id="date-of-birth" label="Date of birth" type="date" value={profile.dateOfBirth} onChange={(v) => updateProfile("dateOfBirth", v)} />
                    <SelectField id="gender" label="Gender" value={profile.gender} onChange={(v) => updateProfile("gender", v)} options={["Female", "Male", "Non-binary", "Prefer not to say"]} />
                    <InputField id="address" label="Address (optional)" value={profile.address} onChange={(v) => updateProfile("address", v)} autoComplete="street-address" />
                  </>
                )}
                <PasswordField id="password" label="Password" value={values.password} visible={showPassword} setVisible={setShowPassword} onChange={(v) => updateCore("password", v)} onBlur={() => setTouched((s) => ({ ...s, password: true }))} error={fieldError("password")} hint="8–128 characters, at least one letter and one number." />
                <PasswordField id="confirm-password" label="Confirm password" value={values.confirmPassword} visible={showConfirmPassword} setVisible={setShowConfirmPassword} onChange={(v) => updateCore("confirmPassword", v)} onBlur={() => setTouched((s) => ({ ...s, confirmPassword: true }))} error={fieldError("confirmPassword")} />
              </div>
            </section>

            {role === "PATIENT" ? (
              <section className={styles.formSection} id="patient-form" role="tabpanel" aria-labelledby="register-tab-patient">
                <h2>Health information <span>Optional · not submitted during registration</span></h2>
                <div className={styles.fields}>
                  <TextArea id="allergies" label="Allergies" value={profile.allergies} onChange={(v) => updateProfile("allergies", v)} />
                  <TextArea id="conditions" label="Existing conditions" value={profile.conditions} onChange={(v) => updateProfile("conditions", v)} />
                  <TextArea id="medicines" label="Current medicines" value={profile.medicines} onChange={(v) => updateProfile("medicines", v)} full />
                </div>
              </section>
            ) : (
              <section className={styles.formSection} id="doctor-form" role="tabpanel" aria-labelledby="register-tab-doctor">
                <div className={styles.sectionTitle}>
                  <h2>Professional information</h2>
                  <span>UI preview · not submitted</span>
                </div>
                <div className={styles.fields}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="specialization">Specializations</label>
                    <select
                      aria-describedby="specialization-hint"
                      className={styles.select}
                      disabled={specializationsLoading || specializationsError}
                      id="specialization"
                      multiple
                      onChange={(event) => setSpecializationIds(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}
                      value={specializationIds}
                    >
                      {specializations.map((specialization) => <option key={specialization.id} value={specialization.id}>{specialization.name}</option>)}
                    </select>
                    {specializationsError ? <p className={styles.error} id="specialization-hint">Specializations could not be loaded. <button type="button" onClick={() => refetchSpecializations()}>Try again</button></p> : <p className={styles.hint} id="specialization-hint">{specializationsLoading ? "Loading specializations…" : "Select one or more specialties."}</p>}
                  </div>
                  <InputField id="license-number" label="Medical license number" value={profile.licenseNumber} onChange={(v) => updateProfile("licenseNumber", v)} />
                  <InputField id="experience" label="Years of experience" type="number" value={profile.experience} onChange={(v) => updateProfile("experience", v)} />
                  <InputField id="fee" label="Consultation fee (BDT)" type="number" value={profile.fee} onChange={(v) => updateProfile("fee", v)} />
                  <TextArea id="qualifications" label="Qualifications" value={profile.qualifications} onChange={(v) => updateProfile("qualifications", v)} />
                  <InputField id="institution" label="Professional biography (optional)" value={profile.institution} onChange={(v) => updateProfile("institution", v)} />
                  <UploadField id="license-upload" label="Medical license" file={uploads.license} onSelect={(e) => selectFile("license", e)} onRemove={() => removeFile("license")} />
                  <UploadField id="supporting-upload" label="Supporting document" file={uploads.supporting} onSelect={(e) => selectFile("supporting", e)} onRemove={() => removeFile("supporting")} />
                </div>
              </section>
            )}

            <section className={styles.consentSection} aria-label="Required consents">
              <Consent id="terms" checked={values.termsAccepted} onChange={(v) => updateCore("termsAccepted", v)} error={fieldError("termsAccepted")}>I accept the <Link href="/#legal-links">Terms of Service</Link>.</Consent>
              <Consent id="privacy" checked={values.privacyConsent} onChange={(v) => updateCore("privacyConsent", v)} error={fieldError("privacyConsent")}>I accept the <Link href="/#legal-links">Privacy Policy</Link>.</Consent>
              <Consent id="health-consent" checked={values.healthConsent} onChange={(v) => updateCore("healthConsent", v)} error={fieldError("healthConsent")}>I consent to the processing of my health information.</Consent>
            </section>

            {requestError && <p className={`${styles.notice} ${styles.noticeError}`} role="alert">{requestError}</p>}
            <button className={styles.submitButton} disabled={isLoading} type="submit">
              {isLoading ? "Sending verification code…" : "Create Account"}
            </button>
            <p className={styles.formFooter}>Already have an account? <Link className={styles.textLink} href="/login">Log in</Link></p>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

function RoleTab({ roleValue, current, disabled, onSelect, onKeyDown }: {
  roleValue: Role;
  current: Role;
  disabled: boolean;
  onSelect: (role: Role) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const selected = current === roleValue;
  return (
    <button
      aria-controls={`${roleValue.toLowerCase()}-form`}
      aria-selected={selected}
      className={styles.registerTab}
      disabled={disabled}
      id={`register-tab-${roleValue.toLowerCase()}`}
      onClick={() => onSelect(roleValue)}
      onKeyDown={onKeyDown}
      role="tab"
      tabIndex={selected ? 0 : -1}
      type="button"
    >
      {roleValue === "PATIENT" ? "Patient" : "Doctor"}
    </button>
  );
}

function InputField({ id, label, value, onChange, onBlur, error, type = "text", autoComplete, required, full }: {
  id: string; label: string; value: string; onChange: (value: string) => void;
  onBlur?: () => void; error?: string; type?: string; autoComplete?: string;
  required?: boolean; full?: boolean;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className={styles.input}
        id={id}
        min={type === "number" ? "0" : undefined}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {error && <p className={styles.error} id={`${id}-error`}>{error}</p>}
    </div>
  );
}

function PasswordField({ id, label, value, visible, setVisible, onChange, onBlur, error, hint }: {
  id: string; label: string; value: string; visible: boolean;
  setVisible: (value: boolean) => void; onChange: (value: string) => void;
  onBlur: () => void; error?: string; hint?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.passwordWrap}>
        <input
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="new-password"
          className={`${styles.input} ${styles.passwordInput}`}
          id={id}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} className={styles.showPassword} onClick={() => setVisible(!visible)} type="button">
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error ? <p className={styles.error} id={`${id}-error`}>{error}</p> : hint && <p className={styles.hint} id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

function SelectField({ id, label, value, onChange, options }: {
  id: string; label: string; value: string;
  onChange: (value: string) => void; options: string[];
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <select className={styles.select} id={id} onChange={(e) => onChange(e.target.value)} value={value}>
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function TextArea({ id, label, value, onChange, full }: {
  id: string; label: string; value: string;
  onChange: (value: string) => void; full?: boolean;
}) {
  return (
    <div className={`${styles.field} ${full ? styles.fieldFull : ""}`}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <textarea className={styles.textarea} id={id} onChange={(e) => onChange(e.target.value)} rows={3} value={value} />
    </div>
  );
}

function UploadField({ id, label, file, onSelect, onRemove }: {
  id: string; label: string; file?: Upload;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <label className={styles.compactUpload} htmlFor={id}>
        {file?.previewUrl ? <Image alt={`${label} preview`} height={48} src={file.previewUrl} unoptimized width={48} /> : <UploadCloud size={22} />}
        <span>{file ? "Replace file" : "Choose file"}<small>PDF, JPG or PNG · max 5 MB · local preview only</small></span>
        <input accept=".pdf,image/jpeg,image/png" className={styles.srOnly} id={id} onChange={onSelect} type="file" />
      </label>
      {file && (
        <div className={styles.compactFile}>
          <FileCheck2 size={15} />
          <span title={file.name}>{file.name} · {file.size}</span>
          <button aria-label={`Remove ${label}`} onClick={onRemove} type="button"><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

function Consent({ id, checked, onChange, error, children }: {
  id: string; checked: boolean; onChange: (value: boolean) => void;
  error?: string; children: ReactNode;
}) {
  return (
    <label className={styles.checkboxRow} htmlFor={id}>
      <input aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} checked={checked} className={styles.checkbox} id={id} onChange={(e) => onChange(e.target.checked)} required type="checkbox" />
      <span>{children}{error && <span className={styles.error} id={`${id}-error`}> {error}</span>}</span>
    </label>
  );
}
