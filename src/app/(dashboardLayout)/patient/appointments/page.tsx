"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, CreditCard, Search, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { appointmentPreviews, type AppointmentStatus } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

const tabs: Array<"All" | AppointmentStatus> = ["All", "Pending", "Approved", "Confirmed", "Completed", "Cancelled"];
const tone = (status: AppointmentStatus) => status === "Completed" || status === "Confirmed" ? "success" : status === "Approved" ? "info" : status === "Cancelled" ? "danger" : "warning";

export default function PatientAppointmentsPage() {
  const [active, setActive] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");
  const appointments = useMemo(() => appointmentPreviews.filter((item) => (active === "All" || item.status === active) && `${item.doctor} ${item.specialty} ${item.id}`.toLowerCase().includes(query.toLowerCase())), [active, query]);

  return <div className={s.page}>
    <PatientPageHeader eyebrow="Care schedule" title="My appointments" description="Track approval, payment, and consultation readiness without leaving your patient workspace." action={<Button asChild className={s.primaryButton}><Link href="/doctors">Book a doctor</Link></Button>} />
    <PreviewNotice />
    <div className={s.toolbar}><label className={s.search}><Search size={17} /><span className="sr-only">Search appointments</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search doctor, specialty, or ID" /></label></div>
    <div className={s.toolbar} role="tablist" aria-label="Appointment status">{tabs.map((tab) => <Button key={tab} role="tab" aria-selected={active === tab} variant={active === tab ? "default" : "ghost"} className={active === tab ? s.primaryButton : undefined} onClick={() => setActive(tab)}>{tab}</Button>)}</div>
    {appointments.length === 0 ? <PageState state="empty" title="No appointments found" message="Choose another status or update your search." /> : <section className={s.grid}>{appointments.map((item) => <article className={s.card} key={item.id}>
      <div className={s.cardTop}><div className={s.doctor}><div className={s.avatar}>{item.initials}</div><div><h2>{item.doctor}</h2><p className={s.muted} style={{ margin: 3 }}>{item.specialty}</p></div></div><StatusPill tone={tone(item.status)}>{item.status}</StatusPill></div>
      <div className={s.metaGrid}><div className={s.metaItem}><span>Date</span><strong><CalendarDays size={14} style={{ display: "inline", marginRight: 6 }} />{item.date}</strong></div><div className={s.metaItem}><span>Time</span><strong><Clock3 size={14} style={{ display: "inline", marginRight: 6 }} />{item.time}</strong></div></div>
      <div className={s.divider} /><div className={s.iconLine}><CreditCard size={16} />{item.paymentStatus}</div><div className={s.iconLine} style={{ marginTop: 9 }}><Video size={16} />{item.consultationStatus}</div>
      <div className={s.actions}>{item.status === "Approved" ? <Button disabled title="Payment will be enabled after API integration">Pay now</Button> : null}<Button asChild variant="outline"><Link href={`/patient/appointments/${item.id}`}>View appointment <ChevronRight size={15} /></Link></Button></div>
    </article>)}</section>}
  </div>;
}

