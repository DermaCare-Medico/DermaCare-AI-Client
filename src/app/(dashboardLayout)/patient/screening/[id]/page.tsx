"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, ShieldAlert, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatConfidence, getPredictionFields, useGetScreeningQuery, useRetryScreeningMutation } from "@/redux/api/screeningApi";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";

export default function ScreeningResultPage() {
  const { id } = useParams<{ id: string }>();
  const query = useGetScreeningQuery(decodeURIComponent(id));
  const [retry, retryState] = useRetryScreeningMutation();
  if (query.isLoading) return <div className={s.page}><PageState state="loading" /></div>;
  if (query.isError || !query.data?.data) return <div className={s.page}><PageState state="error" onRetry={query.refetch} /><Button asChild variant="outline"><Link href="/patient/screening/history"><ArrowLeft size={16} /> Back</Link></Button></div>;
  const item = query.data.data;
  const prediction = getPredictionFields(item);
  const alternatives = (item.alternativePredictions ?? item.predictions ?? []).filter((entry) => entry != null);
  const risk = String(item.riskLevel ?? "Not reported");
  return <div className={s.page}><PatientPageHeader eyebrow={`Screening ${item.screeningId ?? item.id ?? id}`} title="AI screening result" description={item.createdAt ? `Submitted ${new Date(item.createdAt).toLocaleString()}` : "Preliminary AI report"} action={<Button asChild variant="outline"><Link href="/patient/screening/history"><ArrowLeft size={16} /> History</Link></Button>} />
    <div className={s.detailsLayout}><section className={s.panel}><div className={s.rowBetween}><div><p className={s.eyebrow}>Top prediction</p><h2>{prediction.condition}</h2></div><StatusPill tone={risk.toUpperCase() === "HIGH" ? "danger" : "info"}>{risk}</StatusPill></div><p className={s.muted}>{item.symptoms ?? "No symptom summary returned."}</p><div className={s.divider} /><h3>Confidence: {formatConfidence(prediction.confidence)}</h3>{alternatives.length ? <div className={s.list}>{alternatives.map((entry, index) => <div key={`${entry?.condition ?? entry?.label ?? "prediction"}-${index}`} className={s.rowBetween}><strong>{entry?.condition ?? entry?.label ?? "Prediction unavailable"}</strong><span>{formatConfidence(entry?.confidenceScore ?? entry?.confidence)}</span></div>)}</div> : null}</section>
      <aside className={s.list}><section className={s.panel} style={{ background: "#f7fbfa" }}><div className={s.iconLine}><ShieldAlert size={20} /><strong>Medical disclaimer</strong></div><p className={s.muted}>This is a preliminary screening, not a diagnosis. A qualified clinician must assess medical concerns.</p></section><section className={s.panel}><h3>Next steps</h3><div className={s.actions}><Button asChild className={s.primaryButton}><Link href={`/doctors?screeningId=${encodeURIComponent(item.screeningId ?? item.id ?? id)}`}><Stethoscope size={16} /> Find a doctor</Link></Button><Button variant="outline" disabled={retryState.isLoading} onClick={() => void retry(item.screeningId ?? item.id ?? id).unwrap().then(() => query.refetch())}><RefreshCw size={16} />{retryState.isLoading ? "Retrying..." : "Retry analysis"}</Button></div></section></aside>
    </div></div>;
}
