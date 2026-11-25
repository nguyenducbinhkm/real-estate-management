import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { canManageListings } from '../config/navigation';
import { sellerService } from '../services/sellerService';
import { readApiError } from '../services/accountService';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import SellerShell, {
  contactStatusInfo,
  formatDate,
  formatPrice,
  Icon,
  icons,
  StatusPill,
  timeAgo,
} from '../components/seller/SellerShell';

/* Trang "Quản lý khách hàng" (/seller/customers): yêu cầu liên hệ khách gửi tới các tin của người bán. */

const statusKeys = ['New', 'Contacted', 'Closed'];

const normalize = (text) => (text || '').toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

function CustomerCard({ item, busy, onStatus, onDelete }) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-700">
            {(item.senderName || '?').trim().split(/\s+/).pop()?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 font-bold text-ink">
              {item.senderName}
              {item.isRegisteredUser && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">Thành viên</span>}
            </p>
            <p className="text-xs text-slate-500" title={new Date(item.createdAt).toLocaleString('vi-VN')}>{timeAgo(item.createdAt)}</p>
          </div>
        </div>
        <StatusPill info={contactStatusInfo[item.status]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <a href={`tel:${item.senderPhone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-100">
          <Icon d={icons.phone} className="h-4 w-4" />{item.senderPhone}
        </a>
        {item.senderEmail && (
          <a href={`mailto:${item.senderEmail}`} className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200">
            <Icon d={icons.mail} className="h-4 w-4 shrink-0" /><span className="truncate">{item.senderEmail}</span>
          </a>
        )}
      </div>

      {item.message && <p className="mt-3 whitespace-pre-line rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{item.message}</p>}

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <Icon d={icons.listings} className="h-4 w-4 shrink-0" />
        {item.propertyId ? (
          <Link to={`/listings/${item.propertyId}`} className="min-w-0 truncate font-medium text-ink hover:text-brand-700">
            {item.propertyTitle}
            {item.propertyPrice ? <span className="text-brand-700"> · {formatPrice(item.propertyPrice)}</span> : null}
          </Link>
        ) : (
          <span className="italic">Tin đăng đã bị xoá</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div role="group" aria-label="Trạng thái chăm sóc" className="inline-flex rounded-full bg-slate-100 p-1">
          {statusKeys.map((key) => (
            <button
              key={key}
              type="button"
              disabled={busy || item.status === key}
              aria-pressed={item.status === key}
              onClick={() => onStatus(item, key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                item.status === key ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink disabled:opacity-50'
              }`}
            >
              {contactStatusInfo[key].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(item)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Icon d={icons.trash} className="h-4 w-4" /> Xoá
        </button>
      </div>
    </article>
  );
}

export default function SellerCustomers() {
  const user = useAuthStore((state) => state.user);
  const allowed = canManageListings(user);
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: allowed, items: [], error: '' });
  const [keyword, setKeyword] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const status = statusKeys.includes(params.get('status')) ? params.get('status') : 'all';

  useEffect(() => {
    if (!allowed) return undefined;
    let alive = true;
    sellerService
      .contacts()
      .then((items) => alive && setState({ loading: false, items, error: '' }))
      .catch((error) => alive && setState({ loading: false, items: [], error: readApiError(error, 'Không tải được danh sách khách hàng.').message }));
    return () => {
      alive = false;
    };
  }, [allowed]);

  const counts = useMemo(() => {
    const result = { all: state.items.length };
    statusKeys.forEach((key) => { result[key] = state.items.filter((i) => i.status === key).length; });
    return result;
  }, [state.items]);

  const visible = useMemo(() => {
    const q = normalize(keyword.trim());
    return state.items
      .filter((i) => status === 'all' || i.status === status)
      .filter((i) => !q || normalize(`${i.senderName} ${i.senderPhone} ${i.senderEmail} ${i.propertyTitle} ${i.message}`).includes(q));
  }, [state.items, status, keyword]);

  const changeStatus = async (item, to) => {
    setBusyId(item.id);
    setNotice(null);
    try {
      const updated = await sellerService.updateContactStatus(item.id, to);
      setState((value) => ({ ...value, items: value.items.map((i) => (i.id === item.id ? updated : i)) }));
    } catch (error) {
      setNotice({ tone: 'error', text: readApiError(error, 'Không cập nhật được trạng thái.').message });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const item = confirm;
    setConfirm(null);
    setBusyId(item.id);
    setNotice(null);
    try {
      await sellerService.deleteContact(item.id);
      setState((value) => ({ ...value, items: value.items.filter((i) => i.id !== item.id) }));
      setNotice({ tone: 'success', text: `Đã xoá yêu cầu của ${item.senderName}.` });
    } catch (error) {
      setNotice({ tone: 'error', text: readApiError(error, 'Không xoá được yêu cầu.').message });
    } finally {
      setBusyId(null);
    }
  };

  const tabs = [['all', 'Tất cả'], ...statusKeys.map((key) => [key, contactStatusInfo[key].label])];

  return (
    <SellerShell
      title="Quản lý khách hàng"
      description="Khách hàng để lại thông tin trên tin đăng của bạn. Gọi lại sớm để tăng cơ hội giao dịch."
      newContacts={counts.New}
    >
      {state.loading ? (
        <div className="py-20"><Spinner /></div>
      ) : state.error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{state.error}</p>
      ) : (
        <div className="space-y-4">
          <div role="tablist" aria-label="Lọc theo trạng thái" className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={status === key}
                onClick={() => setParams(key === 'all' ? {} : { status: key })}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  status === key ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 hover:ring-brand-300'
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 text-xs ${status === key ? 'bg-white/25' : 'bg-slate-100'}`}>{counts[key]}</span>
              </button>
            ))}
          </div>

          <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-slate-400 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-300">
            <Icon d={icons.search} className="h-4 w-4" />
            <span className="sr-only">Tìm khách hàng</span>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên, số điện thoại, email, tin đăng…" className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400" />
          </label>

          {notice && (
            <p role={notice.tone === 'success' ? 'status' : 'alert'} className={`rounded-2xl px-4 py-3 text-sm ring-1 ${notice.tone === 'success' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'}`}>
              {notice.text}
            </p>
          )}

          {visible.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {visible.map((item) => (
                <CustomerCard key={item.id} item={item} busy={busyId === item.id} onStatus={changeStatus} onDelete={setConfirm} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
              <p className="font-bold text-ink">{state.items.length ? 'Không có khách hàng phù hợp' : 'Chưa có khách hàng nào liên hệ'}</p>
              <p className="mt-1 text-sm text-slate-500">
                {state.items.length ? 'Thử chọn trạng thái khác hoặc đổi từ khoá.' : 'Khi khách bấm "Liên hệ người đăng" trên tin của bạn, thông tin sẽ hiện ở đây.'}
              </p>
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(confirm)} title="Xoá yêu cầu liên hệ?" onClose={() => setConfirm(null)}>
        <p className="text-sm text-slate-600">
          Yêu cầu của <strong className="text-ink">{confirm?.senderName}</strong> ({confirm?.senderPhone}) gửi ngày {formatDate(confirm?.createdAt)} sẽ bị xoá vĩnh viễn.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirm(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:border-brand-300">Huỷ</button>
          <button type="button" onClick={remove} className="h-10 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">Xoá</button>
        </div>
      </Modal>
    </SellerShell>
  );
}
