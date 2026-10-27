"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, FileCheck2, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/doctor/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitDoctorApplicationMutation, useUploadDoctorApplicationDocumentMutation } from "@/redux/api/doctorApi";
import { clearDoctorOnboarding, getDoctorOnboarding } from "@/src/utils/doctorOnboarding";

const steps = ["Professional details", "Experience & fee", "Documents", "Review"];
type ApplicationForm = { specializationIds: string; licenseNumber: string; qualifications: string; experienceYears: string; consultationFee: string; bio: string };
const emptyApplication: ApplicationForm = { specializationIds: "", licenseNumber: "", qualifications: "", experienceYears: "", consultationFee: "", bio: "" };

function errorMessage(error: unknown) {
  if (typeof error === "object" && error) {
    if ("status" in error && error.status === 409) return "A doctor application has already been submitted.";
    if ("status" in error && error.status === 400) {
      const data = "data" in error ? error.data : undefined;
      if (typeof data === "object" && data && "message" in data && typeof data.message === "string") return data.message;
      return "The application details are invalid. Please review them and try again.";
    }
  }
  if (typeof error === "object" && error && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data && "message" in data && typeof data.message === "string") return data.message;
  }
  return "The application could not be submitted. Please review the details and try again.";
}

export default function DoctorApplicationPage() {
  const router = useRouter();
  const onboarding = getDoctorOnboarding();
  const hasResumableDraft = Boolean(onboarding);
  const hasRetainedDocuments = Boolean(onboarding?.documents.length);
  const [step, setStep] = useState(hasRetainedDocuments ? 3 : hasResumableDraft ? 2 : 0);
  const [form, setForm] = useState<ApplicationForm>(() => onboarding ? {
    specializationIds: onboarding.specializationIds,
    licenseNumber: onboarding.licenseNumber,
    qualifications: onboarding.qualifications,
    experienceYears: onboarding.experienceYears,
    consultationFee: onboarding.consultationFee,
    bio: onboarding.bio,
  } : emptyApplication);
  const [documents, setDocuments] = useState<File[]>(() => onboarding?.documents ?? []);
  const [notice, setNotice] = useState(
    hasResumableDraft && !hasRetainedDocuments
      ? "Your application details were restored, but browser security prevents restoring document files. Please reselect your document to resume."
      : "",
  );
  const [success, setSuccess] = useState(false);
  const submitting = useRef(false);
  const uploadedReferences = useRef<string[]>([]);
  const [uploadDocument, { isLoading: isUploading }] = useUploadDoctorApplicationDocumentMutation();
  const [submitApplication, { isLoading: isSubmitting }] = useSubmitDoctorApplicationMutation();
  const busy = isUploading || isSubmitting;
  const update = (field: keyof ApplicationForm, value: string) => { setForm((current) => ({ ...current, [field]: value })); setNotice(""); };

  const selectDocument = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setNotice("Upload a JPG or PNG image no larger than 10 MB.");
      event.target.value = "";
      return;
    }
    uploadedReferences.current = [];
    setDocuments([file]);
    setNotice("");
  };

  const validate = () => {
    const experienceYears = Number(form.experienceYears);
    const consultationFee = Number(form.consultationFee);
    if (!form.specializationIds.trim() || !form.licenseNumber.trim() || !form.qualifications.trim()) return "Complete all required professional fields.";
    if (!form.experienceYears.trim() || !form.consultationFee.trim()) return "Enter your experience and consultation fee.";
    if (!Number.isInteger(experienceYears) || experienceYears < 0) return "Enter valid years of experience.";
    if (!Number.isFinite(consultationFee) || consultationFee < 0) return "Enter a valid consultation fee.";
    if (documents.length === 0) return "Select a JPG or PNG license image.";
    return "";
  };

  const handleSubmit = async () => {
    if (submitting.current || busy) return;
    const validationError = validate();
    if (validationError) { setNotice(validationError); return; }
    submitting.current = true;
    setNotice("");
    try {
      for (const document of documents.slice(uploadedReferences.current.length)) {
        const upload = await uploadDocument(document).unwrap();
        const documentReference = upload.data?.documentReference;
        if (!documentReference) throw new Error("The document upload did not return a reference.");
        uploadedReferences.current.push(documentReference);
      }
      const bio = form.bio.trim();
      await submitApplication({
        licenseNumber: form.licenseNumber.trim(),
        qualifications: form.qualifications.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
        ...(bio ? { bio } : {}),
        specializationIds: form.specializationIds.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
        documentReferences: [...uploadedReferences.current],
      }).unwrap();
      setSuccess(true);
      setNotice("Pending Admin Review. Your doctor application was submitted successfully.");
      clearDoctorOnboarding();
      router.replace("/doctor/pending-approval");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : errorMessage(error));
    } finally {
      submitting.current = false;
    }
  };

  useEffect(() => {
    if (hasRetainedDocuments) void handleSubmit();
    // The in-memory handoff is consumed once on arrival from OTP verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <section className="mx-auto max-w-6xl">
    <PageHeader eyebrow="Professional onboarding" title="Doctor application" description="Upload your license and submit the exact details required for administrator review." />
    <ol className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Application progress">
      {steps.map((label, index) => <li key={label} className={`flex items-center gap-3 rounded-xl border p-3 ${index === step ? "border-[#0F888D] bg-[#E8F5F4]" : index < step ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`} aria-current={index === step ? "step" : undefined}><span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${index <= step ? "bg-[#0F888D] text-white" : "bg-slate-100 text-slate-500"}`}>{index < step ? <Check size={15} /> : index + 1}</span><span className="text-sm font-semibold text-slate-700">{label}</span></li>)}
    </ol>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {step === 0 && <div className="space-y-5"><h2 className="text-lg font-bold text-[#163A5F]">Professional identity</h2><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="specializations">Specialization ID(s)</Label><Input id="specializations" value={form.specializationIds} onChange={(e) => update("specializationIds", e.target.value)} placeholder="Comma-separated IDs supplied by the clinic" /><p className="text-xs text-slate-500">The API requires specialization IDs; names are not accepted.</p></div><div className="space-y-2"><Label htmlFor="license">Medical license number</Label><Input id="license" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} /></div></div><div className="space-y-2"><Label htmlFor="qualifications">Qualifications</Label><Textarea id="qualifications" value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} placeholder="MBBS, FCPS (Dermatology)" rows={4} /></div><div className="space-y-2"><Label htmlFor="bio">Professional biography</Label><Textarea id="bio" value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} /></div></div>}
      {step === 1 && <div className="space-y-5"><h2 className="text-lg font-bold text-[#163A5F]">Experience and consultation fee</h2><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="experience">Years of experience</Label><Input id="experience" type="number" min="0" value={form.experienceYears} onChange={(e) => update("experienceYears", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="fee">Consultation fee</Label><Input id="fee" type="number" min="0" step="0.01" value={form.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} /></div></div></div>}
      {step === 2 && <div className="space-y-5"><div><h2 className="text-lg font-bold text-[#163A5F]">Verification documents</h2><p className="mt-1 text-sm text-slate-500">Each document is uploaded as a JPG or PNG image in the multipart field <code>image</code>, up to 10 MB.</p></div><label htmlFor="license-document" className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center"><FileText className="mb-3 text-[#0F888D]" size={30} /><span className="font-semibold text-slate-700">Choose license image</span><span className="mt-1 text-xs text-slate-500">JPG or PNG · max 10 MB</span><input id="license-document" className="sr-only" type="file" accept="image/jpeg,image/png" onChange={selectDocument} /></label>{documents.length > 0 && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4"><span className="flex min-w-0 items-center gap-3"><FileCheck2 className="shrink-0 text-emerald-600" /><span className="truncate text-sm font-semibold text-emerald-900">{documents.map((file) => file.name).join(", ")}</span></span><Button type="button" variant="ghost" size="sm" onClick={() => { uploadedReferences.current = []; setDocuments([]); }}>Remove</Button></div>}</div>}
      {step === 3 && <div className="space-y-5"><h2 className="text-lg font-bold text-[#163A5F]">Review application</h2><dl className="grid gap-4 sm:grid-cols-2">{[["Specialization IDs", form.specializationIds], ["License number", form.licenseNumber], ["Experience", form.experienceYears], ["Consultation fee", form.consultationFee], ["Qualifications", form.qualifications], ["Documents", documents.map((file) => file.name).join(", ") || "Not provided"]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-700">{value || "Not provided"}</dd></div>)}</dl><Button className="w-full" disabled={busy || success} onClick={handleSubmit}><ShieldCheck size={16} />{busy ? "Submitting application..." : success ? "Application submitted" : "Submit application"}</Button></div>}
      {notice && <p className={`mt-5 rounded-lg border px-4 py-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`} role={success ? "status" : "alert"}>{notice}</p>}
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between"><Button type="button" variant="outline" disabled={step === 0 || busy} onClick={() => setStep((value) => value - 1)}>Previous</Button>{step < steps.length - 1 && <Button type="button" className="bg-[#0F888D] hover:bg-[#0C7479]" disabled={busy} onClick={() => setStep((value) => value + 1)}>Continue</Button>}</div>
    </div>
  </section>;
}
