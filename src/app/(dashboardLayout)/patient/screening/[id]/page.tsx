"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ImageOff,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";

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

interface ScreeningImagePreviewProps {
  primaryUrl: string | null;
  screeningId: string;
  imageId?: string;
  authToken?: string | null;
  altText: string;
}

function ScreeningImagePreview({
  primaryUrl,
  screeningId,
  imageId,
  authToken,
  altText,
}: ScreeningImagePreviewProps) {
  const [failedPrimary, setFailedPrimary] = useState(false);
  const [fallbackBlobUrl, setFallbackBlobUrl] = useState<string | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let objectUrlToRevoke: string | null = null;
    let isCancelled = false;

    if (failedPrimary && screeningId && imageId && authToken) {
      const apiBase = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000/api/v1").replace(
        /\/+$/,
        ""
      );
      const fallbackEndpoint = `${apiBase}/screenings/history/${encodeURIComponent(
        screeningId
      )}/images/${encodeURIComponent(imageId)}`;

      fetch(fallbackEndpoint, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Fallback fetch unsuccessful");
          return res.blob();
        })
        .then((blob) => {
          if (isCancelled) return;
          const url = URL.createObjectURL(blob);
          objectUrlToRevoke = url;
          setFallbackBlobUrl(url);
          setFallbackLoading(false);
        })
        .catch(() => {
          if (isCancelled) return;
          setFallbackFailed(true);
          setFallbackLoading(false);
        });
    }

    return () => {
      isCancelled = true;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [failedPrimary, screeningId, imageId, authToken]);

  const activeUrl = !failedPrimary ? primaryUrl : fallbackBlobUrl;
  const isCompletelyUnavailable =
    (!primaryUrl && !fallbackBlobUrl) || (failedPrimary && fallbackFailed);

  if (isCompletelyUnavailable) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "36px 20px",
          borderRadius: 16,
          backgroundColor: "#f8fafc",
          border: "1px dashed #cbd5e1",
          color: "#64748b",
          textAlign: "center",
        }}
        role="status"
      >
        <ImageOff size={32} style={{ color: "#94a3b8" }} />
        <div>
          <strong style={{ display: "block", color: "#334155", fontSize: "0.95rem" }}>
            Screening Image Unavailable
          </strong>
          <span style={{ fontSize: "0.825rem", color: "#64748b" }}>
            The secure signed URL has expired or the image is inaccessible.
          </span>
        </div>
      </div>
    );
  }

  const showLoadingPlaceholder = fallbackLoading || !imageLoaded;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        backgroundColor: "#0f172a",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      {showLoadingPlaceholder ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: 260,
            color: "#94a3b8",
            fontSize: "0.875rem",
          }}
        >
          <LoaderCircle size={20} className="animate-spin" />
          <span>Loading secure screening image...</span>
        </div>
      ) : null}
      {activeUrl ? (
        <img
          src={activeUrl}
          alt={altText}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (!failedPrimary) {
              setFailedPrimary(true);
              setFallbackLoading(true);
              setImageLoaded(false);
            } else {
              setFallbackFailed(true);
              setFallbackLoading(false);
            }
          }}
          style={{
            display: showLoadingPlaceholder ? "none" : "block",
            width: "100%",
            maxHeight: 380,
            objectFit: "contain",
            margin: "0 auto",
          }}
        />
      ) : null}
    </div>
  );
}

export default function ScreeningResultPage() {
  const { id } = useParams<{ id: string }>();
  const decodedId = decodeURIComponent(id);
  const query = useGetScreeningQuery(decodedId);
  const [retry, retryState] = useRetryScreeningPredictionMutation();
  const authUser = useAppSelector((state) => state.auth.user);
  const authToken = useAppSelector((state) => state.auth.token);
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

  // Backend contract provides data.images[].{id, imageType, imageUrl}
  const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;
  const rawImageUrl =
    firstImage?.imageUrl ??
    item.imageUrl ??
    item.signedImageUrl ??
    firstImage?.signedUrl ??
    firstImage?.url ??
    item.url;
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

          {/* Secure Image Preview Card */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#475569" }}>
                Uploaded Clinical Image
              </h4>
              {firstImage?.imageType ? (
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "3px 8px",
                    borderRadius: 6,
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  {firstImage.imageType} View
                </span>
              ) : null}
            </div>

            <ScreeningImagePreview
              key={imageUrl ?? screeningId}
              primaryUrl={imageUrl}
              screeningId={screeningId}
              imageId={firstImage?.id}
              authToken={authToken}
              altText={`Screening image capture for ${prediction.condition}`}
            />
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
