import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { accountMenu } from '../../config/navigation';
import { ChevronDownIcon } from './Icons';

export function Avatar({ name, className = 'h-9 w-9 text-sm' }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-600 ${className}`}>
      {initial}
    </span>
  );
}

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#2c2c2c] hover:bg-slate-50"
      >
        <Avatar name={user.fullName} />
        <span className="max-w-[140px] truncate">{user.fullName}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <div className="border-b border-slate-100 px-4 pb-3 pt-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <ul className="py-1">
            {accountMenu.map((item) => (
              <li key={item.to}>
                <Link
                  role="menuitem"
                  to={item.to}
                  className="block px-4 py-2.5 text-sm text-[#2c2c2c] hover:bg-slate-50 hover:text-brand-600"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="block w-full px-4 py-2.5 text-left text-sm text-[#2c2c2c] hover:bg-slate-50 hover:text-brand-600"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
