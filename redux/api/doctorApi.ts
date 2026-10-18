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
  fee?: number;
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
  items: PrescriptionItem[];
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
    /** GET /appointments — role-scoped list (doctors see their schedule). */
    getAppointments: builder.query<
      ApiEnvelope<unknown>,
      AppointmentListArgs | void
    >({
      query: (args) => ({
        url: "/appointments",
        params: args
          ? { status: args.status, page: args.page, limit: args.limit }
          : undefined,
      }),
      providesTags: [{ type: "Appointments" as const, id: "LIST" }],
    }),

    /** GET /appointments/{id} — authorized appointment details. */
    getAppointmentById: builder.query<ApiEnvelope<AppointmentDetail>, string>({
      query: (id) => `/appointments/${id}`,
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
      invalidatesTags: [{ type: "Prescriptions" as const, id: "LIST" }],
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
} = doctorApi;
