import type { ApiErrorEnvelope } from "@/types/doctor";

interface RtkErrorLike {
  status?: number | string;
  data?: unknown;
  error?: string;
}

/**
 * Extracts a human-readable message from an RTK Query error.
 * The backend error envelope is `{ success: false, error: { code, message } }`.
 *
 * Shared by every module (doctor + public) so error copy stays consistent.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!error || typeof error !== "object") return fallback;
  const rtk = error as RtkErrorLike;
  const data = rtk.data;
  if (data && typeof data === "object") {
    const envelope = data as Partial<ApiErrorEnvelope> & { message?: string };
    if (envelope.error?.message) return envelope.error.message;
    if (typeof envelope.message === "string") return envelope.message;
  }
  if (typeof data === "string" && data.trim()) {
    const trimmed = data.trim();
    // A raw HTML document means the request never reached the JSON API
    // (typically a `NEXT_PUBLIC_BASE_URL` pointing at the frontend origin).
    if (trimmed.startsWith("<")) {
      return "The API returned an HTML page instead of JSON. Check that NEXT_PUBLIC_BASE_URL points to the backend API (including /api/v1).";
    }
    return trimmed;
  }
  if (typeof rtk.error === "string" && rtk.error.trim()) return rtk.error;
  if (rtk.status === "FETCH_ERROR") {
    return "Could not reach the server. Please check your connection.";
  }
  if (rtk.status === "PARSING_ERROR") {
    return "The server returned an unexpected response format. Please try again.";
  }
  if (rtk.status === 401) return "Your session has expired. Please sign in again.";
  if (rtk.status === 403) return "You are not authorized to perform this action.";
  return fallback;
}
