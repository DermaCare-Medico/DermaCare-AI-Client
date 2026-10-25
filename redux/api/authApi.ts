import { baseApi } from "./baseApi";

export type RegistrationRole = "PATIENT" | "DOCTOR";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: RegistrationRole;
  acceptTerms: true;
  acceptPrivacy: true;
  acceptHealthConsent: true;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthRequest {
  credential: string;
  role?: RegistrationRole;
  acceptTerms?: boolean;
  acceptPrivacy?: boolean;
  acceptHealthConsent?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthApiResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Identity"],
    }),

    requestRegistrationOtp: builder.mutation<
      AuthApiResponse,
      RegisterRequest
    >({
      query: (credentials) => ({
        url: "/auth/register/request-otp",
        method: "POST",
        body: credentials,
      }),
    }),

    verifyOtp: builder.mutation<
      AuthApiResponse,
      VerifyEmailRequest
    >({
      query: (data) => ({
        url: "/auth/register/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User", "Identity"],
    }),

    resendOtp: builder.mutation<AuthApiResponse, EmailRequest>({
      query: (data) => ({
        url: "/auth/register/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    socialAuth: builder.mutation<
      AuthApiResponse,
      GoogleAuthRequest
    >({
      query: (credentials) => ({
        url: "/auth/google",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Identity"],
    }),

    forgotPassword: builder.mutation<
      AuthApiResponse,
      ForgotPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/forgot-password/request-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyForgotPasswordOtp: builder.mutation<
      AuthApiResponse,
      VerifyEmailRequest
    >({
      query: (data) => ({
        url: "/auth/forgot-password/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<
      AuthApiResponse,
      ResetPasswordRequest
    >({
      query: (data) => ({
        url: "/auth/forgot-password/reset",
        method: "POST",
        body: data,
      }),
    }),

    changePassword: builder.mutation<
      AuthApiResponse,
      ChangePasswordRequest
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "PUT",
        body: data,
      }),
    }),

    getMe: builder.query<AuthApiResponse, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Identity", "User"],
    }),

    updateUser: builder.mutation<
      AuthApiResponse,
      UpdateUserRequest
    >({
      query: (data) => ({
        url: "/users/me/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "Identity"],
    }),

    refresh: builder.mutation<AuthApiResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),

    logout: builder.mutation<AuthApiResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Identity"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRequestRegistrationOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useSocialAuthMutation,
  useForgotPasswordMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateUserMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;

// Keeps the existing registration page import working.
export const useRegisterMutation = useRequestRegistrationOtpMutation;