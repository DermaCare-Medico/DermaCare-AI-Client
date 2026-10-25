
import { apiRequest } from "@/lib/api";

export interface PrescriptionItemPayload {
  medicineId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string | number;
  instructions?: string;
}

export interface CreatePrescriptionPayload {
  findings?: string;
  diagnosis?: string;
  advice?: string;
  doctorNotes?: string;
  items?: PrescriptionItemPayload[];
}

export const prescriptionService = {
  createForAppointment: (
    token: string,
    appointmentId: string,
    payload: CreatePrescriptionPayload,
  ) =>
    apiRequest(`/appointments/${appointmentId}/prescriptions`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  update: (
    token: string,
    prescriptionId: string,
    payload: Partial<CreatePrescriptionPayload>,
  ) =>
    apiRequest(`/prescriptions/${prescriptionId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    }),

  replaceItems: (
    token: string,
    prescriptionId: string,
    items: PrescriptionItemPayload[],
  ) =>
    apiRequest(`/prescriptions/${prescriptionId}/items`, {
      method: "PUT",
      token,
      body: JSON.stringify({ items }),
    }),

  send: (token: string, prescriptionId: string) =>
    apiRequest(`/prescriptions/${prescriptionId}/send`, {
      method: "POST",
      token,
    }),

  getMyPrescriptions: (token: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const suffix = query.size ? `?${query.toString()}` : "";

    return apiRequest(`/patients/me/prescriptions${suffix}`, { token });
  },

  getMyPrescription: (token: string, prescriptionId: string) =>
    apiRequest(`/patients/me/prescriptions/${prescriptionId}`, { token }),

  getDoctorPrescriptions: (token: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const suffix = query.size ? `?${query.toString()}` : "";

    return apiRequest(`/doctors/me/prescriptions${suffix}`, { token });
  },
};
