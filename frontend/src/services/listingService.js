import { api } from './api';

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

export const listingService = {
  search(params) {
    return api.get('/api/listings', { params: cleanParams(params) }).then((response) => response.data);
  },
  getById(id) {
    return api.get(`/api/listings/${id}`).then((response) => response.data);
  },
  /** Số liên hệ đầy đủ ("Hiện số"); số/đường dẫn Zalo chỉ có khi đã đăng nhập. */
  contact(id) {
    return api.get(`/api/listings/${id}/contact`).then((response) => response.data);
  },
  create(payload) {
    return api.post('/api/listings', payload).then((response) => response.data);
  },
  update(id, payload) {
    return api.put(`/api/listings/${id}`, payload).then((response) => response.data);
  },
  remove(id) {
    return api.delete(`/api/listings/${id}`);
  },
  getMine() {
    return api.get('/api/listings/my').then((response) => response.data);
  },
};
