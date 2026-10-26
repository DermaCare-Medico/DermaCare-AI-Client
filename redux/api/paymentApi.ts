import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface CheckoutData {
  url?: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface PaymentStatus {
  status?: string;
  paymentStatus?: string;
  paid?: boolean;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAppointmentCheckout: builder.mutation<ApiEnvelope<CheckoutData>, string>({
      query: (id) => ({
        url: `/appointments/${id}/payments/checkout`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Payment", "Appointments"],
    }),

    getAppointmentPaymentStatus: builder.query<ApiEnvelope<PaymentStatus>, string>({
      query: (id) => `/appointments/${id}/payments`,
      providesTags: (_r, _e, id) => [{ type: "Payment", id: `appointment-${id}` }],
    }),

    createOrderCheckout: builder.mutation<ApiEnvelope<CheckoutData>, string>({
      query: (id) => ({
        url: `/orders/${id}/payments/checkout`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Payment", "Orders"],
    }),

    getOrderPaymentStatus: builder.query<ApiEnvelope<PaymentStatus>, string>({
      query: (id) => `/orders/${id}/payments`,
      providesTags: (_r, _e, id) => [{ type: "Payment", id: `order-${id}` }],
    }),
  }),
});

export const {
  useCreateAppointmentCheckoutMutation,
  useGetAppointmentPaymentStatusQuery,
  useCreateOrderCheckoutMutation,
  useGetOrderPaymentStatusQuery,
} = paymentApi;
