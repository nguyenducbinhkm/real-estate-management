import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminShell from './AdminShell';
import { useAuthStore } from '../../store/authStore';

const renderAs = (user) => {
  useAuthStore.setState({ user });
  return render(<MemoryRouter><AdminShell title="Tổng quan"><p>Nội dung quản trị</p></AdminShell></MemoryRouter>);
};

describe('AdminShell – chỉ admin xem được khu quản trị', () => {
  it('người bán thấy thông báo, không thấy nội dung', () => {
    renderAs({ id: '1', role: 'Seller' });
    expect(screen.getByText('Trang này chỉ dành cho quản trị viên')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung quản trị')).not.toBeInTheDocument();
  });

  it('admin thấy nội dung và menu quản trị', () => {
    renderAs({ id: '2', role: 'Admin' });
    expect(screen.getByText('Nội dung quản trị')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Người dùng/ })).toHaveAttribute('href', '/admin/users');
  });
});
