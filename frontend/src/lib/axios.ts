
import axios, { AxiosInstance, AxiosError } from 'axios';
// Importing Logger from backend/src/utils/logger.ts is problematic in a frontend context
// A frontend logger might be defined in frontend/src/utils/logger.ts if needed, or simply use console.
// For now, I'll use console.error/warn directly in the interceptor.
// import { Logger } from '../../../backend/src/utils/logger'; 

/**
 * TACTICAL HTTP CLIENT
 * Configurado para interceptação de tokens e tratamento global de erros.
 */

// Use VITE_API_URL for production or Vite's proxy for development
const API_URL = import.meta.env.VITE_API_URL || '/api/v1'; 

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s timeout for mission critical responsiveness
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': 'AEGIS-FRONTEND-2.0.4'
  }
});

// REQUEST INTERCEPTOR: Inject Auth Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tactical_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error code
      const status = error.response.status;
      const errorMessage = (error.response.data as any)?.error || `Server responded with status ${status}`;
      
      if (status === 401 || status === 403) {
        console.warn(`[AEGIS SECURITY] Unauthorized access attempt (${status}). Purging credentials.`);
        localStorage.removeItem('tactical_token'); // Clear invalid token
        localStorage.removeItem('device_id');
        // Optional: Redirect to login page or show a prominent error message
      } else if (status === 400) {
        console.warn(`[AEGIS VALIDATION] Bad request: ${errorMessage}`, (error.response.data as any).details);
      } else if (status >= 500) {
        console.error(`[AEGIS CRITICAL] Server Systems Failure (${status}): ${errorMessage}`, error.response.data);
      } else {
        console.error(`[AEGIS API Error] Unhandled API error (${status}): ${errorMessage}`, error.response.data);
      }
      return Promise.reject(new Error(errorMessage)); // Propagate a cleaner error
    } else if (error.request) {
        // Request was made but no response received (e.g., network error)
        console.error('[AEGIS NETWORK] Uplink severed. No response received from API server.', error.message);
        return Promise.reject(new Error('Network error: Could not reach the server.'));
    } else {
        // Something else happened in setting up the request that triggered an Error
        console.error('[AEGIS CLIENT Error] Request setup failed:', error.message);
        return Promise.reject(new Error('Client-side request error.'));
    }
  }
);
