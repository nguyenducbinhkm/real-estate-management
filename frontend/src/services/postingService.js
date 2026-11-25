import { api } from './api';

// Sắp xếp theo tên, bỏ qua tiền tố hành chính ("Thành phố Hà Nội" xếp theo "Hà Nội").
const sortKey = (name) => name.replace(/^(Thành phố|Tỉnh)\s+/i, '');
const byName = (a, b) => sortKey(a.name).localeCompare(sortKey(b.name), 'vi', { numeric: true });
const cache = new Map();

/** Gọi GET một lần cho mỗi URL (danh mục địa giới ít thay đổi). */
function cachedGet(url) {
  if (!cache.has(url)) {
    cache.set(url, api.get(url).then((response) => [...response.data].sort(byName)).catch((error) => {
      cache.delete(url);
      throw error;
    }));
  }
  return cache.get(url);
}

// Đăng tin: danh mục địa giới (LocationsController) và tải ảnh (UploadsController).
export const postingService = {
  provinces() {
    return cachedGet('/api/locations/provinces');
  },
  districts(provinceCode) {
    return cachedGet(`/api/locations/provinces/${encodeURIComponent(provinceCode)}/districts`);
  },
  wards(districtCode) {
    return cachedGet(`/api/locations/districts/${encodeURIComponent(districtCode)}/wards`);
  },
  /** Tải 1 ảnh, trả về { url } dạng "/uploads/listings/....jpg". */
  uploadImage(file, onProgress) {
    const body = new FormData();
    body.append('file', file);
    return api
      .post('/api/uploads/images', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (event) => event.total && onProgress?.(Math.round((event.loaded / event.total) * 100)),
      })
      .then((response) => response.data);
  },
};

// Kiểm duyệt tin (AdminListingsController) – chỉ tài khoản Admin.
export const adminService = {
  listings(status, q) {
    return api.get('/api/admin/listings', { params: { status: status || undefined, q: q || undefined } }).then((response) => response.data);
  },
  approve(id) {
    return api.patch(`/api/admin/listings/${id}/approve`).then((response) => response.data);
  },
  reject(id) {
    return api.patch(`/api/admin/listings/${id}/reject`).then((response) => response.data);
  },
  /** Gỡ tin vi phạm đang hiển thị/đang ẩn. */
  takeDown(id) {
    return api.patch(`/api/admin/listings/${id}/takedown`).then((response) => response.data);
  },
  stats() {
    return api.get('/api/admin/stats').then((response) => response.data);
  },
  users(role, q) {
    return api.get('/api/admin/users', { params: { role: role || undefined, q: q || undefined } }).then((response) => response.data);
  },
  /** Đổi vai trò: Buyer, Seller hoặc Agent. */
  changeRole(id, role) {
    return api.patch(`/api/admin/users/${id}/role`, { role }).then((response) => response.data);
  },
};
