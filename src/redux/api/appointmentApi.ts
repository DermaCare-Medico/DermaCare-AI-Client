import { baseApi } from "./baseApi";

export type AppointmentPayload = Record<string, unknown>;

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAppointment: builder.mutation<unknown, AppointmentPayload>({
      query: (body) => ({
        url: "/appointments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),

    getMyPatientAppointments: builder.query<unknown, void>({
      query: () => "/patients/me/appointments",
      providesTags: ["Appointment"],
    }),

    getPatientAppointmentById: builder.query<unknown, string>({
      query: (id) => `/patients/me/appointments/${id}`,
      providesTags: ["Appointment"],
    }),

    getDoctorAppointmentById: builder.query<unknown, string>({
      query: (id) => `/doctors/me/appointments/${id}`,
      providesTags: ["Appointment"],
    }),

    requestAppointmentCancellation: builder.mutation<
      unknown,
      { appointmentId: string; body: AppointmentPayload }
    >({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}/cancellation-request`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),

    decideAppointmentCancellation: builder.mutation<
      unknown,
      { appointmentId: string; body: AppointmentPayload }
    >({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}/cancellation`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),

    cancelAppointment: builder.mutation<
      unknown,
      { appointmentId: string; body?: AppointmentPayload }
    >({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment"],
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useGetMyPatientAppointmentsQuery,
  useGetPatientAppointmentByIdQuery,
  useGetDoctorAppointmentByIdQuery,
  useRequestAppointmentCancellationMutation,
  useDecideAppointmentCancellationMutation,
  useCancelAppointmentMutation,
} = appointmentApi;