import { baseApi } from "./baseApi";

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

export type ScreeningPredictionItem = {
  id?: string;
  condition?: string | ScreeningCondition;
  confidenceScore?: number | string;
  confidence?: number | string;
  score?: number | string;
  label?: string;
  riskCategory?: string;
  [key: string]: unknown;
};

export type ScreeningImageItem = {
  id: string;
  imageType?: string;
  imageUrl?: string;
  url?: string;
  signedUrl?: string;
  storageKey?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type ScreeningRecord = {
  id?: string;
  screeningId?: string;
  userId?: string;
  symptoms?: string;
  imageQualityStatus?: string;
  riskLevel?: string;
  redFlagDetected?: boolean;
  aiStatus?: string;
  status?: string;
  disclaimer?: string;
  recommendations?: string[];
  suggestions?: string[];
  nextSteps?: string[];
  predictions?: ScreeningPredictionItem[];
  alternativePredictions?: ScreeningPredictionItem[];
  prediction?: ScreeningPredictionItem;
  topPrediction?: ScreeningPredictionItem;
  images?: ScreeningImageItem[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

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

  const candidates: ScreeningPredictionItem[] = [];

  if (Array.isArray(record.predictions)) {
    candidates.push(...record.predictions);
  }
  if (Array.isArray(record.alternativePredictions)) {
    candidates.push(...record.alternativePredictions);
  }
  if (record.topPrediction && typeof record.topPrediction === "object") {
    candidates.push(record.topPrediction);
  }
  if (record.prediction && typeof record.prediction === "object") {
    candidates.push(record.prediction);
  }

  let highestScore = -1;
  let topItem: ScreeningPredictionItem | null = null;

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

  if (!topItem) return null;

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
  if (parsed === null) return "Confidence unavailable";
  return `${parsed.toFixed(1)}%`;
}

export type CreateScreeningPayload = {
  symptoms: string;
  hasBleeding?: boolean;
  rapidGrowth?: boolean;
  hasFever?: boolean;
  hasUlceration?: boolean;
  severePain?: boolean;
};

export type ScreeningImageType = "FRONT" | "LEFT" | "RIGHT" | "OTHER";

export type UploadScreeningImagePayload = {
  screeningId: string;
  imageType: ScreeningImageType;
  image: File;
};

export type ScreeningListResponse = {
  statusCode: number;
  message: string;
  data: ScreeningRecord[] | { screenings: ScreeningRecord[]; total?: number };
};

export type ScreeningDetailResponse = {
  statusCode: number;
  message: string;
  data: ScreeningRecord;
};

export const screeningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createScreening: builder.mutation<ScreeningDetailResponse, CreateScreeningPayload>({
      query: (body) => ({
        url: "/screenings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Screening"],
    }),

    uploadScreeningImage: builder.mutation<
      ScreeningDetailResponse,
      UploadScreeningImagePayload
    >({
      query: ({ screeningId, imageType, image }) => {
        const formData = new FormData();

        formData.append("screeningId", screeningId);
        formData.append("imageType", imageType);
        formData.append("image", image);

        return {
          url: "/screenings/images",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Screening"],
    }),

    getScreeningHistory: builder.query<ScreeningListResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/screenings/history",
        params: params || undefined,
      }),
      providesTags: ["Screening"],
    }),

    getScreeningHistoryItem: builder.query<ScreeningDetailResponse, string>({
      query: (screeningId) => `/screenings/history/${screeningId}`,
      providesTags: ["Screening"],
    }),

    getScreening: builder.query<ScreeningDetailResponse, string>({
      query: (screeningId) => `/screenings/history/${screeningId}`,
      providesTags: ["Screening"],
    }),

    retryScreeningPrediction: builder.mutation<ScreeningDetailResponse, string>({
      query: (screeningId) => ({
        url: `/screenings/${screeningId}/retry`,
        method: "POST",
      }),
      invalidatesTags: ["Screening"],
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
  useGetScreeningHistoryItemQuery,
  useGetScreeningQuery,
  useRetryScreeningPredictionMutation,
  useGetScreeningDoctorsQuery,
} = screeningApi;
} = screeningApi;