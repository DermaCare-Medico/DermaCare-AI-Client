"use client";
import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatConfidence, getPredictionFields, useGetScreeningHistoryQuery, type ScreeningRecord } from "@/redux/api/screeningApi";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";

const records = (data: ScreeningRecord[] | { screenings?: ScreeningRecord[] } | undefined) => Array.isArray(data) ? data : data?.screenings ?? [];
export default function ScreeningHistoryPage() {
  const query = useGetScreeningHistoryQuery({ page: 1, limit: 10 });
  const screenings = records(query.data?.data);
  return <div className={s.page}><PatientPageHeader eyebrow="AI screening" title="Screening history" description="Review previous AI screening results and confidence levels." action={<Button asChild className={s.primaryButton}><Link href="/patient/screening/new">New screening</Link></Button>} />
    {query.isLoading ? <PageState state="loading" /> : query.isError ? <PageState state="error" onRetry={query.refetch} /> : screenings.length === 0 ? <PageState state="empty" title="No screenings yet" message="Your completed screenings will appear here." /> : <section className={s.grid}>{screenings.map((item) => { const id = item.screeningId ?? item.id ?? ""; const prediction = getPredictionFields(item); return <article className={s.card} key={id}><div className={s.cardTop}><StatusPill tone={String(item.status).toUpperCase() === "COMPLETED" ? "success" : "info"}>{item.status ?? "Processing"}</StatusPill><span className={s.muted}>{id}</span></div><h2 style={{ marginTop: 16 }}>{prediction.condition}</h2><div className={s.metaGrid}><div className={s.metaItem}><span>Confidence</span><strong>{prediction.confidence == null ? "Pending" : formatConfidence(prediction.confidence)}</strong></div><div className={s.metaItem}><span>Risk</span><strong>{item.riskLevel ?? "Not reported"}</strong></div></div><div className={s.iconLine} style={{ marginTop: 16 }}><CalendarDays size={16} />{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable"}</div><div className={s.actions}><Button asChild variant="outline"><Link href={`/patient/screening/${encodeURIComponent(id)}`}>View details <ChevronRight size={15} /></Link></Button></div></article>; })}</section>}
  </div>;
}
