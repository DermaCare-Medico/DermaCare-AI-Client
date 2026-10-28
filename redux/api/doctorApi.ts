import { baseApi } from "./baseApi";
import type {
  ApiEnvelope,
  AppointmentDetail,
  AppointmentStatus,
  ChatMessage,
  ConsultationTransition,
  Conversation,
  DoctorLicenseSubmission,
  DoctorProfile,
  DoctorSlot,
  PreConsultation,
  Prescription,
  PrescriptionItem,
  VideoAccess,
} from "@/types/doctor";

/**
 * Doctor Module API service.
 *
 * Every endpoint below maps 1:1 to a path defined in the backend OpenAPI
 * contract (`DermaCare-AI-Server/openapi.json`). No endpoints are invented.
 *
 * NOTE: The backend module implementations are still scaffolded (empty) as of
 * 2026-10-18, so these calls surface real errors until the server is live.
 * The UI never fakes success on a failed mutation — see data-state handling.
 */

export interface AppointmentListArgs {
  status?: AppointmentStatus;
  page?: number;
  limit?: number;
}

export interface DoctorDashboardAppointments {
  appointments: AppointmentDetail[];
  pagination: { total: number; totalPages: number };
}

export interface PrescriptionListArgs {
  status?: "DRAFT" | "FINALIZED";
  page?: number;
  limit?: number;
}

export interface MedicationListArgs {
  status?: "current" | "history";
  patientId?: string;
}

export interface SlotListArgs {
  doctorId: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateSlotArgs {
  startTime: string;
  endTime: string;
}

export interface UpdateSlotArgs {
  id: string;
  startTime?: string;
  endTime?: string;
}

export interface CreatePrescriptionArgs {
  appointmentId: string;
  diagnosis: string;
  doctorNotes?: string;
  findings?: string;
  advice?: string;
  followUp?: string;
  items: PrescriptionItem[];
}

export interface DoctorApplicationRequest {
  licenseNumber: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  bio?: string;
  specializationIds: string[];
  documentReferences: string[];
}

export interface Specialization {
  id: string;
  name: string;
  slug?: string;
}

export interface UpdateConsultationArgs {
  id: string;
  status: ConsultationTransition;
  completionSummary?: string;
}

export interface ConsultationNoteArgs {
  id: string;
  subjective: string;
  objective?: string;
  assessment: string;
  plan: string;
}

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpecializations: builder.query<Specialization[], void>({
      query: () => "/specializations",
      transformResponse: (response: ApiEnvelope<Specialization[]> | Specialization[]) =>
        Array.isArray(response) ? response : response.data,
    }),

    uploadDoctorApplicationDocument: builder.mutation<
      ApiEnvelope<{ documentReference: string }>,
      File
    >({
      query: (file) => {
        const body = new FormData();
        body.append("image", file);
        return { url: "/doctors/application/documents", method: "POST", body };
      },
    }),

    submitDoctorApplication: builder.mutation<
      ApiEnvelope<unknown>,
      DoctorApplicationRequest
    >({
      query: (body) => ({ url: "/doctors/application", method: "POST", body }),
      invalidatesTags: ["DoctorProfile", "Identity"],
    }),
    /** GET /appointments — role-scoped list (doctors see their schedule). */
    getAppointments: builder.query<
      ApiEnvelope<unknown>,
      AppointmentListArgs | void
    >({
      query: (args) => ({
        url: "/doctors/me/appointments",
        params: args
          ? {
              status: args.status,
              page: Math.max(1, args.page ?? 1),
              limit: Math.min(50, Math.max(1, args.limit ?? 10)),
            }
          : undefined,
        cache: "no-store",
      }),
      providesTags: [{ type: "Appointments" as const, id: "LIST" }],
    }),

    /** GET /appointments/{id} — authorized appointment details. */
    getAppointmentById: builder.query<ApiEnvelope<AppointmentDetail>, string>({
      query: (id) => ({
        url: `/doctors/me/appointments/${id}`,
        cache: "no-store",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Appointments" as const, id },
      ],
    }),

    /** GET /appointments/{id}/pre-consultation — consent-gated patient history. */
    getPreConsultation: builder.query<ApiEnvelope<PreConsultation>, string>({
      query: (id) => `/appointments/${id}/pre-consultation`,
      providesTags: (_result, _error, id) => [
        { type: "Appointments" as const, id: `pre-${id}` },
      ],
    }),

    /** GET /appointments/{id}/video — time-gated Jitsi access. */
    getAppointmentVideo: builder.query<ApiEnvelope<VideoAccess>, string>({
      query: (id) => `/appointments/${id}/video`,
    }),

    /** PATCH /appointments/{id}/consultation — start / complete lifecycle. */
    updateConsultation: builder.mutation<
      ApiEnvelope<AppointmentDetail>,
      UpdateConsultationArgs
    >({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}/consultation`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Appointments" as const, id },
        { type: "Appointments" as const, id: "LIST" },
      ],
    }),

    /** PUT /appointments/{id}/consultation-note — SOAP clinician notes. */
    saveConsultationNote: builder.mutation<
      ApiEnvelope<unknown>,
      ConsultationNoteArgs
    >({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}/consultation-note`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Appointments" as const, id },
      ],
    }),

    /** POST /appointments/{id}/prescriptions — create draft prescription. */
    createPrescription: builder.mutation<
      ApiEnvelope<Prescription>,
      CreatePrescriptionArgs
    >({
      query: ({ appointmentId, ...body }) => ({
        url: `/appointments/${appointmentId}/prescriptions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { appointmentId }) => [
        { type: "Prescriptions" as const, id: "LIST" },
        { type: "Appointments" as const, id: appointmentId },
        { type: "Appointments" as const, id: "LIST" },
      ],
    }),

    /** GET /prescriptions — role-scoped prescription list. */
    getPrescriptions: builder.query<
      ApiEnvelope<unknown>,
      PrescriptionListArgs | void
    >({
      query: (args) => ({
        url: "/prescriptions",
        params: args
          ? { status: args.status, page: args.page, limit: args.limit }
          : undefined,
      }),
      providesTags: [{ type: "Prescriptions" as const, id: "LIST" }],
    }),

    /** GET /prescriptions/{id} — full record with version history. */
    getPrescriptionById: builder.query<ApiEnvelope<Prescription>, string>({
      query: (id) => `/prescriptions/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Prescriptions" as const, id },
      ],
    }),

    /** PATCH /prescriptions/{id} — edit draft metadata only. */
    updatePrescription: builder.mutation<
      ApiEnvelope<Prescription>,
      { id: string; diagnosis?: string; doctorNotes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/prescriptions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Prescriptions" as const, id },
        { type: "Prescriptions" as const, id: "LIST" },
      ],
    }),

    /** PUT /prescriptions/{id}/items — atomically replace draft items. */
    replacePrescriptionItems: builder.mutation<
      ApiEnvelope<Prescription>,
      { id: string; items: PrescriptionItem[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/prescriptions/${id}/items`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Prescriptions" as const, id },
      ],
    }),

    /** POST /prescriptions/{id}/finalize — freeze immutable version. */
    finalizePrescription: builder.mutation<ApiEnvelope<Prescription>, string>({
      query: (id) => ({
        url: `/prescriptions/${id}/finalize`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Prescriptions" as const, id },
        { type: "Prescriptions" as const, id: "LIST" },
        { type: "Appointments" as const, id: "LIST" },
      ],
    }),

    /** GET /medications — derived from finalized prescriptions. */
    getMedications: builder.query<
      ApiEnvelope<unknown>,
      MedicationListArgs | void
    >({
      query: (args) => ({
        url: "/medications",
        params: args ? { status: args.status, patientId: args.patientId } : undefined,
      }),
      providesTags: ["Prescriptions"],
    }),

    /** GET /doctors/{id} — public verified doctor details. */
    getDoctorById: builder.query<ApiEnvelope<DoctorProfile>, string>({
      query: (id) => `/doctors/${id}`,
      providesTags: ["DoctorProfile"],
    }),

    /** POST /doctors/me/license — submit verification document. */
    submitDoctorLicense: builder.mutation<
      ApiEnvelope<unknown>,
      DoctorLicenseSubmission
    >({
      query: (body) => ({
        url: "/doctors/me/license",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DoctorProfile", "Identity"],
    }),

    /** GET /doctors/{id}/slots — availability inventory. */
    getDoctorSlots: builder.query<ApiEnvelope<unknown>, SlotListArgs>({
      query: ({ doctorId, ...params }) => ({
        url: `/doctors/${doctorId}/slots`,
        params,
      }),
      providesTags: [{ type: "DoctorSlots" as const, id: "LIST" }],
    }),

    /** POST /doctors/me/slots — create availability slot. */
    createDoctorSlot: builder.mutation<ApiEnvelope<DoctorSlot>, CreateSlotArgs>({
      query: (body) => ({
        url: "/doctors/me/slots",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DoctorSlots" as const, id: "LIST" }],
    }),

    /** PATCH /doctors/me/slots/{id} — modify unbooked slot. */
    updateDoctorSlot: builder.mutation<ApiEnvelope<DoctorSlot>, UpdateSlotArgs>({
      query: ({ id, ...body }) => ({
        url: `/doctors/me/slots/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "DoctorSlots" as const, id: "LIST" }],
    }),

    /** DELETE /doctors/me/slots/{id} — remove unbooked slot. */
    deleteDoctorSlot: builder.mutation<ApiEnvelope<unknown>, string>({
      query: (id) => ({
        url: `/doctors/me/slots/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DoctorSlots" as const, id: "LIST" }],
    }),

    /** GET /appointments/{id}/conversation — 7-day post-consultation chat. */
    getAppointmentConversation: builder.query<ApiEnvelope<Conversation>, string>({
      query: (id) => `/appointments/${id}/conversation`,
      providesTags: (_result, _error, id) => [
        { type: "Conversation" as const, id },
      ],
    }),

    /** GET /conversations/{id}/messages — cursor-paginated polling. */
    getConversationMessages: builder.query<
      ApiEnvelope<unknown>,
      { conversationId: string; cursor?: string; limit?: number }
    >({
      query: ({ conversationId, ...params }) => ({
        url: `/conversations/${conversationId}/messages`,
        params,
      }),
      providesTags: (_result, _error, { conversationId }) => [
        { type: "Conversation" as const, id: `messages-${conversationId}` },
      ],
    }),

    /** POST /conversations/{id}/messages — send text within the window. */
    sendConversationMessage: builder.mutation<
      ApiEnvelope<ChatMessage>,
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Conversation" as const, id: `messages-${conversationId}` },
      ],
    }),

    /** PATCH /appointments/{id}/cancellation — doctor approve/reject request. */
    reviewCancellation: builder.mutation<
      ApiEnvelope<AppointmentDetail>,
      { id: string; action: "APPROVE" | "REJECT"; reviewNotes: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}/cancellation`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Appointments" as const, id },
        { type: "Appointments" as const, id: "LIST" },
      ],
    }),

    /** GET /doctors/me/profile � doctor own profile. */
    getOwnDoctorProfile: builder.query<ApiEnvelope<DoctorProfile>, void>({
      query: () => ({ url: "/doctors/me/profile", cache: "no-store" }),
      providesTags: ["DoctorProfile"],
    }),

    /** PATCH /doctors/me/profile � update doctor own profile. */
    updateOwnDoctorProfile: builder.mutation<
      ApiEnvelope<DoctorProfile>,
      { bio?: string; consultationFee?: number; experienceYears?: number }
    >({
      query: (body) => ({
        url: "/doctors/me/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["DoctorProfile", "Identity"],
    }),

    /** GET /doctors/me/slots � list doctor's own slots. */
    getOwnDoctorSlots: builder.query<ApiEnvelope<unknown>, void>({
      query: () => ({ url: "/doctors/me/slots", cache: "no-store" }),
      providesTags: [{ type: "DoctorSlots" as const, id: "LIST" }],
    }),

    /** GET /doctors/me/appointment-requests � pending appointment requests. */
    getDoctorAppointmentRequests: builder.query<ApiEnvelope<unknown>, void>({
      query: () => ({
        url: "/doctors/me/appointment-requests",
        cache: "no-store",
      }),
      providesTags: [{ type: "Appointments" as const, id: "REQUESTS" }],
    }),

    /** GET /doctors/me/appointments � list doctor appointment history. */
    getDoctorAppointments: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/doctors/me/appointments",
        params: params
          ? {
              ...params,
              page: Math.max(1, params.page ?? 1),
              limit: Math.min(50, Math.max(1, params.limit ?? 10)),
            }
          : undefined,
        cache: "no-store",
      }),
      providesTags: [{ type: "Appointments" as const, id: "LIST" }],
    }),

    /** Loads every valid doctor-owned page for exact dashboard counters. */
    getDoctorDashboardAppointments: builder.query<DoctorDashboardAppointments, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const appointments: AppointmentDetail[] = [];
        let page = 1;
        let totalPages = 1;
        let total = 0;

        do {
          const result = await baseQuery({
            url: "/doctors/me/appointments",
            params: { page, limit: 50 },
            cache: "no-store",
          });
          if (result.error) return { error: result.error };

          const response = result.data as ApiEnvelope<AppointmentDetail[]>;
          if (Array.isArray(response?.data)) appointments.push(...response.data);
          const pagination = response?.pagination;
          total = pagination?.totalCount ?? pagination?.total ?? appointments.length;
          totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / 50));
          page += 1;
        } while (page <= totalPages);

        return { data: { appointments, pagination: { total, totalPages } } };
      },
      providesTags: [{ type: "Appointments" as const, id: "LIST" }],
    }),

    /** PATCH /doctors/me/appointments/{appointmentId}/decision � accept or reject appointment. */
    decideAppointmentRequest: builder.mutation<
      ApiEnvelope<unknown>,
      { appointmentId: string; action: "ACCEPT" | "REJECT"; reason?: string }
    >({
      query: ({ appointmentId, ...body }) => ({
        url: `/doctors/me/appointments/${appointmentId}/decision`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        { type: "Appointments" as const, id: "LIST" },
        { type: "Appointments" as const, id: "REQUESTS" },
      ],
    }),

    /** PATCH /doctors/me/appointments/{appointmentId}/complete � complete consultation. */
    completeDoctorConsultation: builder.mutation<
      ApiEnvelope<unknown>,
      string
    >({
      query: (appointmentId) => ({
        url: `/doctors/me/appointments/${appointmentId}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, appointmentId) => [
        { type: "Appointments" as const, id: appointmentId },
        { type: "Appointments" as const, id: "LIST" },
      ],
    }),

    /** GET /doctors/me/prescriptions � list doctor's prescriptions. */
    getDoctorPrescriptions: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/doctors/me/prescriptions",
        params: params || undefined,
      }),
      providesTags: [{ type: "Prescriptions" as const, id: "LIST" }],
    }),

    /** POST /prescriptions/{id}/send � send finalized prescription to patient. */
    sendPrescriptionToPatient: builder.mutation<ApiEnvelope<unknown>, string>({
      query: (id) => ({
        url: `/prescriptions/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Prescriptions" as const, id },
        { type: "Prescriptions" as const, id: "LIST" },
      ],
    }),

    /** GET /doctors/me/earnings/summary � earnings summary. */
    getDoctorEarningsSummary: builder.query<ApiEnvelope<unknown>, void>({
      query: () => "/doctors/me/earnings/summary",
      providesTags: ["Earnings"],
    }),

    /** GET /doctors/me/earnings/history � earnings history. */
    getDoctorEarningsHistory: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number; year?: number; month?: number } | void
    >({
      query: (params) => ({
        url: "/doctors/me/earnings/history",
        params: params || undefined,
      }),
      providesTags: ["Earnings"],
    }),

    /** GET /doctors/me/payouts � payout history. */
    getDoctorPayoutHistory: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/doctors/me/payouts",
        params: params || undefined,
      }),
      providesTags: ["Payouts"],
    }),

    /** POST /appointments/{id}/cancel — doctor direct cancellation. */
    cancelAppointment: builder.mutation<
      ApiEnvelope<AppointmentDetail>,
      { id: string; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/appointments/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Appointments" as const, id },
        { type: "Appointments" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSpecializationsQuery,
  useUploadDoctorApplicationDocumentMutation,
  useSubmitDoctorApplicationMutation,
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useGetPreConsultationQuery,
  useGetAppointmentVideoQuery,
  useUpdateConsultationMutation,
  useSaveConsultationNoteMutation,
  useCreatePrescriptionMutation,
  useGetPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useUpdatePrescriptionMutation,
  useReplacePrescriptionItemsMutation,
  useFinalizePrescriptionMutation,
  useGetMedicationsQuery,
  useGetDoctorByIdQuery,
  useSubmitDoctorLicenseMutation,
  useGetDoctorSlotsQuery,
  useCreateDoctorSlotMutation,
  useUpdateDoctorSlotMutation,
  useDeleteDoctorSlotMutation,
  useGetAppointmentConversationQuery,
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
  useReviewCancellationMutation,
  useCancelAppointmentMutation,
  useGetOwnDoctorProfileQuery,
  useUpdateOwnDoctorProfileMutation,
  useGetOwnDoctorSlotsQuery,
  useGetDoctorAppointmentRequestsQuery,
  useGetDoctorAppointmentsQuery,
  useGetDoctorDashboardAppointmentsQuery,
  useDecideAppointmentRequestMutation,
  useCompleteDoctorConsultationMutation,
  useGetDoctorPrescriptionsQuery,
  useSendPrescriptionToPatientMutation,
  useGetDoctorEarningsSummaryQuery,
  useGetDoctorEarningsHistoryQuery,
  useGetDoctorPayoutHistoryQuery,
} = doctorApi;
