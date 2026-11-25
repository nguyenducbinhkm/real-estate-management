import { api } from './api';

// Khu vực quản lý của người bán (SellerController: /api/seller/...) và gửi yêu cầu liên hệ.
export const sellerService = {
  dashboard() {
    return api.get('/api/seller/dashboard').then((response) => response.data);
  },
  listings() {
    return api.get('/api/seller/listings').then((response) => response.data);
  },
  /** Đổi trạng thái tin: Active (hiện), Draft (ẩn), Sold, Rented. */
  changeListingStatus(id, status) {
    return api.patch(`/api/listings/${id}/status`, { status }).then((response) => response.data);
  },
  deleteListing(id) {
    return api.delete(`/api/listings/${id}`);
  },
  contacts() {
    return api.get('/api/seller/contact-requests').then((response) => response.data);
  },
  updateContactStatus(id, status) {
    return api.patch(`/api/seller/contact-requests/${id}/status`, { status }).then((response) => response.data);
  },
  deleteContact(id) {
    return api.delete(`/api/seller/contact-requests/${id}`);
  },
  /** Khách gửi yêu cầu liên hệ tới người đăng tin (không cần đăng nhập). */
  sendContact(payload) {
    return api.post('/api/contact-requests', payload).then((response) => response.data);
  },
};
