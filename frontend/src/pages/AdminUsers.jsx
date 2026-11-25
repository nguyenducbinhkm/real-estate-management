import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/postingService';
import { readApiError } from '../services/accountService';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import AdminShell from '../components/admin/AdminShell';
import { formatDate, Icon, icons } from '../components/seller/SellerShell';

/* Quản lý người dùng (/admin/users): GET /api/admin/users, PATCH /api/admin/users/{id}/role. */

const ROLES = {
  Buyer: { label: 'Người mua', tone: 'bg-sky-50 text-sky-700 ring-sky-200' },
  Seller: { label: 'Người bán', tone: 'bg-brand-50 text-brand-700 ring-brand-200' },
  Agent: { label: 'Môi giới', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Admin: { label: 'Quản trị', tone: 'bg-ink text-white ring-ink' },
};
const ASSIGNABLE = ['Buyer', 'Seller', 'Agent'];
const TABS = ['', 'Buyer', 'Seller', 'Agent', 'Admin'];

function RoleBadge({ role }) {
  const info = ROLES[role] || { label: role, tone: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${info.tone}`}>{info.label}</span>;
}

export default function AdminUsers() {
  const me = useAuthStore((state) => state.user);
  const isAdmin = me?.role === 'Admin';
  const [params, setParams] = useSearchParams();
  const role = TABS.includes(params.get('role')) ? params.get('role') : '';
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: true, users: [], error: '' });
  const [notice, setNotice] = useState(null);
  const [change, setChange] = useState(null); // { user, role }
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!isAdmin) return undefined;
    let alive = true;
    setState((value) => ({ ...value, loading: true, error: '' }));
    adminService.users(role, query)
      .then((users) => alive && setState({ loading: false, users, error: '' }))
      .catch((error) => alive && setState({ loading: false, users: [], error: readApiError(error, 'Không tải được danh sách người dùng.').message }));
    return () => { alive = false; };
  }, [isAdmin, role, query]);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const confirmChange = async () => {
    const { user, role: target } = change;
    setBusy(true);
    setNotice(null);
    try {
      const updated = await adminService.changeRole(user.id, target);
      setState((value) => ({
        ...value,
        users: role && role !== updated.role
          ? value.users.filter((u) => u.id !== updated.id)
          : value.users.map((u) => (u.id === updated.id ? updated : u)),
      }));
      setNotice({ tone: 'success', text: `Đã đổi ${user.fullName} thành ${ROLES[target].label}. Người dùng cần đăng nhập lại để vai trò mới có hiệu lực.` });
      setChange(null);
    } catch (error) {
      setNotice({ tone: 'error', text: readApiError(error, 'Không đổi được vai trò.').message });
      setChange(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell title="Người dùng" description="Tìm người dùng và đổi vai trò Người mua / Người bán / Môi giới. Tài khoản admin được khai báo trong file admin-accounts.json.">
      <div className="space-y-4">
        <div role="tablist" aria-label="Lọc theo vai trò" className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((key) => (
            <button
              key={key || 'all'}
              type="button"
              role="tab"
              aria-selected={role === key}
              onClick={() => setParams(key ? { role: key } : {})}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                role === key ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 hover:ring-brand-300'
              }`}
            >
              {key ? ROLES[key].label : 'Tất cả'}
            </button>
          ))}
        </div>

        <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-slate-400 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-300">
          <Icon d={icons.search} className="h-4 w-4" />
          <span className="sr-only">Tìm người dùng</span>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, email, số điện thoại…" className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400" />
        </label>

        {notice && (
          <p role={notice.tone === 'success' ? 'status' : 'alert'} className={`rounded-2xl px-4 py-3 text-sm ring-1 ${notice.tone === 'success' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'}`}>
            {notice.text}
          </p>
        )}

        {state.loading ? (
          <div className="py-20"><Spinner /></div>
        ) : state.error ? (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{state.error}</p>
        ) : state.users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center font-bold text-ink">Không có người dùng phù hợp</div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
            <p className="border-b border-slate-100 px-5 py-3 text-sm text-slate-500">{state.users.length} người dùng</p>
            <ul className="divide-y divide-slate-100">
              {state.users.map((u) => {
                const locked = u.role === 'Admin' || u.id === me.id;
                return (
                  <li key={u.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
                        {(u.fullName || u.email).trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                          <span className="truncate">{u.fullName}</span>
                          <RoleBadge role={u.role} />
                          {u.isVerified && <span className="text-xs font-semibold text-emerald-600">✓ Đã xác minh</span>}
                          {u.id === me.id && <span className="text-xs text-slate-400">(bạn)</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">{u.email}{u.phone ? ` · ${u.phone}` : ''} · tham gia {formatDate(u.createdAt)}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm text-slate-600">
                      <span className="font-semibold text-ink">{u.listingCount}</span> tin
                      {u.openListingCount > 0 && <span className="text-slate-400"> ({u.openListingCount} đang mở)</span>}
                    </p>
                    <div className="shrink-0">
                      {locked ? (
                        <span className="text-xs text-slate-400">{u.role === 'Admin' ? 'Sửa trong admin-accounts.json' : '—'}</span>
                      ) : (
                        <label className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="sr-only">Đổi vai trò của {u.fullName}</span>
                          <select
                            value={u.role}
                            onChange={(e) => setChange({ user: u, role: e.target.value })}
                            className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-brand-400"
                          >
                            {ASSIGNABLE.map((key) => <option key={key} value={key}>{ROLES[key].label}</option>)}
                          </select>
                        </label>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Modal open={Boolean(change)} title="Đổi vai trò người dùng?" onClose={() => !busy && setChange(null)}>
        {change && (
          <>
            <p className="text-sm text-slate-600">
              Đổi <strong className="text-ink">{change.user.fullName}</strong> ({change.user.email}) từ{' '}
              <strong className="text-ink">{ROLES[change.user.role]?.label}</strong> thành <strong className="text-ink">{ROLES[change.role].label}</strong>?
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Người dùng sẽ được đăng xuất khỏi các phiên hiện tại và cần đăng nhập lại.
              {change.role === 'Buyer' && ' Người mua không đăng tin được – chỉ đổi được khi họ không còn tin đang mở.'}
              {change.role === 'Seller' && ' Người bán đăng tối đa 5 tin.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setChange(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600">Huỷ</button>
              <button type="button" disabled={busy} onClick={confirmChange} className="h-10 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {busy ? 'Đang đổi…' : 'Đổi vai trò'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </AdminShell>
  );
}
