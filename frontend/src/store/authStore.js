import { create } from 'zustand';

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem('realestatehub_auth')) || {};
  } catch {
    return {};
  }
}

const stored = readStoredAuth();

export const useAuthStore = create((set) => ({
  user: stored.user || null,
  accessToken: stored.accessToken || null,
  refreshToken: stored.refreshToken || null,

  setAuth(auth) {
    const next = {
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    };
    localStorage.setItem('realestatehub_auth', JSON.stringify(next));
    set(next);
  },

  clearAuth() {
    localStorage.removeItem('realestatehub_auth');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
