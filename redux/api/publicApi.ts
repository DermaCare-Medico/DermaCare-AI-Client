import { baseApi } from "./baseApi";
import type {
  ApiEnvelope,
  DoctorProfile,
  Medicine,
} from "@/types/doctor";

/**
 * Public API service (no authentication required).
 *
 * Every endpoint maps 1:1 to a path in the backend OpenAPI contract
 * (`DermaCare-AI-Server/src/docs/endpoints/m04_discovery.ts` and
 * `m09_store.ts`). Used by the public pages: All Doctors, doctor profile and
 * the DermaCare Store catalog.
 */

export interface DoctorSearchArgs {
  search?: string;
  specialty?: string;
  screeningId?: string;
  page?: number;
  limit?: number;
}

export interface MedicineSearchArgs {
  search?: string;
  category?: string;
  requiresPrescription?: boolean;
  page?: number;
  limit?: number;
}

export const publicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /doctors — search & filter verified dermatologists. */
    getDoctors: builder.query<ApiEnvelope<unknown>, DoctorSearchArgs | void>({
      query: (args) => ({
        url: "/doctors",
        params: args ? { page: args.page, limit: args.limit } : undefined,
      }),
      providesTags: [{ type: "Doctors" as const, id: "LIST" }],
    }),

    /** GET /doctors/{id} — public verified doctor details. */
    getPublicDoctorById: builder.query<ApiEnvelope<DoctorProfile>, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Doctors" as const, id }],
    }),

    /** GET /doctors/{id}/slots — public availability inventory. */
    getPublicDoctorSlots: builder.query<
      ApiEnvelope<unknown>,
      { doctorId: string; startDate?: string; endDate?: string }
    >({
      query: ({ doctorId, ...params }) => ({
        url: `/doctors/${doctorId}/slots`,
        params,
      }),
      providesTags: (_result, _error, { doctorId }) => [
        { type: "DoctorSlots" as const, id: doctorId },
      ],
    }),

    /** GET /medicines — public medicine catalog search. */
    getStoreMedicines: builder.query<
      ApiEnvelope<unknown>,
      MedicineSearchArgs | void
    >({
      query: (args) => ({
        url: "/medicines",
        params: args
          ? {
              search: args.search,
              category: args.category,
              requiresPrescription: args.requiresPrescription,
              page: args.page,
              limit: args.limit,
            }
          : undefined,
      }),
      providesTags: [{ type: "StoreMedicines" as const, id: "LIST" }],
    }),

    /** GET /medicines/{id} — single catalog item. */
    getStoreMedicineById: builder.query<ApiEnvelope<Medicine>, string>({
      query: (id) => `/medicines/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "StoreMedicines" as const, id },
      ],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetPublicDoctorByIdQuery,
  useGetPublicDoctorSlotsQuery,
  useGetStoreMedicinesQuery,
  useGetStoreMedicineByIdQuery,
} = publicApi;
