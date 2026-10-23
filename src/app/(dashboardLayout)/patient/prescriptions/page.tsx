"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, FileText, Pill, Search, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { prescriptionPreviews } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

export default function PatientPrescriptionsPage() {
  const [query, setQuery] = useState("");
  const prescriptions = useMemo(() => prescriptionPreviews.filter((item) => `${item.id} ${item.doctor} ${item.diagnosis}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return <div className={s.page}>
    <PatientPageHeader eyebrow="Clinical records" title="My prescriptions" description="View prescription summaries issued after completed consultations. Medicine details will come from the finalized clinical record." />
    <PreviewNotice />
    <section className={s.toolbar}><label className={s.search}><Search size={17} /><span className="sr-only">Search prescriptions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search doctor, diagnosis, or prescription ID" /></label></section>
    {prescriptions.length === 0 ? <PageState state="empty" title="No prescriptions match" message="Try a different doctor, diagnosis, or prescription ID." /> : <section className={s.grid}>{prescriptions.map((item) => <article className={s.card} key={item.id}>
      <div className={s.cardTop}><div className={s.avatar}><FileText size={20} /></div><StatusPill tone="success">Finalized</StatusPill></div>
      <h2 style={{ marginTop: 16 }}>{item.diagnosis}</h2><p className={s.muted}>{item.id} · Appointment {item.appointmentId}</p>
      <div className={s.divider} /><div className={s.iconLine}><Stethoscope size={16} /><strong>{item.doctor}</strong> · {item.specialty}</div><div className={s.iconLine} style={{ marginTop: 10 }}><CalendarDays size={16} />{item.issuedOn}</div><div className={s.iconLine} style={{ marginTop: 10 }}><Pill size={16} />{item.medicineCount} medicines</div>
      <div className={s.actions}><Button asChild variant="outline"><Link href={`/patient/prescriptions/${item.id}`}>View details <ChevronRight size={15} /></Link></Button><Button asChild variant="ghost"><Link href="/store">Explore store</Link></Button></div>
    </article>)}</section>}
  </div>;
}
