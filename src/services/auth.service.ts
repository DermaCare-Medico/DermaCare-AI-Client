
import { apiRequest } from "@/lib/api";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "PATIENT" | "DOCTOR";
  acceptTerms: true;
  acceptPrivacy: true;
  acceptHealthConsent: true;
  consentVersion?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  requestRegistrationOtp: (payload: RegisterPayload) =>
    apiRequest("/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendRegistrationOtp: (payload: { email: string }) =>
    apiRequest("/auth/register/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyRegistrationOtp: (payload: { email: string; otp: string }) =>
    apiRequest("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  googleLogin: (payload: Record<string, unknown>) =>
    apiRequest("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: (token: string) =>
    apiRequest("/auth/me", { token }),

  requestPasswordResetOtp: (payload: { email: string }) =>
    apiRequest("/auth/forgot-password/request-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyPasswordResetOtp: (payload: { email: string; otp: string }) =>
    apiRequest("/auth/forgot-password/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }) =>
    apiRequest("/auth/forgot-password/reset", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  refresh: (payload: Record<string, unknown>) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: (payload: Record<string, unknown>) =>
    apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
