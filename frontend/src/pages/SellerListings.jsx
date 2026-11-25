import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { canManageListings } from '../config/navigation';
import { sellerService } from '../services/sellerService';
import { readApiError } from '../services/accountService';
import { getPropertyImage } from '../data/propertyImages';
import { TYPE_LABELS } from '../utils/searchParser';
import NewsImage from '../components/news/NewsImage';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import SellerShell, {
  daysLeft,
  effectiveStatus,
  formatDate,
  formatPrice,
  Icon,
  icons,
  listingStatusInfo,
  StatusPill,
} from '../components/seller/SellerShell';

/* Trang "Quản lý tin đăng" (/seller/listings): GET /api/seller/listings, PATCH /api/listings/{id}/status, DELETE /api/listings/{id}. */

const tabs = [
  ['all', 'Tất cả', () => true],
  ['Active', 'Đang hiển thị', (s) => s === 'Active'],
  ['Pending', 'Chờ duyệt', (s) => s === 'Pending'],
  ['Draft', 'Đã ẩn', (s) => s === 'Draft'],
  ['Closed', 'Đã giao dịch', (s) => s === 'Sold' || s === 'Rented'],
  ['Inactive', 'Hết hạn / từ chối', (s) => s === 'Expired' || s === 'Rejected'],
];

const sorts = [
  ['newest', 'Mới đăng nhất', (a, b) => new Date(b.listing.createdAt) - new Date(a.listing.createdAt)],
  ['contacts', 'Nhiều liên hệ nhất', (a, b) => b.contactCount - a.contactCount || b.saveCount - a.saveCount],
  ['priceDesc', 'Giá cao → thấp', (a, b) => b.listing.price - a.listing.price],
  ['priceAsc', 'Giá thấp → cao', (a, b) => a.listing.price - b.listing.price],
];

const normalize = (text) => (text || '').toLocaleLowerCase('vi').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

/** Các thao tác đổi trạng thái hợp lệ theo trạng thái hiện tại (khớp quy tắc ở backend). */
function statusActions(listing, status) {
  const isRent = listing.transactionType === 'ForRent';
  const closeAction = { to: isRent ? 'Rented' : 'Sold', label: isRent ? 'Đã cho thuê' : 'Đã bán', icon: icons.check };
  switch (status) {
    case 'Active':
      return [{ to: 'Draft', label: 'Ẩn tin', icon: icons.eyeOff }, closeAction];
    case 'Draft':
      return [{ to: 'Active', label: 'Hiện tin', icon: icons.eye }, closeAction];
    case 'Sold':
    case 'Rented':
      return [{ to: 'Active', label: 'Đăng lại', icon: icons.eye }];
    default:
      return [];
  }
}

function ActionButton({ onClick, icon, children, danger = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-slate-200 text-ink hover:border-brand-300 hover:text-brand-700'
      }`}
    >
      <Icon d={icon} className="h-4 w-4" />
      {children}
    </button>
  );
}

function ListingRow({ item, busy, onStatus, onDelete }) {
  const { listing } = item;
  const status = effectiveStatus(listing);
  const left = daysLeft(listing.expiresAt);
  const location = [listing.districtName, listing.provinceName].filter(Boolean).join(', ');

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-card sm:flex-row">
      <Link to={`/listings/${listing.id}`} className="group relative h-40 shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-48">
        <NewsImage image={getPropertyImage(listing)} className="h-full min-h-[8rem] w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2"><StatusPill info={listingStatusInfo[status]} /></span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1 pr-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link to={`/listings/${listing.id}`} className="line-clamp-2 min-w-0 flex-1 font-bold text-ink hover:text-brand-700">{listing.title}</Link>
          <p className="shrink-0 text-lg font-extrabold text-brand-700">
            {formatPrice(listing.price)}{listing.transactionType === 'ForRent' && listing.price ? <span className="text-xs font-semibold">/tháng</span> : null}
          </p>
        </div>

        <p className="text-sm text-slate-500">
          {TYPE_LABELS[listing.propertyType] || listing.propertyType} · {listing.area} m²{location ? ` · ${location}` : ''}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span>Đăng ngày {formatDate(listing.createdAt)}</span>
          {left !== null && (
            <span className={left <= 0 ? 'font-semibold text-red-600' : left <= 7 ? 'font-semibold text-amber-600' : ''}>
              {left <= 0 ? `Hết hạn ${formatDate(listing.expiresAt)}` : `Còn ${left} ngày (hạn ${formatDate(listing.expiresAt)})`}
            </span>
          )}
          {status === 'Pending' && <span className="font-semibold text-amber-600">Đang chờ admin duyệt</span>}
          {status === 'Rejected' && <span className="font-semibold text-red-600">Tin chưa đạt yêu cầu – hãy sửa nội dung rồi gửi lại</span>}
          {listing.packageType && listing.packageType !== 'Free' && <span className="font-semibold text-gold-700">Gói {listing.packageType.replace('Vip', 'VIP ')}</span>}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/seller/customers" className="flex items-center gap-1.5 hover:text-brand-700" title="Yêu cầu liên hệ">
              <Icon d={icons.mail} className="h-4 w-4" />{item.contactCount} liên hệ
              {item.newContactCount > 0 && <span className="rounded-full bg-sky-500 px-1.5 text-[11px] font-bold text-white">{item.newContactCount} mới</span>}
            </Link>
            <span className="flex items-center gap-1.5" title="Lượt lưu tin"><Icon d={icons.heart} className="h-4 w-4" />{item.saveCount} lưu</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {status !== 'Sold' && status !== 'Rented' && (
              <Link
                to={`/seller/listings/${listing.id}/edit`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-semibold text-ink transition hover:border-brand-300 hover:text-brand-700"
                title={status === 'Rejected' || status === 'Expired' ? 'Sửa và gửi duyệt lại' : 'Sửa tin (tin sẽ được duyệt lại)'}
              >
                <Icon d={icons.edit} className="h-4 w-4" />
                {status === 'Rejected' || status === 'Expired' ? 'Sửa & đăng lại' : 'Sửa'}
              </Link>
            )}
            {statusActions(listing, status).map((action) => (
              <ActionButton key={action.to} icon={action.icon} disabled={busy} onClick={() => onStatus(item, action.to)}>
                {action.label}
              </ActionButton>
            ))}
            <ActionButton icon={icons.trash} danger disabled={busy} onClick={() => onDelete(item)}>Xoá</ActionButton>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function SellerListings() {
  const user = useAuthStore((state) => state.user);
  const allowed = canManageListings(user);
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: allowed, items: [], error: '' });
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('newest');
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const tab = tabs.some(([key]) => key === params.get('tab')) ? params.get('tab') : 'all';

  useEffect(() => {
    if (!allowed) return undefined;
    let alive = true;
    sellerService
      .listings()
      .then((items) => alive && setState({ loading: false, items, error: '' }))
      .catch((error) => alive && setState({ loading: false, items: [], error: readApiError(error, 'Không tải được danh sách tin.').message }));
    return () => {
      alive = false;
    };
  }, [allowed]);

  const counts = useMemo(
    () => Object.fromEntries(tabs.map(([key, , match]) => [key, state.items.filter((i) => match(effectiveStatus(i.listing))).length])),
    [state.items],
  );

  const visible = useMemo(() => {
    const match = tabs.find(([key]) => key === tab)[2];
    const q = normalize(keyword.trim());
    const compare = sorts.find(([key]) => key === sort)[2];
    return state.items
      .filter((i) => match(effectiveStatus(i.listing)))
      .filter((i) => !q || normalize(`${i.listing.title} ${i.listing.streetAddress} ${i.listing.districtName} ${i.listing.provinceName}`).includes(q))
      .sort(compare);
  }, [state.items, tab, keyword, sort]);

  const replaceListing = (updated) =>
    setState((value) => ({ ...value, items: value.items.map((i) => (i.listing.id === updated.id ? { ...i, listing: updated } : i)) }));

  const changeStatus = async (item, to) => {
    setBusyId(item.listing.id);
    setNotice(null);
    try {
      const updated = await sellerService.changeListingStatus(item.listing.id, to);
      replaceListing(updated);
      setNotice({ tone: 'success', text: `Đã chuyển "${item.listing.title}" sang trạng thái ${listingStatusInfo[to].label.toLowerCase()}.` });
    } catch (error) {
      setNotice({ tone: 'error', text: readApiError(error, 'Không đổi được trạng thái tin.').message });
    } finally {
      setBusyId(null);
    }
  };

  const deleteListing = async () => {
    const item = confirm;
    setConfirm(null);
    setBusyId(item.listing.id);
    setNotice(null);
    try {
      await sellerService.deleteListing(item.listing.id);
      setState((value) => ({ ...value, items: value.items.filter((i) => i.listing.id !== item.listing.id) }));
      setNotice({ tone: 'success', text: `Đã xoá tin "${item.listing.title}". Thông tin khách hàng đã liên hệ vẫn được giữ lại.` });
    } catch (error) {
      setNotice({ tone: 'error', text: readApiError(error, 'Không xoá được tin.').message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SellerShell
      title="Quản lý tin đăng"
      description="Theo dõi trạng thái, lượt quan tâm và cập nhật tin của bạn."
      actions={(
        <Link to="/seller/post" className="inline-flex h-11 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700">
          <Icon d={icons.plus} className="h-4 w-4" /> Đăng tin mới
        </Link>
      )}
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
                aria-selected={tab === key}
                onClick={() => setParams(key === 'all' ? {} : { tab: key })}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === key ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 hover:ring-brand-300'
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 text-xs ${tab === key ? 'bg-white/25' : 'bg-slate-100'}`}>{counts[key]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-full bg-white px-4 text-slate-400 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-300">
              <Icon d={icons.search} className="h-4 w-4" />
              <span className="sr-only">Tìm tin</span>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tiêu đề, địa chỉ…" className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400" />
            </label>
            <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm text-slate-500 ring-1 ring-slate-200">
              Sắp xếp
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent font-semibold text-ink outline-none">
                {sorts.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          </div>

          {notice && (
            <p role={notice.tone === 'success' ? 'status' : 'alert'} className={`rounded-2xl px-4 py-3 text-sm ring-1 ${notice.tone === 'success' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'}`}>
              {notice.text}
            </p>
          )}

          {visible.length ? (
            <div className="space-y-4">
              {visible.map((item) => (
                <ListingRow key={item.listing.id} item={item} busy={busyId === item.listing.id} onStatus={changeStatus} onDelete={setConfirm} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
              <p className="font-bold text-ink">{state.items.length ? 'Không có tin phù hợp' : 'Bạn chưa có tin đăng nào'}</p>
              <p className="mt-1 text-sm text-slate-500">{state.items.length ? 'Thử chọn trạng thái khác hoặc đổi từ khoá.' : 'Đăng tin đầu tiên để bắt đầu nhận khách hàng.'}</p>
              {!state.items.length && (
                <Link to="/seller/post" className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Đăng tin mới</Link>
              )}
            </div>
          )}
        </div>
      )}

      <Modal open={Boolean(confirm)} title="Xoá tin đăng?" onClose={() => setConfirm(null)}>
        <p className="text-sm text-slate-600">
          Tin <strong className="text-ink">{confirm?.listing.title}</strong> sẽ bị xoá vĩnh viễn và không thể khôi phục.
          Các yêu cầu liên hệ của khách vẫn được giữ trong Quản lý khách hàng.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirm(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:border-brand-300">Huỷ</button>
          <button type="button" onClick={deleteListing} className="h-10 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">Xoá tin</button>
        </div>
      </Modal>
    </SellerShell>
  );
}
