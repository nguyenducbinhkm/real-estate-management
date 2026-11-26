import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import ContactButtons from './ContactButtons';
import { useAuthStore } from '../../store/authStore';
import { listingService } from '../../services/listingService';

vi.mock('../../services/listingService', () => ({ listingService: { contact: vi.fn() } }));

const listing = { id: 'abc', contactPhoneMasked: '0335 834 ***', hasZalo: true };

function LoginProbe() {
  const location = useLocation();
  return <p data-testid="login">{location.pathname + location.search}</p>;
}

const renderAt = () => render(
  <MemoryRouter initialEntries={['/listings/abc']}>
    <Routes>
      <Route path="/listings/:id" element={<ContactButtons listing={listing} />} />
      <Route path="/login" element={<LoginProbe />} />
    </Routes>
  </MemoryRouter>,
);

describe('ContactButtons – Chat qua Zalo & Hiện số', () => {
  beforeEach(() => {
    vi.mocked(listingService.contact).mockReset();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
  });

  it('chỉ hiện số đã che trước khi bấm', () => {
    renderAt();
    expect(screen.getByRole('button', { name: /0335 834 \*\*\*/ })).toBeInTheDocument();
    expect(listingService.contact).not.toHaveBeenCalled();
  });

  it('bấm "Hiện số" (chưa đăng nhập) → hiện số đầy đủ dạng link gọi điện', async () => {
    vi.mocked(listingService.contact).mockResolvedValue({ phone: '0335834123', zaloLink: null });
    renderAt();
    await userEvent.click(screen.getByRole('button', { name: /Hiện số/ }));
    const link = await screen.findByRole('link', { name: '0335 834 123' });
    expect(link).toHaveAttribute('href', 'tel:0335834123');
  });

  it('khách chưa đăng nhập bấm Zalo → chuyển tới đăng nhập kèm đường quay lại', async () => {
    renderAt();
    await userEvent.click(screen.getByRole('button', { name: /Chat qua Zalo/ }));
    expect(screen.getByTestId('login')).toHaveTextContent('/login?redirect=%2Flistings%2Fabc');
    expect(listingService.contact).not.toHaveBeenCalled();
  });

  it('đã đăng nhập bấm Zalo → mở zalo.me với số Zalo', async () => {
    useAuthStore.setState({ user: { id: 'u1', role: 'Buyer', fullName: 'A' } });
    vi.mocked(listingService.contact).mockResolvedValue({ phone: '0335834123', zaloLink: 'https://zalo.me/0987654321' });
    const popup = { location: { href: '' }, close: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(popup);
    renderAt();
    await userEvent.click(screen.getByRole('button', { name: /Chat qua Zalo/ }));
    await vi.waitFor(() => expect(popup.location.href).toBe('https://zalo.me/0987654321'));
    open.mockRestore();
  });
});
