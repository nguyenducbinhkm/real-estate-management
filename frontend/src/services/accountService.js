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
