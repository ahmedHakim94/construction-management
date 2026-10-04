import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type {
  Contractor,
  ContractorDetails,
  ContractorFormValues,
} from "../types";

type ContractorsParams = PaginationParams & {
  search?: string;
};

type ContractorsResponse = {
  success: boolean;
  data: Contractor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ContractorResponse = {
  success: boolean;
  message?: string;
  data: Contractor;
};

type DeleteContractorResponse = {
  success: boolean;
  message: string;
};

export type ContractorsResult = {
  data: Contractor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const contractorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getContractors: builder.query<ContractorsResult, ContractorsParams | void>({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        const search = params?.search?.trim() ?? "";

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (search) {
          queryParams.set("search", search);
        }

        return `/contractors?${queryParams.toString()}`;
      },

      transformResponse: (response: ContractorsResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),

      providesTags: ["Contractors"],
    }),

    getAllContractors: builder.query<Contractor[], void>({
      query: () => "/contractors/all",

      transformResponse: (response: { success: boolean; data: Contractor[] }) =>
        response.data,

      providesTags: ["Contractors"],
    }),

    // GET BY ID
    getContractorById: builder.query<ContractorDetails, number>({
      query: (id) => `/contractors/${id}`,

      transformResponse: (response: {
        success: boolean;
        data: ContractorDetails;
      }) => response.data,

      providesTags: ["Contractors"],
    }),

    // CREATE
    createContractor: builder.mutation<Contractor, ContractorFormValues>({
      query: (data) => ({
        url: "/contractors/add",
        method: "POST",
        body: data,
      }),

      transformResponse: (response: ContractorResponse) => response.data,

      invalidatesTags: ["Contractors", "Equipment"],
    }),

    // UPDATE
    updateContractor: builder.mutation<
      Contractor,
      { id: number; data: ContractorFormValues }
    >({
      query: ({ id, data }) => ({
        url: `/contractors/edit/${id}`,
        method: "PUT",
        body: data,
      }),

      transformResponse: (response: ContractorResponse) => response.data,

      invalidatesTags: ["Contractors", "Equipment"],
    }),

    // DELETE
    deleteContractor: builder.mutation<DeleteContractorResponse, number>({
      query: (id) => ({
        url: `/contractors/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Contractors", "Equipment"],
    }),
  }),
});

export const {
  useGetContractorsQuery,
  useGetAllContractorsQuery,
  useGetContractorByIdQuery,
  useCreateContractorMutation,
  useUpdateContractorMutation,
  useDeleteContractorMutation,
} = contractorApi;
