import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosHeaders
} from 'axios';
import { authStorage } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

class ApiClient {
  private axios: AxiosInstance;

  constructor(baseURL: string | undefined) {
    if (!baseURL) {
      throw new Error('API base URL is required');
    }

    this.axios = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' }
    });

    // Add request interceptor with proper typing
    this.axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = authStorage.getAccessToken();
        if (accessToken) {
          // Create new headers object if it doesn't exist
          config.headers = config.headers || new AxiosHeaders();
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Add response interceptor
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => this.handleResponse(response),
      (error: AxiosError) => this.handleError(error)
    );
  }

  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Handle successful responses
    return response;
  }

  private handleError(error: AxiosError): Promise<never> {
    if (error.response?.status === 401) {
      // Handle token refresh if needed
      authStorage.clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      return Promise.reject(new Error("Authentication failed"));
    }

    // Enhance error object with server response data
    const apiError = new Error(error.message) as ApiError;
    
    if (error.response) {
      const errorData = error.response?.data as Record<string, unknown>;
      apiError.message = (typeof errorData?.message === 'string' ? errorData.message : error.message);
      apiError.data = error.response.data;
      apiError.status = error.response.status;
    }

    return Promise.reject(apiError);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(endpoint: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.axios.get<T>(endpoint, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T = any>(endpoint: string, data?: unknown, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.axios.post<T>(endpoint, data, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put<T = any>(endpoint: string, data?: unknown, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.axios.put<T>(endpoint, data, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete<T = any>(endpoint: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return this.axios.delete<T>(endpoint, config);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);