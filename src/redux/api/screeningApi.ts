import { baseApi } from "./baseApi";

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

export const screeningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createScreening: builder.mutation<unknown, CreateScreeningPayload>({
      query: (body) => ({
        url: "/screenings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Screening"],
    }),

    uploadScreeningImage: builder.mutation<
      unknown,
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

    getScreeningHistory: builder.query<unknown, void>({
      query: () => "/screenings/history",
      providesTags: ["Screening"],
    }),

    getScreeningHistoryItem: builder.query<unknown, string>({
      query: (screeningId) => `/screenings/history/${screeningId}`,
      providesTags: ["Screening"],
    }),

    retryScreeningPrediction: builder.mutation<unknown, string>({
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
  useRetryScreeningPredictionMutation,
  useGetScreeningDoctorsQuery,
} = screeningApi;