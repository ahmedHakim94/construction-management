import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type { Project, ProjectFormValues } from "../types";

type ProjectsResponse = {
  success: boolean;
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ProjectResponse = {
  success: boolean;
  message?: string;
  data: Project;
};

type DeleteProjectResponse = {
  success: boolean;
  message: string;
};

export type ProjectsResult = {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getProjects: builder.query<ProjectsResult, PaginationParams | void>({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 10;
        return `/projects?page=${page}&limit=${limit}`;
      },

      transformResponse: (response: ProjectsResponse) => ({
        data: response.data,
        pagination: response.pagination,
      }),

      providesTags: ["Projects"],
    }),

    // GET BY ID
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,

      transformResponse: (response: ProjectResponse) => response.data,
    }),

    // CREATE
    createProject: builder.mutation<Project, ProjectFormValues>({
      query: (data) => ({
        url: "/projects/add",
        method: "POST",
        body: {
          name: data.name,
          address: data.address,
        },
      }),

      transformResponse: (response: ProjectResponse) => response.data,

      invalidatesTags: ["Projects"],
    }),

    // UPDATE
    updateProject: builder.mutation<
      Project,
      { id: string; data: ProjectFormValues }
    >({
      query: ({ id, data }) => ({
        url: `/projects/edit/${id}`,
        method: "PUT",
        body: {
          name: data.name,
          address: data.address,
        },
      }),

      transformResponse: (response: ProjectResponse) => response.data,

      invalidatesTags: ["Projects"],
    }),

    // DELETE
    deleteProject: builder.mutation<DeleteProjectResponse, string>({
      query: (id) => ({
        url: `/projects/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Projects"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
