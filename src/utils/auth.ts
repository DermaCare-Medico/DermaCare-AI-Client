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

export function safeReturnPath(value?: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;

  try {
    const parsed = new URL(value, "https://dermacare.local");
    if (parsed.origin !== "https://dermacare.local") return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function destinationAfterLogin(role?: string | null, returnPath?: string | null) {
  const safePath = safeReturnPath(returnPath);
  const normalizedRole = role?.toUpperCase();

  if (
    safePath === "/patient/screening/new" &&
    (normalizedRole === "PATIENT" || normalizedRole === "USER")
  ) {
    return safePath;
  }

  return dashboardForRole(role);
}
