
import { apiRequest } from "@/lib/api";

export const adminService = {
  // Add dashboard, user management, doctor review,
  // verification, payout and medicine-request APIs
  // using the exact routes from the backend admin.routes.ts.
  request: <T>(
    token: string,
    endpoint: string,
    options: RequestInit = {},
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      token,
    }),
};
