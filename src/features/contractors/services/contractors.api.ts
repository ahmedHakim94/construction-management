import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type {
  AvailableContractor,
  ChangeContractorStatusPayload,
  Contractor,
  ContractorDetails,
  ContractorFormValues,
  ContractorProject,
  ContractorResponse,
  ContractorsParams,
  ContractorsResponse,
  ContractorsResult,
  DeleteContractorResponse,
  ExternalContractor,
  LinkContractorPayload,
  LinkContractorResponse,
  UnlinkContractorPayload,
} from "../types";

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
    unlinkContractor: builder.mutation<
      { success: boolean; message: string },
      UnlinkContractorPayload
    >({
      query: ({ contractorId, project_ids }) => ({
        url: `/contractors/unlink/${contractorId}`,
        method: "POST",
        ...(project_ids && { body: { project_ids } }),
      }),
      invalidatesTags: ["Contractors"],
    }),

    // external contractor

    getExternalContractors: builder.query<ExternalContractor[], void>({
      query: () => "/contractors/external",

      transformResponse: (response: {
        success: boolean;
        data: ExternalContractor[];
      }) => response.data,

      providesTags: ["Contractors"],
    }),

    createExternalContractor: builder.mutation<
      ExternalContractor,
      { name: string; phone?: string }
    >({
      query: (data) => ({
        url: "/contractors/external/add",
        method: "POST",
        body: data,
      }),

      transformResponse: (response: {
        success: boolean;
        data: ExternalContractor;
      }) => response.data,

      invalidatesTags: ["Contractors"],
    }),

    getAvailableContractors: builder.query<
      AvailableContractor[],
      number | void
    >({
      query: (projectId) => ({
        url: "/contractors/available",
        params: projectId ? { project_id: projectId } : {},
      }),

      transformResponse: (response: {
        success: boolean;
        data: AvailableContractor[];
      }) => response.data,

      providesTags: ["Contractors"],
    }),

    linkContractorToProject: builder.mutation<
      LinkContractorResponse,
      LinkContractorPayload
    >({
      query: (data) => ({
        url: "/contractors/link",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Contractors"],
    }),

    getContractorProjects: builder.query<ContractorProject[], number>({
      query: (contractorId) => `/contractors/${contractorId}/projects`,

      transformResponse: (response: {
        success: boolean;
        data: ContractorProject[];
      }) => response.data,

      providesTags: ["Contractors"],
    }),

    changeContractorStatus: builder.mutation<
      { success: boolean; message: string },
      ChangeContractorStatusPayload
    >({
      query: ({ id, status }) => ({
        url: `/contractors/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Contractors"],
    }),
  }),
});

export const {
  useGetContractorsQuery,
  useGetAllContractorsQuery,
  useGetContractorByIdQuery,
  useCreateContractorMutation,
  useUpdateContractorMutation,
  useUnlinkContractorMutation,
  useGetExternalContractorsQuery,
  useCreateExternalContractorMutation,
  useGetAvailableContractorsQuery,
  useLinkContractorToProjectMutation,
  useGetContractorProjectsQuery,
  useChangeContractorStatusMutation,
} = contractorApi;
