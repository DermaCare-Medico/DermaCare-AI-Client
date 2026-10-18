"use client";

import { useState } from "react";

import { AppointmentCard } from "@/components/doctor/AppointmentCard";
import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { PageHeader } from "@/components/doctor/PageHeader";
import { cn } from "@/lib/utils";
import { appointmentStatusMeta } from "@/lib/doctor/utils";
import { useDoctorAppointments } from "@/src/hooks/useDoctorModule";
import type { AppointmentStatus } from "@/types/doctor";
import { APPOINTMENT_STATUSES } from "@/types/doctor";

type Filter = "ALL" | AppointmentStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "ALL", label: "All" },
  ...APPOINTMENT_STATUSES.map((status) => ({
    value: status as Filter,
    label: appointmentStatusMeta[status].label,
  })),
];

export default function DoctorAppointmentsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const status = filter === "ALL" ? undefined : filter;

  const { appointments, isDemo, isLoading, isError, error, refetch } =
    useDoctorAppointments(status);

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
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === item.value
                ? "border-[#0F888D] bg-[#0F888D] text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#0F888D]/40 hover:text-[#0F888D]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

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
      </DataState>
    </section>
  );
}
