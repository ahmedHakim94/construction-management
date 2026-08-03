export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
} as const;
