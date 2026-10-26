"use client";

import { useMemo, useState } from "react";
import { Check, Clock3, Search, ShieldCheck, X, AlertCircle, Loader2 } from "lucide-react";
import {
  useGetAdminDoctorApprovalsQuery,
  useApproveDoctorApplicationMutation,
  useRejectDoctorApplicationMutation,
} from "@/redux/api/adminApi";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Verificationque() {
  const [query, setQuery] = useState("");
  const [rejectingItem, setRejectingItem] = useState<Record<string, unknown> | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminDoctorApprovalsQuery();
  const [approveDoctor, { isLoading: isApproving }] = useApproveDoctorApplicationMutation();
  const [rejectDoctor, { isLoading: isRejecting }] = useRejectDoctorApplicationMutation();

  const rawApprovals = data?.data ?? data;
  const approvalsList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawApprovals)) {
      return rawApprovals.filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null);
    }
    if (rawApprovals && typeof rawApprovals === "object") {
      const itemsProp = (rawApprovals as Record<string, unknown>).items;
      if (Array.isArray(itemsProp)) {
        return itemsProp.filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null);
      }
      const appProp = (rawApprovals as Record<string, unknown>).approvals;
      if (Array.isArray(appProp)) {
        return appProp.filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null);
      }
    }
    return [];
  }, [rawApprovals]);

  const visibleApplications = useMemo(
    () =>
      approvalsList.filter((app) => {
        const docObj = (typeof app.doctor === "object" && app.doctor !== null ? app.doctor : {}) as Record<string, unknown>;
        const userObj = (typeof app.user === "object" && app.user !== null ? app.user : docObj.user) as Record<string, unknown> | undefined;
        const name = String(app.name ?? userObj?.name ?? "");
        const email = String(app.email ?? userObj?.email ?? "");
        const license = String(app.licenseNumber ?? app.license ?? "");
        return `${name} ${email} ${license}`
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [approvalsList, query],
  );

  const pendingCount = approvalsList.length;

  const handleApprove = async (app: Record<string, unknown>) => {
    const id = String(app.id ?? app._id);
    const docObj = (typeof app.doctor === "object" && app.doctor !== null ? app.doctor : {}) as Record<string, unknown>;
    const userObj = (typeof app.user === "object" && app.user !== null ? app.user : docObj.user) as Record<string, unknown> | undefined;
    const applicantName = String(app.name ?? userObj?.name ?? "doctor");
    try {
      await approveDoctor(id).unwrap();
      toast.success(`Application for ${applicantName} approved.`);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to approve application.");
      toast.error(message);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingItem) return;
    const id = String(rejectingItem.id ?? rejectingItem._id);
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    try {
      await rejectDoctor({ id, reason: rejectReason.trim() }).unwrap();
      toast.success("Application rejected.");
      setRejectingItem(null);
      setRejectReason("");
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to reject application.");
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0F888D]">
            Clinician onboarding
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#163A5F] sm:text-[28px]">
            Verification queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review professional credentials before clinicians join the active network.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          <Clock3 size={15} />
          {isLoading ? "..." : pendingCount} awaiting review
        </span>
      </section>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load verification queue from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Awaiting Review</p>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
            {isLoading ? "..." : pendingCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Applications pending validation</p>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Verification Source</p>
            <span className="grid size-9 place-items-center rounded-xl bg-[#E8F5F4] text-[#0F777E]">
              <ShieldCheck size={18} />
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-[#163A5F]">
            Live API
          </p>
          <p className="mt-1 text-xs text-slate-400">Connected to administrative endpoints</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold text-[#163A5F]">
              Pending Clinician Applications
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review submitted credentials, license details, and take action.
            </p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-[#0F888D]">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applications..."
              aria-label="Search verification applications"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-52"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="grid min-h-[180px] place-items-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin text-[#0F888D]" />
                Loading pending clinician applications...
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Applicant</th>
                  <th className="px-4 py-3">Specialty</th>
                  <th className="px-4 py-3">License number</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleApplications.map((app) => {
                  const docObj = (typeof app.doctor === "object" && app.doctor !== null ? app.doctor : {}) as Record<string, unknown>;
                  const userObj = (typeof app.user === "object" && app.user !== null ? app.user : docObj.user) as Record<string, unknown> | undefined;
                  const name = String(app.name ?? userObj?.name ?? "Dr. Applicant");
                  const email = String(app.email ?? userObj?.email ?? "");
                  const specialty = String(app.specialization ?? app.specialty ?? "Dermatology");
                  const license = String(app.licenseNumber ?? app.license ?? "N/A");
                  const status = String(app.status ?? "PENDING");
                  const initials = name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "DR";

                  return (
                    <tr key={String(app.id ?? app._id ?? email)} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                            {initials}
                          </span>
                          <div>
                            <p className="font-medium text-[#163A5F]">{name}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{specialty}</td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-500">{license}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={isApproving}
                            onClick={() => handleApprove(app)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#E8F5F4] px-2.5 text-xs font-semibold text-[#0F777E] transition-colors hover:bg-[#D7EEEC] disabled:opacity-50"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={isRejecting}
                            onClick={() => {
                              setRejectingItem(app);
                              setRejectReason("");
                            }}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleApplications.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No applications currently awaiting review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Reject Modal */}
      <Dialog open={Boolean(rejectingItem)} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Clinician Application</DialogTitle>
            <DialogDescription>
              Provide an official reason for rejecting the application. This reason will be logged with the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-600" htmlFor="reject-reason">
              Rejection Reason *
            </label>
            <Textarea
              id="reject-reason"
              rows={3}
              placeholder="e.g. Incomplete credentials or invalid medical registration documentation provided."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isRejecting || !rejectReason.trim()}
              onClick={handleRejectConfirm}
            >
              {isRejecting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
