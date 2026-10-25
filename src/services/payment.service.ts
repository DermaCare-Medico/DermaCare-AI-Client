
import { apiRequest } from "@/lib/api";

export const paymentService = {
  createAppointmentCheckout: (
    token: string,
    appointmentId: string,
  ) =>
    apiRequest(`/appointments/${appointmentId}/payments/checkout`, {
      method: "POST",
      token,
    }),

  createOrderCheckout: (token: string, orderId: string) =>
    apiRequest(`/orders/${orderId}/payments/checkout`, {
      method: "POST",
      token,
    }),

  getAppointmentPayment: (token: string, appointmentId: string) =>
    apiRequest(`/appointments/${appointmentId}/payments`, { token }),
};
