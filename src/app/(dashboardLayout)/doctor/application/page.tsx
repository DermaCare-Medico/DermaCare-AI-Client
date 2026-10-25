"use client";

import { useState, type ChangeEvent } from "react";
import { Award, Check, FileCheck2, FileText, GraduationCap, ShieldCheck, Stethoscope } from "lucide-react";

import { PageHeader } from "@/components/doctor/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatusGuidance, type DoctorApplicationPreview } from "@/src/app/(dashboardLayout)/doctor/_components/doctor-preview-data";

const steps = ["Professional details", "Experience & fee", "Documents", "Review"];
const emptyApplication: DoctorApplicationPreview = { specialization: "", licenseNumber: "", qualifications: "", experienceYears: "", consultationFee: "", documentName: "" };

export default function DoctorApplicationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyApplication);
  const [documentMeta, setDocumentMeta] = useState<{ name: string; size: string } | null>(null);
  const update = (field: keyof DoctorApplicationPreview, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const selectDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentMeta({ name: file.name, size: `${(file.size / 1024 / 1024).toFixed(2)} MB` });
    update("documentName", file.name);
  };

  return <section className="mx-auto max-w-6xl">
    <PageHeader eyebrow="Professional onboarding" title="Doctor application" description="Prepare professional credentials for review. This UI preview does not upload or submit data." />
    <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm leading-6 text-cyan-900" role="note">Application preview only. Files stay in this browser session and the final submit control remains disabled until a secure API is connected.</div>

    <ol className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Application progress">
      {steps.map((label, index) => <li key={label} className={`flex items-center gap-3 rounded-xl border p-3 ${index === step ? "border-[#0F888D] bg-[#E8F5F4]" : index < step ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`} aria-current={index === step ? "step" : undefined}><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index <= step ? "bg-[#0F888D] text-white" : "bg-slate-100 text-slate-500"}`}>{index < step ? <Check size={15} /> : index + 1}</span><span className="text-sm font-semibold text-slate-700">{label}</span></li>)}
    </ol>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,.7fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {step === 0 && <div className="space-y-5"><div><h2 className="text-lg font-bold text-[#163A5F]">Professional identity</h2><p className="mt-1 text-sm text-slate-500">Enter the details an administrator would use to verify your medical registration.</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="specialization">Primary specialization</Label><Input id="specialization" value={form.specialization} onChange={(e) => update("specialization", e.target.value)} placeholder="e.g. Clinical Dermatology" /></div><div className="space-y-2"><Label htmlFor="license">Medical license number</Label><Input id="license" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} placeholder="e.g. BMDC-DOC-00000" /></div></div><div className="space-y-2"><Label htmlFor="qualifications">Qualifications</Label><Textarea id="qualifications" value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} placeholder="List degrees, fellowships, and relevant certifications" rows={5} /></div></div>}
        {step === 1 && <div className="space-y-5"><div><h2 className="text-lg font-bold text-[#163A5F]">Experience and consultation fee</h2><p className="mt-1 text-sm text-slate-500">Financial values are preview inputs and do not configure billing.</p></div><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="experience">Years of experience</Label><Input id="experience" inputMode="numeric" value={form.experienceYears} onChange={(e) => update("experienceYears", e.target.value)} placeholder="8" /></div><div className="space-y-2"><Label htmlFor="fee">Consultation fee (BDT)</Label><Input id="fee" inputMode="decimal" value={form.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} placeholder="1200" /></div></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">The earnings preview uses a 15% platform commission and 85% doctor net share. Actual commercial terms require an approved backend configuration.</div></div>}
        {step === 2 && <div className="space-y-5"><div><h2 className="text-lg font-bold text-[#163A5F]">Verification document</h2><p className="mt-1 text-sm text-slate-500">Choose a PDF, JPG, or PNG to preview its filename. Nothing is uploaded.</p></div><label htmlFor="license-document" className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#0F888D]"><FileText className="mb-3 text-[#0F888D]" size={30} /><span className="font-semibold text-slate-700">Choose license document</span><span className="mt-1 text-xs text-slate-500">PDF, JPG or PNG · preview only</span><input id="license-document" className="sr-only" type="file" accept=".pdf,image/jpeg,image/png" onChange={selectDocument} /></label>{documentMeta && <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex min-w-0 items-center gap-3"><FileCheck2 className="shrink-0 text-emerald-600" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-emerald-900">{documentMeta.name}</p><p className="text-xs text-emerald-700">{documentMeta.size} · local preview</p></div></div><Button type="button" variant="ghost" size="sm" onClick={() => { setDocumentMeta(null); update("documentName", ""); }}>Remove</Button></div>}</div>}
        {step === 3 && <div className="space-y-5"><div><h2 className="text-lg font-bold text-[#163A5F]">Review application</h2><p className="mt-1 text-sm text-slate-500">Confirm the preview information before a future secure submission.</p></div><dl className="grid gap-4 sm:grid-cols-2">{[["Specialization", form.specialization], ["License number", form.licenseNumber], ["Experience", form.experienceYears ? `${form.experienceYears} years` : "Not provided"], ["Consultation fee", form.consultationFee ? `BDT ${form.consultationFee}` : "Not provided"], ["Qualifications", form.qualifications], ["Document", form.documentName]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-700">{value || "Not provided"}</dd></div>)}</dl><Button className="w-full" disabled title="Secure doctor application API required"><ShieldCheck size={16} /> Submit application (API required)</Button></div>}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between"><Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Previous</Button>{step < steps.length - 1 ? <Button type="button" className="bg-[#0F888D] hover:bg-[#0C7479]" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>Continue</Button> : null}</div>
      </div>

      <aside className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-[#163A5F]">Application states</h2><div className="mt-4 space-y-4">{applicationStatusGuidance.map((item) => <div key={item.status} className="flex gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : item.status === "REJECTED" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{item.status === "APPROVED" ? <Award size={17} /> : item.status === "REJECTED" ? <FileText size={17} /> : <Stethoscope size={17} />}</span><div><h3 className="text-sm font-semibold text-slate-700">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p></div></div>)}</div></div><div className="rounded-xl border border-slate-200 bg-[#F8FBFC] p-5"><div className="flex items-center gap-2 text-[#0F888D]"><GraduationCap size={18} /><strong className="text-sm">Before submitting</strong></div><ul className="mt-3 space-y-2 pl-4 text-xs leading-5 text-slate-600"><li>Use the name shown on your medical registration.</li><li>Upload a clear, current document.</li><li>Check fee and experience details carefully.</li></ul></div></aside>
    </div>
  </section>;
}

