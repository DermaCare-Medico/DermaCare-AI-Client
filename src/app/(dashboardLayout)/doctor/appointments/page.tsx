"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Clock, UserRound, X } from "lucide-react";

import { AppointmentCard } from "@/components/doctor/AppointmentCard";
import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { PageHeader } from "@/components/doctor/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appointmentStatusMeta, formatDateTime, getApiErrorMessage } from "@/lib/doctor/utils";
import { useDoctorAppointments } from "@/src/hooks/useDoctorModule";
import {
  useGetDoctorAppointmentRequestsQuery,
  useDecideAppointmentRequestMutation,
} from "@/redux/api/doctorApi";
import type { AppointmentStatus } from "@/types/doctor";
import { APPOINTMENT_STATUSES, normalizeAppointments, unwrapEnvelope } from "@/types/doctor";

type Filter = "ALL" | "REQUESTS" | AppointmentStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "REQUESTS", label: "Pending Requests" },
  ...APPOINTMENT_STATUSES.map((status) => ({
    value: status as Filter,
    label: appointmentStatusMeta[status].label,
  })),
];

export default function DoctorAppointmentsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const status = filter === "ALL" || filter === "REQUESTS" ? undefined : filter;

  const { appointments, pagination, isDemo, isLoading, isError, error, refetch } =
    useDoctorAppointments(status, page, 10);

  const {
    data: rawRequests,
    isLoading: requestsLoading,
    isError: requestsError,
    error: requestsErrorValue,
    refetch: refetchRequests,
  } = useGetDoctorAppointmentRequestsQuery();

  const [decideRequest, decideState] = useDecideAppointmentRequestMutation();

  const pendingRequests = useMemo(
    () => normalizeAppointments(unwrapEnvelope(rawRequests)),
    [rawRequests]
  );

  const handleDecision = async (appointmentId: string, action: "ACCEPT" | "REJECT") => {
    try {
      await decideRequest({
        appointmentId,
        action,
        reason: action === "ACCEPT" ? "Slot accepted by doctor." : "Doctor unavailable at this time.",
      }).unwrap();
      toast.success(action === "ACCEPT" ? "Appointment accepted." : "Appointment rejected.");
      refetchRequests();
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not process appointment request."));
    }
  };

  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
  );

  return (
    <section>
      <PageHeader
        eyebrow="Schedule"
        title="All appointments"
        description="Every booking assigned to you, grouped by consultation status."
      />

      {isDemo && <DemoNotice className="mb-6" />}

      {/* Pending requests alert section */}
      {pendingRequests.length > 0 && filter !== "REQUESTS" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-amber-900">
                You have {pendingRequests.length} pending appointment request(s)
              </h3>
              <p className="text-xs text-amber-700">
                Review and accept or reject upcoming patient bookings.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              onClick={() => setFilter("REQUESTS")}
            >
              View requests
            </Button>
          </div>
        </div>
      )}

      <div
        role="tablist"
        aria-label="Filter appointments by status"
        className="mb-6 flex flex-wrap gap-2"
      >
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            onClick={() => { setFilter(item.value); setPage(1); }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === item.value
                ? "border-[#0F888D] bg-[#0F888D] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#0F888D]/40 hover:text-[#0F888D]"
            )}
          >
            {item.label}
            {item.value === "REQUESTS" && pendingRequests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filter === "REQUESTS" ? (
        <DataState
          isLoading={requestsLoading}
          isError={requestsError}
          error={requestsErrorValue}
          isEmpty={pendingRequests.length === 0}
          emptyTitle="No pending requests"
          emptyMessage="You do not have any appointment requests awaiting review."
          onRetry={refetchRequests}
        >
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.appointmentId}
                className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <UserRound size={16} className="text-[#0F888D]" />
                    <p className="font-semibold text-[#163A5F]">{req.patientName}</p>
                  </div>
                  {req.scheduledTime && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={14} />
                      {formatDateTime(req.scheduledTime)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-[#0F888D] hover:bg-[#0C7479]"
                    disabled={decideState.isLoading}
                    onClick={() => handleDecision(req.appointmentId, "ACCEPT")}
                  >
                    <Check size={14} className="mr-1" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 hover:bg-rose-50"
                    disabled={decideState.isLoading}
                    onClick={() => handleDecision(req.appointmentId, "REJECT")}
                  >
                    <X size={14} className="mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DataState>
      ) : (
        <DataState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={sorted.length === 0}
          emptyTitle="No appointments found"
          emptyMessage="There are no appointments matching this filter."
          onRetry={refetch}
        >
          <div className="space-y-3">
            {sorted.map((appointment) => (
              <AppointmentCard
                key={appointment.appointmentId}
                appointment={appointment}
              />
            ))}
          </div>
          {(pagination?.totalPages ?? 1) > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {pagination?.page ?? page} of {pagination?.totalPages}
              </span>
              <Button variant="outline" disabled={page >= (pagination?.totalPages ?? 1) || isLoading} onClick={() => setPage((value) => value + 1)}>
                Next
              </Button>
            </div>
          )}
        </DataState>
      )}
    </section>
  );
}
