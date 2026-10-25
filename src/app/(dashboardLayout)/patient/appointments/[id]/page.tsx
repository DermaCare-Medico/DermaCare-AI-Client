"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock3, CreditCard, ShieldCheck, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { appointmentPreviews } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

const steps = ["Request sent", "Doctor decision", "Payment", "Consultation"];
const progress: Record<string, number> = { Pending: 1, Approved: 2, Confirmed: 3, Completed: 4, Cancelled: 1 };

export default function AppointmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const appointment = appointmentPreviews.find((item) => item.id === decodeURIComponent(params.id));
  if (!appointment) return <div className={s.page}><PageState state="error" title="Appointment not found" message="This preview appointment is unavailable." /><Button asChild variant="outline"><Link href="/patient/appointments"><ArrowLeft size={16} /> Back to appointments</Link></Button></div>;

  return <div className={s.page}>
    <PatientPageHeader eyebrow={`Appointment ${appointment.id}`} title="Appointment details" description="Review your booking status, consultation readiness, and available next steps." action={<Button asChild variant="outline"><Link href="/patient/appointments"><ArrowLeft size={16} /> All appointments</Link></Button>} />
    <PreviewNotice />
    <div className={s.detailsLayout}>
      <div className={s.list}>
        <section className={s.panel}><div className={s.rowBetween}><div className={s.doctor}><div className={s.avatar}>{appointment.initials}</div><div><h2>{appointment.doctor}</h2><p className={s.muted} style={{ margin: 3 }}>{appointment.specialty}</p></div></div><StatusPill tone={appointment.status === "Cancelled" ? "danger" : appointment.status === "Pending" ? "warning" : "success"}>{appointment.status}</StatusPill></div><div className={s.metaGrid}><div className={s.metaItem}><span>Date</span><strong>{appointment.date}</strong></div><div className={s.metaItem}><span>Time</span><strong>{appointment.time}</strong></div><div className={s.metaItem}><span>Consultation</span><strong>{appointment.meetingType}</strong></div><div className={s.metaItem}><span>Fee</span><strong>{appointment.fee}</strong></div></div></section>
        <section className={s.panel}><div className={s.sectionTitle}><h2>Status timeline</h2><p>Progress shown from typed preview data.</p></div><div className={s.list}>{steps.map((step, index) => { const complete = index < progress[appointment.status]; return <div className={s.iconLine} key={step} style={{ padding: 12, borderRadius: 12, background: complete ? "#edf9f5" : "#f7f9f9", color: complete ? "#176649" : "#718184" }}><span className={s.avatar} style={{ width: 30, height: 30, borderRadius: 10 }}>{complete ? <Check size={15} /> : index + 1}</span><strong>{step}</strong></div>; })}</div></section>
      </div>
      <aside className={s.list}>
        <section className={s.panel}><h3>Appointment information</h3><div className={s.list} style={{ marginTop: 16 }}><div className={s.iconLine}><CalendarDays size={17} />{appointment.date}</div><div className={s.iconLine}><Clock3 size={17} />{appointment.time}</div><div className={s.iconLine}><CreditCard size={17} />{appointment.paymentStatus}</div><div className={s.iconLine}><Video size={17} />{appointment.consultationStatus}</div></div></section>
        <section className={s.panel}><h3>Available actions</h3><p className={s.muted}>{appointment.status === "Approved" ? "Payment will become available when the payment integration is connected." : appointment.status === "Confirmed" ? "The secure consultation link will be provided by the backend near the appointment time." : appointment.status === "Cancelled" ? appointment.cancellationNote : "No action is required right now."}</p><div className={s.actions}>{appointment.status === "Approved" ? <Button disabled>Pay securely</Button> : null}{appointment.status === "Confirmed" ? <Button disabled><Video size={16} /> Join consultation</Button> : null}{appointment.status !== "Completed" && appointment.status !== "Cancelled" ? <Button variant="outline" disabled>Request cancellation</Button> : null}</div></section>
        <section className={s.panel} style={{ background: "#f7fbfa" }}><div className={s.iconLine}><ShieldCheck size={18} /><strong>Private care workspace</strong></div><p className={s.muted}>Consultation and payment actions shown here are inactive until their secure APIs are integrated.</p></section>
      </aside>
    </div>
  </div>;
}

