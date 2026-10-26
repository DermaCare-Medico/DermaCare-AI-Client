import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setSession } from "../features/authSlice";
import type { RootState } from "../store";

const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!configuredBaseUrl) throw new Error("Environment variable NEXT_PUBLIC_BASE_URL is not set");
const baseUrl = configuredBaseUrl.replace(/\/+$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

type RefreshEnvelope = { data?: { accessToken?: string; refreshToken?: string; user?: Record<string, unknown> } };
let refreshPromise: Promise<RefreshEnvelope | null> | null = null;

function expireSession(api: { dispatch: (action: ReturnType<typeof logout>) => unknown }) {
  api.dispatch(logout());
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?redirect=${redirect}&session=expired`);
  }
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;

  const state = api.getState() as RootState;
  const refreshToken = state.auth.refreshToken;
  const requestUrl = typeof args === "string" ? args : args.url;
  if (!refreshToken || requestUrl.includes("/auth/refresh")) {
    if (state.auth.token) expireSession(api);
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery({ url: "/auth/refresh", method: "POST", body: { refreshToken } }, api, extraOptions);
      return refreshResult.data ? (refreshResult.data as RefreshEnvelope) : null;
    })().finally(() => { refreshPromise = null; });
  }

  const refreshed = await refreshPromise;
  const session = refreshed?.data;
  if (!session?.accessToken) {
    expireSession(api);
    return result;
  }

  api.dispatch(setSession({ accessToken: session.accessToken, refreshToken: session.refreshToken ?? refreshToken, user: session.user ?? state.auth.user }));
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Events", "Identity", "PatientProfile", "Screenings", "Appointments", "Payment", "Prescriptions", "DoctorProfile", "DoctorSlots", "Conversation", "Doctors", "StoreMedicines", "Orders", "Notifications", "Earnings", "Payouts"],
  endpoints: () => ({}),
});
