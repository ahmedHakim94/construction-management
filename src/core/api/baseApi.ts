import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { API_CONFIG } from "../config/api";
import { notify } from "@/shared/utils/notify";

type ApiResponse = {
  success?: boolean;
  statusCode?: number;
  message?: string;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,
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
