import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface NotificationItem {
  id: string;
  userId?: string;
  type?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  link?: string;
  href?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnreadNotificationCount: builder.query<ApiEnvelope<UnreadCountResponse>, void>({
      query: () => "/notifications/unread-count",
      providesTags: [{ type: "Notifications" as const, id: "UNREAD_COUNT" }],
    }),

    listNotifications: builder.query<
      ApiEnvelope<unknown>,
      { page?: number; limit?: number; isRead?: boolean } | void
    >({
      query: (params) => ({
        url: "/notifications/",
        params: params || undefined,
      }),
      providesTags: [{ type: "Notifications" as const, id: "LIST" }],
    }),

    markAllNotificationsAsRead: builder.mutation<
      ApiEnvelope<{ updatedCount?: number }>,
      void
    >({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notifications" as const, id: "LIST" },
        { type: "Notifications" as const, id: "UNREAD_COUNT" },
      ],
    }),

    markSingleNotificationAsRead: builder.mutation<
      ApiEnvelope<unknown>,
      string
    >({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notifications" as const, id: "LIST" },
        { type: "Notifications" as const, id: "UNREAD_COUNT" },
      ],
    }),
  }),
});

export const {
  useGetUnreadNotificationCountQuery,
  useListNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkSingleNotificationAsReadMutation,
} = notificationApi;
