import { Check, LoaderCircle } from "lucide-react";

import styles from "./page.module.css";

const steps = [
  { title: "Processing Image", shortTitle: "Processing", description: "Preparing your image securely" },
  { title: "Analyzing Skin Condition", shortTitle: "Analyzing", description: "Reviewing visible skin features" },
  { title: "Finalizing Result", shortTitle: "Finalizing", description: "Preparing your screening summary" },
] as const;

export default function ScreeningProgress({ activeStep }: { activeStep: number }) {
  const lineProgress = activeStep >= 3 ? 100 : activeStep * 50;

  return (
    <section className={styles.loadingCard} aria-live="polite" aria-busy="true">
      <p className={styles.eyebrow}>AI-assisted screening</p>
      <h1>Analyzing your screening</h1>
      <p className={styles.loadingIntro}>Please keep this page open while we process your submission.</p>

      <div className={styles.progressTrack}>
        <div className={styles.trackBase} aria-hidden="true">
          <span className={styles.trackFill} style={{ width: `${lineProgress}%` }} />
        </div>
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const active = index === activeStep && activeStep < steps.length;
          return (
            <div className={styles.progressStep} key={step.title}>
              <span
                className={`${styles.stepIndicator} ${completed ? styles.completed : ""} ${active ? styles.active : ""}`}
                aria-hidden="true"
              >
                {completed ? <Check size={18} strokeWidth={2.5} /> : active ? <LoaderCircle size={18} /> : index + 1}
              </span>
              <strong className={styles.desktopTitle}>{step.title}</strong>
              <strong className={styles.mobileTitle}>{step.shortTitle}</strong>
              <span className={styles.stepDescription}>{step.description}</span>
            </div>
          );
        })}
      </div>

      <p className={styles.nonDiagnostic}>This AI-assisted screening is preliminary and is not a medical diagnosis.</p>
    </section>
  );
}
