import { baseApi } from "./baseApi";

export type NotificationQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
};

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<unknown, NotificationQuery | void>({
      query: (params) => ({
        url: "/notifications",
        params:
          params === undefined
            ? undefined
            : {
                ...params,
                isRead:
                  params.isRead === undefined
                    ? undefined
                    : String(params.isRead),
              },
      }),
      providesTags: ["Notification"],
    }),

    getUnreadNotificationCount: builder.query<unknown, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notification"],
    }),

    markNotificationRead: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    markAllNotificationsRead: builder.mutation<unknown, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;