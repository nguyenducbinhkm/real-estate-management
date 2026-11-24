import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mainMenu } from '../../config/navigation';

export default function Navbar() {
  const ref = useRef(null);
  const location = useLocation();

  // Dropdown mở theo :focus-within; bỏ focus khi chuyển trang để menu đóng lại.
  useEffect(() => {
    if (ref.current?.contains(document.activeElement)) document.activeElement.blur();
  }, [location]);

  return (
    <nav ref={ref} className="hidden h-full items-stretch xl:flex" aria-label="Điều hướng chính">
      {mainMenu.map((item) => (
        <div key={item.label} className="group relative flex items-center">
          <Link
            to={item.to}
            className="relative flex h-full items-center px-3 text-sm text-[#2c2c2c] transition-colors hover:text-black"
          >
            {item.label}
            <span className="absolute inset-x-3 bottom-0 h-0.5 scale-x-0 bg-brand-600 transition-transform group-focus-within:scale-x-100 group-hover:scale-x-100" />
          </Link>

          {item.children && (
            <div className="invisible absolute left-0 top-full z-50 min-w-[280px] pt-0 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <ul className="rounded-lg bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {item.children.map((child) => (
                  <li key={child.label}>
                    <Link
                      to={child.to}
                      className="block whitespace-nowrap px-4 py-2.5 text-sm text-[#2c2c2c] hover:bg-slate-50 hover:text-brand-600"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
