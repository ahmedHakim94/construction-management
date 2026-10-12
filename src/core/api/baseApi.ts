import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { API_CONFIG } from "../config/api";
import { notify } from "@/shared/utils/notify";
import { logout } from "@/features/auth/store/authSlice";
import type { RootState } from "@/app/store/store";

type ApiResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const getMessage = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return undefined;
  }

  const message = data.message;

  return typeof message === "string" && message.trim()
    ? message.trim()
    : undefined;
};

const baseQueryWithNotifications: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  const method =
    typeof args === "string" ? "GET" : (args.method ?? "GET").toUpperCase();

  if (result.error) {
    const url = typeof args === "string" ? args : args.url;
    const isLoginRequest = url.split("?")[0] === "/auth/login";

    const token = (api.getState() as RootState).auth.token;

    // Auto logout when an authenticated request returns 401.
    if (result.error.status === 401 && token && !isLoginRequest) {
      api.dispatch(logout());

      notify.error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى");

      return result;
    }

    notify.error(
      getMessage(result.error.data) ??
        "حدث خطأ أثناء تنفيذ العملية، يرجى المحاولة مرة أخرى",
    );

    return result;
  }

  const response = result.data as ApiResponse | undefined;

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
    response?.success === true
  ) {
    const message = getMessage(result.data);

    if (message) {
      notify.success(message);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithNotifications,

  tagTypes: [
    "EquipmentTypes",
    "Tasks",
    "Projects",
    "Contractors",
    "Equipment",
    "DailyWork",
    "Payments",
  ],

  endpoints: () => ({}),
});
