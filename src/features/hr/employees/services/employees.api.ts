import { baseApi } from "@/core/api/baseApi";
import type {
  ApiEmployee,
  DeleteEmployeeResponse,
  Employee,
  EmployeeApiResponse,
  EmployeeMutationPayload,
  EmployeesApiResponse,
  EmployeesQueryParams,
  EmployeesResult,
} from "../types";

const mapApiEmployeeToEmployee = (raw: ApiEmployee): Employee => {
  const projects = Array.isArray(raw.projects)
    ? raw.projects.map((project) => ({
        id: Number(project.id),
        name: project.name,
      }))
    : [];

  const projectIds = Array.isArray(raw.project_ids)
    ? raw.project_ids.map(Number)
    : projects.map((project) => project.id);

  return {
    id: Number(raw.id),
    code: String(raw.id),
    name: raw.name,
    phone: raw.phone,
    address: raw.address ?? "",
    jobTitle: raw.job_title ?? "",
    hireDate: raw.hire_date ?? "",
    basicSalary: Number(raw.salary) || 0,
    status: raw.status,
    projectIds,
    projects,
  };
};

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeesResult, EmployeesQueryParams | void>({
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

        if (params?.status) {
          queryParams.set("status", params.status);
        }

        if (params?.project_id) {
          queryParams.set("project_id", String(params.project_id));
        }

        return `/employees?${queryParams.toString()}`;
      },

      transformResponse: (response: EmployeesApiResponse): EmployeesResult => ({
        data: (response.data ?? []).map(mapApiEmployeeToEmployee),
        pagination: response.pagination,
      }),

      providesTags: ["Employees"],
    }),

    createEmployee: builder.mutation<Employee, EmployeeMutationPayload>({
      query: (body) => ({
        url: "/employees",
        method: "POST",
        body,
      }),

      transformResponse: (response: EmployeeApiResponse): Employee =>
        mapApiEmployeeToEmployee(response.data),

      invalidatesTags: ["Employees"],
    }),

    updateEmployee: builder.mutation<
      Employee,
      { id: number; data: EmployeeMutationPayload }
    >({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body: data,
      }),

      transformResponse: (response: EmployeeApiResponse): Employee =>
        mapApiEmployeeToEmployee(response.data),

      invalidatesTags: ["Employees"],
    }),

    deleteEmployee: builder.mutation<DeleteEmployeeResponse, number>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Employees"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeesApi;
