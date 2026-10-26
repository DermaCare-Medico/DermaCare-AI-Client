import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface PrescriptionListItem {
  id?: string;
  prescriptionId?: string;
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  diagnosis?: string;
  status?: string;
  createdAt?: string;
  issuedAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PrescriptionDetail {
  id?: string;
  prescriptionId?: string;
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  diagnosis?: string;
  findings?: string;
  advice?: string;
  followUp?: string;
  status?: string;
  createdAt?: string;
  issuedAt?: string;
  items?: Array<{
    id?: string;
    medicineName?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    durationDays?: number;
    instructions?: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatientPrescriptions: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/patients/me/prescriptions",
        params: params || undefined,
      }),
      providesTags: [{ type: "Prescriptions" as const, id: "PATIENT_LIST" }],
    }),

    getPatientPrescriptionById: builder.query<
      ApiEnvelope<PrescriptionDetail>,
      string
    >({
      query: (id) => `/patients/me/prescriptions/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Prescriptions" as const, id }],
    }),
  }),
});

export const {
  useGetPatientPrescriptionsQuery,
  useGetPatientPrescriptionByIdQuery,
} = prescriptionApi;
