"use client";

import { useMemo, useState } from "react";
import { Eye, Search, ShieldAlert, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import {
  useGetAdminAppointmentsQuery,
  useAdminDecideCancellationMutation,
  useAdminForceCancelAppointmentMutation,
  useAdminRetryMeetingProvisioningMutation,
  useAdminMarkAppointmentNoShowMutation,
} from "@/redux/api/adminApi";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function AdminAppointmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [cancelModal, setCancelModal] = useState<Record<string, unknown> | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminAppointmentsQuery({
    status: status === "ALL" ? undefined : status,
  });

  const [decideCancellation, { isLoading: isDeciding }] = useAdminDecideCancellationMutation();
  const [forceCancel, { isLoading: isCanceling }] = useAdminForceCancelAppointmentMutation();
  const [retryMeeting, { isLoading: isRetrying }] = useAdminRetryMeetingProvisioningMutation();
  const [markNoShow, { isLoading: isMarkingNoShow }] = useAdminMarkAppointmentNoShowMutation();

  const rawAppointments = data?.data ?? data;
  const appointmentList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawAppointments)) {
      return rawAppointments.filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null);
    }
    if (rawAppointments && typeof rawAppointments === "object") {
      const itemsProp = (rawAppointments as Record<string, unknown>).items;
      if (Array.isArray(itemsProp)) {
        return itemsProp.filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null);
      }
      const aptsProp = (rawAppointments as Record<string, unknown>).appointments;
      if (Array.isArray(aptsProp)) {
        return aptsProp.filter((it): it is Record<string, unknown> => typeof it === "object" && it !== null);
      }
    }
    return [];
  }, [rawAppointments]);

  const appointments = useMemo(() => {
    return appointmentList.filter((apt) => {
      const id = String(apt.id ?? apt._id ?? "");
      const docObj = (typeof apt.doctor === "object" && apt.doctor !== null ? apt.doctor : {}) as Record<string, unknown>;
      const docUser = (typeof docObj.user === "object" && docObj.user !== null ? docObj.user : {}) as Record<string, unknown>;
      const docName = String(docUser.name ?? apt.doctorName ?? docObj.name ?? "");

      const patObj = (typeof apt.patient === "object" && apt.patient !== null ? apt.patient : {}) as Record<string, unknown>;
      const patUser = (typeof patObj.user === "object" && patObj.user !== null ? patObj.user : {}) as Record<string, unknown>;
      const patName = String(patUser.name ?? apt.patientName ?? patObj.name ?? "");

      const aptStatus = String(apt.status ?? "CONFIRMED");

      const term = search.toLowerCase();
      const matchSearch = `${id} ${docName} ${patName}`.toLowerCase().includes(term);
      const matchStatus = status === "ALL" || aptStatus === status;

      return matchSearch && matchStatus;
    });
  }, [appointmentList, search, status]);

  const handleCancellationDecision = async (aptId: string, action: "APPROVE" | "REJECT") => {
    try {
      await decideCancellation({
        appointmentId: aptId,
        action,
        reviewNotes: `Cancellation ${action.toLowerCase()}d by admin.`,
      }).unwrap();
      toast.success(`Cancellation request ${action.toLowerCase()}d.`);
      setSelected(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to submit decision.");
      toast.error(message);
    }
  };

  const handleForceCancel = async () => {
    if (!cancelModal) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for force cancellation.");
      return;
    }
    const aptId = String(cancelModal.id ?? cancelModal._id);
    try {
      await forceCancel({
        appointmentId: aptId,
        reason: cancelReason.trim(),
      }).unwrap();
      toast.success("Appointment cancelled by admin override.");
      setCancelModal(null);
      setCancelReason("");
      setSelected(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to cancel appointment.");
      toast.error(message);
    }
  };

  const handleRetryMeeting = async (aptId: string) => {
    try {
      await retryMeeting(aptId).unwrap();
      toast.success("Meeting link provisioning retried successfully.");
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to retry meeting link.");
      toast.error(message);
    }
  };

  const handleMarkNoShow = async (aptId: string) => {
    try {
      await markNoShow(aptId).unwrap();
      toast.success("Appointment marked as no-show.");
      setSelected(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to update status.");
      toast.error(message);
    }
  };

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Care operations"
        title="Appointments"
        description="Monitor consultations, payment readiness, meeting links, and cancellation requests."
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load appointments from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative">
            <span className="sr-only">Search appointments</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search ID, doctor, or patient"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Appointment status</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              {["PENDING", "APPROVED", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].map((item) => (
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
            Loading appointments oversight...
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <AdminEmptyState title="No appointments found" description="Try adjusting your search or filters." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment</TableHead>
                <TableHead>Doctor / Patient</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => {
                const id = String(appointment.id ?? appointment._id ?? "APT");
                const docObj = (typeof appointment.doctor === "object" && appointment.doctor !== null ? appointment.doctor : {}) as Record<string, unknown>;
                const docUser = (typeof docObj.user === "object" && docObj.user !== null ? docObj.user : {}) as Record<string, unknown>;
                const docName = String(docUser.name ?? appointment.doctorName ?? "Doctor");

                const patObj = (typeof appointment.patient === "object" && appointment.patient !== null ? appointment.patient : {}) as Record<string, unknown>;
                const patUser = (typeof patObj.user === "object" && patObj.user !== null ? patObj.user : {}) as Record<string, unknown>;
                const patName = String(patUser.name ?? appointment.patientName ?? "Patient");

                const scheduleDate = String(appointment.date ?? appointment.appointmentDate ?? "N/A");
                const scheduleTime = String(appointment.startTime ?? appointment.time ?? "");
                const pStatus = String(appointment.paymentStatus ?? (appointment.isPaid ? "PAID" : "PENDING"));
                const aptStatus = String(appointment.status ?? "CONFIRMED");

                const cancObj = typeof appointment.cancellation === "object" && appointment.cancellation !== null ? (appointment.cancellation as Record<string, unknown>) : undefined;
                const hasCancellationReq = Boolean(
                  appointment.cancellationRequested ||
                  cancObj?.requestedBy ||
                  appointment.cancellationReason
                );

                return (
                  <TableRow key={id}>
                    <TableCell className="font-semibold text-[#163A5F]">
                      {id}
                      {hasCancellationReq && (
                        <span
                          className="ml-2 inline-block size-2 rounded-full bg-amber-500"
                          title="Cancellation review pending"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{docName}</p>
                      <p className="text-xs text-slate-500">{patName}</p>
                    </TableCell>
                    <TableCell>
                      <p>{scheduleDate}</p>
                      {scheduleTime && <p className="text-xs text-slate-500">{scheduleTime}</p>}
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={pStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={aptStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(appointment)}>
                        <Eye className="size-4" /> Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Appointment Detail & Actions Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{String(selected?.id ?? selected?._id ?? "Appointment details")}</DialogTitle>
            <DialogDescription>Consultation and administrative controls.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={String(selected.status ?? "CONFIRMED")} />
                <StatusBadge value={String(selected.paymentStatus ?? (selected.isPaid ? "PAID" : "PENDING"))} />
              </div>
              <dl className="grid gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Doctor</dt>
                  <dd className="font-semibold">
                    {String(
                      ((typeof selected.doctor === "object" && selected.doctor !== null)
                        ? ((selected.doctor as Record<string, unknown>).user as Record<string, unknown> | undefined)?.name
                        : "") ??
                      selected.doctorName ??
                      "Doctor"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Patient</dt>
                  <dd className="font-semibold">
                    {String(
                      ((typeof selected.patient === "object" && selected.patient !== null)
                        ? ((selected.patient as Record<string, unknown>).user as Record<string, unknown> | undefined)?.name
                        : "") ??
                      selected.patientName ??
                      "Patient"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Schedule</dt>
                  <dd>
                    {String(selected.date ?? selected.appointmentDate ?? "N/A")}{" "}
                    {String(selected.startTime ?? selected.time ?? "")}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Fee</dt>
                  <dd>BDT {Number(selected.fee ?? selected.amount ?? 0).toLocaleString()}</dd>
                </div>
                {Boolean(selected.reason) && (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Reason / Concern</dt>
                    <dd>{String(selected.reason)}</dd>
                  </div>
                )}
                {Boolean(selected.meetingLink) && (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Meeting Link</dt>
                    <dd>
                      <a
                        href={String(selected.meetingLink)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0F888D] underline"
                      >
                        {String(selected.meetingLink)}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Cancellation decision section */}
              {Boolean(selected.cancellationReason || selected.cancellationRequested) && (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <ShieldAlert className="size-5 shrink-0 text-amber-700" />
                    <div>
                      <h3 className="font-semibold text-amber-950">Cancellation review requested</h3>
                      <p className="mt-1 text-sm text-amber-800">
                        Reason: {String(selected.cancellationReason ?? "Requested by user.")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={isDeciding}
                      onClick={() => handleCancellationDecision(String(selected.id ?? selected._id), "APPROVE")}
                    >
                      Approve cancellation & refund
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeciding}
                      onClick={() => handleCancellationDecision(String(selected.id ?? selected._id), "REJECT")}
                    >
                      Reject cancellation
                    </Button>
                  </div>
                </section>
              )}

              {/* Administrative Actions */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Admin Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isRetrying}
                    onClick={() => handleRetryMeeting(String(selected.id ?? selected._id))}
                  >
                    Retry Meeting Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isMarkingNoShow || selected.status === "NO_SHOW"}
                    onClick={() => handleMarkNoShow(String(selected.id ?? selected._id))}
                  >
                    Mark No-Show
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={selected.status === "CANCELLED"}
                    onClick={() => setCancelModal(selected)}
                  >
                    Force Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Force Cancel Dialog */}
      <Dialog open={Boolean(cancelModal)} onOpenChange={(open) => !open && setCancelModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Force Cancel Appointment</DialogTitle>
            <DialogDescription>
              Cancel this appointment via administrative override. Please enter the reason for the record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-slate-600" htmlFor="force-cancel-reason">
              Cancellation Reason *
            </label>
            <Textarea
              id="force-cancel-reason"
              rows={3}
              placeholder="e.g. Administrative override cancellation due to clinical emergency."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setCancelModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isCanceling || !cancelReason.trim()}
              onClick={handleForceCancel}
            >
              {isCanceling ? "Cancelling..." : "Confirm Force Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
