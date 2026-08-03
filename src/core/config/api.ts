export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10000,
} as const;
