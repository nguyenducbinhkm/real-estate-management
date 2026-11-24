import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { site } from '../../config/site';
import Navbar from './Navbar';
import UserMenu from './UserMenu';
import MobileDrawer from './MobileDrawer';
import { MenuIcon, PlusIcon, UserIcon } from './Icons';

function Logo({ light }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${site.name} - Trang chủ`}>
      {/* Logo nền sáng / nền tối tùy trạng thái header. */}
      <img src={light ? '/images/logo-mark.png' : '/images/logo-mark-light-bg.png'} alt="" className="h-10 w-auto" />
      <span className="leading-none">
        <span className={`block text-lg font-extrabold tracking-wide transition-colors duration-300 ${light ? 'text-white' : 'text-ink'}`}>
          {site.name.toUpperCase()}
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.3em] transition-colors duration-300 ${light ? 'text-gold-300' : 'text-gold-600'}`}>
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}

/** Đã cuộn khỏi đầu trang hay chưa (để đổi header từ trong suốt sang trắng). */
function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > threshold);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const scrolled = useScrolled();

  // Trang chủ: header nằm đè lên banner và trong suốt khi ở đầu trang; cuộn xuống hoặc trang khác thì nền trắng mờ.
  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

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
    <>
      <header
        className={`top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300 ${
          isHome ? 'fixed inset-x-0' : 'sticky'
        } ${
          transparent
            ? 'border-b border-transparent bg-gradient-to-b from-ink-900/55 to-transparent'
            : 'border-b border-slate-100 bg-white/90 shadow-[0_6px_20px_rgba(40,41,36,0.06)] backdrop-blur'
        }`}
      >
        <div className="flex h-16 w-full items-stretch justify-between gap-4 px-4 xl:h-[72px] xl:px-6">
          <div className="flex min-w-0 items-stretch gap-3 xl:gap-6">
            <div className="flex items-center"><Logo light={transparent} /></div>
            <Navbar light={transparent} />
          </div>

          {/* Tài khoản và "Đăng tin" luôn hiển thị ở mọi kích thước; chỉ menu chính mới thu vào nút ☰ (dưới 1024px). */}
          <div className="flex items-center gap-1 xl:gap-2">
            {user ? (
              <UserMenu user={user} onLogout={logout} light={transparent} />
            ) : (
              <>
                <div className="hidden items-center gap-1 xl:flex">
                  <Link to="/login" className={`rounded-lg px-3 py-2 text-sm transition-colors ${transparent ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-[#2c2c2c] hover:bg-slate-50'}`}>
                    Đăng nhập
                  </Link>
                  <span className={`h-4 w-px ${transparent ? 'bg-white/40' : 'bg-slate-300'}`} />
                  <Link to="/register" className={`rounded-lg px-3 py-2 text-sm transition-colors ${transparent ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-[#2c2c2c] hover:bg-slate-50'}`}>
                    Đăng ký
                  </Link>
                </div>
                {/* Dưới 1280px gom "Đăng nhập / Đăng ký" thành một biểu tượng tài khoản. */}
                <Link
                  to="/login"
                  aria-label="Đăng nhập / Đăng ký"
                  title="Đăng nhập / Đăng ký"
                  className={`grid h-10 w-10 place-items-center rounded-full border transition-colors xl:hidden ${
                    transparent
                      ? 'border-white/40 text-white hover:bg-white/15'
                      : 'border-slate-200 text-ink hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  <UserIcon />
                </Link>
              </>
            )}
            <Link
              to="/seller/post"
              aria-label="Đăng tin"
              className={`ml-1 flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold shadow-sm transition-colors duration-300 sm:px-5 xl:ml-2 xl:h-11 ${
                transparent
                  ? 'bg-white text-brand-700 hover:bg-brand-50'
                  : 'bg-brand-600 text-white shadow-brand-600/30 hover:bg-brand-700'
              }`}
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng tin</span>
            </Link>

            <button
              type="button"
              className={`rounded-lg p-2 transition-colors lg:hidden ${transparent ? 'text-white hover:bg-white/10' : 'text-[#2c2c2c] hover:bg-slate-50'}`}
              aria-label="Mở menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      {/* Đặt ngoài <header>: backdrop-blur của header khiến phần tử fixed bên trong bị giới hạn trong header
          (ngăn kéo chỉ cao 64px và tràn ngang trang trên điện thoại). */}
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} user={user} onLogout={logout} />
    </>
  );
}
