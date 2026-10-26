"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardCheck, Pill, ShoppingBag, Stethoscope, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { useGetPatientPrescriptionByIdQuery } from "@/redux/api/prescriptionApi";

export default function PrescriptionDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");

  const { data: rawData, isLoading, isError, refetch } = useGetPatientPrescriptionByIdQuery(id, { skip: !id });

  const apiData = (rawData as { data?: Record<string, unknown> })?.data ?? (rawData as unknown as Record<string, unknown>);
  const hasApi = Boolean(apiData && (apiData.id || apiData.prescriptionId || apiData.diagnosis));

  if (isLoading) {
    return (
      <div className={s.page}>
        <PageState state="loading" title="Loading prescription..." message="Fetching prescription details from clinical records." />
      </div>
    );
  }

  if (isError || !hasApi) {
    return (
      <div className={s.page}>
        <PageState
          state="error"
          title="Prescription not found"
          message="This prescription record is unavailable or could not be loaded."
          onRetry={() => refetch()}
          
        />
        <div style={{ marginTop: 16 }}>
          <Button asChild variant="outline">
            <Link href="/patient/prescriptions">
              <ArrowLeft size={16} /> Back to prescriptions
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const doctorObj = (apiData.doctor as Record<string, unknown>) || {};
  const patientObj = (apiData.patient as Record<string, unknown>) || {};
  const rawItems = Array.isArray(apiData.items) ? apiData.items : [];

  const prescription = {
    id: String(apiData.id || apiData.prescriptionId || id),
    diagnosis: String(apiData.diagnosis || "Consultation Diagnosis"),
    status: String(apiData.status || "Finalized"),
    patientName: String(patientObj.name || apiData.patientName || "Patient"),
    issuedOn: apiData.issuedAt || apiData.createdAt ? new Date(String(apiData.issuedAt || apiData.createdAt)).toLocaleDateString() : "Recently",
    doctor: String(doctorObj.name || apiData.doctorName || "Dr. Specialist"),
    specialty: String(doctorObj.specialty || apiData.doctorSpecialty || "Dermatology"),
    appointmentId: String(apiData.appointmentId || "N/A"),
    advice: String(apiData.advice || apiData.notes || "Follow doctor instructions carefully."),
    medicines: rawItems.map((m: Record<string, unknown>) => ({
      name: String(m.medicineName || m.name || "Medicine"),
      dosage: String(m.dosage || "As prescribed"),
      frequency: String(m.frequency || "Daily"),
      duration: String(m.duration || (m.durationDays ? `${m.durationDays} days` : "7 days")),
    })),
  };

  return (
    <div className={s.page}>
      <PatientPageHeader
        eyebrow={`Prescription ${prescription.id}`}
        title="Prescription details"
        description="Review the finalized medicine plan and advice recorded for this consultation."
        action={
          <Button asChild variant="outline">
            <Link href="/patient/prescriptions">
              <ArrowLeft size={16} /> All prescriptions
            </Link>
          </Button>
        }
      />
      <div className={s.detailsLayout}>
        <div className={s.list}>
          <section className={s.panel}>
            <div className={s.rowBetween}>
              <div>
                <p className={s.eyebrow}>Clinical summary</p>
                <h2>{prescription.diagnosis}</h2>
              </div>
              <StatusPill tone="success">{prescription.status}</StatusPill>
            </div>
            <div className={s.metaGrid}>
              <div className={s.metaItem}>
                <span>Patient</span>
                <strong>
                  <UserRound size={14} style={{ display: "inline", marginRight: 6 }} />
                  {prescription.patientName}
                </strong>
              </div>
              <div className={s.metaItem}>
                <span>Issued</span>
                <strong>
                  <CalendarDays size={14} style={{ display: "inline", marginRight: 6 }} />
                  {prescription.issuedOn}
                </strong>
              </div>
              <div className={s.metaItem}>
                <span>Doctor</span>
                <strong>{prescription.doctor}</strong>
              </div>
              <div className={s.metaItem}>
                <span>Appointment</span>
                <strong>{prescription.appointmentId}</strong>
              </div>
            </div>
          </section>
          <section className={s.panel}>
            <div className={s.sectionTitle}>
              <h2>Medicines</h2>
              <p>{prescription.medicines.length} items in this finalized prescription.</p>
            </div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.medicines.map((medicine, idx) => (
                    <tr key={`${medicine.name}-${idx}`}>
                      <td>
                        <strong>{medicine.name}</strong>
                      </td>
                      <td>{medicine.dosage}</td>
                      <td>{medicine.frequency}</td>
                      <td>{medicine.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className={s.panel}>
            <div className={s.iconLine}>
              <ClipboardCheck size={20} />
              <h2>Medical advice</h2>
            </div>
            <p className={s.muted}>{prescription.advice}</p>
          </section>
        </div>
        <aside className={s.list}>
          <section className={s.panel}>
            <div className={s.doctor}>
              <div className={s.avatar}>
                <Stethoscope size={20} />
              </div>
              <div>
                <h3>{prescription.doctor}</h3>
                <p className={s.muted} style={{ margin: 3 }}>
                  {prescription.specialty}
                </p>
              </div>
            </div>
          </section>
          <section className={s.panel} style={{ background: "#f5fbfa" }}>
            <div className={s.iconLine}>
              <Pill size={19} />
              <strong>Need these medicines?</strong>
            </div>
            <p className={s.muted}>
              Order prescribed items directly through the DermaCare pharmacy.
            </p>
            <div className={s.actions}>
              <Button asChild className={s.primaryButton}>
                <Link href="/store">
                  <ShoppingBag size={16} /> Order medicines
                </Link>
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
