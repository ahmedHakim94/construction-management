import { baseApi } from "@/core/api/baseApi";
import type { Task, TaskFormValues } from "../types";

type TasksResponse = {
  success: boolean;
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type TaskResponse = {
  success: boolean;
  message?: string;
  data: Task;
};

type DeleteTaskResponse = {
  success: boolean;
  message: string;
};

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getTasks: builder.query<Task[], void>({
      query: () => "/tasks?page=1&limit=100",

      transformResponse: (response: TasksResponse) => response.data,

      providesTags: ["Tasks"],
    }),

    // GET BY ID
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,

      transformResponse: (response: TaskResponse) => response.data,
    }),

    // CREATE
    createTask: builder.mutation<
      Task,
      TaskFormValues
    >({
      query: (data) => ({
        url: "/tasks/add",
        method: "POST",
        body: {
          name: data.name,
        },
      }),

      transformResponse: (response: TaskResponse) => response.data,

      invalidatesTags: ["Tasks"],
    }),

    // UPDATE
    updateTask: builder.mutation<
      Task,
      { id: string; data: TaskFormValues }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/edit/${id}`,
        method: "PUT",
        body: {
          name: data.name,
        },
      }),

      transformResponse: (response: TaskResponse) => response.data,

      invalidatesTags: ["Tasks"],
    }),

    // DELETE
    deleteTask: builder.mutation<
      DeleteTaskResponse,
      string
    >({
      query: (id) => ({
        url: `/tasks/delete/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;