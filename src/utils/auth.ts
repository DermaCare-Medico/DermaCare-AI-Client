import type { AuthApiResponse } from "@/redux/api/authApi";

export function sessionFromResponse(response: AuthApiResponse) {
  const { accessToken, refreshToken, user } = response.data ?? {};
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken, user: user ?? null };
}

export function dashboardForRole(
  role?: string | null,
  doctorApplicant = false,
  verificationStatus?: string | null
) {
  const normalized = role?.toUpperCase();
  switch (normalized) {
    case "ADMIN":
      return "/admin/dashboard";
    case "DOCTOR": {
      const status = verificationStatus?.toUpperCase();
      if (status === "NOT_SUBMITTED") return "/doctor/application";
      if (status === "PENDING_REVIEW" || status === "REJECTED") return "/doctor/pending-approval";
      return "/doctor";
    }
    case "PATIENT":
      return "/patient/dashboard";
    default:
      return doctorApplicant ? "/doctor/application" : "/user";
  }
}

export function profileForRole(role?: string | null) {
  const normalized = role?.toUpperCase();
  switch (normalized) {
    case "ADMIN":
      return "/admin/dashboard/profile";
    case "DOCTOR":
      return "/doctor/profile";
    case "PATIENT":
    default:
      return "/patient/profile";
  }
}
