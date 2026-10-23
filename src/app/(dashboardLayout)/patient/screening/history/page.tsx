"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { screeningPreviews, type ScreeningStatus } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

const tone = (status: ScreeningStatus) => status === "Completed" ? "success" : status === "Needs review" ? "warning" : "info";

export default function ScreeningHistoryPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | ScreeningStatus>("All");
  const [risk, setRisk] = useState("All");

  const results = useMemo(() => screeningPreviews.filter((item) => {
    const matchesQuery = `${item.id} ${item.bodyArea} ${item.topPrediction}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "All" || item.status === status) && (risk === "All" || item.risk === risk);
  }), [query, risk, status]);

  return (
    <div className={s.page}>
      <PatientPageHeader eyebrow="AI screening" title="Screening history" description="Review previous skin screenings, confidence levels, and records that may benefit from clinical follow-up." action={<Button asChild className={s.primaryButton}><Link href="/patient/screening/new">New screening</Link></Button>} />
      <PreviewNotice />
      <section className={s.toolbar} aria-label="Screening history filters">
        <label className={s.search}><Search size={17} aria-hidden="true" /><span className="sr-only">Search screenings</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search condition, body area, or ID" /></label>
        <select className={s.select} value={status} onChange={(event) => setStatus(event.target.value as "All" | ScreeningStatus)} aria-label="Filter by status"><option>All</option><option>Completed</option><option>Needs review</option><option>Processing</option></select>
        <select className={s.select} value={risk} onChange={(event) => setRisk(event.target.value)} aria-label="Filter by risk"><option>All</option><option>Low</option><option>Moderate</option><option>High</option></select>
      </section>

      {results.length === 0 ? <PageState state="empty" title="No screenings match" message="Try adjusting your search or filters." /> : (
        <section className={s.grid} aria-label={`${results.length} screening records`}>
          {results.map((item) => (
            <article className={s.card} key={item.id}>
              <div className={s.cardTop}><StatusPill tone={tone(item.status)}>{item.status}</StatusPill><span className={s.muted}>{item.id}</span></div>
              <h2 style={{ marginTop: 16 }}>{item.topPrediction}</h2>
              <p className={s.muted}>{item.bodyArea}</p>
              <div className={s.metaGrid}>
                <div className={s.metaItem}><span>Confidence</span><strong>{item.confidence ? `${item.confidence}%` : "Pending"}</strong></div>
                <div className={s.metaItem}><span>Risk level</span><strong>{item.risk}</strong></div>
              </div>
              <div className={s.iconLine} style={{ marginTop: 16 }}><CalendarDays size={16} />{item.date}</div>
              <div className={s.iconLine} style={{ marginTop: 9 }}><ShieldCheck size={16} />Preliminary screening</div>
              <div className={s.actions}><Button asChild variant="outline"><Link href={`/patient/screening/${item.id}`}>View details <ChevronRight size={15} /></Link></Button></div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

