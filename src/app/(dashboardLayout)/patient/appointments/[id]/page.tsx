"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, CreditCard, ExternalLink, ShieldCheck, Stethoscope, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetPatientAppointmentQuery, useRequestAppointmentCancellationMutation, useCancelAppointmentMutation } from "@/redux/api/appointmentApi";
import { useCreateAppointmentCheckoutMutation, useGetAppointmentPaymentStatusQuery } from "@/redux/api/paymentApi";
import { PageState, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import styles from "./appointment-details.module.css";

const apiMessage = (error: unknown) => typeof error === "object" && error && "data" in error && typeof error.data === "object" && error.data && "message" in error.data && typeof error.data.message === "string" ? error.data.message : "The requested action could not be completed.";
const normalizedStatus = (value: unknown) => typeof value === "string" ? value.trim().toUpperCase() : "";
const isGoogleMeetUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "meet.google.com" && url.pathname.length > 1; }
  catch { return false; }
};

export default function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const appointmentId = decodeURIComponent(id);
  const query = useGetPatientAppointmentQuery(appointmentId, { refetchOnMountOrArgChange: true });
  const payment = useGetAppointmentPaymentStatusQuery(appointmentId, { refetchOnMountOrArgChange: true });
  const [checkout, checkoutState] = useCreateAppointmentCheckoutMutation();
  const [requestCancel, requestState] = useRequestAppointmentCancellationMutation();
  const [cancel, cancelState] = useCancelAppointmentMutation();
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");

  if (query.isLoading) return <div className={s.page}><PageState state="loading" /></div>;
  if (query.isError || !query.data?.data) return <div className={s.page}><PageState state="error" onRetry={query.refetch} /></div>;

  const item = query.data.data;
  const status = normalizedStatus(item.status) || "PENDING";
  const when = item.slot?.startTime ?? item.scheduledTime;
  const paymentData = payment.data?.data;
  const appointmentPaymentStatus = normalizedStatus(item.paymentStatus);
  const endpointPaymentStatus = normalizedStatus(paymentData?.paymentStatus ?? paymentData?.payment?.status ?? paymentData?.status);
  const isPaid = appointmentPaymentStatus === "PAID" || endpointPaymentStatus === "PAID" || paymentData?.isPaid === true;
  const paymentStatus = isPaid ? "PAID" : appointmentPaymentStatus || endpointPaymentStatus || "NOT PAID";
  const meetingStatus = normalizedStatus(item.meetingProvisioningStatus);
  const canJoin = status === "CONFIRMED" && isPaid && meetingStatus === "READY" && isGoogleMeetUrl(item.videoLink);
  const specialty = item.doctor?.specialization?.name ?? item.doctor?.specialties?.join(", ") ?? "Dermatology";
  const canCancel = !["COMPLETED", "CANCELLED"].includes(status);
  const meetingMessage = meetingStatus === "FAILED" ? "The consultation link could not be prepared. Please contact support." : meetingStatus === "READY" && !isGoogleMeetUrl(item.videoLink) ? "The meeting is ready, but no valid Google Meet link is available." : meetingStatus && meetingStatus !== "READY" ? "Your consultation link is still being prepared." : "The consultation link will appear here when it is ready.";

  const act = async (direct: boolean) => {
    if (!reason.trim()) { setNotice("Enter a cancellation reason."); return; }
    setNotice("");
    try {
      if (direct) await cancel({ id: appointmentId, reason: reason.trim() }).unwrap();
      else await requestCancel({ id: appointmentId, reason: reason.trim() }).unwrap();
      setNotice(direct ? "Appointment cancelled." : "Cancellation request submitted.");
      void query.refetch();
    } catch (error) { setNotice(apiMessage(error)); }
  };

  const pay = async () => {
    if (isPaid || checkoutState.isLoading) return;
    setNotice("");
    try {
      const response = await checkout(appointmentId).unwrap();
      const url = response.data.checkoutUrl ?? response.data.redirectUrl ?? response.data.url;
      if (!url) throw new Error("The checkout API did not return a redirect URL.");
      const destination = new URL(url);
      if (!["https:", "http:"].includes(destination.protocol)) throw new Error("The checkout API returned an invalid redirect URL.");
      window.location.assign(destination.href);
    } catch (error) { setNotice(error instanceof Error ? error.message : apiMessage(error)); }
  };

  return <div className={`${s.page} ${styles.page}`}>
    <header className={styles.header}>
      <div><Link className={styles.backLink} href="/patient/appointments"><ArrowLeft size={15} /> All appointments</Link><p className={styles.eyebrow}>Appointment {item.appointmentId ?? item.id ?? id}</p><h1>Appointment details</h1></div>
      <StatusPill tone={status === "CANCELLED" ? "danger" : status === "CONFIRMED" || status === "COMPLETED" ? "success" : "info"}>{status}</StatusPill>
    </header>

    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <section className={styles.section}><div className={styles.doctorIcon}><Stethoscope size={21} /></div><div><p className={styles.label}>Your dermatologist</p><h2>{item.doctor?.name ?? "Dermatologist"}</h2><p className={styles.secondary}>{specialty}</p></div></section>
        <section className={styles.infoGrid} aria-label="Appointment information"><div className={styles.infoItem}><CalendarDays size={18} /><div><span>Date and time</span><strong>{when ? new Date(when).toLocaleString() : "Pending"}</strong></div></div><div className={styles.infoItem}><CreditCard size={18} /><div><span>Payment status</span><strong className={isPaid ? styles.paid : undefined}>{payment.isLoading && !appointmentPaymentStatus ? "Checking..." : paymentStatus}</strong></div></div></section>
        <section className={styles.consultation}><div className={styles.sectionHeading}><div><p className={styles.label}>Online consultation</p><h3>Google Meet access</h3></div><Video size={20} /></div>{canJoin ? <div className={styles.consultationReady}><p>Your secure consultation link is ready. Join at the scheduled appointment time.</p><Button asChild size="sm"><a href={item.videoLink ?? undefined} target="_blank" rel="noopener noreferrer"><Video /> Join Google Meet <ExternalLink /></a></Button></div> : <p className={styles.secondary} role="status">{status === "CONFIRMED" && isPaid ? meetingMessage : "Meeting access becomes available after the appointment and payment are confirmed."}</p>}</section>
      </div>

      <aside className={styles.sideColumn}>
        {!isPaid && !["COMPLETED", "CANCELLED"].includes(status) ? <section className={styles.sideSection}><p className={styles.label}>Payment required</p><h3>Complete your booking</h3><p className={styles.secondary}>Pay securely to confirm your consultation.</p><Button className={styles.fullButton} disabled={checkoutState.isLoading} onClick={() => void pay()}>{checkoutState.isLoading ? "Opening checkout..." : "Pay securely"}</Button></section> : null}
        {canCancel ? <section className={styles.sideSection}><p className={styles.label}>Appointment changes</p><h3>Cancellation</h3><label className={styles.reasonLabel}>Reason<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tell us why you need to cancel" /></label><div className={styles.cancelActions}><Button variant="outline" size="sm" disabled={requestState.isLoading} onClick={() => void act(false)}>Request cancellation</Button><Button variant="destructive" size="sm" disabled={cancelState.isLoading} onClick={() => void act(true)}>Cancel directly</Button></div></section> : null}
        {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      </aside>
    </div>
  </div>;
}
