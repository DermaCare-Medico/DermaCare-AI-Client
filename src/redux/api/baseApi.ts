import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000/api/v1";

type AuthState = {
  auth?: {
    token?: string | null;
  };
};

export const baseApi = createApi({
  reducerPath: "baseApi",

  baseQuery: fetchBaseQuery({
    baseUrl,

    prepareHeaders: (headers, { getState }) => {
      const state = getState() as AuthState;
      const token = state.auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "Doctor",
    "Screening",
    "Appointment",
    "Prescription",
    "Order",
    "Notification",
    "Medicine",
    "AdminDashboard",
    "AdminUsers",
    "AdminDoctors",
    "AdminDoctorApprovals",
    "AdminAppointments",
    "AdminMedicines",
    "AdminOrders",
    "AdminDoctorPayments",
    "AdminAuditLogs",
  ],

  endpoints: () => ({}),
});
