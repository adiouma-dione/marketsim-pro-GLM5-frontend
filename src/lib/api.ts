// ============================================================
// MarketSim Pro - Axios API Client
// ============================================================

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from './stores/auth-store';
import { parseApiError } from './utils';

// ------------------------------------------------------------
// API Configuration
// ------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 15000;

// ------------------------------------------------------------
// Axios Instance
// ------------------------------------------------------------

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ------------------------------------------------------------
// Request Interceptor
// ------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from auth store
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// Response Interceptor
// ------------------------------------------------------------

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        // No refresh token, logout
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Update tokens in store
        useAuthStore.getState().setTokens({
          access_token,
          refresh_token,
          token_type: 'bearer',
          expires_in: 86400,
        });

        // Process queued requests
        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        processQueue(refreshError as Error, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const detail = error.response.data?.detail;
      if (Array.isArray(detail)) {
        error.message = detail.map((d: { msg: string }) => d.msg).join(', ');
      } else if (typeof detail === 'string') {
        error.message = detail;
      }
    }

    // Handle 5xx Server Error
    if (error.response?.status >= 500) {
      error.message = 'Erreur serveur, réessayez.';
    }

    return Promise.reject(error);
  }
);

// ------------------------------------------------------------
// Typed API Methods
// ------------------------------------------------------------

export async function apiGet<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<T>(endpoint, config);
  return response.data;
}

export async function apiPost<T>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<T>(endpoint, data, config);
  return response.data;
}

export async function apiPut<T>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<T>(endpoint, data, config);
  return response.data;
}

export async function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<T>(endpoint, data, config);
  return response.data;
}

export async function apiDelete<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<T>(endpoint, config);
  return response.data;
}

// ------------------------------------------------------------
// Export Instance for Custom Use
// ------------------------------------------------------------

export { apiClient, parseApiError };

// ------------------------------------------------------------
// SSE Connection Helper (for protected endpoints)
// ------------------------------------------------------------

export function createSSEConnection(endpoint: string): EventSource | null {
  const token = useAuthStore.getState().token;
  if (!token) return null;

  // For SSE with protected endpoints, we need to pass token in URL
  // or use a proxy route handler that adds the Authorization header
  const url = `${API_URL}${endpoint}?token=${encodeURIComponent(token)}`;

  return new EventSource(url);
}

// ------------------------------------------------------------
// File Upload Helper
// ------------------------------------------------------------

export async function apiUpload<T>(
  endpoint: string,
  file: File,
  fieldName = 'file',
  additionalData?: Record<string, string>
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await apiClient.post<T>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// ------------------------------------------------------------
// File Download Helper
// ------------------------------------------------------------

export async function apiDownload(
  endpoint: string,
  filename: string
): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
