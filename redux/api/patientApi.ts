import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface PatientProfile {
  id?: string;
  userId?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  allergies?: string[];
  existingConditions?: string[];
  [key: string]: unknown;
}
export type UpdatePatientProfile = Pick<PatientProfile, "dateOfBirth" | "gender" | "address" | "allergies" | "existingConditions">;

export const patientApi = baseApi.injectEndpoints({ endpoints: (builder) => ({
  getPatientProfile: builder.query<ApiEnvelope<PatientProfile>, void>({ query: () => "/patients/me/profile", providesTags: ["PatientProfile"] }),
  updatePatientProfile: builder.mutation<ApiEnvelope<PatientProfile>, UpdatePatientProfile>({ query: (body) => ({ url: "/patients/me/profile", method: "PATCH", body }), invalidatesTags: ["PatientProfile", "Identity"] }),
}) });
export const { useGetPatientProfileQuery, useUpdatePatientProfileMutation } = patientApi;
