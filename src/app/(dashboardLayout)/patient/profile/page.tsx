"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PencilLine, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { initialPatientProfile, type PatientProfileData } from "@/src/app/(dashboardLayout)/patient/mockData";
import styles from "./page.module.css";

const EMPTY_ERRORS: Partial<Record<keyof PatientProfileData, string>> = {};

export default function PatientProfilePage() {
  const [formValues, setFormValues] = useState<PatientProfileData>(initialPatientProfile);
  const [savedValues, setSavedValues] = useState<PatientProfileData>(initialPatientProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientProfileData, string>>>(EMPTY_ERRORS);
  const [saveMessage, setSaveMessage] = useState("");

  const initials = useMemo(() => {
    return formValues.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [formValues.fullName]);

  const handleFieldChange = (field: keyof PatientProfileData, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveMessage("");
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof PatientProfileData, string>> = {};

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (formValues.phone && !/^\+?[0-9()\-\s]{7,}$/.test(formValues.phone.trim())) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!formValues.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    }

    return nextErrors;
  };

  const handleSave = () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSaveMessage("");
      return;
    }

    setSavedValues(formValues);
    setIsEditing(false);
    setSaveMessage("Your mock profile changes have been saved for this session.");
  };

  const handleCancel = () => {
    setFormValues(savedValues);
    setErrors(EMPTY_ERRORS);
    setIsEditing(false);
    setSaveMessage("");
  };

  return (
    <div className={styles.page}>
      <header className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Patient profile</p>
          <h1>Profile overview</h1>
        </div>
        {!isEditing ? (
          <Button className={styles.primaryButton} onClick={() => setIsEditing(true)}>
            <PencilLine size={16} />
            Edit profile
          </Button>
        ) : null}
      </header>

      <section className={styles.heroCard}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar} aria-label="Profile avatar">
            {formValues.profileImage ? (
              <img src={formValues.profileImage} alt={formValues.fullName} className={styles.avatarImage} />
            ) : (
              <span>{initials || "AW"}</span>
            )}
          </div>
        </div>

        <div className={styles.identityBlock}>
          <h2>{formValues.fullName}</h2>
          <p>{formValues.email}</p>
          <div className={styles.metaChips}>
            <span>{formValues.city || "City not provided"}</span>
            <span>{formValues.gender || "Gender not provided"}</span>
          </div>
        </div>
      </section>

      <form className={styles.formGrid} onSubmit={(event) => event.preventDefault()}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>Personal information</p>
              <h3>Contact details</h3>
            </div>
            <UserRound size={18} className={styles.sectionIcon} />
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Full name</span>
              <input
                type="text"
                name="fullName"
                value={formValues.fullName}
                onChange={(event) => handleFieldChange("fullName", event.target.value)}
                disabled={!isEditing}
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName ? <small>{errors.fullName}</small> : null}
            </label>

            <label className={styles.field}>
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={(event) => handleFieldChange("email", event.target.value)}
                disabled={!isEditing}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? <small>{errors.email}</small> : null}
            </label>

            <label className={styles.field}>
              <span>Phone number</span>
              <input
                type="tel"
                name="phone"
                value={formValues.phone}
                onChange={(event) => handleFieldChange("phone", event.target.value)}
                disabled={!isEditing}
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>

            <label className={styles.field}>
              <span>Date of birth</span>
              <input
                type="date"
                name="dateOfBirth"
                value={formValues.dateOfBirth}
                onChange={(event) => handleFieldChange("dateOfBirth", event.target.value)}
                disabled={!isEditing}
                aria-invalid={Boolean(errors.dateOfBirth)}
              />
              {errors.dateOfBirth ? <small>{errors.dateOfBirth}</small> : null}
            </label>

            <label className={styles.field}>
              <span>Gender</span>
              <input
                type="text"
                name="gender"
                value={formValues.gender}
                onChange={(event) => handleFieldChange("gender", event.target.value)}
                disabled={!isEditing}
              />
            </label>

            <label className={styles.field}>
              <span>City / address</span>
              <input
                type="text"
                name="city"
                value={formValues.city}
                onChange={(event) => handleFieldChange("city", event.target.value)}
                disabled={!isEditing}
              />
            </label>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionLabel}>Medical context</p>
              <h3>Health details</h3>
            </div>
            <ShieldCheck size={18} className={styles.sectionIcon} />
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Known allergies</span>
              <input
                type="text"
                name="allergies"
                value={formValues.allergies}
                onChange={(event) => handleFieldChange("allergies", event.target.value)}
                disabled={!isEditing}
              />
            </label>

            <label className={styles.field}>
              <span>Existing medical conditions</span>
              <input
                type="text"
                name="conditions"
                value={formValues.conditions}
                onChange={(event) => handleFieldChange("conditions", event.target.value)}
                disabled={!isEditing}
              />
            </label>

            <label className={styles.field}>
              <span>Current medicines</span>
              <input
                type="text"
                name="medications"
                value={formValues.medications}
                onChange={(event) => handleFieldChange("medications", event.target.value)}
                disabled={!isEditing}
              />
            </label>

            <label className={styles.field}>
              <span>Skin type</span>
              <input
                type="text"
                name="skinType"
                value={formValues.skinType}
                onChange={(event) => handleFieldChange("skinType", event.target.value)}
                disabled={!isEditing}
              />
            </label>

            <label className={styles.fieldFull}>
              <span>Relevant skin concerns</span>
              <textarea
                name="skinConcerns"
                value={formValues.skinConcerns}
                onChange={(event) => handleFieldChange("skinConcerns", event.target.value)}
                disabled={!isEditing}
              />
            </label>
          </div>
        </section>

        {saveMessage ? (
          <div className={styles.successBanner} role="status" aria-live="polite">
            <CheckCircle2 size={16} />
            <span>{saveMessage}</span>
          </div>
        ) : null}

        <div className={styles.actionBar}>
          {isEditing ? (
            <>
              <Button className={styles.primaryButton} onClick={handleSave} type="button">
                Save Changes
              </Button>
              <Button variant="outline" className={styles.secondaryButton} onClick={handleCancel} type="button">
                Cancel
              </Button>
            </>
          ) : null}
        </div>

        <aside className={styles.privacyNote}>
          <h4>Why this information matters</h4>
          <p>
            Optional clinical context helps you and your doctor understand patterns over time, avoid medication conflicts,
            and make consultations more focused. We only ask for details that support care planning and do not expose this
            information to pharmacy flows or unrelated services.
          </p>
        </aside>
      </form>
    </div>
  );
}
