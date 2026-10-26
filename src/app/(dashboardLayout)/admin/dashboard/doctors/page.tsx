"use client";

import { useMemo, useState } from "react";
import { Eye, Search, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import { useGetAdminDoctorsQuery } from "@/redux/api/adminApi";

export default function AdminDoctorsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [specialization, setSpecialization] = useState("ALL");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading, isError, refetch } = useGetAdminDoctorsQuery({
    status: status === "ALL" ? undefined : status,
  });

  const rawDoctors = data?.data ?? data;
  const doctorList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawDoctors)) {
      return rawDoctors.filter((d): d is Record<string, unknown> => typeof d === "object" && d !== null);
    }
    if (rawDoctors && typeof rawDoctors === "object") {
      const itemsProp = (rawDoctors as Record<string, unknown>).items;
      if (Array.isArray(itemsProp)) {
        return itemsProp.filter((d): d is Record<string, unknown> => typeof d === "object" && d !== null);
      }
      const docsProp = (rawDoctors as Record<string, unknown>).doctors;
      if (Array.isArray(docsProp)) {
        return docsProp.filter((d): d is Record<string, unknown> => typeof d === "object" && d !== null);
      }
    }
    return [];
  }, [rawDoctors]);

  const specializations = useMemo(() => {
    return [
      ...new Set(
        doctorList
          .map((d) => String(d.specialization ?? d.specialty ?? ""))
          .filter(Boolean),
      ),
    ];
  }, [doctorList]);

  const doctors = useMemo(() => {
    return doctorList.filter((doctor) => {
      const userObj = (typeof doctor.user === "object" && doctor.user !== null ? doctor.user : {}) as Record<string, unknown>;
      const name = String(doctor.name ?? userObj.name ?? "");
      const email = String(doctor.email ?? userObj.email ?? "");
      const license = String(doctor.licenseNumber ?? doctor.license ?? "");
      const spec = String(doctor.specialization ?? doctor.specialty ?? "");
      const docStatus = String(doctor.verificationStatus ?? doctor.status ?? "APPROVED");

      const term = search.toLowerCase();
      const matchSearch =
        name.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        license.toLowerCase().includes(term);

      const matchStatus = status === "ALL" || docStatus === status;
      const matchSpec = specialization === "ALL" || spec === specialization;

      return matchSearch && matchStatus && matchSpec;
    });
  }, [doctorList, search, status, specialization]);

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Clinical network"
        title="Doctors"
        description="Review doctor profiles, professional details, fees, and verification status."
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load doctors from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Doctor filters">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label className="relative">
            <span className="sr-only">Search doctors</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or license"
              className="pl-9"
            />
          </label>
          <label>
            <span className="sr-only">Verification status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All verification states</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_REVIEW">Pending review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Specialization</span>
            <select
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All specializations</option>
              {specializations.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading doctors directory...
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <AdminEmptyState title="No doctors found" description="Try adjusting your search or filters." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => {
                const userObj = (typeof doctor.user === "object" && doctor.user !== null ? doctor.user : {}) as Record<string, unknown>;
                const name = String(doctor.name ?? userObj.name ?? "Dr. Unknown");
                const email = String(doctor.email ?? userObj.email ?? "");
                const spec = String(doctor.specialization ?? doctor.specialty ?? "General Dermatology");
                const exp = Number(doctor.experienceYears ?? doctor.experience ?? 0);
                const fee = Number(doctor.fee ?? doctor.consultationFee ?? 0);
                const vStatus = String(doctor.verificationStatus ?? doctor.status ?? "APPROVED");

                return (
                  <TableRow key={String(doctor.id ?? doctor._id ?? email)}>
                    <TableCell>
                      <p className="font-semibold text-[#163A5F]">{name}</p>
                      <p className="text-xs text-slate-500">{email}</p>
                    </TableCell>
                    <TableCell>{spec}</TableCell>
                    <TableCell>{exp} years</TableCell>
                    <TableCell>BDT {fee.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge value={vStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(doctor)}>
                        <Eye className="size-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor details</DialogTitle>
            <DialogDescription>Professional information from clinical registry.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-slate-50 p-4">
                <div>
                  <h3 className="font-bold text-[#163A5F]">
                    {String(
                      selected.name ??
                      ((typeof selected.user === "object" && selected.user !== null)
                        ? (selected.user as Record<string, unknown>).name
                        : "") ??
                      "Doctor"
                    )}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {String(selected.specialization ?? selected.specialty ?? "Dermatology")}
                  </p>
                </div>
                <StatusBadge value={String(selected.verificationStatus ?? selected.status ?? "APPROVED")} />
              </div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">License</dt>
                  <dd className="font-medium">{String(selected.licenseNumber ?? selected.license ?? "N/A")}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Consultation fee</dt>
                  <dd className="font-medium">
                    BDT {Number(selected.fee ?? selected.consultationFee ?? 0).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Experience</dt>
                  <dd className="font-medium">{Number(selected.experienceYears ?? selected.experience ?? 0)} years</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium">
                    {String(
                      selected.email ??
                      ((typeof selected.user === "object" && selected.user !== null)
                        ? (selected.user as Record<string, unknown>).email
                        : "") ??
                      "N/A"
                    )}
                  </dd>
                </div>
              </dl>
              {Array.isArray(selected.qualifications) && selected.qualifications.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500">Qualifications</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.qualifications.map((item: unknown) => (
                      <span key={String(item)} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                        {String(item)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
