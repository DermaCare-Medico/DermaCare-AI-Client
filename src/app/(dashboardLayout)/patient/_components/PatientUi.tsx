import type { ReactNode } from "react";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import styles from "./patient-ui.module.css";

export function PatientPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
      {action ? <div className={styles.headerAction}>{action}</div> : null}
    </header>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  return <span className={`${styles.statusPill} ${styles[tone]}`}>{children}</span>;
}

export function PreviewNotice() {
  return (
    <div className={styles.previewNotice} role="note">
      Preview data only. Actions are prepared for future API integration and do not create records, charge payments, or provide a medical diagnosis.
    </div>
  );
}

export function PageState({
  state,
  title,
  message,
  onRetry,
}: {
  state: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const copy = {
    loading: ["Loading your information", "Please wait while this page gets ready."],
    empty: ["Nothing here yet", "New records will appear here when they become available."],
    error: ["We could not load this page", "Please try again. No changes have been made."],
  }[state];
  const Icon = state === "loading" ? LoaderCircle : state === "empty" ? Inbox : AlertCircle;

  return (
    <section className={styles.stateCard} aria-live="polite" aria-busy={state === "loading"}>
      <Icon className={state === "loading" ? styles.spin : undefined} size={26} aria-hidden="true" />
      <h2>{title ?? copy[0]}</h2>
      <p>{message ?? copy[1]}</p>
      {state === "error" && onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
    </section>
  );
}

export { styles as patientUiStyles };

