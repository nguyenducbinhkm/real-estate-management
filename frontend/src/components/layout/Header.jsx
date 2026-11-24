import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { site } from '../../config/site';
import Navbar from './Navbar';
import UserMenu from './UserMenu';
import MobileDrawer from './MobileDrawer';
import { HeartIcon, MenuIcon } from './Icons';

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${site.name} - Trang chủ`}>
      <img src="/images/logo-mark-light-bg.png" alt="" className="h-10 w-auto" />
      <span className="leading-none">
        <span className="block text-lg font-extrabold tracking-wide text-ink">{site.name.toUpperCase()}</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-600">{site.tagline}</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setDrawerOpen(false), [location]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const logout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Token có thể đã hết hạn; vẫn xoá phiên phía client.
    }
    clearAuth();
    setDrawerOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_#f2f2f2]">
      <div className="flex h-16 w-full items-stretch justify-between gap-4 px-4 xl:h-[72px] xl:px-6">
        <div className="flex items-stretch gap-4 xl:gap-6">
          <div className="flex items-center"><Logo /></div>
          <Navbar />
        </div>

        <div className="flex items-center gap-1 xl:gap-2">
          <Link
            to="/saved"
            aria-label="Tin đã lưu"
            title="Tin đã lưu"
            className="rounded-lg p-2 text-[#2c2c2c] hover:bg-slate-50 hover:text-brand-600"
          >
            <HeartIcon />
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {user ? (
              <UserMenu user={user} onLogout={logout} />
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-[#2c2c2c] hover:bg-slate-50">
                  Đăng nhập
                </Link>
                <span className="h-4 w-px bg-slate-300" />
                <Link to="/register" className="rounded-lg px-3 py-2 text-sm text-[#2c2c2c] hover:bg-slate-50">
                  Đăng ký
                </Link>
              </>
            )}
            <Link
              to="/seller/post"
              className="ml-2 flex h-12 items-center rounded-lg border border-[#cccccc] px-4 text-sm font-semibold text-[#2c2c2c] transition-colors hover:bg-slate-50"
            >
              Đăng tin
            </Link>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-[#2c2c2c] hover:bg-slate-50 xl:hidden"
            aria-label="Mở menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <MobileDrawer open={drawerOpen} onClose={closeDrawer} user={user} onLogout={logout} />
    </header>
  );
}
