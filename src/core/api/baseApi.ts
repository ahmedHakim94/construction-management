import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG } from "../config/api";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.baseURL,
  }),

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
