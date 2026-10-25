
import { apiRequest } from "@/lib/api";

export const notificationService = {
  list: (token: string, params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    if (params?.isRead !== undefined) {
      query.set("isRead", String(params.isRead));
    }

    const suffix = query.size ? `?${query.toString()}` : "";

    return apiRequest(`/notifications${suffix}`, { token });
  },

  getUnreadCount: (token: string) =>
    apiRequest("/notifications/unread-count", { token }),

  markAsRead: (token: string, notificationId: string) =>
    apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      token,
    }),

  markAllAsRead: (token: string) =>
    apiRequest("/notifications/read-all", {
      method: "PATCH",
      token,
    }),
};
