import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Icon, icons } from '../seller/SellerShell';

/* Khung chung cho khu quản trị (/admin...): menu bên + nội dung. Chỉ tài khoản Admin. */

function SideLink({ to, icon, end, badge, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
        }`
      }
    >
      <Icon d={icon} className="h-[18px] w-[18px]" />
      <span className="flex-1">{children}</span>
      {badge > 0 && <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">{badge}</span>}
    </NavLink>
  );
}

export default function AdminShell({ title, description, actions, pending = 0, children }) {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== 'Admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-lg font-bold text-ink">Trang này chỉ dành cho quản trị viên</p>
        <Link to="/" className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        <span aria-hidden="true">›</span>
        <Link to="/admin" className="hover:text-brand-600">Quản trị</Link>
        <span aria-hidden="true">›</span>
        <span className="text-ink">{title}</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-3 shadow-card lg:sticky lg:top-24">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Quản trị hệ thống</p>
          <nav aria-label="Quản trị" className="space-y-1">
            <SideLink to="/admin" end icon={icons.dashboard}>Tổng quan</SideLink>
            <SideLink to="/admin/listings" icon={icons.shield} badge={pending}>Duyệt tin đăng</SideLink>
            <SideLink to="/admin/users" icon={icons.users}>Người dùng</SideLink>
            <div className="my-2 border-t border-slate-100" />
            <SideLink to="/profile" icon={icons.settings}>Cài đặt tài khoản</SideLink>
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{title}</h1>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {actions}
          </header>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </div>
  );
}
