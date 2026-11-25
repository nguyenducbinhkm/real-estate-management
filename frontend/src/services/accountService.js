import { api } from './api';

// Thông tin tài khoản của người dùng đang đăng nhập (UsersController: /api/users/me).
export const accountService = {
  getProfile() {
    return api.get('/api/users/me').then((response) => response.data);
  },
  updateProfile(payload) {
    return api.put('/api/users/me', payload).then((response) => response.data);
  },
  changePassword(payload) {
    return api.put('/api/users/me/password', payload);
  },
  /** Tải ảnh đại diện mới từ máy (backend lưu lên Supabase Storage, ghi đè ảnh cũ). Trả về hồ sơ mới. */
  uploadAvatar(file, onProgress) {
    const body = new FormData();
    body.append('file', file);
    return api
      .put('/api/users/me/avatar', body, {
        // Ghi đè Content-Type JSON mặc định của api – nếu không, axios sẽ đổi FormData thành JSON (lỗi 415).
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (event) => event.total && onProgress?.(Math.round((event.loaded / event.total) * 100)),
      })
      .then((response) => response.data);
  },
  removeAvatar() {
    return api.delete('/api/users/me/avatar').then((response) => response.data);
  },
};

/**
 * Tách lỗi trả về từ API thành { message, fields } – fields theo tên trường (viết thường chữ đầu: fullName, phone…)
 * để hiện ngay dưới ô nhập tương ứng.
 */
export function readApiError(error, fallback = 'Không thể lưu thay đổi. Vui lòng thử lại.') {
  const data = error?.response?.data;
  const fields = {};
  Object.entries(data?.details || {}).forEach(([key, messages]) => {
    const name = key.charAt(0).toLowerCase() + key.slice(1);
    fields[name] = Array.isArray(messages) ? messages[0] : String(messages);
  });
  if (!error?.response) return { message: 'Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy.', fields };
  return { message: Object.keys(fields).length ? 'Vui lòng kiểm tra lại các thông tin bên dưới.' : data?.message || fallback, fields, code: data?.code };
}
