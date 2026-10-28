import type { VerificationStatus } from "@/types/doctor";

export type DoctorRouteAccess =
  | "allow"
  | "deny-role"
  | "redirect-pending"
  | "redirect-approved";

export function getDoctorRouteAccess({
  pathname,
  role,
  status,
  demoEnabled,
}: {
  pathname: string;
  role?: string;
  status?: VerificationStatus;
  demoEnabled: boolean;
}): DoctorRouteAccess {
  if (demoEnabled) return "allow";
  if (pathname.startsWith("/doctor/application")) {
    if (status === "APPROVED") return "redirect-approved";
    if (status === "PENDING_REVIEW") return "redirect-pending";
    return "allow";
  }
  if (pathname.startsWith("/doctor/pending-approval")) {
    return status === "APPROVED" ? "redirect-approved" : "allow";
  }
  if (role !== "DOCTOR") return "deny-role";
  if (status !== "APPROVED") return "redirect-pending";
  return "allow";
}
