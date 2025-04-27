import axios from 'axios';
import { getAuthStore } from '../store/auth';



const API_URL = 'http://localhost:8000/';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Request interceptor to attach the access token to every request
api.interceptors.request.use((config) => {
  const token = getAuthStore.getState().accessToken;
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token refresh and logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getAuthStore.getState().refreshToken;
        if (!refreshToken) {
          console.error('No refresh token found. Logging out...');
          getAuthStore.getState().logout();
          window.location.href = "/";
          return Promise.reject(error);
        }

        // Refresh the access token
        const { data } = await axios.post(`${API_URL}auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = data as { access: string };

        getAuthStore.getState().setTokens({
          access,
          refresh: refreshToken,
        });

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        getAuthStore.getState().logout();
      window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden. Logging out...');
      getAuthStore.getState().logout();
  
    }

    return Promise.reject(error);
  }
);
