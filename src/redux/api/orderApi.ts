import { baseApi } from "./baseApi";

export type CreateOrderPayload = {
  deliveryAddress: string;
  prescriptionId?: string;
  items: Array<{
    medicineId: string;
    quantity: number;
  }>;
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<unknown, CreateOrderPayload>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    getMyOrders: builder.query<unknown, void>({
      query: () => "/patients/me/orders",
      providesTags: ["Order"],
    }),

    getMyOrderById: builder.query<unknown, string>({
      query: (orderId) => `/patients/me/orders/${orderId}`,
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderByIdQuery,
} = orderApi;