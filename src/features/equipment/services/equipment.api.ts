import { baseApi } from "@/core/api/baseApi";
import type {
  DeleteEquipmentResponse,
  Equipment,
  EquipmentFormValues,
  EquipmentListResponse,
  EquipmentParams,
  EquipmentResponse,
  EquipmentResult,
  EquipmentUpdateValues
} from "../types";

export const equipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getEquipment: builder.query<EquipmentResult, EquipmentParams | void>({
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

        return `/equipments?${queryParams.toString()}`;
      },

      transformResponse: (response: EquipmentListResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),

      providesTags: ["Equipment"],
    }),

    getAllEquipment: builder.query<Equipment[], void>({
      query: () => "/equipments/all",

      transformResponse: (response: { success: boolean; data: Equipment[] }) =>
        response.data,

      providesTags: ["Equipment"],
    }),

    // GET BY ID
    getEquipmentById: builder.query<Equipment, number>({
      query: (id) => `/equipments/${id}`,

      transformResponse: (response: EquipmentResponse) => response.data,
    }),

    // CREATE
    createEquipment: builder.mutation<Equipment, EquipmentFormValues>({
      query: (data) => ({
        url: "/equipments/add",
        method: "POST",
        body: data,
      }),

      transformResponse: (response: EquipmentResponse) => response.data,

      invalidatesTags: ["Equipment", "Contractors"],
    }),

    // UPDATE
    updateEquipment: builder.mutation<
      Equipment,
      { id: number; data: EquipmentUpdateValues }
    >({
      query: ({ id, data }) => ({
        url: `/equipments/edit/${id}`,
        method: "PUT",
        body: data,
      }),

      transformResponse: (response: EquipmentResponse) => response.data,

      invalidatesTags: ["Equipment", "Contractors"],
    }),

    // DELETE
    deleteEquipment: builder.mutation<
      DeleteEquipmentResponse,
      { id: number; project_id?: number }
    >({
      query: ({ id, project_id }) => ({
        url: `/equipments/delete/${id}`,
        method: "DELETE",
        params: project_id != null ? { project_id } : {},
      }),

      invalidatesTags: ["Equipment", "Contractors"],
    }),

    // GET AVAILABLE EQUIPMENT
    getAvailableEquipments: builder.query<
      Equipment[],
      { contractorId: number; project_id?: number }
    >({
      query: ({ contractorId, project_id }) => ({
        url: "/equipments/available",
        params: {
          contractorId,
          ...(project_id ? { project_id } : {}),
        },
      }),

      transformResponse: (response: { success: boolean; data: Equipment[] }) =>
        response.data,

      providesTags: ["Equipment"],
    }),

    // LINK EXISTING EQUIPMENT TO PROJECT
    linkEquipmentToProject: builder.mutation<
      { success: boolean; message: string },
      { equipmentId: number; project_id?: number }
    >({
      query: (data) => ({
        url: "/equipments/link",
        method: "POST",
        body: data,
      }),

      invalidatesTags: ["Equipment"],
    }),
  }),
});

export const {
  useGetEquipmentQuery,
  useGetAllEquipmentQuery,
  useGetEquipmentByIdQuery,
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  useGetAvailableEquipmentsQuery,
  useLinkEquipmentToProjectMutation,
} = equipmentApi;
