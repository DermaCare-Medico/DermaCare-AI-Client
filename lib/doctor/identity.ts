import type { VerificationStatus } from "@/types/doctor";

/**
 * Safe, role-aware identity summary derived from `GET /auth/me`.
 * The backend returns a `{ success, data }` envelope whose `data` may be nested,
 * so this helper tolerates both `{ data: {...} }` and a bare object.
 */
export interface DoctorIdentity {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  licenseNumber?: string;
  licenseSubmittedAt?: string;
  /** Doctor verification status when the account has the DOCTOR role. */
  status?: VerificationStatus;
}

function unwrap(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const envelope = data as { data?: unknown };
  if (envelope.data && typeof envelope.data === "object") {
    return envelope.data as Record<string, unknown>;
  }
  return data as Record<string, unknown>;
}

function nestedRecord(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  }
  return {};
}

function verificationStatus(value: unknown): VerificationStatus | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === "PENDING") return "PENDING_REVIEW";
  if (["NOT_SUBMITTED", "PENDING_REVIEW", "APPROVED", "REJECTED"].includes(normalized)) {
    return normalized as VerificationStatus;
  }
  return undefined;
}

export function readIdentity(data: unknown): DoctorIdentity {
  const body = unwrap(data);
  const profile = nestedRecord(body, ["doctorProfile", "doctor_profile", "profile", "doctor"]);
  const user = nestedRecord(body, ["user"]);
  const source = { ...user, ...body, ...profile };
  return {
    id: typeof source.id === "string" ? source.id : undefined,
    name: typeof source.name === "string" ? source.name : undefined,
    email: typeof source.email === "string" ? source.email : undefined,
    role: typeof source.role === "string" ? source.role : typeof body.role === "string" ? body.role : undefined,
    licenseNumber:
      typeof source.licenseNumber === "string"
        ? source.licenseNumber
        : typeof source.license_number === "string"
          ? source.license_number
          : undefined,
    licenseSubmittedAt:
      typeof source.licenseSubmittedAt === "string"
        ? source.licenseSubmittedAt
        : typeof source.license_submitted_at === "string"
          ? source.license_submitted_at
        : undefined,
    status: verificationStatus(
      source.approvalStatus ??
      source.approval_status ??
      source.doctorVerificationStatus ??
      source.verificationStatus ??
      source.licenseStatus,
    ),
  };
}
