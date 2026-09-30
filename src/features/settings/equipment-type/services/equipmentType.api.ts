import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type { EquipmentType, EquipmentTypeFormValues } from "../types";

type EquipmentTypesResponse = {
  success: boolean;
  data: EquipmentType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type EquipmentTypeResponse = {
  success: boolean;
  message?: string;
  data: EquipmentType;
};

type DeleteEquipmentTypeResponse = {
  success: boolean;
  message: string;
};

export type EquipmentTypesResult = {
  data: EquipmentType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};


export const equipmentTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getEquipmentTypes: builder.query<
      EquipmentTypesResult,
      PaginationParams | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        return `/equipment_types?page=${page}&limit=${limit}`;
      },

      transformResponse: (response: EquipmentTypesResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),

      providesTags: ["EquipmentTypes"],
    }),


    // GET BY ID
    getEquipmentTypeById: builder.query<EquipmentType, string>({
      query: (id) => `/equipment_types/${id}`,

      transformResponse: (response: EquipmentTypeResponse) => response.data,
    }),

    // CREATE
    createEquipmentType: builder.mutation<
      EquipmentType,
      EquipmentTypeFormValues
    >({
      query: (data) => ({
        url: "/equipment_types/add",
        method: "POST",
        body: {
          name: data.name,
        },
      }),

      transformResponse: (response: EquipmentTypeResponse) => response.data,

      invalidatesTags: ["EquipmentTypes"],
    }),

    // UPDATE
    updateEquipmentType: builder.mutation<
      EquipmentType,
      { id: string; data: EquipmentTypeFormValues }
    >({
      query: ({ id, data }) => ({
        url: `/equipment_types/edit/${id}`,
        method: "PUT",
        body: {
          name: data.name,
        },
      }),

      transformResponse: (response: EquipmentTypeResponse) => response.data,

      invalidatesTags: ["EquipmentTypes"],
    }),

    // DELETE
    deleteEquipmentType: builder.mutation<
      DeleteEquipmentTypeResponse,
      string
    >({
      query: (id) => ({
        url: `/equipment_types/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["EquipmentTypes"],
    }),
  }),
});

export const {
  useGetEquipmentTypesQuery,
  useGetEquipmentTypeByIdQuery,
  useCreateEquipmentTypeMutation,
  useUpdateEquipmentTypeMutation,
  useDeleteEquipmentTypeMutation,
} = equipmentTypeApi;