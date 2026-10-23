"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardCheck, Pill, ShoppingBag, Stethoscope, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { prescriptionPreviews } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

export default function PrescriptionDetailsPage() {
  const params = useParams<{ id: string }>();
  const prescription = prescriptionPreviews.find((item) => item.id === decodeURIComponent(params.id));

  if (!prescription) return <div className={s.page}><PageState state="error" title="Prescription not found" message="This preview prescription is unavailable. No clinical record was changed." /><Button asChild variant="outline"><Link href="/patient/prescriptions"><ArrowLeft size={16} /> Back to prescriptions</Link></Button></div>;

  return <div className={s.page}>
    <PatientPageHeader eyebrow={`Prescription ${prescription.id}`} title="Prescription details" description="Review the finalized medicine plan and advice recorded for this consultation." action={<Button asChild variant="outline"><Link href="/patient/prescriptions"><ArrowLeft size={16} /> All prescriptions</Link></Button>} />
    <PreviewNotice />
    <div className={s.detailsLayout}>
      <div className={s.list}>
        <section className={s.panel}>
          <div className={s.rowBetween}><div><p className={s.eyebrow}>Clinical summary</p><h2>{prescription.diagnosis}</h2></div><StatusPill tone="success">{prescription.status}</StatusPill></div>
          <div className={s.metaGrid}><div className={s.metaItem}><span>Patient</span><strong><UserRound size={14} style={{ display: "inline", marginRight: 6 }} />{prescription.patientName}</strong></div><div className={s.metaItem}><span>Issued</span><strong><CalendarDays size={14} style={{ display: "inline", marginRight: 6 }} />{prescription.issuedOn}</strong></div><div className={s.metaItem}><span>Doctor</span><strong>{prescription.doctor}</strong></div><div className={s.metaItem}><span>Appointment</span><strong>{prescription.appointmentId}</strong></div></div>
        </section>
        <section className={s.panel}><div className={s.sectionTitle}><h2>Medicines</h2><p>{prescription.medicines.length} items in this finalized prescription.</p></div><div className={s.tableWrap}><table className={s.table}><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead><tbody>{prescription.medicines.map((medicine) => <tr key={medicine.name}><td><strong>{medicine.name}</strong></td><td>{medicine.dosage}</td><td>{medicine.frequency}</td><td>{medicine.duration}</td></tr>)}</tbody></table></div></section>
        <section className={s.panel}><div className={s.iconLine}><ClipboardCheck size={20} /><h2>Medical advice</h2></div><p className={s.muted}>{prescription.advice}</p></section>
      </div>
      <aside className={s.list}>
        <section className={s.panel}><div className={s.doctor}><div className={s.avatar}><Stethoscope size={20} /></div><div><h3>{prescription.doctor}</h3><p className={s.muted} style={{ margin: 3 }}>{prescription.specialty}</p></div></div></section>
        <section className={s.panel} style={{ background: "#f5fbfa" }}><div className={s.iconLine}><Pill size={19} /><strong>Need these medicines?</strong></div><p className={s.muted}>Explore the store to check availability. Prescription-only items still require backend verification before checkout.</p><div className={s.actions}><Button asChild className={s.primaryButton}><Link href="/store"><ShoppingBag size={16} /> Order medicines</Link></Button></div></section>
      </aside>
    </div>
  </div>;
}

