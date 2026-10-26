import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface BookAppointmentRequest { doctorId: string; slotId: string; screeningId?: string; historySharingConsent: boolean }
export interface PatientAppointment { id?: string; appointmentId?: string; status?: string; doctorId?: string; doctor?: { id?: string; name?: string; specialties?: string[] }; slot?: { startTime?: string; endTime?: string }; scheduledTime?: string; consultationFee?: number; paymentStatus?: string; cancellationReason?: string; [key: string]: unknown }
export interface AppointmentListArgs { page?: number; limit?: number; status?: string }

export const appointmentApi = baseApi.injectEndpoints({ endpoints: (builder) => ({
  bookAppointment: builder.mutation<ApiEnvelope<PatientAppointment>, BookAppointmentRequest>({ query: (body) => ({ url: "/appointments", method: "POST", body }), invalidatesTags: ["Appointments", "DoctorSlots"] }),
  getPatientAppointments: builder.query<ApiEnvelope<PatientAppointment[] | { appointments?: PatientAppointment[] }>, AppointmentListArgs | void>({ query: (params) => ({ url: "/patients/me/appointments", params: params || undefined }), providesTags: ["Appointments"] }),
  getPatientAppointment: builder.query<ApiEnvelope<PatientAppointment>, string>({ query: (id) => `/patients/me/appointments/${id}`, providesTags: (_r, _e, id) => [{ type: "Appointments", id }] }),
  requestAppointmentCancellation: builder.mutation<ApiEnvelope<PatientAppointment>, { id: string; reason: string }>({ query: ({ id, reason }) => ({ url: `/appointments/${id}/cancellation-request`, method: "POST", body: { reason } }), invalidatesTags: (_r, _e, { id }) => ["Appointments", { type: "Appointments", id }] }),
  cancelAppointment: builder.mutation<ApiEnvelope<PatientAppointment>, { id: string; reason: string }>({ query: ({ id, reason }) => ({ url: `/appointments/${id}/cancel`, method: "POST", body: { reason } }), invalidatesTags: (_r, _e, { id }) => ["Appointments", { type: "Appointments", id }] }),
}) });
export const { useBookAppointmentMutation, useGetPatientAppointmentsQuery, useGetPatientAppointmentQuery, useRequestAppointmentCancellationMutation, useCancelAppointmentMutation } = appointmentApi;
