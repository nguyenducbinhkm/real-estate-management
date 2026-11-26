import { describe, expect, it } from 'vitest';
import { accountMenuFor, canManageListings } from './navigation';

const labels = (user) => accountMenuFor(user).map((item) => item.label);

describe('menu tài khoản theo vai trò', () => {
  it('người mua chỉ thấy mục cài đặt tài khoản', () => {
    expect(canManageListings({ role: 'Buyer' })).toBe(false);
    expect(labels({ role: 'Buyer' })).toEqual(['Cài đặt tài khoản', 'Đổi mật khẩu']);
  });

  it('người bán / môi giới thấy khu vực người bán nhưng không thấy Quản trị', () => {
    for (const role of ['Seller', 'Agent']) {
      expect(labels({ role })).toContain('Quản lý tin đăng');
      expect(labels({ role })).not.toContain('Quản trị hệ thống');
    }
  });

  it('admin thấy thêm Quản trị hệ thống', () => expect(labels({ role: 'Admin' })).toContain('Quản trị hệ thống'));
  it('chưa đăng nhập: không có quyền quản lý tin', () => expect(canManageListings(null)).toBe(false));
});
