"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, PreviewNotice, StatusBadge } from "../_components/AdminPreviewUI";
import { ADMIN_PREVIEW_NOTICE, adminDoctors, type AdminDoctorPreview } from "../_components/admin-preview-data";

export default function AdminDoctorsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [specialization, setSpecialization] = useState("ALL");
  const [selected, setSelected] = useState<AdminDoctorPreview | null>(null);
  const specializations = [...new Set(adminDoctors.map((doctor) => doctor.specialization))];
  const doctors = useMemo(() => adminDoctors.filter((doctor) => {
    const term = search.toLowerCase();
    return (doctor.name.toLowerCase().includes(term) || doctor.email.toLowerCase().includes(term) || doctor.licenseNumber.toLowerCase().includes(term)) && (status === "ALL" || doctor.verificationStatus === status) && (specialization === "ALL" || doctor.specialization === specialization);
  }), [search, status, specialization]);

  return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
    <AdminPageHeader eyebrow="Clinical network" title="Doctors" description="Review doctor profiles, professional details, fees, and verification status." />
    <PreviewNotice>{ADMIN_PREVIEW_NOTICE}</PreviewNotice>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Doctor filters">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
        <label className="relative"><span className="sr-only">Search doctors</span><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400"/><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or license" className="pl-9"/></label>
        <label><span className="sr-only">Verification status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="ALL">All verification states</option><option value="APPROVED">Approved</option><option value="PENDING_REVIEW">Pending review</option><option value="REJECTED">Rejected</option></select></label>
        <label><span className="sr-only">Specialization</span><select value={specialization} onChange={(event) => setSpecialization(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="ALL">All specializations</option>{specializations.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
    </section>
    {doctors.length === 0 ? <AdminEmptyState /> : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><Table><TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Specialization</TableHead><TableHead>Experience</TableHead><TableHead>Fee</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Details</TableHead></TableRow></TableHeader><TableBody>{doctors.map((doctor) => <TableRow key={doctor.id}><TableCell><p className="font-semibold text-[#163A5F]">{doctor.name}</p><p className="text-xs text-slate-500">{doctor.email}</p></TableCell><TableCell>{doctor.specialization}</TableCell><TableCell>{doctor.experienceYears} years</TableCell><TableCell>৳{doctor.fee.toLocaleString()}</TableCell><TableCell><StatusBadge value={doctor.verificationStatus}/></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setSelected(doctor)}><Eye className="size-4"/>View</Button></TableCell></TableRow>)}</TableBody></Table></section>}
    <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Doctor details</DialogTitle><DialogDescription>Professional information from sample admin data.</DialogDescription></DialogHeader>{selected && <div className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-slate-50 p-4"><div><h3 className="font-bold text-[#163A5F]">{selected.name}</h3><p className="text-sm text-slate-600">{selected.specialization}</p></div><StatusBadge value={selected.verificationStatus}/></div><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">License</dt><dd className="font-medium">{selected.licenseNumber}</dd></div><div><dt className="text-slate-500">Consultation fee</dt><dd className="font-medium">৳{selected.fee.toLocaleString()}</dd></div><div><dt className="text-slate-500">Experience</dt><dd className="font-medium">{selected.experienceYears} years</dd></div><div><dt className="text-slate-500">Submitted</dt><dd className="font-medium">{selected.submittedAt}</dd></div></dl><div><p className="text-sm text-slate-500">Qualifications</p><div className="mt-2 flex flex-wrap gap-2">{selected.qualifications.map((item) => <span key={item} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">{item}</span>)}</div></div><p className="text-xs text-slate-500">Approval actions remain in the existing Verification Queue. No changes can be made here.</p></div>}</DialogContent></Dialog>
  </main>;
}
