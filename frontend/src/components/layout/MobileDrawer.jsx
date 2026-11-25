import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { accountMenuFor, mainMenu } from '../../config/navigation';
import { Avatar } from './UserMenu';
import { ChevronDownIcon, CloseIcon } from './Icons';

function Section({ item }) {
  const [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link to={item.to} className="block px-5 py-3.5 text-[15px] text-[#2c2c2c]">
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[15px] text-[#2c2c2c]"
      >
        {item.label}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="bg-slate-50 py-1">
          <li>
            <Link to={item.to} className="block px-8 py-2.5 text-sm font-semibold text-brand-600">
              Tất cả {item.label.toLowerCase()}
            </Link>
          </li>
          {item.children.map((child) => (
            <li key={child.label}>
              <Link to={child.to} className="block px-8 py-2.5 text-sm text-[#2c2c2c]">
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MobileDrawer({ open, onClose, user, onLogout }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Đóng menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          {user ? (
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={user.fullName} url={user.avatarUrl} className="h-10 w-10 text-base" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link to="/login" className="text-[#2c2c2c]">Đăng nhập</Link>
              <span className="h-4 w-px bg-slate-300" />
              <Link to="/register" className="text-[#2c2c2c]">Đăng ký</Link>
            </div>
          )}
          <button type="button" onClick={onClose} aria-label="Đóng menu" className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4">
            <Link
              to="/seller/post"
              className="flex h-11 items-center justify-center rounded-lg border border-[#cccccc] text-sm font-semibold text-[#2c2c2c]"
            >
              Đăng tin
            </Link>
          </div>

          <nav aria-label="Điều hướng chính" className="divide-y divide-slate-100 border-y border-slate-100">
            {mainMenu.map((item) => <Section key={item.label} item={item} />)}
          </nav>

          {user && (
            <div className="py-2">
              <p className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Tài khoản</p>
              {accountMenuFor(user).map((item) => (
                <Link key={item.to} to={item.to} className="block px-5 py-3 text-[15px] text-[#2c2c2c]">
                  {item.label}
                </Link>
              ))}
              <button type="button" onClick={onLogout} className="block w-full px-5 py-3 text-left text-[15px] text-[#2c2c2c]">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
