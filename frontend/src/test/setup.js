import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Node ≥ 22 có sẵn biến toàn cục `localStorage` (thử nghiệm) che mất localStorage của jsdom → dùng bản trong bộ nhớ.
if (typeof globalThis.localStorage?.clear !== 'function') {
  const store = new Map();
  const memoryStorage = {
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    key: (index) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true, writable: true });
  if (typeof window !== 'undefined') Object.defineProperty(window, 'localStorage', { value: memoryStorage, configurable: true, writable: true });
}

// Mỗi test bắt đầu với DOM và localStorage sạch.
afterEach(() => {
  cleanup();
  localStorage.clear();
});
