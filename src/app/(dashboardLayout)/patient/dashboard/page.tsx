"use client";
import Link from "next/link";
import { CalendarClock, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { getPredictionFields, useGetScreeningHistoryQuery, type ScreeningRecord } from "@/redux/api/screeningApi";
import { useGetPatientAppointmentsQuery, type PatientAppointment } from "@/redux/api/appointmentApi";
import { PageState } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { educationalResources } from "@/src/app/(dashboardLayout)/patient/mockData";
import styles from "./page.module.css";

export default function PatientDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const screeningsQuery = useGetScreeningHistoryQuery({ page: 1, limit: 3 });
  const appointmentsQuery = useGetPatientAppointmentsQuery({ page: 1, limit: 10 });
  const screeningPayload = screeningsQuery.data?.data;
  const screenings: ScreeningRecord[] = Array.isArray(screeningPayload) ? screeningPayload : screeningPayload?.screenings ?? [];
  const appointmentPayload = appointmentsQuery.data?.data;
  const appointments: PatientAppointment[] = Array.isArray(appointmentPayload) ? appointmentPayload : appointmentPayload?.appointments ?? [];
  const upcoming = appointments.find((item) => !["COMPLETED", "CANCELLED"].includes(String(item.status).toUpperCase()));
  const loading = screeningsQuery.isLoading || appointmentsQuery.isLoading;
  const failed = screeningsQuery.isError || appointmentsQuery.isError;
  return <div className={styles.page}>
    <div className={styles.topBar}><div><p className={styles.eyebrow}>Patient dashboard</p><h1>Welcome, {user?.name ?? "Patient"}</h1></div><div className={styles.topActions}><Button asChild size="lg" className={styles.primaryButton}><Link href="/patient/screening/new">Start New Screening</Link></Button></div></div>
    {loading ? <PageState state="loading" /> : failed ? <PageState state="error" onRetry={() => { void screeningsQuery.refetch(); void appointmentsQuery.refetch(); }} /> : <>
      <section className={styles.summaryGrid}><article className={styles.summaryCard}><p>Recent screenings</p><strong>{screenings.length}</strong><span>Latest records</span></article><article className={styles.summaryCard}><p>Appointments</p><strong>{appointments.length}</strong><span>Current page</span></article><article className={styles.summaryCard}><p>Upcoming</p><strong>{upcoming ? "1" : "0"}</strong><span>{upcoming?.status ? String(upcoming.status) : "None scheduled"}</span></article></section>
      <section className={styles.mainGrid}><article className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.sectionEyebrow}>Recent screenings</p><h3>Screening history</h3></div><Link href="/patient/screening/history" className={styles.inlineLink}>View all</Link></div><div className={styles.recordList}>{screenings.length === 0 ? <p>No screening records yet.</p> : screenings.map((item) => { const id = item.screeningId ?? item.id ?? ""; const prediction = getPredictionFields(item); return <div key={id} className={styles.recordCard}><div className={styles.thumbnail}>AI</div><div className={styles.recordDetails}><div className={styles.recordMetaRow}><span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Date unavailable"}</span><span className={styles.statusBadge}>{item.status ?? "Processing"}</span></div><h4>{prediction.condition}</h4><p>{item.symptoms ?? "No symptom summary returned."}</p><Link href={`/patient/screening/${encodeURIComponent(id)}`} className={styles.textButton}>View Details</Link></div></div>; })}</div></article>
      <aside className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.sectionEyebrow}>Upcoming visit</p><h3>Appointment</h3></div>{upcoming ? <span className={styles.statusBadge}>{upcoming.status ?? "Pending"}</span> : null}</div><div className={styles.appointmentCard}><div className={styles.doctorAvatar}><Stethoscope size={18} /></div><div><h4>{upcoming?.doctor?.name ?? "No upcoming appointment"}</h4><p>{upcoming?.doctor?.specialties?.join(", ") ?? "Book a dermatologist when ready."}</p></div></div><ul className={styles.appointmentMeta}><li><CalendarClock size={16} /><span>{upcoming?.slot?.startTime ?? upcoming?.scheduledTime ? new Date(upcoming.slot?.startTime ?? upcoming.scheduledTime ?? "").toLocaleString() : "Not scheduled"}</span></li></ul><Button asChild variant="outline" className={styles.appointmentButton}><Link href="/patient/appointments">View Appointments</Link></Button></aside></section>
    </>}
    <section className={styles.resourcesSection}><div className={styles.resourcesHeader}><div><p className={styles.sectionEyebrow}>Helpful resources</p><h3>Skin health tips</h3></div></div><div className={styles.resourceGrid}>{educationalResources.map((resource) => <article key={resource.title} className={styles.resourceCard}><h4>{resource.title}</h4><p>{resource.description}</p></article>)}</div></section>
  </div>;
}
