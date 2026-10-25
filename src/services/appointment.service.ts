
import { apiRequest } from "@/lib/api";

export const appointmentService = {
  create: (token: string, payload: Record<string, unknown>) =>
    apiRequest("/appointments", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getMyAppointments: (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);

    const suffix = query.size ? `?${query.toString()}` : "";

    return apiRequest(`/patients/me/appointments${suffix}`, { token });
  },

  getMyAppointment: (token: string, appointmentId: string) =>
    apiRequest(`/patients/me/appointments/${appointmentId}`, { token }),

  getDoctorAppointment: (token: string, appointmentId: string) =>
    apiRequest(`/doctors/me/appointments/${appointmentId}`, { token }),

  requestCancellation: (
    token: string,
    appointmentId: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest(`/appointments/${appointmentId}/cancellation-request`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  reviewCancellation: (
    token: string,
    appointmentId: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest(`/appointments/${appointmentId}/cancellation`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),

  cancel: (
    token: string,
    appointmentId: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
};
