import axios from "axios";

// Forcing /api (no v1) to match backend standardization
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Global 401 Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  },
);

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
