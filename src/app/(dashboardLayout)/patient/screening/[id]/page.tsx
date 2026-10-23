"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Download, FileText, ShieldAlert, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { screeningPreviews } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

export default function ScreeningResultPage() {
  const params = useParams<{ id: string }>();
  const screening = screeningPreviews.find((item) => item.id === decodeURIComponent(params.id));

  if (!screening) return <div className={s.page}><PageState state="error" title="Screening not found" message="This preview record is unavailable. Return to screening history to choose another result." /><Button asChild variant="outline"><Link href="/patient/screening/history"><ArrowLeft size={16} /> Back to history</Link></Button></div>;
  if (screening.status === "Processing") return <div className={s.page}><PatientPageHeader eyebrow="AI screening" title="Analysis in progress" description="This preview result is not ready yet." /><PageState state="loading" /></div>;

  return (
    <div className={s.page}>
      <PatientPageHeader eyebrow={`Screening ${screening.id}`} title="AI screening result" description={`Submitted for ${screening.bodyArea} on ${screening.date}.`} action={<Button asChild variant="outline"><Link href="/patient/screening/history"><ArrowLeft size={16} /> History</Link></Button>} />
      <PreviewNotice />
      {screening.redFlags.length > 0 ? <section className={s.panel} style={{ borderColor: "#f0c7c7", background: "#fff8f8" }} role="alert"><div className={s.iconLine} style={{ color: "#a13030" }}><ShieldAlert size={22} /><strong>Clinical review recommended</strong></div><p className={s.muted}>This screening includes reported warning signs. Seek timely professional advice, especially if symptoms worsen.</p><ul>{screening.redFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul></section> : null}
      <div className={s.detailsLayout}>
        <section className={s.panel}>
          <div className={s.rowBetween}><div><p className={s.eyebrow}>Top prediction</p><h2>{screening.topPrediction}</h2></div><StatusPill tone={screening.risk === "Low" ? "success" : "warning"}>{screening.risk} risk</StatusPill></div>
          <p className={s.muted}>{screening.summary}</p>
          <div className={s.divider} />
          <h3>Prediction confidence</h3>
          <div className={s.list} style={{ marginTop: 16 }}>{screening.predictions.map((prediction) => <div key={prediction.condition}><div className={s.rowBetween}><strong>{prediction.condition}</strong><span>{prediction.confidence}%</span></div><div style={{ height: 9, marginTop: 8, overflow: "hidden", borderRadius: 999, background: "#eaf0ef" }}><div style={{ width: `${prediction.confidence}%`, height: "100%", borderRadius: 999, background: "#0f888d" }} /></div></div>)}</div>
        </section>
        <aside className={s.list}>
          <section className={s.panel} style={{ background: "#f7fbfa" }}><div className={s.iconLine}><AlertTriangle size={20} /><strong>Medical disclaimer</strong></div><p className={s.muted}><strong>This is a preliminary screening, not a medical diagnosis.</strong> Confidence scores are informational and must not replace assessment by a qualified clinician.</p></section>
          <section className={s.panel}><h3>Next steps</h3><p className={s.muted}>A dermatologist can review your symptoms and decide whether treatment or further testing is appropriate.</p><div className={s.actions}><Button asChild className={s.primaryButton}><Link href="/doctors"><Stethoscope size={16} /> Find a doctor</Link></Button><Button variant="outline" disabled title="PDF generation will be connected to the screening API"><Download size={16} /> Download PDF</Button></div><p className={s.muted}><FileText size={14} style={{ display: "inline", marginRight: 6 }} />PDF download is awaiting API integration.</p></section>
        </aside>
      </div>
    </div>
  );
}

