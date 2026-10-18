/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../features/authSlice";
import { RootState } from "../store";

const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!configuredBaseUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_BASE_URL is not set");
}

/**
 * Normalised API base URL (trailing slashes removed) so `${baseUrl}/doctors`
 * is always built consistently. The OpenAPI server value already includes the
 * `/api/v1` prefix, e.g. `http://localhost:4000/api/v1`.
 */
const baseUrl = configuredBaseUrl.replace(/\/+$/, "");

/**
 * A response is only usable when the API answers with JSON.
 *
 * If `NEXT_PUBLIC_BASE_URL` points at the frontend origin (e.g.
 * `http://localhost:3000`) instead of the backend API, a request for `/doctors`
 * is handled by the Next.js app itself and the browser receives an HTML page
 * (Next.js dev assets + Turbopack scripts). `fetchBaseQuery` returns that HTML
 * as a plain string with a 2xx status, which previously slipped through and was
 * treated as if it were valid data.
 */
function coerceJsonResponse(
  data: unknown
): { ok: true; value: unknown } | { ok: false } {
  // Real JSON bodies are already parsed into objects by fetchBaseQuery.
  if (typeof data !== "string") return { ok: true, value: data };

  const trimmed = data.trim();
  if (!trimmed) return { ok: false };

  // Some servers omit `Content-Type: application/json`; recover the JSON body.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return { ok: true, value: JSON.parse(trimmed) };
    } catch {
      return { ok: false };
    }
  }

  // Anything else (HTML pages, redirects, plain text) is not our contract.
  return { ok: false };
}

const NON_JSON_MESSAGE =
  `The API returned a non-JSON response (an HTML page instead of JSON). ` +
  `Check NEXT_PUBLIC_BASE_URL — it currently points to "${baseUrl}". ` +
  `It must be the backend API base URL including /api/v1 ` +
  `(e.g. http://localhost:4000/api/v1), never the frontend origin.`;

/*
 * Surface the misconfiguration as early as possible. Client-only side effect,
 * executed once when this module is imported.
 */
if (typeof window !== "undefined") {
  try {
    if (new URL(baseUrl).origin === window.location.origin) {
      console.error(
        `[DermaCare] NEXT_PUBLIC_BASE_URL ("${baseUrl}") points at the frontend ` +
          `origin. API requests will be served by the Next.js app and return HTML ` +
          `instead of JSON. Set it to the backend API base URL, e.g. ` +
          `"http://localhost:4000/api/v1".`
      );
    }
  } catch {
    // Invalid URL — the response guard below still reports the failure clearly.
  }
}

const baseQueryWithAuth: ReturnType<typeof fetchBaseQuery> = async (
  args,
  api,
  extraOptions
) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token;
      if (token) {
        // OpenAPI securityScheme `BearerAuth` requires the "Bearer" prefix.
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    (result.error.status === 401 || result.error.status === 403)
  ) {
    api.dispatch(logout());
    // Redirect to login page
    // if (typeof window !== "undefined") {
    //   window.location.href = "/login";
    // }
  }

  // Never let an HTML/plain-text body masquerade as a successful API payload.
  if ("data" in result && typeof result.data === "string") {
    const coerced = coerceJsonResponse(result.data);
    if (!coerced.ok) {
      return {
        error: {
          status: "CUSTOM_ERROR",
          error: NON_JSON_MESSAGE,
          data: {
            success: false,
            error: { code: "NON_JSON_RESPONSE", message: NON_JSON_MESSAGE },
          },
        },
      };
    }
    // Recover a JSON body that arrived without `Content-Type: application/json`.
    return { ...result, data: coerced.value };
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "User",
    "Events",
    "Identity",
    "Appointments",
    "Prescriptions",
    "DoctorProfile",
    "DoctorSlots",
    "Conversation",
    "Doctors",
    "StoreMedicines",
  ],
  endpoints: (builder) => ({}),
});

//* for refresh token use this following setup of base api
//* Change the refresh api url (if needed)
//* change the error structure (if needed)
//* change the token name if you are not getting token as a accessToken named then change it according to your data.
//* if you want you can handle other status code (if needed), currently only 401 handled.

// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// if (!baseUrl) {
//   throw new Error("Environment variable NEXT_PUBLIC_BASE_URL is not set");
// }

// const baseQuery = fetchBaseQuery({
//   baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
//   prepareHeaders: (headers, { getState }) => {
//     const state = getState() as RootState;
//     const token = state?.auth?.token || null;
//     if (token) {
//       headers.set("authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });
// const baseQueryWithReauth: BaseQueryFn<
//   string | FetchArgs,
//   unknown,
//   FetchBaseQueryError
// > = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);
//   const state = api.getState() as RootState;
//   const refresh = state?.auth?.refresh_token || null;
//   if (result.error) {
//     const errorData = result.error;
//     result.error = {
//       status: (errorData as any)?.status || 500,
//       data: (errorData as any)?.data?.detail || "something was wrong",
//     };
//   }

//   if (result.error && result.error.status == 401) {
//     const refreshResult = await baseQuery(
//       {
//         url: "auth/token/refresh/",
//         method: "POST",
//         body: { refresh },
//       },
//       api,
//       extraOptions
//     );

//     if (refreshResult.data) {
//       const newToken = (refreshResult.data as { access: string }).access;
//       api.dispatch(setUser({ token: newToken }));
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       api.dispatch(logout());
//     }
//   }

//   return result;
// };

// export const baseApi = createApi({
//   reducerPath: "api",
//   baseQuery: baseQueryWithReauth,
//   endpoints: () => ({}),
//   tagTypes: ["User"],
// });
