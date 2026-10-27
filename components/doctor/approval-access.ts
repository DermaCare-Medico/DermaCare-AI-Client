import type { VerificationStatus } from "@/types/doctor";

export type DoctorRouteAccess = "allow" | "deny-role" | "redirect-pending";

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
  const isNonClinicalRoute =
    pathname.startsWith("/doctor/application") ||
    pathname.startsWith("/doctor/pending-approval");

  if (isNonClinicalRoute || demoEnabled) return "allow";
  if (role !== "DOCTOR") return "deny-role";
  if (status !== "APPROVED") return "redirect-pending";
  return "allow";
}
