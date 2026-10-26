import { baseApi } from "./baseApi";

export type RegistrationRole = "PATIENT" | "DOCTOR";
export type AuthUser = { id?: string; name?: string; email?: string; role?: string; [key: string]: unknown };
export type AuthApiResponse = { success: boolean; message?: string; data?: { accessToken?: string; refreshToken?: string; user?: AuthUser; [key: string]: unknown } };
export interface RegisterRequest { name: string; email: string; password: string; role: RegistrationRole; acceptTerms: true; acceptPrivacy: true; acceptHealthConsent: true }
export interface EmailRequest { email: string }
export interface VerifyEmailRequest extends EmailRequest { otp: string }
export interface LoginRequest { email: string; password: string }
export interface ResetPasswordRequest extends VerifyEmailRequest { newPassword: string }
export type UpdateUserRequest = Record<string, unknown>;

export const authApi = baseApi.injectEndpoints({ endpoints: (builder) => ({
  login: builder.mutation<AuthApiResponse, LoginRequest>({ query: (body) => ({ url: "/auth/login", method: "POST", body }) }),
  requestRegistrationOtp: builder.mutation<AuthApiResponse, RegisterRequest>({ query: (body) => ({ url: "/auth/register/request-otp", method: "POST", body }) }),
  verifyOtp: builder.mutation<AuthApiResponse, VerifyEmailRequest>({ query: (body) => ({ url: "/auth/register/verify-otp", method: "POST", body }) }),
  resendOtp: builder.mutation<AuthApiResponse, EmailRequest>({ query: (body) => ({ url: "/auth/register/resend-otp", method: "POST", body }) }),
  forgotPassword: builder.mutation<AuthApiResponse, EmailRequest>({ query: (body) => ({ url: "/auth/forgot-password/request-otp", method: "POST", body }) }),
  verifyForgotPasswordOtp: builder.mutation<AuthApiResponse, VerifyEmailRequest>({ query: (body) => ({ url: "/auth/forgot-password/verify-otp", method: "POST", body }) }),
  resetPassword: builder.mutation<AuthApiResponse, ResetPasswordRequest>({ query: (body) => ({ url: "/auth/forgot-password/reset", method: "POST", body }) }),
  getMe: builder.query<AuthApiResponse, void>({ query: () => "/auth/me", providesTags: ["Identity", "User"] }),
  updateUser: builder.mutation<AuthApiResponse, UpdateUserRequest>({ query: (body) => ({ url: "/users/me", method: "PATCH", body }), invalidatesTags: ["Identity", "User"] }),
  refresh: builder.mutation<AuthApiResponse, { refreshToken: string }>({ query: (body) => ({ url: "/auth/refresh", method: "POST", body }) }),
  logout: builder.mutation<AuthApiResponse, { refreshToken: string }>({ query: (body) => ({ url: "/auth/logout", method: "POST", body }), invalidatesTags: ["User", "Identity"] }),
}) });

export const { useLoginMutation, useRequestRegistrationOtpMutation, useVerifyOtpMutation, useResendOtpMutation, useForgotPasswordMutation, useVerifyForgotPasswordOtpMutation, useResetPasswordMutation, useGetMeQuery, useUpdateUserMutation, useRefreshMutation, useLogoutMutation } = authApi;
export const useRegisterMutation = useRequestRegistrationOtpMutation;
