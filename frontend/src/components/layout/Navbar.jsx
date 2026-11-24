import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainMenu } from '../../config/navigation';
import { useSearchStore } from '../../store/searchStore';

/** Mục menu đang xem: so đường dẫn; riêng /listings so thêm loại giao dịch đang lọc (Bán / Cho thuê). */
function useIsActive() {
  const { pathname } = useLocation();
  const transactionType = useSearchStore((state) => state.criteria.transactionType);
  return (to) => {
    const [path, query] = to.split('?');
    if (path === '/') return pathname === '/';
    if (!pathname.startsWith(path)) return false;
    const wanted = new URLSearchParams(query).get('transactionType');
    return !wanted || wanted === transactionType;
  };
}

/** Menu chính. `light`: header đang trong suốt trên banner → chữ trắng, gạch chân vàng. */
export default function Navbar({ light = false }) {
  const ref = useRef(null);
  const location = useLocation();
  const isActive = useIsActive();

  // Dropdown mở theo :focus-within; bỏ focus khi chuyển trang để menu đóng lại.
  useEffect(() => {
    if (ref.current?.contains(document.activeElement)) document.activeElement.blur();
  }, [location]);

  return (
    // Hiện từ 1024px (lg): menu chỉ cần ~550px; từ 1024–1280px thu hẹp khoảng cách giữa các mục.
    <nav ref={ref} className="hidden h-full items-stretch lg:flex" aria-label="Điều hướng chính">
      {mainMenu.map((item) => {
        const active = isActive(item.to);
        const textClass = light
          ? active ? 'text-white' : 'text-white/85 hover:text-white'
          : active ? 'text-brand-700' : 'text-[#2c2c2c] hover:text-brand-700';
        return (
          <div key={item.label} className="group relative flex items-center">
            <Link
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-full items-center whitespace-nowrap px-2 text-sm font-medium transition-colors duration-300 xl:px-3 ${textClass}`}
            >
              {item.label}
              <span
                className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-transform duration-300 xl:inset-x-3 ${light ? 'bg-gold-300' : 'bg-brand-600'} ${
                  active ? 'scale-x-100' : 'scale-x-0 group-focus-within:scale-x-100 group-hover:scale-x-100'
                }`}
              />
            </Link>

            {item.children && (
              <div className="invisible absolute left-0 top-full z-50 min-w-[280px] pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="rounded-2xl border border-slate-100 bg-white py-2 shadow-[0_16px_40px_rgba(40,41,36,0.16)]">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        to={child.to}
                        className="mx-2 block whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-[#2c2c2c] hover:bg-brand-50 hover:text-brand-700"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
