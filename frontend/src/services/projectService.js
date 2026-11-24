import { api } from './api';

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

// API dự án (chỉ đọc) – xem docs/api-contract.md.
export const projectService = {
  search(params) {
    return api.get('/api/projects', { params: cleanParams(params) }).then((response) => response.data);
  },
  getById(id) {
    return api.get(`/api/projects/${id}`).then((response) => response.data);
  },
  getListings(id, { page = 1, pageSize = 8 } = {}) {
    return api.get(`/api/projects/${id}/listings`, { params: { page, pageSize } }).then((response) => response.data);
  },
  getRelated(id, limit = 4) {
    return api.get(`/api/projects/${id}/related`, { params: { limit } }).then((response) => response.data);
  },
  getProvinces() {
    return api.get('/api/projects/provinces').then((response) => response.data);
  },
};
