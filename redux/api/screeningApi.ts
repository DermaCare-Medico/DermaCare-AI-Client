import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface CreateScreeningRequest {
  symptoms: string;
  hasBleeding: boolean;
  rapidGrowth: boolean;
  hasFever: boolean;
  hasUlceration: boolean;
  severePain: boolean;
}

export type ScreeningCondition = {
  id?: string;
  name?: string;
  overview?: string;
  symptoms?: string[];
  warningSigns?: string[];
  prevention?: string | null;
  naturalCare?: string | null;
  safeForHomeCare?: boolean;
  riskCategory?: string;
  [key: string]: unknown;
};

export interface ScreeningPrediction {
  condition?: string | ScreeningCondition;
  label?: string;
  confidence?: number | string;
  confidenceScore?: number | string;
  score?: number | string;
  [key: string]: unknown;
}

export interface ScreeningImageItem {
  id: string;
  imageType?: string;
  imageUrl?: string;
  url?: string;
  signedUrl?: string;
  storageKey?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ScreeningRecord {
  id?: string;
  screeningId?: string;
  userId?: string;
  status?: string;
  aiStatus?: string;
  symptoms?: string;
  imageQualityStatus?: string;
  riskLevel?: string;
  redFlagDetected?: boolean;
  redFlags?: string[];
  disclaimer?: string;
  recommendations?: string[];
  suggestions?: string[];
  nextSteps?: string[];
  prediction?: string | ScreeningPrediction | null;
  topPrediction?: string | ScreeningPrediction | null;
  predictedClass?: string;
  confidence?: number | string;
  confidenceScore?: number | string;
  createdAt?: string;
  updatedAt?: string;
  predictions?: Array<ScreeningPrediction | null>;
  alternativePredictions?: Array<ScreeningPrediction | null>;
  images?: ScreeningImageItem[];
  imageUrl?: string;
  signedImageUrl?: string;
  [key: string]: unknown;
}

export interface ScreeningListArgs {
  page?: number;
  limit?: number;
}

export type NormalizedScreeningStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "UNKNOWN";

export function getScreeningStatus(record?: ScreeningRecord | null): NormalizedScreeningStatus {
  if (!record) return "UNKNOWN";
  const rawStatus = (record.aiStatus ?? record.status ?? "").trim().toUpperCase();
  if (!rawStatus) return "UNKNOWN";
  if (rawStatus === "COMPLETED") return "COMPLETED";
  if (rawStatus === "PROCESSING") return "PROCESSING";
  if (rawStatus === "PENDING") return "PENDING";
  if (rawStatus === "FAILED") return "FAILED";
  return "UNKNOWN";
}

export function parseConfidenceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 0 && value <= 1 ? value * 100 : value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) {
      return parsed >= 0 && parsed <= 1 ? parsed * 100 : parsed;
    }
  }
  return null;
}

export function safeScreeningText(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "object" && value !== null) {
    const candidate =
      "name" in value && typeof (value as { name: unknown }).name === "string"
        ? (value as { name: string }).name
        : "label" in value && typeof (value as { label: unknown }).label === "string"
        ? (value as { label: string }).label
        : null;
    return candidate && candidate.trim().length > 0 ? candidate.trim() : null;
  }
  return null;
}

export function getHighestScoringPrediction(
  record?: ScreeningRecord | null
): { condition: string; confidenceScore: number | null } | null {
  if (!record) return null;

  const candidates: ScreeningPrediction[] = [];

  if (Array.isArray(record.predictions)) {
    for (const item of record.predictions) {
      if (item) candidates.push(item);
    }
  }
  if (Array.isArray(record.alternativePredictions)) {
    for (const item of record.alternativePredictions) {
      if (item) candidates.push(item);
    }
  }
  if (record.topPrediction && typeof record.topPrediction === "object") {
    candidates.push(record.topPrediction);
  }
  if (record.prediction && typeof record.prediction === "object") {
    candidates.push(record.prediction);
  }

  let highestScore = -1;
  let topItem: ScreeningPrediction | null = null;

  for (const item of candidates) {
    if (!item) continue;
    const score = parseConfidenceNumber(
      item.confidenceScore ?? item.confidence ?? item.score
    );
    if (score !== null && score > highestScore) {
      highestScore = score;
      topItem = item;
    } else if (topItem === null && safeScreeningText(item.condition ?? item.label)) {
      topItem = item;
    }
  }

  if (!topItem) {
    const fallbackText =
      (typeof record.prediction === "string" ? record.prediction : null) ??
      (typeof record.topPrediction === "string" ? record.topPrediction : null) ??
      record.predictedClass;
    if (fallbackText) {
      const parsedScore = parseConfidenceNumber(record.confidenceScore ?? record.confidence);
      return {
        condition: fallbackText,
        confidenceScore: parsedScore,
      };
    }
    return null;
  }

  const conditionName =
    safeScreeningText(topItem.condition) ??
    safeScreeningText(topItem.label) ??
    "Condition unclassified";

  return {
    condition: conditionName,
    confidenceScore: highestScore >= 0 ? highestScore : null,
  };
}

export function getPredictionFields(record?: ScreeningRecord | null): {
  condition: string;
  confidence: number | null;
} {
  const top = getHighestScoringPrediction(record);
  if (top) {
    return {
      condition: top.condition,
      confidence: top.confidenceScore,
    };
  }

  const rawStatus = getScreeningStatus(record);
  if (rawStatus === "COMPLETED") {
    return {
      condition: "Condition unclassified",
      confidence: null,
    };
  }
  if (rawStatus === "PROCESSING" || rawStatus === "PENDING") {
    return {
      condition: "Analysis pending",
      confidence: null,
    };
  }
  if (rawStatus === "FAILED") {
    return {
      condition: "Analysis unsuccessful",
      confidence: null,
    };
  }

  return {
    condition: "Screening status unavailable",
    confidence: null,
  };
}

export function formatConfidence(value?: unknown): string {
  const parsed = parseConfidenceNumber(value);
  if (parsed === null) return "Not reported";
  return `${Math.round(parsed)}%`;
}

export const screeningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createScreening: builder.mutation<ApiEnvelope<ScreeningRecord>, CreateScreeningRequest>({
      query: (body) => ({
        url: "/screenings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Screenings"],
    }),

    uploadScreeningImage: builder.mutation<
      ApiEnvelope<ScreeningRecord>,
      { screeningId: string; imageType: "FRONT" | "LEFT" | "RIGHT" | "OTHER"; image: File }
    >({
      query: ({ screeningId, imageType, image }) => {
        const body = new FormData();
        body.append("screeningId", screeningId);
        body.append("imageType", imageType);
        body.append("image", image);
        return {
          url: "/screenings/images",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Screenings"],
    }),

    getScreeningHistory: builder.query<
      ApiEnvelope<ScreeningRecord[] | { screenings?: ScreeningRecord[] }>,
      ScreeningListArgs | void
    >({
      query: (params) => ({
        url: "/screenings/history",
        params: params || undefined,
      }),
      providesTags: ["Screenings"],
    }),

    getScreening: builder.query<ApiEnvelope<ScreeningRecord>, string>({
      query: (id) => `/screenings/history/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Screenings", id }],
    }),

    getScreeningHistoryItem: builder.query<ApiEnvelope<ScreeningRecord>, string>({
      query: (id) => `/screenings/history/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Screenings", id }],
    }),

    retryScreening: builder.mutation<ApiEnvelope<ScreeningRecord>, string>({
      query: (id) => ({
        url: `/screenings/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => ["Screenings", { type: "Screenings", id }],
    }),

    retryScreeningPrediction: builder.mutation<ApiEnvelope<ScreeningRecord>, string>({
      query: (id) => ({
        url: `/screenings/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => ["Screenings", { type: "Screenings", id }],
    }),

    getScreeningDoctors: builder.query<unknown, string>({
      query: (screeningId) => `/screenings/${screeningId}/doctors`,
    }),
  }),
});

export const {
  useCreateScreeningMutation,
  useUploadScreeningImageMutation,
  useGetScreeningHistoryQuery,
  useGetScreeningQuery,
  useGetScreeningHistoryItemQuery,
  useRetryScreeningMutation,
  useRetryScreeningPredictionMutation,
  useGetScreeningDoctorsQuery,
} = screeningApi;
