import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Backend chạy profile "http" ở cổng 5129 (xem src/RealEstateHub.API/Properties/launchSettings.json).
// Đổi bằng biến môi trường VITE_API_URL nếu backend chạy ở địa chỉ khác.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5129';

/** Đường dẫn file do API phục vụ (vd. ảnh tải lên "/uploads/listings/x.jpg") → URL đầy đủ. */
export const mediaUrl = (url) => (url && url.startsWith('/') ? `${API_BASE}${url}` : url);

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const refreshToken = useAuthStore.getState().refreshToken;

    if (status === 401 && refreshToken && !original?._retry) {
      original._retry = true;
      try {
        const response = await axios.post(
          `${API_BASE}/api/auth/refresh-token`,
          { refreshToken },
        );
        useAuthStore.getState().setAuth(response.data);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);
