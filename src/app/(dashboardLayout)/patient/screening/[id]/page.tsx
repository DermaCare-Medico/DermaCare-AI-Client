"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, ShieldAlert, Stethoscope, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  formatConfidence,
  getPredictionFields,
  getScreeningStatus,
  safeScreeningText,
  useGetScreeningQuery,
  useRetryScreeningPredictionMutation,
} from "@/redux/api/screeningApi";
import { useGetPatientProfileQuery } from "@/redux/api/patientApi";
import { useAppSelector } from "@/redux/hooks";
import {
  PageState,
  PatientPageHeader,
  StatusPill,
  patientUiStyles as s,
} from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function readableGender(value?: string) {
  if (!value?.trim()) return null;
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ScreeningResultPage() {
  const { id } = useParams<{ id: string }>();
  const decodedId = decodeURIComponent(id);
  const query = useGetScreeningQuery(decodedId);
  const [retry, retryState] = useRetryScreeningPredictionMutation();
  const authUser = useAppSelector((state) => state.auth.user);
  const profileQuery = useGetPatientProfileQuery();

  if (query.isLoading) {
    return (
      <div className={s.page}>
        <PageState state="loading" />
      </div>
    );
  }

  if (query.isError || !query.data?.data) {
    return (
      <div className={s.page}>
        <PageState state="error" onRetry={query.refetch} />
        <Button asChild variant="outline">
          <Link href="/patient/screening/history">
            <ArrowLeft size={16} /> Back to History
          </Link>
        </Button>
      </div>
    );
  }

  const item = query.data.data;
  const screeningId = item.screeningId ?? item.id ?? decodedId;
  const status = getScreeningStatus(item);
  const prediction = getPredictionFields(item);
  const alternatives = (item.alternativePredictions ?? item.predictions ?? []).filter(
    (entry) => entry != null
  );
  const risk = String(item.riskLevel ?? "Not reported");

  const profile = profileQuery.data?.data;
  const patientName =
    typeof authUser?.name === "string" && authUser.name.trim() ? authUser.name : null;
  const patientAge = calculateAge(profile?.dateOfBirth);
  const patientGender = readableGender(profile?.gender);

  // Check if an accessible image URL is provided by the API
  const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;
  const rawImageUrl =
    item.signedImageUrl ??
    item.imageUrl ??
    item.url ??
    firstImage?.imageUrl ??
    firstImage?.url ??
    firstImage?.signedUrl;
  const imageUrl = typeof rawImageUrl === "string" && rawImageUrl.trim().length > 0 ? rawImageUrl : null;

  const tone =
    status === "COMPLETED"
      ? risk.toUpperCase() === "HIGH"
        ? "danger"
        : "success"
      : status === "FAILED"
      ? "danger"
      : "info";

  return (
    <div className={s.page}>
      <PatientPageHeader
        eyebrow={`Screening ${screeningId}`}
        title="AI screening result"
        description={
          item.createdAt
            ? `Submitted ${new Date(item.createdAt).toLocaleString()}`
            : "Preliminary AI report"
        }
        action={
          <Button asChild variant="outline">
            <Link href="/patient/screening/history">
              <ArrowLeft size={16} /> History
            </Link>
          </Button>
        }
      />

      <div className={s.detailsLayout}>
        <section className={s.panel}>
          <div className={s.rowBetween}>
            <div>
              <p className={s.eyebrow}>Top prediction</p>
              <h2>{prediction.condition}</h2>
            </div>
            <StatusPill tone={tone}>
              {status !== "UNKNOWN" ? `${status} · ${risk} risk` : risk}
            </StatusPill>
          </div>

          <div style={{ margin: "16px 0" }}>
            <p className={s.muted}>{item.symptoms ?? "No symptom summary returned."}</p>
          </div>

          <div className={s.divider} />

          <div style={{ margin: "16px 0" }}>
            <h3>
              Confidence:{" "}
              {prediction.confidence !== null
                ? formatConfidence(prediction.confidence)
                : "Not available"}
            </h3>
          </div>

          {alternatives.length > 0 ? (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 12, fontSize: "0.95rem", color: "#475569" }}>
                All condition predictions
              </h4>
              <div className={s.list}>
                {alternatives.map((entry, index) => {
                  const label =
                    safeScreeningText(entry?.condition) ??
                    safeScreeningText(entry?.label) ??
                    "Prediction unavailable";
                  const conf = entry?.confidenceScore ?? entry?.confidence ?? entry?.score;
                  return (
                    <div key={`${label}-${index}`} className={s.rowBetween}>
                      <strong>{label}</strong>
                      <span>{formatConfidence(conf)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className={s.divider} />

          {/* Secure Image Preview or Privacy Notice */}
          <div style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 12, fontSize: "0.95rem", color: "#475569" }}>
              Uploaded Clinical Image
            </h4>
            {imageUrl ? (
              <div
                style={{
                  maxWidth: 400,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Clinical screening capture"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 8,
                  backgroundColor: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  color: "#64748b",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                }}
              >
                Medical image ID <code>{firstImage?.id ?? "stored"}</code> is encrypted in compliant
                storage. Cloudinary direct URL is protected.
              </div>
            )}
          </div>

          <div className={s.divider} />

          {/* Patient Details */}
          <div style={{ marginTop: 20 }}>
            <div className={s.iconLine} style={{ marginBottom: 12 }}>
              <UserRound size={18} />
              <strong>Patient Information</strong>
            </div>
            <div className={s.metaGrid}>
              {patientName ? (
                <div className={s.metaItem}>
                  <span>Patient</span>
                  <strong>{patientName}</strong>
                </div>
              ) : null}
              {patientAge !== null ? (
                <div className={s.metaItem}>
                  <span>Age</span>
                  <strong>{patientAge} years</strong>
                </div>
              ) : null}
              {patientGender ? (
                <div className={s.metaItem}>
                  <span>Gender</span>
                  <strong>{patientGender}</strong>
                </div>
              ) : null}
              {item.imageQualityStatus ? (
                <div className={s.metaItem}>
                  <span>Image Quality</span>
                  <strong>{item.imageQualityStatus}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <aside className={s.list}>
          <section className={s.panel} style={{ background: "#f7fbfa" }}>
            <div className={s.iconLine}>
              <ShieldAlert size={20} />
              <strong>Medical disclaimer</strong>
            </div>
            <p className={s.muted}>
              {item.disclaimer ??
                "This is a preliminary screening, not a diagnosis. A qualified clinician must assess medical concerns."}
            </p>
          </section>

          <section className={s.panel}>
            <h3>Next steps</h3>
            <div className={s.actions}>
              <Button asChild className={s.primaryButton}>
                <Link href={`/doctors?screeningId=${encodeURIComponent(screeningId)}`}>
                  <Stethoscope size={16} /> Find a doctor
                </Link>
              </Button>
              <Button
                variant="outline"
                disabled={retryState.isLoading}
                onClick={() =>
                  void retry(screeningId)
                    .unwrap()
                    .then(() => query.refetch())
                }
              >
                <RefreshCw size={16} />
                {retryState.isLoading ? "Retrying..." : "Retry analysis"}
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
