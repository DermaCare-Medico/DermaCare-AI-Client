# DermaCare AI Frontend Implementation Audit

**Audit date:** 2026-10-23  
**Scope:** Static, read-only audit of `DermaCare-AI-Client`; verification commands attempted without configuration changes.  
**Classification:** `COMPLETE`, `PARTIAL`, `UI_ONLY`, `BROKEN`, `MISSING`, `NOT_VERIFIED`.

## 1. Executive summary and readiness

**Overall readiness: NOT production-ready.** The repository is a Next.js 16 / React 19 / TypeScript App Router application with a coherent shared layout, Redux Toolkit/RTK Query data layer, responsive styling, public catalogue error states, and a comparatively substantial doctor module. However, the primary login and password-recovery journeys are explicitly nonfunctional, server-side route enforcement is commented out, the access token is persisted in browser-readable storage, most patient and all visible admin workflows are mock-only, and major commerce/payment capabilities do not exist.

The doctor module has the strongest UI implementation, but contract reconciliation now shows that several of its paths do not match the Postman collection and many are absent from the OpenAPI mounted-operation inventory. Prescription editing and several slot/message/cancellation calls align with Postman; the module as a whole is not backend-compatible yet.

### Source limitations

- The project-local `docs/reference/` copies requested for re-audit were absent. The re-audit used the read-only source files supplied through the IDE context: `D:/Downloads/DermaCare_AI_Frontend_Requirements_and_Workflow.pdf`, `C:/Users/sumai/OneDrive/Desktop/DermaCareAI/docs/postman/DermaCare_AI.postman_collection.json`, and `C:/Users/sumai/OneDrive/Desktop/DermaCareAI/openapi.json`.
- Backend source and validators were not supplied. OpenAPI and Postman document contracts, but conflict on which operations are mounted; no live backend call was made, so runtime behavior remains unverified.
- Runtime verification was not possible: the installed Node version manager reports **“No active Node.js version is configured.”** No packages were installed or configuration changed.
- No external APIs were called and no authenticated end-to-end scenarios were exercised.

## 2. Architecture

| Area | Finding | Evidence |
|---|---|---|
| Framework | Next.js 16.1.6, React 19.2.4, TypeScript 5, App Router and route groups. | `package.json:14-36`; `src/app/layout.tsx:1-6` |
| Layouts | Root providers plus public and dashboard layouts; role-specific patient/doctor layouts. | `src/app/layout.tsx:1-6`; `src/app/(dashboardLayout)/layout.tsx:87-169` |
| Components | Shared UI primitives, public cards, form wrappers, doctor and admin components are separated reasonably. | `components/ui/`; `components/doctor/`; `components/AdminDashboard/` |
| API client | One RTK Query base API, bearer header, tag invalidation and JSON-response guard. | `redux/api/baseApi.ts:6-13,75-124` |
| State | Redux Toolkit + redux-persist; the entire auth slice is persisted to local/session storage. | `redux/store.ts:27-46` |
| Auth | Custom bearer auth and an unrelated GitHub NextAuth route coexist; login UI does not call either. | `src/app/api/auth/[...nextauth]/route.ts:1-14`; `components/Auth/LoginPage.tsx:11-16` |
| Route security | Proxy authorization logic is commented out and always allows requests; dashboard role presentation defaults from pathname. | `src/proxy.ts:23-66`; `src/app/(dashboardLayout)/layout.tsx:42-53` |
| Dependencies | Several suspicious generic packages (`form`, `hook`, `cn`) and dual mobile hooks suggest template residue; no Stripe, PDF, test runner, or realtime dependency. | `package.json:20-35`; `hooks/use-mobile.ts`; `src/hooks/use-mobile.ts` |
| Tests | No test/spec source files and no `test` script. | `package.json:5-10` |

## 3. Complete route inventory

The application defines **31 page routes** and **1 API route**. Route groups do not contribute URL segments.

| URL | Page | Assessment |
|---|---|---|
| `/` | Landing | Public content page |
| `/about-us` | About | Public content page |
| `/contact` | Contact | Static CTA/contact content |
| `/faq` | FAQ | Public content page |
| `/terms` | Terms | Public legal content |
| `/privacy` | Privacy | Public legal content |
| `/disclaimer` | Medical disclaimer | Public legal content |
| `/doctors` | Doctor catalogue | API-backed with optional demo fallback |
| `/doctors/[id]` | Doctor detail/slots | Dynamic API-backed page; booking links only to login |
| `/store` | Medicine catalogue | UI present; API path contradicts both contracts |
| `/login` | Login | Broken: submit only shows “not connected” |
| `/register` | Shared patient/doctor/pharmacy registration | API declaration used; contract not verified |
| `/verify-email` | Registration OTP | API declaration used; demo bypass available |
| `/forgot-password` | Recovery request | UI only |
| `/forgot-password/otp` | Recovery OTP | UI only |
| `/forgot-password/otp/change-password` | Recovery password entry | UI only |
| `/reset-password` | Password entry alias | UI only |
| `/change-password` | Password entry alias | UI only |
| `/patient` | Redirect wrapper | Renders patient dashboard component |
| `/patient/dashboard` | Patient dashboard | Mock data |
| `/patient/profile` | Patient profile | Session-local mock state |
| `/patient/screening/new` | New AI screening | Fictional client-side result |
| `/doctor` | Doctor dashboard | API-oriented with demo fallback |
| `/doctor/appointments` | Appointment list | API-oriented with demo fallback |
| `/doctor/appointments/[id]` | Consultation detail | API-oriented notes/status/chat/prescription |
| `/doctor/availability` | Slot management | API-oriented CRUD with demo fallback |
| `/doctor/profile` | Doctor profile/license | API-oriented update/upload |
| `/doctor/pending-approval` | Approval state | `/auth/me`-oriented status UI |
| `/admin/dashboard` | Admin dashboard | Static sample metrics/activity |
| `/admin/dashboard/user-list` | User list | Local sample users |
| `/admin/dashboard/verification-queue` | Doctor approvals | Local sample applications/actions |
| `/user` | Legacy user dashboard | Generic wrapper/template route |
| `/api/auth/[...nextauth]` | GitHub NextAuth handler | Not connected to primary login |

Missing required route families include screening result/history/PDF, patient appointments/consultation/prescriptions/chat/orders/notifications, checkout/payment, doctor earnings/payouts, and most admin management surfaces.

## 4. Requirements-to-implementation matrix

### Public

| Feature | Status | Evidence / rationale |
|---|---|---|
| Landing | COMPLETE | Composed sections and navigation exist (`src/app/(defaultLayout)/(home)/page.tsx:1-21`). Static inspection only. |
| About | COMPLETE | Dedicated composed page (`src/app/(defaultLayout)/about-us/page.tsx:1-19`). |
| FAQ | COMPLETE | Dedicated page renders FAQ component (`src/app/(defaultLayout)/faq/page.tsx:1-10`). |
| Terms | COMPLETE | Dedicated legal page (`src/app/(defaultLayout)/terms/page.tsx`). |
| Privacy | COMPLETE | Dedicated structured page (`src/app/(defaultLayout)/privacy/page.tsx:224,330`). |
| Disclaimer | COMPLETE | Dedicated page (`src/app/(defaultLayout)/disclaimer/page.tsx`). |
| Doctors discovery/detail | NOT_VERIFIED | Queries match Postman but the paths are absent from OpenAPI's claimed mounted-operation inventory (`redux/api/publicApi.ts:36-70`); no booking flow. |
| Store | BROKEN | Frontend calls `/store/medicines`; both contracts use `/medicines` (`redux/api/publicApi.ts:72-95`). No cart, checkout, or purchase. |

### Authentication

| Feature | Status | Evidence / rationale |
|---|---|---|
| Patient registration | BROKEN | Postman exposes `/auth/register` as an alias, but the body is incompatible: frontend sends `termsAccepted`, `privacyConsent`, `marketingUpdates`, `consentAcceptedAt`; contract requires `acceptTerms`, `acceptPrivacy`, `acceptHealthConsent` (`redux/api/authApi.ts:7-19,40-46`). |
| Doctor registration | BROKEN | Shared form omits mandatory doctor questions and incorrectly permits `PHARMACY`; backend models doctor registration plus a separate application/documents flow (`src/app/(auth)/register/page.tsx:250-266`; `redux/api/authApi.ts:5`). |
| Registration OTP/resend | PARTIAL | API calls and states exist (`src/app/(auth)/verify-email/page.tsx:49-50,135-198`); demo fixed OTP is also present. |
| Login | BROKEN | Submit only sets “Sign-in is not connected yet”; declared login mutation is unused (`components/Auth/LoginPage.tsx:11-16`; `redux/api/authApi.ts:32-38`). |
| Logout | BROKEN | Never calls required `POST /auth/logout`; clears only local access state, leaves refresh cookie, then redirects (`components/shared/nav-user.tsx:44-45`; `redux/features/authSlice.ts:44-52`). |
| Forgot/reset password | BROKEN | All three components explicitly say recovery/OTP/reset is not connected (`components/Auth/ForgotPassword.tsx:13-16`; `components/Auth/Otp.tsx:13-15`; `components/Auth/ChangePassword.tsx:14-22`). |
| Role redirects | BROKEN | Login cannot establish a session; proxy role enforcement is commented out (`src/proxy.ts:28-64`). Dashboard layout defaults role from pathname (`src/app/(dashboardLayout)/layout.tsx:42-53`). |
| Session handling | BROKEN | Token is persisted in localStorage via redux-persist and JS-readable cookies; proxy looks for `token` while slice writes `accessToken` (`redux/store.ts:27-35`; `redux/features/authSlice.ts:33`; `src/proxy.ts:23`). |
| Doctor approval gate | PARTIAL | Client gate queries identity and redirects non-approved doctors (`components/doctor/ApprovalGate.tsx:32-55`), but it is bypassable client-side and cannot replace backend authorization. |

### Patient

| Feature | Status | Evidence / rationale |
|---|---|---|
| Dashboard | UI_ONLY | Reads `mockScreenings` and mock appointment data (`src/app/(dashboardLayout)/patient/dashboard/page.tsx:7-10,84-142`). |
| Profile | UI_ONLY | Uses `initialPatientProfile`; saves only in component state (`src/app/(dashboardLayout)/patient/profile/page.tsx:7,14,58-69`). |
| AI image upload/screening | UI_ONLY | Local file preview and fictional result; no upload or screening API (`src/app/(dashboardLayout)/patient/screening/new/page.tsx:76-83,231-276,587-599`). |
| Screening results detail | MISSING | No result route; result exists only inside the new-screening page. |
| PDF report | MISSING | No PDF generation/download route, library, or action. |
| Screening history | UI_ONLY | Sidebar points “Screening History” back to `/patient/dashboard`; dashboard data is mocked (`components/shared/app-sidebar.tsx:98-100`). |
| Doctor discovery | NOT_VERIFIED | Public queries match Postman but conflict with OpenAPI mounted-path inventory; patient sidebar still points back to dashboard (`components/shared/app-sidebar.tsx:103-104`). |
| Booking | MISSING | Doctor detail sends users to `/login`; no booking mutation/page (`src/app/(defaultLayout)/doctors/[id]/page.tsx:123`). |
| Stripe payment | MISSING | No Stripe dependency, checkout route, payment intent, or payment UI. |
| Consultation | MISSING | No patient consultation page or API use. |
| Prescriptions | MISSING | Sidebar incorrectly points to profile; no patient prescription route (`components/shared/app-sidebar.tsx:113-114`). |
| Chat | MISSING | Conversation implementation appears only in doctor appointment detail. |
| Medicines/orders | BROKEN | Catalogue calls the wrong `/store/medicines` path; order/cart integrations are absent and sidebar returns to dashboard (`redux/api/publicApi.ts:72-95`; `components/shared/app-sidebar.tsx:118-119`). |
| Notifications | UI_ONLY | Header bell has no handler/data binding (`src/app/(dashboardLayout)/layout.tsx:134-142`); notification API declarations are unused. |

### Doctor

| Feature | Status | Evidence / rationale |
|---|---|---|
| Application/approval | BROKEN | Frontend posts `/doctors/me/license`; Postman requires document upload then `POST /doctors/application` (`redux/api/doctorApi.ts:249-260`). |
| Documents | BROKEN | Frontend has one incompatible license endpoint; contract uses `/doctors/application/documents` plus indexed document retrieval. |
| Profile | BROKEN | Shared update mutation calls `/users/me/profile`; contracts use `/doctors/me/profile`, `/patients/me/profile`, or `/users/me` by role (`redux/api/authApi.ts:100-106`). |
| Availability | NOT_VERIFIED | Create/update/delete slot paths match Postman (`redux/api/doctorApi.ts:271-297`) but all are absent from OpenAPI's mounted inventory. |
| Dashboard/bookings | BROKEN | Frontend uses `/appointments` and `/appointments/{id}`; contract uses `/doctors/me/appointments` and `/doctors/me/appointments/{id}` (`redux/api/doctorApi.ts:87-107`). |
| Consultation | BROKEN | Frontend uses `/appointments/{id}/consultation` and `/consultation-note`; Postman uses doctor-scoped `/decision` and `/complete`, with no matching note path (`redux/api/doctorApi.ts:122-151`). |
| Prescriptions | PARTIAL | Create/finalize UI is wired (`components/doctor/PrescriptionDialog.tsx:65-80,95-139`); separate list route/UI is absent. |
| Chat | BROKEN | Message paths align with Postman, but conversation lookup is wrong: frontend `/appointments/{id}/conversation`, contract `/conversations/appointment/{id}` (`redux/api/doctorApi.ts:300-335`). No image-send implementation. |
| Earnings | MISSING | No route, component, API declaration, or sidebar item. |
| Payouts | MISSING | No route, component, API declaration, or sidebar item. |

### Admin

| Feature | Status | Evidence / rationale |
|---|---|---|
| Dashboard | UI_ONLY | Metrics and activity are hardcoded arrays (`components/AdminDashboard/Dashboard.tsx:12-42`). |
| Users | UI_ONLY | Uses `initialUsers`; no user-management query (`components/AdminDashboard/UserPage.tsx:6`). |
| Doctor approvals/documents | UI_ONLY | Uses `sampleApplications`; approve/decline only change local state (`components/AdminDashboard/Verificationque.tsx:19,72-102,270-279`). |
| Appointments | MISSING | No admin appointment route/UI. |
| Medicines | MISSING | No admin medicine CRUD route/UI. |
| Orders | MISSING | No admin order route/UI. |
| Payments/payouts | MISSING | No admin finance route/UI. |
| Audit logs | MISSING | No audit-log route/API/UI. |
| Authorization | BROKEN | Admin paths have no effective proxy/server guard (`src/proxy.ts:14-18,28-66`). |

## 5. Backend API integration gaps

### Integration footprint

- **Used/meaningfully wired domains:** registration/verification; public doctors; doctor identity; portions of prescriptions, availability, messages and cancellation. Several apparent integrations are contract-incompatible as detailed in §8A.
- **Declared but visibly unused or template residue:** social login; most password APIs; notification APIs; uploader API; event/member/speaker APIs unrelated to the audited DermaCare requirements (`redux/api/eventApi.ts`; `redux/api/memberApi.ts`).
- **Absent domains:** AI screening/history/results/PDF, patient booking/payment/consultation/prescriptions/orders, Stripe/demo-payment UI, doctor earnings/payouts, and DermaCare admin management APIs. The contracts document most of these backend surfaces.

### Contract risks

| Severity | Gap | Evidence |
|---|---|---|
| Critical | OpenAPI and Postman conflict: OpenAPI claims to list mounted operations but omits many operations in Postman. Runtime truth cannot be established without backend validators or a live non-mutating test environment. | `openapi.json` description and paths; Postman doctor/screening/chat/payment collections; §8A. |
| Critical | Auth endpoints are declared but login/recovery screens do not invoke them. | `redux/api/authApi.ts:32-90`; `components/Auth/LoginPage.tsx:14-16`; recovery component evidence above. |
| High | Types are weakened with `any` for login, registration query input, password flows, profile updates and several legacy APIs. | `redux/api/authApi.ts:1,32-104`; `redux/api/eventApi.ts:26,35,112` |
| High | Response parsing uses permissive envelope helpers and multiple potential ID locations, indicating uncertain contracts. | `types/doctor.ts`; `components/doctor/PrescriptionDialog.tsx:60` |
| High | No refresh flow: commented sample code is the only refresh implementation; 401/403 simply logs out. | `redux/api/baseApi.ts:93-100,143-214` |
| High | Legacy event/member APIs are unrelated to the supplied DermaCare contracts; `admin/members` also lacks a leading slash. | `redux/api/eventApi.ts`; `redux/api/memberApi.ts:29` |
| Medium | GET endpoints generally omit explicit methods (valid RTK Query default, but method documentation is inconsistent). | `redux/api/publicApi.ts:36-96`; `redux/api/doctorApi.ts:88-118` |
| Medium | Dynamic IDs are used in doctor routes, but patient/admin required resources have no dynamic pages or hooks. | Route inventory; `redux/api/doctorApi.ts:102-225` |
| Medium | `NEXT_PUBLIC_BASE_URL` is mandatory at module import; missing environment can crash rendering/build rather than produce a controlled configuration page. | `redux/api/baseApi.ts:6-10` |

## 6. Mock data and nonfunctional UI inventory

- Patient dashboard: mock screenings, health score, appointment, and quick actions (`src/app/(dashboardLayout)/patient/mockData.ts`; dashboard evidence above).
- Patient profile: mock initial identity/medical details and session-only save.
- AI screening: local image preview, timer-like analysing state, deterministic fictional result, local-only draft.
- Public doctors/store: optional fallback datasets when requests fail and demo flags are enabled (`lib/public/demoData.ts`; `src/hooks/usePublicCatalog.ts:23-29`).
- Doctor module: optional demo data/fallback controlled by `NEXT_PUBLIC_DOCTOR_DEMO` (`src/app/(dashboardLayout)/doctor/mockData.ts`; `components/doctor/ApprovalGate.tsx:13,45`).
- Registration/OTP: optional frontend-only registration and fixed OTP (`src/app/(auth)/register/page.tsx:122-148`; `src/app/(auth)/verify-email/page.tsx:135-181`).
- Login, forgot-password, recovery OTP, and reset-password: buttons only reveal “not connected” messages.
- Admin dashboard/users/verification queue: hardcoded arrays and local actions.
- Dashboard search field and notification bell are visual only (`src/app/(dashboardLayout)/layout.tsx:119-142`).
- Several patient sidebar entries route to the dashboard/profile rather than their named feature (`components/shared/app-sidebar.tsx:98-124`).
- Store cards provide catalogue presentation, not cart/checkout/order behavior.

## 7. Security, UI/UX, accessibility and code quality

### Critical/high findings

1. **No effective server-side route protection.** Proxy auth and RBAC logic is commented out; every matched request passes (`src/proxy.ts:28-66`). Client gates are presentation controls, not authorization boundaries.
2. **Bearer tokens are exposed to XSS.** Auth is persisted in localStorage and set via `js-cookie`, not an HttpOnly/Secure/SameSite server cookie (`redux/store.ts:27-35`; `redux/features/authSlice.ts:27-41`).
3. **Cookie naming is inconsistent.** Slice writes `accessToken`, proxy reads `token`, and logout leaves `refreshToken` behind (`redux/features/authSlice.ts:33-48`; `src/proxy.ts:23`).
4. **Medical images and results are not integrated.** Current screening is explicitly fictional and local, so privacy, retention, consent, upload authorization, and clinical escalation cannot be verified.
5. **Role derivation can misrepresent authorization.** Dashboard layout defaults unauthenticated pathname segments to PATIENT/DOCTOR/ADMIN for the sidebar (`src/app/(dashboardLayout)/layout.tsx:42-53`).

### UI/UX and accessibility

- Positive: responsive Tailwind/CSS-module breakpoints, semantic form labels, OTP grouping, `aria-live`/`role=alert`, loading skeletons, and reusable error/empty states appear in newer flows.
- Gaps: no runtime viewport/accessibility test was possible; many icon-only actions need systematic accessible-name verification; dashboard search/notifications imply functionality they do not have; several links lead to the current dashboard rather than a destination; no global error boundary or route-level `loading.tsx` files were found.
- Medical UX risk: fictional screening does show disclaimers and urgent warning signs (`src/app/(dashboardLayout)/patient/screening/new/page.tsx:547-599`), but there is no real escalation, clinician handoff, or emergency localization.

### Code quality

- Strengths: centralized base query, API error formatting, shared data-state components, feature-focused doctor types/utilities, and visible demo notices.
- Weaknesses: pervasive `any` in critical auth/legacy endpoints, stale event/member template APIs, duplicate hooks, two competing auth systems, large page components (up to 775 lines), mock data intermixed with production paths, and encoding artifacts such as `Donâ€™t` in rendered copy (`components/Auth/LoginPage.tsx:84`).

## 8. Typecheck, lint, tests and build

| Check | Result | Detail |
|---|---|---|
| Typecheck | NOT_VERIFIED | Attempted `.\\node_modules\\.bin\\tsc.cmd --noEmit`; failed before TypeScript ran: no active Node.js version configured. |
| Lint | NOT_VERIFIED | Attempted `npm.exe run lint`; same Node version-manager failure. |
| Tests | NOT_VERIFIED | No `test` script and no test/spec files found. |
| Build | NOT_VERIFIED | Could not meaningfully run because the same Node runtime prerequisite blocks npm/Next; not retried after lint/typecheck proved the environment issue. |
| Runtime/E2E | NOT_VERIFIED | No server started, backend unavailable, and no external API calls were permitted. |

No configuration, dependency, source, migration, or Git changes were made. The only created artifact is this report (and its `docs` directory).

## 8A. Requirements & API Contract Re-Audit

**Re-audit date:** 2026-10-23. **Evidence model:** PDF statements are requirements, OpenAPI describes its listed paths as currently mounted operations, and Postman documents a larger executable/proposal inventory. These are contract documents, not runtime proof. Where OpenAPI and Postman disagree, this report does not assume that the extra Postman route is live.

### Contract-source conflict

OpenAPI describes **64 mounted operations** and says proposal-era contracts are excluded, but its `paths` omit public doctor discovery, doctor application/profile/slots/decisions, screenings, prescription authoring, conversations, earnings/payouts and Stripe checkout. Postman contains all of those (for example doctor application at lines 3162/3272, doctor decision at 4291, conversations at 6911, screenings at 7255-7781, and checkout at 8610/8955). Consequently:

- A frontend path present only in Postman is classified `NOT_VERIFIED` if the UI and body otherwise align.
- A frontend path that differs from both sources is `BROKEN`.
- OpenAPI-covered operations are checked against their method, path, security, body and documented responses, but remain runtime-unverified.
- OpenAPI's generic success envelopes (`{ success, data }`) do not define many inner response shapes; frontend normalization cannot be fully certified.

### Mandatory PDF requirement reconciliation

#### Common and public requirements

| Mandatory requirement | Re-audit status | Reconciled evidence |
|---|---|---|
| Follow Swagger and replace mocks when APIs are ready | BROKEN | Production paths still use mock/demo data; several paths contradict both contracts. |
| Protect every page by role and redirect cross-role users | BROKEN | Proxy/RBAC implementation is commented out (`src/proxy.ts:28-66`). |
| Loading, empty and error state on every data page | PARTIAL | Shared `DataState` and doctor states exist, but static patient/admin pages bypass real loading/error states. |
| Success alerts for registration, OTP, reset, booking, payment, order, prescription | PARTIAL | Registration/OTP and prescription use feedback; reset, booking, payment and order flows are absent/broken. |
| Required AI disclaimer | PARTIAL | Current mock result states it is not a diagnosis (`src/app/(dashboardLayout)/patient/screening/new/page.tsx:587-599`), but there is no actual result page. |
| Demo-payment notice | MISSING | No payment page exists. PDF says demo-only; Postman also documents Stripe checkout, creating a product/contract conflict that needs a decision. |
| Responsive phone/tablet/desktop | NOT_VERIFIED | Responsive classes exist, but no runtime viewport validation was possible. |
| Landing, About, FAQ, Terms/Privacy, Disclaimer | COMPLETE | All required public routes exist; static inspection only. |
| All Doctors | NOT_VERIFIED | UI calls Postman-listed `/doctors` paths, but OpenAPI omits them (`redux/api/publicApi.ts:35-70`; Postman line 2901). |
| Explore Store | BROKEN | UI exists but calls `/store/medicines`; both contracts use `/medicines` (OpenAPI line 1655; `redux/api/publicApi.ts:72-95`). |

#### Authentication requirements

| Mandatory requirement | Re-audit status | Reconciled evidence |
|---|---|---|
| Register → OTP → alert → role redirect | BROKEN | Register body keys conflict with canonical contract and verification redirects to login rather than role destination (`redux/api/authApi.ts:7-19`; `src/app/(auth)/verify-email/page.tsx:147-168`). |
| Separate Patient/Doctor tabs and changing questions | MISSING | One role `<select>` is used, not two tailored tabs (`src/app/(auth)/register/page.tsx:250-266`). |
| Patient registration fields | PARTIAL | Core name/email/password/consents exist; phone, DOB, gender, address and health fields are absent from registration. |
| Doctor registration fields and document | MISSING | Specialization, license number/document, experience, qualifications and fee are absent. Postman models document upload plus application (lines 3162-3312). |
| Doctor initially User with pending message | PARTIAL | Pending approval page/gate exists, but registration success does not implement the documented pending-role journey. |
| Six-digit OTP, 60-second resend, wrong/expired messages | PARTIAL | Six inputs and timer exist; client timer does not reliably disable resend after expiry, and expired-code handling depends on an unverified response (`src/app/(auth)/verify-email/page.tsx:74-75,167-198,288-289`). |
| Login and demo login | BROKEN | Normal login is explicitly disconnected and no demo-login button is rendered (`components/Auth/LoginPage.tsx:11-16,75-80`). |
| Patient→Screening, Doctor→Doctor dashboard, Admin→Admin dashboard | BROKEN | No functional login; dashboard role is inferred/defaulted from URL (`src/app/(dashboardLayout)/layout.tsx:42-53`). |
| Forgot password: email→OTP→reset→alert→login | BROKEN | All screens explicitly state the actions are not connected. Canonical paths are `/auth/forgot-password/*` (OpenAPI lines 962 etc.), while declared alias mutations are unused. |

#### Patient requirements

| Mandatory requirement | Re-audit status | Reconciled evidence |
|---|---|---|
| Profile before/within workflow | UI_ONLY | View/edit uses session-local mock state; canonical `GET/PATCH /patients/me/profile` exists (OpenAPI line 3367) but is unused. |
| Land on Screening after auth | BROKEN | Documented redirect is absent. |
| JPG/PNG ≤10 MB validation and quality feedback | PARTIAL | Type/size validation and local preview exist; no genuine image-quality check or server upload. |
| Conditional information form with required body area/duration/changing | PARTIAL | Form is always rendered and includes analogous fields, but not conditionally after upload; backend request schema is not used. |
| Optional symptom/medical fields | PARTIAL | Many fields exist, but burning, bleeding/discharge, current medicines and previous treatment are not faithfully modeled as specified. |
| Display all 22 detectable disease classes on screening page | MISSING | Required class catalogue is not displayed. |
| Submit to a separate AI Result page | MISSING | Client generates a fictional inline result (`src/app/(dashboardLayout)/patient/screening/new/page.tsx:231-276,587-599`). Postman screening APIs at lines 7255-7781 are unused. |
| Result: conditions/confidences, red flags, gated care | UI_ONLY | Mock result approximates this; no backend policy flags or real inference. |
| Result PDF, Find Doctor, automatic history save | MISSING | No PDF or result route/persistence; no functional handoff. |
| Dashboard overview: screening, appointments, orders, unread notifications | UI_ONLY | Screening/appointment are mocked; orders and notifications are not integrated. Canonical dashboard is available in OpenAPI but unused. |
| Prediction history/detail/PDF | MISSING | Sidebar loops to dashboard; Postman history endpoints are unused. |
| Booking doctor + slot, default Pending | MISSING | No booking mutation despite canonical `POST /appointments` (OpenAPI line 1821). |
| Approval→demo payment→appointment | MISSING | No payment/appointment patient UI. OpenAPI covers demo payment; Postman additionally advertises Stripe checkout, conflicting with PDF demo-only direction. |
| Appointment cards for Pending/Approved/Confirmed/Completed/Rejected/Cancelled | MISSING | No patient appointment route. PDF vocabulary also conflicts with OpenAPI's reduced `SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED` schema and frontend types (`types/doctor.ts:45-55`). |
| Prescription detail and Order Medicines | MISSING | Patient prescription APIs exist in OpenAPI/Postman but have no frontend route. |
| Reusable chat popup: text/images/live/read-only expiry | MISSING | No patient chat. Doctor chat is text/polling only; no images or verified expiry enforcement. |
| Store cards, cart, checkout, confirmation, Rx restriction | BROKEN | Catalogue URL is wrong; cart/checkout/confirmation/Rx authorization are absent. |
| Order history and notifications/read state | MISSING | Canonical endpoints exist (OpenAPI lines 4449 onward for notifications), but frontend does not use them. |

#### Doctor requirements

| Mandatory requirement | Re-audit status | Reconciled evidence |
|---|---|---|
| Locked until Admin approval and unlock on Doctor role | PARTIAL | Client approval gate exists (`components/doctor/ApprovalGate.tsx:17-55`), but proxy is open and cannot enforce security. |
| Navbar: Store, Dashboard, My Appointments, Public | PARTIAL | Dashboard/appointments/home exist; required Store/public navigation is incomplete (`components/shared/app-sidebar.tsx:135-164`). |
| Overview counts: pending/today/completed | PARTIAL | Dashboard derives appointment metrics, but uses an incompatible list endpoint. |
| Profile: specialization, qualifications, fee, license | BROKEN | UI exists, but update/license endpoints conflict with Postman (`src/app/(dashboardLayout)/doctor/profile/page.tsx:55-82`; Postman lines 3477-3715). |
| Appointment cards and Pending Accept/Cancel | BROKEN | Frontend reads `/appointments`; Postman requires doctor-scoped list/request and `/decision` endpoints (`redux/api/doctorApi.ts:87-107`; Postman lines 4088-4450). |
| Approved waiting payment; Confirmed video/complete; Completed Rx/chat | BROKEN | Frontend status model is `SCHEDULED/IN_PROGRESS/...`, not the PDF workflow, and uses unsupported consultation/video paths (`types/doctor.ts:45-55`; `redux/api/doctorApi.ts:117-151`). |
| Appointment detail with patient, image, screening, symptoms/history/video | PARTIAL | Rich detail UI exists, but its detail/pre-consultation/video endpoints differ from Postman and are absent from OpenAPI. |
| Prescription fields, send, alert and patient delivery | PARTIAL | Create/update/items/finalize align with Postman, but required `POST /prescriptions/{id}/send` is never called (frontend ends at finalize: `components/doctor/PrescriptionDialog.tsx:121-130`; Postman lines 6402/6436). |
| Shared completed-appointment chat | BROKEN | Conversation lookup path is incompatible; messages are text-only polling (`redux/api/doctorApi.ts:300-335`). |
| Availability | NOT_VERIFIED | UI CRUD paths match Postman, but are absent from OpenAPI mounted operations. This feature is useful but not explicitly mandatory in the PDF page list. |

#### Admin requirements

| Mandatory requirement | Re-audit status | Reconciled evidence |
|---|---|---|
| Login→Dashboard→approval→store→orders→reports | BROKEN | Login is disconnected; only three mock admin routes exist. |
| Navbar: Store, Dashboard, All Orders, Public | MISSING | Admin sidebar has dashboard, verification, users, profile/home only (`components/shared/app-sidebar.tsx:55-79`). |
| Overview totals | UI_ONLY | Hardcoded metrics; canonical `GET /admin/dashboard` exists (OpenAPI line 5111). |
| Admin profile view/edit | MISSING | Sidebar links to nonexistent `/user/dashboard/profile`; contract is `GET/PATCH /users/me`. |
| Doctor payments and demo Send Payment | MISSING | OpenAPI documents list/send (line 5208 onward); no page/API client. |
| Orders filter, accept/reject reason, fulfillment statuses | MISSING | OpenAPI supports admin list/detail/status and `OUT_FOR_DELIVERY` enum (lines 5475-5757); unused. |
| Patients/users search/status/details | UI_ONLY | Local sample users; canonical admin user APIs (OpenAPI line 5899) unused. |
| Doctors list/details | MISSING | Canonical endpoints documented; no route/UI. |
| Approval documents, approve, reject reason, role unlock | UI_ONLY | Local state only; canonical endpoints begin OpenAPI line 6596. |
| Store CRUD/deactivate/Rx/low-stock | MISSING | Canonical admin medicine CRUD begins OpenAPI line 7030; no UI/client. |
| Appointments filters/details | MISSING | Canonical endpoints begin OpenAPI line 7744; no UI/client. |
| Audit logs | MISSING | Canonical endpoint at OpenAPI line 8009; no UI/client. |

The PDF labels reports and subscriptions **optional**. Both are absent and intentionally excluded from mandatory completion metrics.

### Frontend-to-contract API compatibility

| Frontend integration | Contract result | Finding |
|---|---|---|
| Registration | BROKEN | `/auth/register` exists only as Postman alias; frontend consent keys do not match canonical request (`redux/api/authApi.ts:7-19,40-46`; OpenAPI lines 166-218). |
| OTP resend/verify | PARTIAL | Alias paths exist in Postman; canonical OpenAPI uses `/auth/register/resend-otp` and `/auth/register/verify-otp`. Bodies align for email/OTP. |
| Login | UNUSED | `POST /auth/login` method/path/body concept aligns (OpenAPI line 487), but UI never invokes the mutation. |
| Social login | BROKEN | Frontend `/auth/social-login`; contract `/auth/google` with `idToken` and consent fields (`redux/api/authApi.ts:48-54`). |
| Password recovery | UNUSED/PARTIAL | Alias request/reset paths exist in Postman, but verify mutation is shared with registration and all recovery screens are disconnected. |
| Change password | INCORRECT | Frontend declares `PUT /auth/change-password`; neither supplied contract documents it (`redux/api/authApi.ts:85-90`). |
| Refresh/logout | MISSING | Contracts require `POST /auth/refresh` and `/auth/logout`; frontend has no mutation/rotation and only local logout. OpenAPI documents bearer access plus HTTP-only refresh cookie. |
| Current identity | ALIGNED, NOT RUN | `GET /auth/me` with bearer aligns (`redux/api/authApi.ts:92-98`). |
| Profile update | BROKEN | `/users/me/profile` is not documented; contracts separate `/users/me`, `/patients/me/profile`, `/doctors/me/profile` (`redux/api/authApi.ts:100-106`). |
| Public doctors | CONFLICTED | Frontend paths align with Postman, but are absent from OpenAPI. |
| Medicines | BROKEN | Frontend `/store/medicines[/{id}]`; contracts `/medicines[/{id}]` (`redux/api/publicApi.ts:72-95`; OpenAPI line 1655). |
| Screening | MISSING | Postman documents create/images/history/retry/recommendations; no frontend API slice uses them. |
| Booking/patient appointments/payments | MISSING | OpenAPI documents these; no patient integration. |
| Doctor appointment list/detail | BROKEN | Frontend generic paths conflict with doctor-scoped contract (`redux/api/doctorApi.ts:87-107`). |
| Doctor decision/complete | BROKEN | Frontend `/consultation` does not match Postman `/doctors/me/appointments/{id}/decision` and `/complete`. |
| Pre-consultation/video/note | CONFLICTED | Frontend paths appear in neither supplied contract; Postman appointment detail is the only documented doctor detail/video provisioning surface. |
| Prescription create/edit/items/finalize | PARTIAL | Methods and paths align with Postman, but OpenAPI omits authoring operations and frontend never calls required `/send`. |
| Doctor application/documents | BROKEN | One `/doctors/me/license` call replaces the documented two-step documents/application workflow. |
| Doctor slots | CONFLICTED | CRUD aligns with Postman; absent from OpenAPI. |
| Chat | BROKEN | Message GET/POST align with Postman; appointment→conversation lookup path does not. No image body support. |
| Cancellation | PARTIAL | Review/direct cancel methods, bodies and paths align with Postman; absent from current OpenAPI. |
| Notifications | BROKEN/UNUSED | Frontend uses singular `/notification/...`; contract uses plural `/notifications...` (`redux/api/notificationApi.ts:7-35`; OpenAPI line 4449). |
| Upload | INCORRECT/UNUSED | Generic `/upload/multiple` is undocumented; screening and doctor-document uploads have domain-specific Postman paths (`redux/api/uploaderApi.ts:5-10`). |
| Admin | MISSING | No DermaCare admin API client despite complete OpenAPI surfaces for dashboard, payouts, orders, users, doctors, approvals, medicines, appointments and audit logs. Existing event/member APIs are unrelated template residue. |

### Authorization, enums and response/status handling

- OpenAPI requires bearer authentication for patient appointments/orders/prescriptions/notifications and every admin operation. `baseApi` adds a bearer token (`redux/api/baseApi.ts:82-89`), but open proxy rules and localStorage persistence remain security failures.
- OpenAPI documents a 15-minute access token and rotating HTTP-only refresh cookie. The frontend does not refresh and persists a refresh token through JavaScript (`redux/features/authSlice.ts:36-42`), directly conflicting with the documented model.
- PDF appointment states (`Pending`, `Approved`, `Confirmed`, `Completed`, `Rejected`, `Cancelled`) conflict with OpenAPI's `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`; frontend adds `CANCELLATION_REQUESTED` but lacks Pending/Approved/Confirmed/Rejected (`types/doctor.ts:45-55`). Postman uses `CONFIRMED` filters and decision APIs, reinforcing the documentation conflict.
- Frontend doctor verification statuses (`NOT_SUBMITTED`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`) are plausible for Postman application flows but not defined by the supplied OpenAPI schemas (`types/doctor.ts:151-155`).
- Admin order status requirements align with OpenAPI: `PENDING`, `CONFIRMED`, `PROCESSING`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`. No frontend admin code consumes them.
- API error handling is strongest in new registration/doctor pages, but status-specific behavior for 401/403/404/409/429 is generally flattened into messages or automatic logout; no rate-limit retry guidance, conflict recovery, or validation-field mapping is systematic.
- Response inner shapes remain under-specified in OpenAPI. Frontend's permissive envelope/ID normalization may tolerate variants, but this is not proof of compatibility.

## 9. Prioritized fix roadmap

### Critical

1. Connect login to the actual auth contract, establish the session, and implement validated post-login role redirects.
2. Replace browser-persisted bearer tokens with a server-managed HttpOnly/Secure/SameSite session; align cookie names and clear all session material on logout.
3. Reinstate server-side route/RBAC enforcement for patient, doctor and admin paths; retain backend authorization on every API.
4. Resolve and version the OpenAPI/Postman conflicts, designate one authoritative mounted-operation contract, and regenerate typed clients from it.
5. Replace the fictional screening with secure upload, AI job/status/result persistence, consent/retention controls, safety messaging and clinician escalation—or remove it from production navigation.

### High

6. Implement the patient core journey end-to-end: results/history/PDF → doctor booking → Stripe payment → consultation/chat → prescriptions → order tracking.
7. Replace admin sample arrays with guarded backend workflows for users, doctor documents/approvals, appointments, medicines, orders, payments/payouts and audit logs.
8. Wire password recovery/change and OTP state securely; expire and bind recovery challenges and prevent route skipping.
9. Add doctor earnings/payout pages and APIs; add a prescription list/history surface and confirm realtime chat requirements.
10. Remove or isolate demo fallback from production builds and ensure backend failures cannot silently turn into believable clinical/business data.

### Medium

11. Introduce strict request/response types generated or validated from OpenAPI; remove `any` from auth and active APIs.
12. Add route-level loading/error boundaries, useful empty states, working notifications/search, and correct misleading sidebar links.
13. Add unit/integration/E2E coverage for auth/RBAC, screening, booking/payment, prescriptions and admin approval; include accessibility checks.
14. Consolidate custom bearer auth vs NextAuth, delete stale event/member template code, and split oversized pages into tested domain components.

### Low

15. Correct mojibake/encoding, review metadata/SEO/legal copy, remove duplicate hooks and unused dependencies, and run a formal responsive/accessibility audit.

## 10. Summary metrics

### Route metrics

- Page routes: **31**
- API routes: **1** (NextAuth catch-all)
- Required route families visibly missing: **at least 15** (patient results/history/PDF/booking/payment/consultation/prescriptions/chat/orders/notifications; doctor earnings/payouts; admin appointments/medicines/orders/payments/audit logs; several are grouped in this count)

### Feature matrix metrics

The matrix contains **50 auditable feature rows**: Public 8, Auth 9, Patient 14, Doctor 10, Admin 9.

| Classification | Count | Share |
|---|---:|---:|
| COMPLETE | 6 | 12.0% |
| PARTIAL | 3 | 6.0% |
| UI_ONLY | 8 | 16.0% |
| BROKEN | 16 | 32.0% |
| MISSING | 14 | 28.0% |
| NOT_VERIFIED | 3 | 6.0% |

`NOT_VERIFIED` is used where frontend and Postman align but OpenAPI's mounted-operation inventory omits the operation. Contract-aligned rows still lack runtime verification.

**Strict completion percentage:** **12.0%** (`COMPLETE / 50`).  
**Weighted implementation estimate:** **19.0%**, using COMPLETE=1, PARTIAL=0.5, UI_ONLY=0.25, BROKEN/MISSING/NOT_VERIFIED=0. This is a conservative planning indicator, not proof of production behavior.  
**Visible integration coverage:** **17/50 features (34.0%)** have some API wiring. Only a subset of individual calls align with at least one supplied contract; **0 integrations are runtime-verified**. OpenAPI/Postman disagreement prevents a defensible feature-level “verified contract coverage” percentage.

## Top 10 actionable issues

1. Make login functional and implement correct role redirects.
2. Enforce authentication/RBAC on the server, especially `/admin` and `/doctor`.
3. Move session tokens out of localStorage/JS cookies and fix cookie/logout inconsistencies.
4. Resolve OpenAPI/Postman path and status conflicts and publish one authoritative, versioned contract.
5. Build the real, secure AI screening upload/result/history/PDF pipeline.
6. Implement patient booking, Stripe payment and consultation/chat end-to-end.
7. Implement patient prescriptions, medicine checkout, orders and notifications.
8. Replace all admin mock data with guarded APIs and add missing management/audit routes.
9. Finish doctor earnings/payouts and validate the existing doctor API workflows.
10. Establish a working Node runtime and CI gates for typecheck, lint, build, tests, E2E and accessibility.
