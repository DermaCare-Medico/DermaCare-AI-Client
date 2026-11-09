import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout, setSession, type AuthUser } from "../features/authSlice";
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

// Refresh uses only the refresh-token body required by the backend contract. An
// expired access token must not be attached to this request.
const rawRefreshQuery = fetchBaseQuery({ baseUrl });

type RefreshEnvelope = { data?: { accessToken?: string; refreshToken?: string; user?: AuthUser | null } };
type RefreshOutcome =
  | { kind: "success"; accessToken: string; refreshToken: string; user: AuthUser | null }
  | { kind: "rejected" }
  | { kind: "transient" };

let refreshFlight: { refreshToken: string; promise: Promise<RefreshOutcome> } | null = null;

const publicAuthPaths = [
  "/auth/login",
  "/auth/register/",
  "/auth/forgot-password/",
  "/auth/refresh",
  "/auth/logout",
];

const requestPath = (args: string | FetchArgs) => typeof args === "string" ? args : args.url;
const shouldAttemptRefresh = (path: string) => !publicAuthPaths.some((publicPath) =>
  publicPath.endsWith("/") ? path.startsWith(publicPath) : path.includes(publicPath),
);

function clearAuthenticatedState(api: { dispatch: (action: unknown) => unknown }) {
  api.dispatch(logout());
  api.dispatch(baseApi.util.resetApiState());
}

function expireSession(api: { dispatch: (action: unknown) => unknown }) {
  clearAuthenticatedState(api);
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    // Forced navigation can occur before redux-persist's queued write. Remove the
    // auth-only persisted root synchronously so reload cannot restore the session.
    window.localStorage.removeItem("persist:root");
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/login?redirect=${redirect}&session=expired`);
  }
}

function startRefresh(
  refreshToken: string,
  user: AuthUser | null,
  api: Parameters<typeof rawRefreshQuery>[1],
  extraOptions: Parameters<typeof rawRefreshQuery>[2],
) {
  if (refreshFlight) return refreshFlight;

  const promise = (async (): Promise<RefreshOutcome> => {
    const result = await rawRefreshQuery(
      { url: "/auth/refresh", method: "POST", body: { refreshToken } },
      api,
      extraOptions,
    );
    if (result.data) {
      const session = (result.data as RefreshEnvelope).data;
      if (session?.accessToken) {
        return {
          kind: "success",
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? refreshToken,
          user: session.user ?? user,
        };
      }
    }

    const status = result.error?.status;
    // The backend uses a client/auth rejection for an invalid or expired refresh
    // token. Network, parsing, and 5xx failures are recoverable and retain state.
    if (status === 400 || status === 401 || status === 403) return { kind: "rejected" };
    return { kind: "transient" };
  })();

  refreshFlight = { refreshToken, promise };
  void promise.finally(() => {
    if (refreshFlight?.promise === promise) refreshFlight = null;
  });
  return refreshFlight;
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401) return result;

  const beforeRefresh = (api.getState() as RootState).auth;
  const path = requestPath(args);
  if (!beforeRefresh.token || !shouldAttemptRefresh(path)) return result;

  if (!beforeRefresh.refreshToken) {
    expireSession(api);
    return result;
  }

  const flight = startRefresh(beforeRefresh.refreshToken, beforeRefresh.user, api, extraOptions);
  // A different account/session must never join or be overwritten by an older flight.
  if (flight.refreshToken !== beforeRefresh.refreshToken) return result;

  const refreshed = await flight.promise;
  if (refreshed.kind === "rejected") {
    const current = (api.getState() as RootState).auth;
    if (current.refreshToken === beforeRefresh.refreshToken) expireSession(api);
    return result;
  }
  if (refreshed.kind === "transient") return result;

  const current = (api.getState() as RootState).auth;
  const sessionStillCurrent = current.refreshToken === beforeRefresh.refreshToken || current.token === refreshed.accessToken;
  if (!sessionStillCurrent) return result;

  if (current.token !== refreshed.accessToken) {
    api.dispatch(setSession(refreshed));
  }
  // Exactly one retry. A second 401 is returned to the caller and cannot recurse.
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Events", "Identity", "PatientProfile", "Screenings", "Appointments", "Payment", "Cart", "Prescriptions", "DoctorProfile", "DoctorSlots", "Conversation", "Doctors", "StoreMedicines", "Orders", "Notifications", "Earnings", "Payouts", "AdminDashboard", "AdminUsers", "AdminDoctors", "AdminDoctorApprovals", "AdminAppointments", "AdminMedicines", "AdminOrders", "AdminDoctorPayments", "AdminAuditLogs", "Auth"],
  endpoints: () => ({}),
});
