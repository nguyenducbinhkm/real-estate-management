import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { canManageListings } from '../../config/navigation';

/* Khung chung cho khu vực người bán: Tổng quan, Quản lý tin đăng, Quản lý khách hàng. */

export const listingStatusInfo = {
  Active: { label: 'Đang hiển thị', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  Pending: { label: 'Chờ duyệt', tone: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  Draft: { label: 'Đã ẩn', tone: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  Sold: { label: 'Đã bán', tone: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  Rented: { label: 'Đã cho thuê', tone: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  Expired: { label: 'Hết hạn', tone: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  Rejected: { label: 'Bị từ chối', tone: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
};

export const contactStatusInfo = {
  New: { label: 'Mới', tone: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  Contacted: { label: 'Đã liên hệ', tone: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  Closed: { label: 'Đã xong', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
};

/** Trạng thái hiển thị của tin: tin "Đang hiển thị" nhưng đã qua ngày hết hạn được coi là Hết hạn. */
export function effectiveStatus(listing) {
  const expired = listing.expiresAt && new Date(listing.expiresAt) <= new Date();
  if (listing.status === 'Active' && expired) return 'Expired';
  return listing.status;
}

export function StatusPill({ info, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${info?.tone || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${info?.dot || 'bg-slate-400'}`} />
      {children || info?.label}
    </span>
  );
}

export function formatPrice(value) {
  if (!value) return 'Liên hệ';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')} tỷ`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000).toLocaleString('vi-VN')} triệu`;
  return `${Number(value).toLocaleString('vi-VN')} đ`;
}

export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';
}

/** "Vừa xong", "5 phút trước", "3 ngày trước"… */
export function timeAgo(iso) {
  if (!iso) return '';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(iso);
}

/** Số ngày còn lại tới hạn (âm nếu đã quá hạn), null nếu không có hạn. */
export function daysLeft(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}

export const icons = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  listings: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></>,
  customers: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14a6 6 0 0 1 3.5 6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  settings: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  heart: <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6" /></>,
  check: <path d="m5 12 5 5L20 7" />,
  trash: <><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
};

function SideLink({ to, icon, children, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
        }`
      }
    >
      <Icon d={icon} className="h-[18px] w-[18px]" />
      <span className="flex-1">{children}</span>
      {badge > 0 && <span className="rounded-full bg-sky-500 px-1.5 text-[11px] font-bold text-white">{badge}</span>}
    </NavLink>
  );
}

/** Khung trang người bán: thanh bên (menu) + nội dung. Tài khoản người mua thấy thông báo thay vì nội dung. */
export default function SellerShell({ title, description, actions, newContacts = 0, children }) {
  const user = useAuthStore((state) => state.user);
  const allowed = canManageListings(user);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        <span aria-hidden="true">›</span>
        <span>Quản lý</span>
        <span aria-hidden="true">›</span>
        <span className="text-ink">{title}</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-3 shadow-card lg:sticky lg:top-24">
          <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Khu vực người bán</p>
          <nav aria-label="Quản lý" className="space-y-1">
            <SideLink to="/seller/dashboard" icon={icons.dashboard}>Tổng quan</SideLink>
            <SideLink to="/seller/listings" icon={icons.listings}>Quản lý tin đăng</SideLink>
            <SideLink to="/seller/customers" icon={icons.customers} badge={newContacts}>Quản lý khách hàng</SideLink>
            <SideLink to="/seller/post" icon={icons.plus}>Đăng tin mới</SideLink>
            {user?.role === 'Admin' && <SideLink to="/admin/listings" icon={icons.shield}>Duyệt tin đăng</SideLink>}
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
            {allowed && actions}
          </header>
          <div className="mt-6">
            {allowed ? children : (
              <div className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
                <p className="text-lg font-bold text-ink">Tài khoản người mua không có khu vực quản lý tin</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Mục này dành cho tài khoản Người bán / Môi giới. Hãy đăng ký tài khoản người bán để đăng tin và quản lý khách hàng.
                </p>
                <Link to="/listings" className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
                  Xem tin bất động sản
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
