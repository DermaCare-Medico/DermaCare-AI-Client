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
  const status = verificationStatus?.toUpperCase();
  if (doctorApplicant) {
    return status === "PENDING_REVIEW" || status === "REJECTED"
      ? "/doctor/pending-approval"
      : "/doctor/application";
  }
  switch (normalized) {
    case "ADMIN":
      return "/admin/dashboard";
    case "DOCTOR": {
      if (status === "NOT_SUBMITTED") return "/doctor/application";
      if (status === "PENDING_REVIEW" || status === "REJECTED") return "/doctor/pending-approval";
      return "/doctor";
    }
    case "PATIENT":
      return "/patient/dashboard";
    default:
      return "/user";
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
  const isScreeningPath =
    safePath === "/patient/screening/new" ||
    safePath === "/patient/screening/result" ||
    Boolean(safePath && /^\/patient\/screening\/[^/?#]+$/.test(safePath));
  const isDoctorApplicationPath = safePath === "/doctor/application";

  if (
    safePath &&
    isScreeningPath &&
    (normalizedRole === "PATIENT" || normalizedRole === "USER")
  ) {
    return safePath;
  }

  if (
    isDoctorApplicationPath &&
    (normalizedRole === "PATIENT" || normalizedRole === "USER")
  ) {
    return safePath;
  }

  return dashboardForRole(role);
}
