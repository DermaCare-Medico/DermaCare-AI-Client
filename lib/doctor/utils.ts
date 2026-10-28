import type { AppointmentStatus, VerificationStatus } from "@/types/doctor";

// Re-exported for backwards compatibility; the canonical helper now lives in
// `lib/api/errors.ts` so shared/public components can use it too.
export { getApiErrorMessage } from "@/lib/api/errors";

/** Formats an ISO timestamp as e.g. "Wed, Oct 18 · 2:30 PM". */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Formats an ISO timestamp as a short time, e.g. "2:30 PM". */
export function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Formats an ISO timestamp as a date, e.g. "Oct 18, 2026". */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** True when the ISO timestamp falls on the current calendar day. */
export function isToday(iso?: string | null): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/** Formats a numeric or decimal string value as USD currency. */
export function formatCurrency(value?: number | string | null): string {
  if (value === undefined || value === null) return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

/** Formats a rating value (numeric or decimal string, e.g. "4.98") to 2 decimal places. */
export function formatRating(value?: number | string | null): string {
  if (value === undefined || value === null) return "—";
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return numeric.toFixed(2);
}

export interface StatusMeta {
  label: string;
  className: string;
}

/** Tailwind classes for each appointment status badge. */
export const appointmentStatusMeta: Record<AppointmentStatus, StatusMeta> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Confirmed", className: "bg-[#E8F5F4] text-[#0F777E]" },
  SCHEDULED: { label: "Scheduled", className: "bg-[#E8F5F4] text-[#0F777E]" },
  IN_PROGRESS: { label: "In progress", className: "bg-amber-100 text-amber-800" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
  NO_SHOW: { label: "No show", className: "bg-slate-100 text-slate-600" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-600" },
  CANCELLATION_REQUESTED: {
    label: "Cancellation requested",
    className: "bg-rose-100 text-rose-700",
  },
};

export const verificationStatusMeta: Record<VerificationStatus, StatusMeta> = {
  NOT_SUBMITTED: { label: "Not submitted", className: "bg-slate-100 text-slate-600" },
  PENDING_REVIEW: { label: "Pending review", className: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Rejected", className: "bg-rose-100 text-rose-700" },
};

/** Humanises a SCREAMING_SNAKE status into "Title case". */
export function humanizeStatus(status?: string | null): string {
  if (!status) return "—";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Normalises the doctor `qualifications` field, which the backend spec returns
 * as a single string but may also be delivered as an array.
 */
export function qualificationList(
  qualifications: string | string[] | undefined
): string[] {
  if (!qualifications) return [];
  if (Array.isArray(qualifications)) return qualifications.filter(Boolean);
  return qualifications
    .split(/;|\n/)
    .map((q) => q.trim())
    .filter(Boolean);
}
