/**
 * DermaCare AI — shared domain types.
 *
 * These mirror the read-only backend contract
 * (`DermaCare-AI-Server/src/docs/endpoints/m*.ts` → `openapi.json`,
 * servers: `/api/v1`). Every endpoint returns the envelope
 * `{ success, message?, data }` on success and
 * `{ success: false, error: { code, message } }` on error.
 *
 * Response shapes are intentionally tolerant: the spec examples are the source
 * of truth, and `data` payloads are normalised by the helpers below so the UI
 * never crashes on a slightly different wrapper key.
 */

/* ------------------------------------------------------------------ */
/* Envelopes                                                           */
/* ------------------------------------------------------------------ */

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface Pagination {
  page?: number;
  limit?: number;
  totalCount?: number;
  totalPages?: number;
  total?: number;
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

/**
 * Appointment lifecycle statuses.
 * `SCHEDULED -> IN_PROGRESS -> COMPLETED` (doctor-driven, see m06),
 * `SCHEDULED -> CANCELLATION_REQUESTED -> CANCELLED`, and direct `CANCELLED`.
 */
export type AppointmentStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "CANCELLATION_REQUESTED";

export interface AppointmentSummary {
  /** Normalised identifier (spec list uses `id`, booking create uses `appointmentId`). */
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: AppointmentStatus;
  scheduledTime: string;
  doctorName?: string;
  patientName?: string;
}

export interface AppointmentDetail extends AppointmentSummary {
  patientEmail?: string;
  consentRecorded?: boolean;
  consentGiven?: boolean;
  hasScreeningAttached?: boolean;
  screeningId?: string;
  /** Free-text chief complaint provided by the patient at booking time. */
  reason?: string;
  patientNotes?: string;
  consultationSummary?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ConsultationTransition = "IN_PROGRESS" | "COMPLETED";

export interface ConsultationTransitionResult {
  appointmentId?: string;
  previousStatus?: AppointmentStatus;
  currentStatus?: AppointmentStatus;
  completedAt?: string;
  chatWindowExpiresAt?: string;
}

/* ------------------------------------------------------------------ */
/* Screening / pre-consultation                                        */
/* ------------------------------------------------------------------ */

export type RiskLevel = "LOW" | "MODERATE" | "HIGH";

/** Attached screening returned by `GET /appointments/{id}/pre-consultation`. */
export interface AttachedScreening {
  id: string;
  bodyPart: string;
  detectedCondition: string;
  confidenceScore: number;
  riskLevel: RiskLevel;
  redFlagDetected?: boolean;
  signedImageUrl?: string;
  /** Present in some payloads; kept optional for tolerance. */
  screeningId?: string;
}

export interface PreConsultationPatient {
  id?: string;
  name?: string;
  age?: number;
  gender?: string;
  skinType?: string;
  knownAllergies?: string[];
}

/** `GET /appointments/{id}/pre-consultation` (consent-gated). */
export interface PreConsultation {
  appointmentId?: string;
  patient?: PreConsultationPatient;
  attachedScreening?: AttachedScreening | null;
  patientNotes?: string;
  /** Optional extras tolerated from richer payloads. */
  symptoms?: string;
  /**
   * NOTE: the current contract does not return pre-existing conditions for
   * doctors. Kept optional/tolerant so the UI can display them if the backend
   * adds them later, without inventing a field.
   */
  existingConditions?: string[];
  previousScreenings?: AttachedScreening[];
}

/** `GET /appointments/{id}/video` — time-gated Jitsi access. */
export interface VideoAccess {
  roomName?: string;
  domain?: string;
  jwtToken?: string;
  role?: string;
  validFrom?: string;
  validUntil?: string;
}

/* ------------------------------------------------------------------ */
/* Consultants / doctors                                               */
/* ------------------------------------------------------------------ */

export type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface SpecializationItem {
  id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/** `GET /doctors/{id}` public verified doctor profile. */
export interface DoctorProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  /** Primary specialization name */
  specialization?: string;
  specializations?: SpecializationItem[];
  specialties?: string[];
  /** Spec returns a single string; array form tolerated. */
  qualifications?: string | string[];
  bio?: string;
  consultationFee?: number | string;
  currency?: string;
  rating?: number | string;
  reviewCount?: number;
  ratingCount?: number;
  totalReviews?: number;
  yearsExperience?: number;
  experienceYears?: number;
  avatarUrl?: string;
  isFeatured?: boolean;
  verificationStatus?: VerificationStatus;
  licenseStatus?: VerificationStatus;
  licenseNumber?: string;
  user?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** `GET /doctors` list item. */
export interface DoctorListItem {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization?: string;
  specializations?: SpecializationItem[];
  specialties?: string[];
  consultationFee?: number | string;
  currency?: string;
  rating?: number | string;
  ratingCount?: number;
  totalReviews?: number;
  experienceYears?: number;
  qualifications?: string | string[];
  bio?: string;
  isFeatured?: boolean;
  matchedCondition?: string;
  nextAvailableSlot?: string;
  user?: {
    id?: string;
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** `GET /doctors/{id}/slots`, `POST /doctors/me/slots`. */
export interface DoctorSlot {
  id: string;
  doctorId?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  fee?: number;
  status?: "AVAILABLE" | "HELD" | "BOOKED";
}

export interface DoctorLicenseSubmission {
  licenseNumber: string;
  issuingState: string;
  documentUrl: string;
  expiryDate: string;
}

/* ------------------------------------------------------------------ */
/* Prescriptions & medications                                         */
/* ------------------------------------------------------------------ */

export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export type PrescriptionStatus = "DRAFT" | "FINALIZED";

export interface Prescription {
  id: string;
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  patientId?: string;
  patientName?: string;
  diagnosis?: string;
  doctorNotes?: string;
  status: PrescriptionStatus;
  version?: number;
  items?: PrescriptionItem[];
  itemCount?: number;
  finalizedAt?: string;
  createdAt?: string;
  digitalSignature?: string;
  versionHistory?: Array<{
    version: number;
    status: PrescriptionStatus;
    finalizedAt?: string;
  }>;
}

/** `GET /medications` — derived from finalized prescriptions. */
export interface Medication {
  id?: string;
  medicineName?: string;
  dosage?: string;
  prescribedBy?: string;
  startDate?: string;
  endDate?: string;
  status?: "current" | "history";
}

/* ------------------------------------------------------------------ */
/* Chat                                                                */
/* ------------------------------------------------------------------ */

/** `GET /appointments/{id}/conversation`. */
export interface Conversation {
  conversationId: string;
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  isActive?: boolean;
  completedAt?: string;
  expiresAt?: string;
  totalMessages?: number;
}

/** `GET|POST /conversations/{id}/messages`. */
export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  senderRole?: string;
  senderName?: string;
  content: string;
  sentAt?: string;
}

/* ------------------------------------------------------------------ */
/* Store                                                              */
/* ------------------------------------------------------------------ */

/** `GET /store/medicines`, `GET /store/medicines/{id}`. */
export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  packSize?: string;
  category?: string;
  price?: number;
  currency?: string;
  requiresPrescription?: boolean;
  inStock?: boolean;
  stockQuantity?: number;
  contraindications?: string[];
  storageInstructions?: string;
  manufacturer?: string;
}

/* ------------------------------------------------------------------ */
/* Normalisation helpers                                              */
/* ------------------------------------------------------------------ */

/** Unwraps `{ data: ... }` envelopes while tolerating bare payloads. */
export function unwrapEnvelope<T = unknown>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as object)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

const LIST_KEYS = [
  "items",
  "results",
  "data",
  "appointments",
  "prescriptions",
  "doctors",
  "medicines",
  "slots",
  "messages",
  "screenings",
  "orders",
  "medications",
] as const;

/**
 * Normalises a list response that may be a bare array or a wrapper object using
 * any of the collection keys defined in the backend contract.
 */
export function extractList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of LIST_KEYS) {
      const value = record[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/** Normalises a raw doctor record into DoctorListItem */
export function normalizeDoctorListItem(raw: unknown): DoctorListItem | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = str(record.id);
  if (!id) return null;

  const user = asRecord(record.user);
  const name = str(user?.name) ?? str(record.name) ?? "Doctor";

  // Specialization handling
  const rawSpec = record.specialization;
  const primarySpecName =
    typeof rawSpec === "string"
      ? str(rawSpec)
      : str(asRecord(rawSpec)?.name);

  // Specializations array handling
  const rawSpecsList = Array.isArray(record.specializations)
    ? record.specializations
    : Array.isArray(record.specialties)
    ? record.specialties
    : [];

  const specialties: string[] = [];
  if (primarySpecName) {
    specialties.push(primarySpecName);
  }

  for (const item of rawSpecsList) {
    const specName =
      typeof item === "string"
        ? str(item)
        : str(asRecord(item)?.name);
    if (specName && !specialties.includes(specName)) {
      specialties.push(specName);
    }
  }

  const fee = parseNumber(record.consultationFee);
  const rating = parseNumber(record.rating);
  const ratingCount =
    typeof record.ratingCount === "number"
      ? record.ratingCount
      : typeof record.totalReviews === "number"
      ? record.totalReviews
      : typeof record.reviewCount === "number"
      ? record.reviewCount
      : undefined;

  const avatarUrl =
    str(record.avatarUrl) ??
    str(record.image) ??
    str(record.imageUrl) ??
    str(record.profileImage);

  return {
    ...record,
    id,
    name,
    avatarUrl,
    specialties,
    specialization: primarySpecName ?? specialties[0],
    consultationFee: fee,
    currency: str(record.currency) ?? "USD",
    rating,
    ratingCount,
    totalReviews: ratingCount,
    experienceYears:
      typeof record.experienceYears === "number"
        ? record.experienceYears
        : typeof record.yearsExperience === "number"
        ? record.yearsExperience
        : undefined,
  };
}

/** Normalises a raw doctor record into DoctorProfile */
export function normalizeDoctorProfile(raw: unknown): DoctorProfile | null {
  const item = normalizeDoctorListItem(raw);
  if (!item) return null;

  const record = asRecord(raw) ?? {};
  const user = asRecord(record.user);

  return {
    ...record,
    ...item,
    email: str(user?.email) ?? str(record.email),
    phone: str(user?.phone) ?? str(record.phone),
    bio: str(record.bio),
    qualifications: record.qualifications as string | string[] | undefined,
    yearsExperience: item.experienceYears,
  };
}

/** Normalises an appointment object that may use `id` or `appointmentId`. */
export function normalizeAppointment(raw: unknown): AppointmentSummary | null {
  const record = asRecord(raw);
  if (!record) return null;

  const id = str(record.appointmentId) ?? str(record.id);
  if (!id) return null;

  const nestedDoctor = asRecord(record.doctor);
  const nestedPatient = asRecord(record.patient);

  return {
    appointmentId: id,
    doctorId: str(record.doctorId) ?? str(nestedDoctor?.id) ?? "",
    patientId: str(record.patientId) ?? str(nestedPatient?.id) ?? "",
    status: (str(record.status) as AppointmentStatus) ?? "SCHEDULED",
    scheduledTime:
      str(record.scheduledTime) ?? str(record.scheduledAt) ?? "",
    doctorName: str(record.doctorName) ?? str(nestedDoctor?.name),
    patientName: str(record.patientName) ?? str(nestedPatient?.name),
  };
}

export function normalizeAppointments(payload: unknown): AppointmentSummary[] {
  return extractList<unknown>(payload)
    .map(normalizeAppointment)
    .filter((a): a is AppointmentSummary => Boolean(a));
}

/** Normalises `GET /appointments/{id}` into the detail shape. */
export function normalizeAppointmentDetail(
  payload: unknown
): AppointmentDetail | null {
  const base = normalizeAppointment(payload);
  if (!base) return null;
  const record = asRecord(payload) ?? {};
  const nestedPatient = asRecord(record.patient);

  return {
    ...base,
    patientEmail: str(record.patientEmail) ?? str(nestedPatient?.email),
    consentRecorded:
      typeof record.consentRecorded === "boolean"
        ? record.consentRecorded
        : undefined,
    consentGiven:
      typeof record.consentGiven === "boolean" ? record.consentGiven : undefined,
    hasScreeningAttached:
      typeof record.hasScreeningAttached === "boolean"
        ? record.hasScreeningAttached
        : undefined,
    screeningId: str(record.screeningId),
    reason: str(record.reason) ?? str(record.patientNotes),
    patientNotes: str(record.patientNotes),
    consultationSummary: str(record.consultationSummary),
    createdAt: str(record.createdAt),
    updatedAt: str(record.updatedAt),
  };
}

/** Normalises the conversation metadata (`conversationId` may be `id`). */
export function normalizeConversation(payload: unknown): Conversation | null {
  const body = asRecord(unwrapEnvelope(payload));
  if (!body) return null;
  const conversationId =
    str(body.conversationId) ?? str(body.id) ?? str(body.conversation_id);
  if (!conversationId) return null;
  return {
    conversationId,
    appointmentId: str(body.appointmentId),
    patientId: str(body.patientId),
    doctorId: str(body.doctorId),
    isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    completedAt: str(body.completedAt),
    expiresAt: str(body.expiresAt),
    totalMessages:
      typeof body.totalMessages === "number" ? body.totalMessages : undefined,
  };
}

/** Builds the Jitsi join URL from the time-gated credentials. */
export function buildVideoUrl(video?: VideoAccess | null): string | undefined {
  if (!video?.domain || !video.roomName) return undefined;
  const base = `https://${video.domain}/${video.roomName}`;
  return video.jwtToken
    ? `${base}?jwt=${encodeURIComponent(video.jwtToken)}`
    : base;
}

/** Appointment statuses used across the UI, in display order. */
export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLATION_REQUESTED",
  "CANCELLED",
];
