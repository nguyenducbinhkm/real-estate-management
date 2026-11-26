import { describe, expect, it, vi, beforeEach, onTestFinished } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Login from './Login';
import { authService } from '../services/authService';

vi.mock('../services/authService', () => ({ authService: { login: vi.fn() } }));

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

async function loginFrom(url) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
  await userEvent.type(screen.getByLabelText('Email'), 'a@b.vn');
  await userEvent.type(screen.getByLabelText('Mật khẩu'), 'mat-khau-123');
  await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  return screen.findByTestId('where');
}

describe('Login – quay lại sau khi đăng nhập', () => {
  beforeEach(() => vi.mocked(authService.login).mockResolvedValue({ accessToken: 't', refreshToken: 'r', user: { id: '1', role: 'Buyer' } }));

  it('quay lại đúng tin đang xem', async () => expect(await loginFrom('/login?redirect=%2Flistings%2F42')).toHaveTextContent('/listings/42'));

  it('bỏ qua đường dẫn ra ngoài (chống chuyển hướng lừa đảo)', async () => {
    expect(await loginFrom('/login?redirect=%2F%2Fevil.example')).toHaveTextContent(/^\/$/);
  });

  it('đăng nhập sai hiện thông báo lỗi', async () => {
    const unauthorized = Object.assign(new Error('Request failed with status code 401'), {
      response: { status: 401, data: { message: 'Email hoặc mật khẩu không đúng.' } },
    });
    // Hàm thường (không dùng vi.fn): vi.fn theo dõi Promise bị từ chối sẽ sinh cảnh báo "unhandled rejection" giả.
    const original = authService.login;
    authService.login = async () => { throw unauthorized; };
    onTestFinished(() => { authService.login = original; });
    render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<Login />} /></Routes></MemoryRouter>);
    await userEvent.type(screen.getByLabelText('Email'), 'a@b.vn');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'sai');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByText('Email hoặc mật khẩu không đúng.')).toBeInTheDocument();
  });
});
