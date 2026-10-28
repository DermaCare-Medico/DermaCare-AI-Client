import { baseApi } from "@/redux/api/baseApi";

export function unwrapAdminPayload(value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  return "data" in record ? record.data : value;
}

export function adminCollection(value: unknown, keys: string[]): Record<string, unknown>[] {
  let current = unwrapAdminPayload(value);
  if (typeof current === "object" && current !== null && !Array.isArray(current)) {
    const record = current as Record<string, unknown>;
    const key = [...keys, "items", "results", "data"].find((candidate) => Array.isArray(record[candidate]));
    if (key) current = record[key];
  }
  return Array.isArray(current)
    ? current.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    : [];
}

export function adminCollectionTotal(value: unknown, fallback: number): number {
  const current = unwrapAdminPayload(value);
  if (typeof current !== "object" || current === null || Array.isArray(current)) return fallback;
  const record = current as Record<string, unknown>;
  const pagination = (record.pagination ?? record.meta) as Record<string, unknown> | undefined;
  const candidate = record.total ?? record.totalCount ?? record.count ?? pagination?.total ?? pagination?.totalCount;
  const total = Number(candidate);
  return Number.isFinite(total) && total >= 0 ? total : fallback;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface AdminUsersQuery extends PaginationParams {
  role?: string;
  status?: string;
  search?: string;
}

export interface AdminDoctorsQuery extends PaginationParams {
  status?: string;
  search?: string;
}

export interface AdminDoctorApprovalsQuery extends PaginationParams {
  search?: string;
}

export interface AdminMedicinesQuery extends PaginationParams {
  lowStock?: boolean;
  isAvailable?: boolean;
  search?: string;
}

export interface AdminOrdersQuery extends PaginationParams {
  status?: string;
}

export interface AdminAppointmentsQuery extends PaginationParams {
  status?: string;
}

export interface AdminDoctorPaymentsQuery extends PaginationParams {
  status?: string;
}

export interface AdminDoctorPaymentsSummaryQuery extends PaginationParams {
  year?: number | string;
  month?: number | string;
  doctorId?: string;
}

export interface AdminDoctorPayableQuery {
  doctorId: string;
  year?: number | string;
  month?: number | string;
}

export interface GeneratePayoutPayload {
  doctorId: string;
  year: number;
  month: number;
  notes?: string;
}

export interface AdminCancellationDecisionPayload {
  appointmentId: string;
  action: "APPROVE" | "REJECT";
  reviewNotes?: string;
}

export interface AdminForceCancelPayload {
  appointmentId: string;
  reason: string;
}

export interface AdminCreateMedicinePayload {
  name: string;
  strength?: string;
  description?: string;
  price: number;
  stockQuantity: number;
  requiresPrescription: boolean;
  dosageForm?: string;
  manufacturer?: string;
}

export interface AdminUpdateMedicinePayload {
  id: string;
  name?: string;
  strength?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  isAvailable?: boolean;
  dosageForm?: string;
  manufacturer?: string;
}

export interface AdminUpdateOrderStatusPayload {
  orderId: string;
  status: string;
  reason?: string;
}

export interface AdminUpdateUserStatusPayload {
  userId: string;
  status: "ACTIVE" | "SUSPENDED" | string;
}

export interface RejectDoctorApplicationPayload {
  id: string;
  reason: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  phone?: string;
  [key: string]: unknown;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Dashboard summary
    getAdminDashboardSummary: builder.query<Record<string, unknown>, void>({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),

    // 2. Users
    getAdminUsers: builder.query<Record<string, unknown>, AdminUsersQuery | void>({
      query: (params) => ({
        url: "/admin/users",
        params: params || undefined,
      }),
      providesTags: ["AdminUsers"],
    }),

    getAdminUserById: builder.query<Record<string, unknown>, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminUsers", id }],
    }),

    updateAdminUserStatus: builder.mutation<Record<string, unknown>, AdminUpdateUserStatusPayload>({
      query: ({ userId, status }) => ({
        url: `/admin/users/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminUsers", "AdminDashboard"],
    }),

    // 3. Doctor Approvals & Doctor Management
    getAdminDoctorApprovals: builder.query<Record<string, unknown>, AdminDoctorApprovalsQuery | void>({
      query: (params) => ({
        url: "/admin/doctor-approvals",
        params: params || undefined,
      }),
      providesTags: ["AdminDoctorApprovals"],
    }),

    approveDoctorApplication: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({
        url: `/admin/doctor-approvals/${id}/approve`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["AdminDoctorApprovals", "AdminDoctors", "AdminDashboard"],
    }),

    rejectDoctorApplication: builder.mutation<Record<string, unknown>, RejectDoctorApplicationPayload>({
      query: ({ id, reason }) => ({
        url: `/admin/doctor-approvals/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["AdminDoctorApprovals", "AdminDoctors", "AdminDashboard"],
    }),

    getAdminDoctors: builder.query<Record<string, unknown>, AdminDoctorsQuery | void>({
      query: (params) => ({
        url: "/admin/doctors",
        params: params || undefined,
      }),
      providesTags: ["AdminDoctors"],
    }),

    getAdminDoctorById: builder.query<Record<string, unknown>, string>({
      query: (id) => `/admin/doctors/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminDoctors", id }],
    }),

    // 4. Appointments oversight
    getAdminAppointments: builder.query<Record<string, unknown>, AdminAppointmentsQuery | void>({
      query: (params) => ({
        url: "/admin/appointments",
        params: params || undefined,
      }),
      providesTags: ["AdminAppointments"],
    }),

    getAdminAppointmentById: builder.query<Record<string, unknown>, string>({
      query: (id) => `/admin/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminAppointments", id }],
    }),

    adminDecideCancellation: builder.mutation<Record<string, unknown>, AdminCancellationDecisionPayload>({
      query: ({ appointmentId, action, reviewNotes }) => ({
        url: `/admin/appointments/${appointmentId}/cancellation`,
        method: "PATCH",
        body: { action, reviewNotes },
      }),
      invalidatesTags: ["AdminAppointments", "AdminDashboard"],
    }),

    adminForceCancelAppointment: builder.mutation<Record<string, unknown>, AdminForceCancelPayload>({
      query: ({ appointmentId, reason }) => ({
        url: `/admin/appointments/${appointmentId}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["AdminAppointments", "AdminDashboard"],
    }),

    adminMarkAppointmentNoShow: builder.mutation<Record<string, unknown>, string>({
      query: (appointmentId) => ({
        url: `/admin/appointments/${appointmentId}/no-show`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminAppointments", "AdminDashboard"],
    }),

    adminRetryMeetingProvisioning: builder.mutation<Record<string, unknown>, string>({
      query: (appointmentId) => ({
        url: `/admin/appointments/${appointmentId}/meeting/retry`,
        method: "POST",
      }),
      invalidatesTags: ["AdminAppointments"],
    }),

    // 5. Medicine catalog CRUD
    getAdminMedicines: builder.query<Record<string, unknown>, AdminMedicinesQuery | void>({
      query: (params) => ({
        url: "/admin/medicines",
        params: params || undefined,
      }),
      providesTags: ["AdminMedicines"],
    }),

    getAdminMedicineById: builder.query<Record<string, unknown>, string>({
      query: (id) => `/admin/medicines/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminMedicines", id }],
    }),

    createAdminMedicine: builder.mutation<Record<string, unknown>, AdminCreateMedicinePayload>({
      query: (body) => ({
        url: "/admin/medicines",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminMedicines"],
    }),

    updateAdminMedicine: builder.mutation<Record<string, unknown>, AdminUpdateMedicinePayload>({
      query: ({ id, ...body }) => ({
        url: `/admin/medicines/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminMedicines"],
    }),

    deactivateAdminMedicine: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({
        url: `/admin/medicines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminMedicines"],
    }),

    // 6. Orders
    getAdminOrders: builder.query<Record<string, unknown>, AdminOrdersQuery | void>({
      query: (params) => ({
        url: "/admin/orders",
        params: params || undefined,
      }),
      providesTags: ["AdminOrders"],
    }),

    getAdminOrderById: builder.query<Record<string, unknown>, string>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminOrders", id }],
    }),

    updateAdminOrderStatus: builder.mutation<Record<string, unknown>, AdminUpdateOrderStatusPayload>({
      query: ({ orderId, status, reason }) => ({
        url: `/admin/orders/${orderId}/status`,
        method: "PATCH",
        body: { status, reason },
      }),
      invalidatesTags: ["AdminOrders", "AdminDashboard"],
    }),

    // 7. Doctor Payments & Payouts
    getAdminDoctorPayments: builder.query<Record<string, unknown>, AdminDoctorPaymentsQuery | void>({
      query: (params) => ({
        url: "/admin/doctor-payments",
        params: params || undefined,
      }),
      providesTags: ["AdminDoctorPayments"],
    }),

    getAdminDoctorPaymentById: builder.query<Record<string, unknown>, string>({
      query: (id) => `/admin/doctor-payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "AdminDoctorPayments", id }],
    }),

    getAdminDoctorPaymentsSummary: builder.query<Record<string, unknown>, AdminDoctorPaymentsSummaryQuery | void>({
      query: (params) => ({
        url: "/admin/doctor-payments/summary",
        params: params || undefined,
      }),
      providesTags: ["AdminDoctorPayments"],
    }),

    sendAdminDoctorPayout: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({
        url: `/admin/doctor-payments/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: ["AdminDoctorPayments", "AdminDashboard"],
    }),

    getAdminDoctorPayableConsultations: builder.query<Record<string, unknown>, AdminDoctorPayableQuery>({
      query: ({ doctorId, ...params }) => ({
        url: `/admin/doctors/${doctorId}/payable`,
        params: params || undefined,
      }),
      providesTags: ["AdminDoctorPayments"],
    }),

    generateAdminDoctorPayout: builder.mutation<Record<string, unknown>, GeneratePayoutPayload>({
      query: ({ doctorId, ...body }) => ({
        url: `/admin/doctors/${doctorId}/payouts/generate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminDoctorPayments", "AdminDashboard"],
    }),

    // 8. Audit logs
    getAdminAuditLogs: builder.query<Record<string, unknown>, PaginationParams | void>({
      query: (params) => ({
        url: "/admin/audit-logs",
        params: params || undefined,
      }),
      providesTags: ["AdminAuditLogs"],
    }),

    // Current user / Admin profile
    getCurrentUserProfile: builder.query<Record<string, unknown>, void>({
      query: () => "/users/me",
      providesTags: ["Auth"],
    }),

    updateCurrentUserProfile: builder.mutation<Record<string, unknown>, UpdateUserProfilePayload>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useGetAdminDashboardSummaryQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useUpdateAdminUserStatusMutation,
  useGetAdminDoctorApprovalsQuery,
  useApproveDoctorApplicationMutation,
  useRejectDoctorApplicationMutation,
  useGetAdminDoctorsQuery,
  useGetAdminDoctorByIdQuery,
  useGetAdminAppointmentsQuery,
  useGetAdminAppointmentByIdQuery,
  useAdminDecideCancellationMutation,
  useAdminForceCancelAppointmentMutation,
  useAdminMarkAppointmentNoShowMutation,
  useAdminRetryMeetingProvisioningMutation,
  useGetAdminMedicinesQuery,
  useGetAdminMedicineByIdQuery,
  useCreateAdminMedicineMutation,
  useUpdateAdminMedicineMutation,
  useDeactivateAdminMedicineMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useUpdateAdminOrderStatusMutation,
  useGetAdminDoctorPaymentsQuery,
  useGetAdminDoctorPaymentByIdQuery,
  useGetAdminDoctorPaymentsSummaryQuery,
  useSendAdminDoctorPayoutMutation,
  useGetAdminDoctorPayableConsultationsQuery,
  useGenerateAdminDoctorPayoutMutation,
  useGetAdminAuditLogsQuery,
  useGetCurrentUserProfileQuery,
  useUpdateCurrentUserProfileMutation,
} = adminApi;

