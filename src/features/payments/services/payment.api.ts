import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type {
  PaymentDetails,
  PaymentDetailsParams,
  PaymentDetailsResponse,
  PaymentSummary,
  RecordPaymentPayload,
  RecordPaymentResponse,
} from "../types";

type PaymentsResponse = {
  success: boolean;
  data: PaymentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PaymentsResult = {
  data: PaymentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentsResult, PaginationParams>({
      query: ({ page, limit, search, projectId, year, month }) => ({
        url: "/payments",
        params: {
          page,
          limit,
          ...(search?.trim() && { search: search.trim() }),
          ...(projectId !== "" && projectId != null && { projectId }),
          ...(year !== "" && year != null && { year }),
          ...(month !== "" && month != null && { month }),
        },
      }),

      transformResponse: (response: PaymentsResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),

      providesTags: ["Payments"],
    }),

    recordPayment: builder.mutation<
      RecordPaymentResponse,
      RecordPaymentPayload
    >({
      query: (payload) => ({
        url: "/payments/record",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Payments"],
    }),

    getPaymentDetails: builder.query<PaymentDetails, PaymentDetailsParams>({
      query: ({ contractorId, projectId, year, month }) => ({
        url: "/payments/details",
        params: {
          contractorId,
          projectId,
          year,
          month,
        },
      }),

      transformResponse: (response: PaymentDetailsResponse) => response.data,

      providesTags: ["Payments"],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useRecordPaymentMutation,
  useGetPaymentDetailsQuery,
} = paymentApi;
