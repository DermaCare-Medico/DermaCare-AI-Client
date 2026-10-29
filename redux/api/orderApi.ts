import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface CartItemDto {
  id: string;
  medicineId: string;
  name: string;
  strength?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockQuantity: number;
  requiresPrescription: boolean;
  prescriptionId?: string | null;
  prescriptionVerified: boolean;
}

export interface CartDto {
  cartId: string;
  items: CartItemDto[];
  subtotal: number;
  shipping: number;
  total: number;
  eligibleForCheckout: boolean;
}

export interface AddToCartArgs {
  medicineId: string;
  quantity: number;
  prescriptionId?: string;
}

export interface UpdateCartItemArgs {
  id: string;
  quantity: number;
}

export interface ShippingAddressDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PlaceOrderArgs {
  fromCart?: boolean;
  shippingAddress: ShippingAddressDto;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  prescriptionId?: string;
  items?: Array<{
    medicineId: string;
    quantity: number;
  }>;
  idempotencyKey?: string;
}

export interface OrderItemRecord {
  id?: string;
  inventoryId?: string;
  medicineId?: string;
  medicineName?: string;
  medicineStrength?: string | null;
  name?: string;
  quantity: number;
  unitPrice?: number | string;
  subtotal?: number | string;
  totalPrice?: number | string;
  strength?: string;
  [key: string]: unknown;
}

export interface PatientOrder {
  id: string;
  orderId?: string;
  patientId?: string;
  prescriptionId?: string | null;
  deliveryAddress: string;
  status: string;
  paymentStatus?: string;
  isPaid?: boolean;
  items?: OrderItemRecord[];
  subtotal?: number;
  deliveryFee?: number;
  totalAmount?: number | string;
  total?: number | string;
  createdAt?: string;
  paymentExpiresAt?: string;
  [key: string]: unknown;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Cart Endpoints
    getCart: builder.query<ApiEnvelope<CartDto>, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<ApiEnvelope<{ cartItemId: string; quantity: number }>, AddToCartArgs>({
      query: (body) => ({
        url: "/cart/items",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItemQuantity: builder.mutation<ApiEnvelope<{ cartItemId: string; quantity: number }>, UpdateCartItemArgs>({
      query: ({ id, quantity }) => ({
        url: `/cart/items/${id}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<ApiEnvelope<{ message: string }>, string>({
      query: (id) => ({
        url: `/cart/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Order Endpoints
    placeOrder: builder.mutation<ApiEnvelope<PatientOrder>, PlaceOrderArgs>({
      query: ({ idempotencyKey, ...body }) => ({
        url: "/orders",
        method: "POST",
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        body,
      }),
      invalidatesTags: ["Cart", { type: "Orders" as const, id: "LIST" }],
    }),

    getPatientOrders: builder.query<
      ApiEnvelope<PatientOrder[]>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/orders",
        params: params || undefined,
      }),
      providesTags: [{ type: "Orders" as const, id: "LIST" }],
    }),

    getPatientOrderById: builder.query<ApiEnvelope<PatientOrder>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Orders" as const, id }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemQuantityMutation,
  useRemoveCartItemMutation,
  usePlaceOrderMutation,
  useGetPatientOrdersQuery,
  useGetPatientOrderByIdQuery,
} = orderApi;
