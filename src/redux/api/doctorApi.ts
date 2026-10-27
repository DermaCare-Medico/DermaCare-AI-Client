import { baseApi } from "./baseApi";

export type DoctorQuery = {
  page?: number;
  limit?: number;
  search?: string;
  specializationId?: string;
};

export type DoctorPayload = Record<string, unknown>;

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query<unknown, DoctorQuery | void>({
      query: (params) => ({
        url: "/doctors",
        params: params ?? undefined,
      }),
      providesTags: ["Doctor"],
    }),

    getDoctorById: builder.query<unknown, string>({
      query: (doctorId) => `/doctors/${doctorId}`,
      providesTags: ["Doctor"],
    }),

    getDoctorSlots: builder.query<unknown, string>({
      query: (doctorId) => `/doctors/${doctorId}/slots`,
    }),

    getMyDoctorProfile: builder.query<unknown, void>({
      query: () => "/doctors/me/profile",
      providesTags: ["Doctor"],
    }),

    updateMyDoctorProfile: builder.mutation<unknown, DoctorPayload>({
      query: (body) => ({
        url: "/doctors/me/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Doctor"],
    }),

    submitDoctorApplication: builder.mutation<unknown, DoctorPayload>({
      query: (body) => ({
        url: "/doctors/application",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Doctor"],
    }),

    getMyDoctorSlots: builder.query<unknown, void>({
      query: () => "/doctors/me/slots",
    }),

    createDoctorSlot: builder.mutation<unknown, DoctorPayload>({
      query: (body) => ({
        url: "/doctors/me/slots",
        method: "POST",
        body,
      }),
    }),

    updateDoctorSlot: builder.mutation<
      unknown,
      { slotId: string; body: DoctorPayload }
    >({
      query: ({ slotId, body }) => ({
        url: `/doctors/me/slots/${slotId}`,
        method: "PATCH",
        body,
      }),
    }),

    deleteDoctorSlot: builder.mutation<unknown, string>({
      query: (slotId) => ({
        url: `/doctors/me/slots/${slotId}`,
        method: "DELETE",
      }),
    }),

    getDoctorAppointmentRequests: builder.query<unknown, void>({
      query: () => "/doctors/me/appointment-requests",
      providesTags: ["Appointment"],
    }),

    getDoctorAppointments: builder.query<unknown, void>({
      query: () => "/doctors/me/appointments",
      providesTags: ["Appointment"],
    }),

    decideDoctorAppointment: builder.mutation<
      unknown,
      { appointmentId: string; body: DoctorPayload }
    >({
      query: ({ appointmentId, body }) => ({
        url: `/doctors/me/appointments/${appointmentId}/decision`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),

    completeDoctorAppointment: builder.mutation<unknown, string>({
      query: (appointmentId) => ({
        url: `/doctors/me/appointments/${appointmentId}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointment"],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorSlotsQuery,
  useGetMyDoctorProfileQuery,
  useUpdateMyDoctorProfileMutation,
  useSubmitDoctorApplicationMutation,
  useGetMyDoctorSlotsQuery,
  useCreateDoctorSlotMutation,
  useUpdateDoctorSlotMutation,
  useDeleteDoctorSlotMutation,
  useGetDoctorAppointmentRequestsQuery,
  useGetDoctorAppointmentsQuery,
  useDecideDoctorAppointmentMutation,
  useCompleteDoctorAppointmentMutation,
} = doctorApi;
