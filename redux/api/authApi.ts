/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from "./baseApi";

export type RegistrationRole = "PATIENT" | "DOCTOR" | "PHARMACY";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: RegistrationRole;
  termsAccepted: true;
  privacyConsent: true;
  marketingUpdates: boolean;
  consentAcceptedAt: string;
}

export interface EmailRequest {
  email: string;
}

export interface VerifyEmailRequest extends EmailRequest {
  otp: string;
}

export interface AuthApiResponse {
  message?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: any) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation<AuthApiResponse, RegisterRequest>({
      query: (credentials: any) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    socialAuth: builder.mutation({
      query: (credentials: any) => ({
        url: "/auth/social-login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (email: any) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"],
    }),
    resendOtp: builder.mutation<AuthApiResponse, EmailRequest>({
      query: (email: any) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: email,
      }),
    }),
    verifyOtp: builder.mutation<AuthApiResponse, VerifyEmailRequest>({
      query: (data: any) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: any) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data: any) => ({
        url: "/auth/change-password",
        method: "PUT",
        body: data,
      }),
    }),
    getMe: builder.query({
      query: () => ({
        // OpenAPI: GET /auth/me — role-aware identity + verification status.
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Identity", "User"],
    }),
    updateUser: builder.mutation({
      query: (data: any) => ({
        // OpenAPI: PATCH /users/me/profile
        url: "/users/me/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "Identity"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocialAuthMutation,
  useForgotPasswordMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateUserMutation,
} = authApi;
