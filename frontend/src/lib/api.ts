import axios from "axios";

// Forcing /api (no v1) to match backend standardization
const baseURL = "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Global 401 Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prevent redirect loop if the error is from an auth endpoint
    const isAuthRequest = error.config?.url?.includes("/auth/");

    if (error.response?.status === 401 && !isAuthRequest) {
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
