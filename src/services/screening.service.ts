
import { apiRequest } from "@/lib/api";

export type ScreeningImageType = "FRONT" | "LEFT" | "RIGHT" | "OTHER";

export interface CreateScreeningPayload {
  symptoms: string;
  hasBleeding?: boolean;
  rapidGrowth?: boolean;
  hasFever?: boolean;
  hasUlceration?: boolean;
  severePain?: boolean;
}

export const screeningService = {
  create: (token: string, payload: CreateScreeningPayload) =>
    apiRequest("/screenings", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  uploadImage: (
    token: string,
    screeningId: string,
    imageType: ScreeningImageType,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append("screeningId", screeningId);
    formData.append("imageType", imageType);
    formData.append("image", file);

    return apiRequest("/screenings/images", {
      method: "POST",
      token,
      body: formData,
    });
  },

  getHistory: (token: string) =>
    apiRequest("/screenings/history", { token }),

  getHistoryItem: (token: string, screeningId: string) =>
    apiRequest(`/screenings/history/${screeningId}`, { token }),

  retryPrediction: (token: string, screeningId: string) =>
    apiRequest(`/screenings/${screeningId}/retry`, {
      method: "POST",
      token,
    }),

  getRecommendedDoctors: (token: string, screeningId: string) =>
    apiRequest(`/screenings/${screeningId}/doctors`, { token }),
};
