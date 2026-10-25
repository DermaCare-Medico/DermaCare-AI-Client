
import { apiRequest } from "@/lib/api";

export const doctorService = {
  list: (params?: {
    page?: number;
    limit?: number;
    specialization?: string;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.specialization) {
      query.set("specialization", params.specialization);
    }

    const suffix = query.size ? `?${query.toString()}` : "";
    return apiRequest(`/doctors${suffix}`);
  },

  getById: (doctorId: string) =>
    apiRequest(`/doctors/${doctorId}`),

  getAvailableSlots: (doctorId: string, params?: {
    date?: string;
  }) => {
    const query = new URLSearchParams();

    if (params?.date) query.set("date", params.date);

    const suffix = query.size ? `?${query.toString()}` : "";
    return apiRequest(`/doctors/${doctorId}/slots${suffix}`);
  },

  getMyProfile: (token: string) =>
    apiRequest("/doctors/me/profile", { token }),

  updateMyProfile: (
    token: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest("/doctors/me/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),

  submitApplication: (
    token: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest("/doctors/application", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  uploadApplicationDocument: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("document", file);

    return apiRequest("/doctors/application/documents", {
      method: "POST",
      token,
      body: formData,
    });
  },

  getMySlots: (token: string) =>
    apiRequest("/doctors/me/slots", { token }),

  createSlot: (token: string, payload: Record<string, unknown>) =>
    apiRequest("/doctors/me/slots", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  updateSlot: (
    token: string,
    slotId: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest(`/doctors/me/slots/${slotId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),

  deleteSlot: (token: string, slotId: string) =>
    apiRequest(`/doctors/me/slots/${slotId}`, {
      method: "DELETE",
      token,
    }),

  getAppointmentRequests: (token: string) =>
    apiRequest("/doctors/me/appointment-requests", { token }),

  getMyAppointments: (token: string) =>
    apiRequest("/doctors/me/appointments", { token }),

  decideAppointment: (
    token: string,
    appointmentId: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest(`/doctors/me/appointments/${appointmentId}/decision`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),

  completeConsultation: (
    token: string,
    appointmentId: string,
    payload: Record<string, unknown> = {},
  ) =>
    apiRequest(`/doctors/me/appointments/${appointmentId}/complete`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),

  getEarningsSummary: (token: string) =>
    apiRequest("/doctors/me/earnings/summary", { token }),

  getEarningsHistory: (token: string) =>
    apiRequest("/doctors/me/earnings/history", { token }),

  getMyPayouts: (token: string) =>
    apiRequest("/doctors/me/payouts", { token }),
};
