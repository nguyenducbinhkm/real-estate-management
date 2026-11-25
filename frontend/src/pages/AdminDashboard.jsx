import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/postingService';
import { readApiError } from '../services/accountService';
import Spinner from '../components/ui/Spinner';
import AdminShell from '../components/admin/AdminShell';
import { Icon, icons, listingStatusInfo } from '../components/seller/SellerShell';

/* Tổng quan quản trị (/admin): GET /api/admin/stats. */

const ROLE_INFO = [
  ['Buyer', 'Người mua', 'bg-sky-500'],
  ['Seller', 'Người bán', 'bg-brand-500'],
  ['Agent', 'Môi giới', 'bg-emerald-500'],
  ['Admin', 'Quản trị', 'bg-ink'],
];
const STATUS_ORDER = ['Pending', 'Active', 'Draft', 'Sold', 'Rented', 'Expired', 'Rejected'];

function StatCard({ label, value, sub, icon, to, tone = 'bg-brand-50 text-brand-700' }) {
  const body = (
    <div className="flex h-full items-start gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon d={icon} /></span>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-3xl font-extrabold text-ink">{value.toLocaleString('vi-VN')}</p>
        {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{body}</Link> : body;
}

/** Thanh tỉ lệ + chú thích. */
function Breakdown({ title, items, total, linkFor }) {
  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
      <h2 className="font-bold text-ink">{title}</h2>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {items.filter((i) => i.value > 0).map((i) => (
          <span key={i.key} className={i.color} style={{ width: `${(i.value / Math.max(total, 1)) * 100}%` }} title={`${i.label}: ${i.value}`} />
        ))}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.key}>
            <Link to={linkFor(i.key)} className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-slate-50">
              <span className="flex items-center gap-2 text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${i.color}`} />{i.label}</span>
              <span className="font-semibold text-ink">{i.value.toLocaleString('vi-VN')}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminDashboard() {
  const isAdmin = useAuthStore((state) => state.user?.role === 'Admin');
  const [state, setState] = useState({ loading: true, stats: null, error: '' });

  useEffect(() => {
    if (!isAdmin) return undefined;
    let alive = true;
    adminService.stats()
      .then((stats) => alive && setState({ loading: false, stats, error: '' }))
      .catch((error) => alive && setState({ loading: false, stats: null, error: readApiError(error, 'Không tải được số liệu.').message }));
    return () => { alive = false; };
  }, [isAdmin]);

  const s = state.stats;
  const pending = s?.listingsByStatus?.Pending || 0;

  return (
    <AdminShell title="Tổng quan" description="Tình hình người dùng và tin đăng trên toàn hệ thống." pending={pending}>
      {state.loading ? (
        <div className="py-20"><Spinner /></div>
      ) : state.error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{state.error}</p>
      ) : (
        <div className="space-y-6">
          {pending > 0 && (
            <Link to="/admin/listings" className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">
              <span className="flex items-center gap-3 font-semibold"><Icon d={icons.alert} />Có {pending} tin đang chờ duyệt</span>
              <span className="text-sm font-semibold">Duyệt ngay →</span>
            </Link>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Người dùng" value={s.totalUsers} sub={`+${s.newUsers7Days} trong 7 ngày`} icon={icons.users} to="/admin/users" />
            <StatCard label="Tin đăng" value={s.totalListings} sub={`+${s.newListings7Days} trong 7 ngày`} icon={icons.listings} to="/admin/listings?status=Active" tone="bg-emerald-50 text-emerald-700" />
            <StatCard label="Chờ duyệt" value={pending} sub="Cần kiểm tra nội dung" icon={icons.clock} to="/admin/listings" tone="bg-amber-50 text-amber-700" />
            <StatCard label="Đang hiển thị" value={s.listingsByStatus.Active || 0} sub="Tin công khai" icon={icons.eye} to="/admin/listings?status=Active" tone="bg-sky-50 text-sky-700" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Breakdown
              title="Người dùng theo vai trò"
              total={s.totalUsers}
              items={ROLE_INFO.map(([key, label, color]) => ({ key, label, color, value: s.usersByRole[key] || 0 }))}
              linkFor={(key) => `/admin/users?role=${key}`}
            />
            <Breakdown
              title="Tin đăng theo trạng thái"
              total={s.totalListings}
              items={STATUS_ORDER.map((key) => ({ key, label: listingStatusInfo[key].label, color: listingStatusInfo[key].dot, value: s.listingsByStatus[key] || 0 }))}
              linkFor={(key) => (key === 'Pending' ? '/admin/listings' : `/admin/listings?status=${key}`)}
            />
          </div>
        </div>
      )}
    </AdminShell>
  );
}
