
import { apiRequest } from "@/lib/api";

export interface CreateOrderPayload {
  deliveryAddress: string;
  prescriptionId?: string;
  items: Array<{
    medicineId: string;
    quantity: number;
  }>;
}

export const orderService = {
  create: (token: string, payload: CreateOrderPayload) =>
    apiRequest("/orders", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getMyOrders: (token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);

    const suffix = query.size ? `?${query.toString()}` : "";

    return apiRequest(`/patients/me/orders${suffix}`, { token });
  },

  getMyOrder: (token: string, orderId: string) =>
    apiRequest(`/patients/me/orders/${orderId}`, { token }),
};
