import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type { Equipment, EquipmentFormValues } from "../types";

type EquipmentParams = PaginationParams & {
  search?: string;
};

type EquipmentResponse = {
  success: boolean;
  message?: string;
  data: Equipment;
};

type EquipmentListResponse = {
  success: boolean;
  data: Equipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type DeleteEquipmentResponse = {
  success: boolean;
  message: string;
};

export type EquipmentResult = {
  data: Equipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

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

      transformResponse: (response: {
        success: boolean;
        data: Equipment[];
      }) => response.data,

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

      invalidatesTags: ["Equipment"],
    }),

    // UPDATE
    updateEquipment: builder.mutation<
      Equipment,
      { id: number; data: EquipmentFormValues }
    >({
      query: ({ id, data }) => ({
        url: `/equipments/edit/${id}`,
        method: "PUT",
        body: data,
      }),

      transformResponse: (response: EquipmentResponse) => response.data,

      invalidatesTags: ["Equipment"],
    }),

    // DELETE
    deleteEquipment: builder.mutation<DeleteEquipmentResponse, number>({
      query: (id) => ({
        url: `/equipments/delete/${id}`,
        method: "DELETE",
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
} = equipmentApi;
