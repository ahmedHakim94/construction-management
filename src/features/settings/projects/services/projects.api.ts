import { baseApi } from "@/core/api/baseApi";
import type { PaginationParams } from "@/types";
import type { DeleteProjectResponse, Project, ProjectFormValues, ProjectResponse, ProjectsResponse, ProjectsResult } from "../types";



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

    getAllProjects: builder.query<Project[], void>({
      query: () => "/projects/all",
      transformResponse: (response: { success: boolean; data: Project[] }) =>
        response.data,
      providesTags: ["Projects"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetAllProjectsQuery,
} = projectApi;
