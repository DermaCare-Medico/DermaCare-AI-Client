import { baseApi } from "./baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAppointmentCheckout: builder.mutation<unknown, string>({
      query: (appointmentId) => ({
        url: `/appointments/${appointmentId}/payments/checkout`,
        method: "POST",
      }),
    }),

    getAppointmentPayments: builder.query<unknown, string>({
      query: (appointmentId) =>
        `/appointments/${appointmentId}/payments`,
    }),

    createOrderCheckout: builder.mutation<unknown, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/payments/checkout`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useCreateAppointmentCheckoutMutation,
  useGetAppointmentPaymentsQuery,
  useCreateOrderCheckoutMutation,
} = paymentApi;