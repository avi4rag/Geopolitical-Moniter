import axios from 'axios';

// ─── API Client ───────────────────────────────────────────────────────────────
// Centralized Axios instance for all backend calls.
// In development, Vite proxies /api to localhost:3000 automatically.
// In production, VITE_API_URL must point to the deployed backend.
// ─────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response Interceptor ────────────────────────────────────────────────────
// Unwraps the standard { success, data, error } envelope.
// Throws a normalized error if success is false.

apiClient.interceptors.response.use(
  (response) => {
    // Return the inner `data` from our envelope
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'An unexpected error occurred';

    const code =
      error.response?.data?.error?.code || 'NETWORK_ERROR';

    const normalizedError = new Error(message);
    normalizedError.code = code;
    normalizedError.status = error.response?.status;

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
