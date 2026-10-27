"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, RefreshCw, ShieldAlert, Stethoscope, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getPredictionFields,
  parseConfidenceNumber,
  safeScreeningText,
  useCreateScreeningMutation,
  useUploadScreeningImageMutation,
  type ScreeningRecord,
} from "@/redux/api/screeningApi";
import { useGetPatientProfileQuery } from "@/redux/api/patientApi";
import { useAppSelector } from "@/redux/hooks";
import { useScreeningFlow } from "../screening-flow-context";
import ScreeningProgress from "./ScreeningProgress";
import styles from "./page.module.css";

type ViewState = "loading" | "error" | "success" | "missing";

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data && "message" in data && typeof data.message === "string") return data.message;
  }
  return "We could not complete this screening. Please try again.";
}

function stringList(record: ScreeningRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }
  return [];
}

function confidenceLabel(value?: unknown) {
  const parsed = parseConfidenceNumber(value);
  if (parsed === null) return null;
  if (parsed >= 80) return "High";
  if (parsed >= 50) return "Medium";
  return "Low";
}

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function readableGender(value?: string) {
  if (!value?.trim()) return null;
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ScreeningResultPage() {
  const router = useRouter();
  const { pendingScreening, setPendingScreening } = useScreeningFlow();
  const submittedScreeningRef = useRef(pendingScreening);
  const authUser = useAppSelector((state) => state.auth.user);
  const profileQuery = useGetPatientProfileQuery();
  const [createScreening] = useCreateScreeningMutation();
  const [uploadImage] = useUploadScreeningImageMutation();
  const [viewState, setViewState] = useState<ViewState>(pendingScreening ? "loading" : "missing");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ScreeningRecord | null>(null);
  const [error, setError] = useState("");
  const [submittedImageUrl, setSubmittedImageUrl] = useState<string | null>(null);
  const startedRef = useRef(false);
  const runningRef = useRef(false);
  const screeningIdRef = useRef<string | null>(null);
  const createdRecordRef = useRef<ScreeningRecord | null>(null);

  useEffect(() => {
    const image = submittedScreeningRef.current?.image;
    if (!image) return;
    const objectUrl = URL.createObjectURL(image);
    setSubmittedImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, []);

  useEffect(() => {
    if (viewState !== "loading") return;
    setActiveStep(0);
    const analyzingTimer = window.setTimeout(() => setActiveStep(1), 850);
    const finalizingTimer = window.setTimeout(() => setActiveStep(2), 1850);
    return () => {
      window.clearTimeout(analyzingTimer);
      window.clearTimeout(finalizingTimer);
    };
  }, [viewState]);

  const runAnalysis = useCallback(async () => {
    if (!pendingScreening || runningRef.current) return;
    runningRef.current = true;
    setViewState("loading");
    setError("");

    try {
      let screeningId = screeningIdRef.current;
      if (!screeningId) {
        const { formData } = pendingScreening;
        const symptoms = [
          formData.mainSymptom,
          `Area: ${formData.bodyArea}`,
          `Duration: ${formData.duration}`,
          formData.notes,
        ].filter(Boolean).join(". ");
        const created = await createScreening({
          symptoms,
          hasBleeding: false,
          rapidGrowth: formData.worsening === "Yes",
          hasFever: formData.feverOrOtherSymptoms.toLowerCase().includes("fever"),
          hasUlceration: false,
          severePain: formData.pain === "Yes",
        }).unwrap();
        createdRecordRef.current = created.data;
        screeningId = created.data.screeningId ?? created.data.id ?? null;
        if (!screeningId) throw new Error("The screening service did not return a screening ID.");
        screeningIdRef.current = screeningId;
      }

      const uploaded = await uploadImage({
        screeningId,
        imageType: "FRONT",
        image: pendingScreening.image,
      }).unwrap();
      const savedResult = { ...createdRecordRef.current, ...uploaded.data };
      const savedScreeningId = savedResult.screeningId ?? savedResult.id ?? screeningId;
      setActiveStep(3);
      setResult(savedResult);
      setPendingScreening(null);
      window.setTimeout(() => {
        router.replace(`/patient/screening/${encodeURIComponent(savedScreeningId)}`);
      }, 350);
    } catch (requestError) {
      setError(errorMessage(requestError));
      setViewState("error");
    } finally {
      runningRef.current = false;
    }
  }, [createScreening, pendingScreening, router, setPendingScreening, uploadImage]);

  useEffect(() => {
    if (!pendingScreening || startedRef.current) return;
    startedRef.current = true;
    void runAnalysis();
  }, [pendingScreening, runAnalysis]);

  if (viewState === "loading") return <ScreeningProgress activeStep={activeStep} />;

  if (viewState === "missing") {
    return (
      <section className={styles.stateCard}>
        <AlertCircle size={30} />
        <h1>No screening is waiting to be analyzed</h1>
        <p>For your privacy, images and symptom details are kept only in memory and are cleared when this page is refreshed.</p>
        <Button asChild><Link href="/patient/screening/new">Return to New Screening</Link></Button>
      </section>
    );
  }

  if (viewState === "error") {
    return (
      <section className={styles.stateCard} role="alert">
        <AlertCircle size={30} className={styles.errorIcon} />
        <h1>Screening could not be completed</h1>
        <p>{error}</p>
        <div className={styles.actions}>
          <Button onClick={() => void runAnalysis()}><RefreshCw size={16} /> Retry</Button>
          <Button asChild variant="outline"><Link href="/patient/screening/new">Back to form</Link></Button>
        </div>
      </section>
    );
  }

  if (!result) return null;
  const prediction = getPredictionFields(result);
  const alternatives = (result.alternativePredictions ?? result.predictions ?? []).filter((item) => item != null);
  const recommendations = stringList(result, ["recommendations", "suggestions", "nextSteps"]);
  const screeningId = result.screeningId ?? result.id;
  const submittedForm = submittedScreeningRef.current?.formData;
  const profile = profileQuery.data?.data;
  const patientName = typeof authUser?.name === "string" && authUser.name.trim() ? authUser.name : null;
  const patientAge = calculateAge(profile?.dateOfBirth);
  const patientGender = readableGender(profile?.gender);
  const modelConfidence = confidenceLabel(prediction.confidence);
  const screeningDate = result.createdAt ? new Date(result.createdAt) : null;
  const validScreeningDate = screeningDate && !Number.isNaN(screeningDate.getTime()) ? screeningDate : null;

  return (
    <div className={styles.resultPage}>
      <header className={styles.resultHeading}>
        <div>
          <p className={styles.eyebrow}>Patient screening report</p>
          <h1>Your screening result</h1>
        </div>
        <span className={styles.nonDiagnosticLabel}>AI-assisted · Non-diagnostic</span>
      </header>

      <div className={styles.resultGrid}>
        <div className={styles.leftColumn}>
          {submittedImageUrl ? (
            <section className={styles.imageCard}>
              <div className={styles.cardHeading}><span>Submitted image</span><strong>{submittedScreeningRef.current?.image.name}</strong></div>
              <div className={styles.imageFrame}><img src={submittedImageUrl} alt="Skin image submitted for this screening" /></div>
            </section>
          ) : null}

          <section className={styles.detailsCard}>
            <div className={styles.sectionTitle}><UserRound size={18} /><h2>Patient and screening details</h2></div>
            <dl className={styles.metadataGrid}>
              {patientName ? <div><dt>Patient</dt><dd>{patientName}</dd></div> : null}
              {patientAge !== null ? <div><dt>Age</dt><dd>{patientAge} years</dd></div> : null}
              {patientGender ? <div><dt>Gender</dt><dd>{patientGender}</dd></div> : null}
              {screeningId ? <div><dt>Screening ID</dt><dd>{screeningId}</dd></div> : null}
              {validScreeningDate ? <div><dt>Date</dt><dd>{validScreeningDate.toLocaleString()}</dd></div> : null}
              {submittedForm?.bodyArea ? <div><dt>Affected area</dt><dd>{submittedForm.bodyArea}</dd></div> : null}
              {(result.symptoms || submittedForm?.mainSymptom) ? <div className={styles.fullMetadata}><dt>Submitted symptoms</dt><dd>{result.symptoms ?? submittedForm?.mainSymptom}</dd></div> : null}
            </dl>
          </section>
        </div>

        <aside className={styles.rightColumn}>
          <section className={styles.predictionCard}>
            <span className={styles.cardLabel}>Predicted condition</span>
            <h2>{prediction.condition}</h2>
            {modelConfidence ? <div className={styles.confidence}><span>Model confidence</span><strong data-level={modelConfidence.toLowerCase()}>{modelConfidence}</strong></div> : null}

            {alternatives.length > 0 ? (
              <div className={styles.detailSection}>
                <h3>Alternative predictions</h3>
                <div className={styles.predictionList}>
                  {alternatives.map((item, index) => {
                    const alternativeConfidence = confidenceLabel(item?.confidenceScore ?? item?.confidence);
                    const label = safeScreeningText(item?.condition) ?? safeScreeningText(item?.label) ?? "Prediction unavailable";
                    return <div key={`${label}-${index}`}><span>{label}</span>{alternativeConfidence ? <strong>{alternativeConfidence}</strong> : null}</div>;
                  })}
                </div>
              </div>
            ) : null}

            {recommendations.length > 0 ? <div className={styles.detailSection}><h3>Recommendations</h3><ul>{recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
          </section>

          <section className={styles.nextCard}>
            <h3>Next actions</h3>
            <div className={styles.actions}>
              {screeningId ? <Button asChild><Link href={`/patient/screening/${encodeURIComponent(screeningId)}`}>View full report <ArrowRight size={16} /></Link></Button> : null}
              <Button asChild variant="outline"><Link href={screeningId ? `/doctors?screeningId=${encodeURIComponent(screeningId)}` : "/doctors"}><Stethoscope size={16} /> Find a doctor</Link></Button>
              <Button asChild variant="ghost"><Link href="/patient/screening/new">Start new screening</Link></Button>
            </div>
          </section>
        </aside>
      </div>

      <section className={styles.disclaimerCard}>
        <ShieldAlert size={20} />
        <div><h2>Medical disclaimer</h2><p>This AI-assisted result is a preliminary screening and is not a medical diagnosis. It does not replace an examination, diagnosis, or treatment plan from a qualified healthcare professional.</p></div>
      </section>
    </div>
  );
}
