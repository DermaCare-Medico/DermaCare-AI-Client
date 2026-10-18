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

export function readIdentity(data: unknown): DoctorIdentity {
  const body = unwrap(data);
  return {
    id: typeof body.id === "string" ? body.id : undefined,
    name: typeof body.name === "string" ? body.name : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    role: typeof body.role === "string" ? body.role : undefined,
    licenseNumber:
      typeof body.licenseNumber === "string" ? body.licenseNumber : undefined,
    licenseSubmittedAt:
      typeof body.licenseSubmittedAt === "string"
        ? body.licenseSubmittedAt
        : undefined,
    status: (body.doctorVerificationStatus ??
      body.verificationStatus ??
      body.licenseStatus) as VerificationStatus | undefined,
  };
}
