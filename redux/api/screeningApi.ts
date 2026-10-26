import { baseApi } from "./baseApi";
import type { ApiEnvelope } from "@/types/doctor";

export interface CreateScreeningRequest { symptoms: string; hasBleeding: boolean; rapidGrowth: boolean; hasFever: boolean; hasUlceration: boolean; severePain: boolean }
export interface ScreeningPrediction { condition?: string; label?: string; confidence?: number; confidenceScore?: number }
export interface ScreeningRecord { id?: string; screeningId?: string; status?: string; symptoms?: string; prediction?: string | ScreeningPrediction | null; topPrediction?: string | ScreeningPrediction | null; predictedClass?: string; confidence?: number; confidenceScore?: number; riskLevel?: string; createdAt?: string; predictions?: Array<ScreeningPrediction | null>; alternativePredictions?: Array<ScreeningPrediction | null>; redFlags?: string[]; [key: string]: unknown }
export interface ScreeningListArgs { page?: number; limit?: number }

export function getPredictionFields(record: ScreeningRecord): { condition: string; confidence?: number } {
  const prediction = record.topPrediction ?? record.prediction;
  if (prediction && typeof prediction === "object") {
    return {
      condition: prediction.condition ?? prediction.label ?? record.predictedClass ?? "Analysis pending",
      confidence: prediction.confidenceScore ?? prediction.confidence ?? record.confidenceScore ?? record.confidence,
    };
  }
  return {
    condition: typeof prediction === "string" ? prediction : record.predictedClass ?? "Analysis pending",
    confidence: record.confidenceScore ?? record.confidence,
  };
}

export function formatConfidence(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Not reported";
  const percentage = value >= 0 && value <= 1 ? value * 100 : value;
  return `${Math.round(percentage)}%`;
}

export const screeningApi = baseApi.injectEndpoints({ endpoints: (builder) => ({
  createScreening: builder.mutation<ApiEnvelope<ScreeningRecord>, CreateScreeningRequest>({ query: (body) => ({ url: "/screenings/", method: "POST", body }), invalidatesTags: ["Screenings"] }),
  uploadScreeningImage: builder.mutation<ApiEnvelope<ScreeningRecord>, { screeningId: string; imageType: "FRONT" | "LEFT" | "RIGHT" | "OTHER"; image: File }>({ query: ({ screeningId, imageType, image }) => { const body = new FormData(); body.append("screeningId", screeningId); body.append("imageType", imageType); body.append("image", image); return { url: "/screenings/images", method: "POST", body }; }, invalidatesTags: ["Screenings"] }),
  getScreeningHistory: builder.query<ApiEnvelope<ScreeningRecord[] | { screenings?: ScreeningRecord[] }>, ScreeningListArgs | void>({ query: (params) => ({ url: "/screenings/history", params: params || undefined }), providesTags: ["Screenings"] }),
  getScreening: builder.query<ApiEnvelope<ScreeningRecord>, string>({ query: (id) => `/screenings/history/${id}`, providesTags: (_r, _e, id) => [{ type: "Screenings", id }] }),
  retryScreening: builder.mutation<ApiEnvelope<ScreeningRecord>, string>({ query: (id) => ({ url: `/screenings/${id}/retry`, method: "POST" }), invalidatesTags: (_r, _e, id) => ["Screenings", { type: "Screenings", id }] }),
}) });
export const { useCreateScreeningMutation, useUploadScreeningImageMutation, useGetScreeningHistoryQuery, useGetScreeningQuery, useRetryScreeningMutation } = screeningApi;
