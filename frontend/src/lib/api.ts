import axios from "axios";

// Forcing /api (no v1) to match backend standardization
const baseURL = "http://localhost:8000/api";
// process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
