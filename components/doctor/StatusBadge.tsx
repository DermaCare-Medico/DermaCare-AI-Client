import { cn } from "@/lib/utils";
import { appointmentStatusMeta, verificationStatusMeta } from "@/lib/doctor/utils";
import type { AppointmentStatus, VerificationStatus } from "@/types/doctor";

const fallback = { label: "Unknown", className: "bg-slate-100 text-slate-600" };

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const meta = appointmentStatusMeta[status] ?? { ...fallback, label: status };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}

export function VerificationStatusBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const meta = verificationStatusMeta[status] ?? { ...fallback, label: status };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}
