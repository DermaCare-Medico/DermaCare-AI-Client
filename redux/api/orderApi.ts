import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface OrderItem {
  medicineId: string;
  medicineName?: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  strength?: string;
  [key: string]: unknown;
}

export interface PlaceOrderRequest {
  deliveryAddress: string;
  prescriptionId?: string;
  items: Array<{
    medicineId: string;
    quantity: number;
  }>;
}

export interface PatientOrder {
  id?: string;
  orderId?: string;
  patientId?: string;
  prescriptionId?: string;
  deliveryAddress?: string;
  status?: string;
  paymentStatus?: string;
  items?: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  totalAmount?: number;
  createdAt?: string;
  estimatedDelivery?: string;
  [key: string]: unknown;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    placeOrder: builder.mutation<ApiEnvelope<PatientOrder>, PlaceOrderRequest>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Orders" as const, id: "LIST" }],
    }),

    getPatientOrders: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/patients/me/orders",
        params: params || undefined,
      }),
      providesTags: [{ type: "Orders" as const, id: "LIST" }],
    }),

    getPatientOrderById: builder.query<ApiEnvelope<PatientOrder>, string>({
      query: (id) => `/patients/me/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Orders" as const, id }],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetPatientOrdersQuery,
  useGetPatientOrderByIdQuery,
} = orderApi;
