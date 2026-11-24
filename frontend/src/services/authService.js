import { api } from './api';

export const authService = {
  register(payload) {
    return api.post('/api/auth/register', payload).then((response) => response.data);
  },
  login(payload) {
    return api.post('/api/auth/login', payload).then((response) => response.data);
  },
  refresh(refreshToken) {
    return api.post('/api/auth/refresh-token', { refreshToken }).then((response) => response.data);
  },
  logout(refreshToken) {
    return api.post('/api/auth/logout', { refreshToken });
  },
};
