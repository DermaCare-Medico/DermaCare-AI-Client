import { baseApi } from "./baseApi";

export type AuthRequest = Record<string, unknown>;

export type AuthResponse = {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  data?: unknown;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestRegistrationOtp: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/register/request-otp",
        method: "POST",
        body,
      }),
    }),

    resendRegistrationOtp: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/register/resend-otp",
        method: "POST",
        body,
      }),
    }),

    verifyRegistrationOtp: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/register/verify-otp",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<AuthResponse, AuthRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    googleLogin: builder.mutation<AuthResponse, AuthRequest>({
      query: (body) => ({
        url: "/auth/google",
        method: "POST",
        body,
      }),
    }),

    requestPasswordResetOtp: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/forgot-password/request-otp",
        method: "POST",
        body,
      }),
    }),

    verifyPasswordResetOtp: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/forgot-password/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/forgot-password/reset",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    refreshSession: builder.mutation<AuthResponse, AuthRequest>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<unknown, AuthRequest>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useRequestRegistrationOtpMutation,
  useResendRegistrationOtpMutation,
  useVerifyRegistrationOtpMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useRequestPasswordResetOtpMutation,
  useVerifyPasswordResetOtpMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useRefreshSessionMutation,
  useLogoutMutation,
} = authApi;