import Link from "next/link";
import { CalendarClock, ChevronRight, UserRound } from "lucide-react";

import { AppointmentStatusBadge } from "@/components/doctor/StatusBadge";
import { formatDateTime } from "@/lib/doctor/utils";
import type { AppointmentSummary } from "@/types/doctor";

function shortId(id?: string): string {
  if (!id) return "Unknown patient";
  return id.length > 14 ? `${id.slice(0, 10)}…` : id;
}

export function AppointmentCard({
  appointment,
  patientName,
}: {
  appointment: AppointmentSummary;
  patientName?: string;
}) {
  const displayName =
    patientName || appointment.patientName || shortId(appointment.patientId);

  return (
    <Link
      href={`/doctor/appointments/${appointment.appointmentId}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-[#0F888D]/40 hover:bg-[#F8FCFC]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-[#0F888D]" />
            <p className="truncate font-semibold text-[#163A5F]">
              {displayName}
            </p>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <CalendarClock size={14} />
            {formatDateTime(appointment.scheduledTime)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AppointmentStatusBadge status={appointment.status} />
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    </Link>
  );
}
