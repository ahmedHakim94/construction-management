import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error),
);

export const get = <T>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config);
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config);
export const put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config);
export const patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config);
export const remove = <T>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config);

export default apiClient;
