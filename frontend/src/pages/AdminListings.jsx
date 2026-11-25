import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminService } from '../services/postingService';
import { readApiError } from '../services/accountService';
import { getPropertyImage, getUploadedImages } from '../data/propertyImages';
import { TYPE_LABELS } from '../utils/searchParser';
import NewsImage from '../components/news/NewsImage';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { formatPrice, Icon, icons, listingStatusInfo, StatusPill, timeAgo } from '../components/seller/SellerShell';
import AdminShell from '../components/admin/AdminShell';

/* Trang "Duyệt tin đăng" (/admin/listings) – chỉ Admin: GET /api/admin/listings, PATCH .../approve | .../reject. */

const TABS = ['Pending', 'Active', 'Rejected', 'Draft', 'Sold', 'Rented', 'Expired'];
const ROLE_LABELS = { Seller: 'Người bán', Agent: 'Môi giới', Admin: 'Quản trị', Buyer: 'Người mua' };

function ModerationRow({ item, busy, onApprove, onReject, onTakeDown, onOpen }) {
  const { listing } = item;
  const location = [listing.wardName, listing.districtName, listing.provinceName].filter(Boolean).join(', ');
  const isRent = listing.transactionType === 'ForRent';
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-card sm:flex-row">
      <button type="button" onClick={() => onOpen(item)} className="group relative h-40 shrink-0 overflow-hidden rounded-2xl sm:h-auto sm:w-52">
        <NewsImage image={getPropertyImage(listing)} className="h-full min-h-[8rem] w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2"><StatusPill info={listingStatusInfo[listing.status]} /></span>
        {getUploadedImages(listing).length > 0 && <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] text-white">{getUploadedImages(listing).length} ảnh</span>}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1 pr-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <button type="button" onClick={() => onOpen(item)} className="line-clamp-2 min-w-0 flex-1 text-left font-bold text-ink hover:text-brand-700">{listing.title}</button>
          <p className="shrink-0 text-lg font-extrabold text-brand-700">{formatPrice(listing.price)}{isRent ? <span className="text-xs">/tháng</span> : null}</p>
        </div>
        <p className="text-sm text-slate-500">
          {isRent ? 'Cho thuê' : 'Bán'} {(TYPE_LABELS[listing.propertyType] || listing.propertyType).toLowerCase()} · {listing.area} m² · {location}
        </p>
        <p className="text-xs text-slate-500">
          Người đăng: <span className="font-semibold text-ink">{item.ownerName}</span> ({ROLE_LABELS[item.ownerRole] || item.ownerRole}) · {item.ownerEmail} · {item.ownerPhone}
          <span className="mx-1">·</span>cập nhật {timeAgo(listing.updatedAt || listing.createdAt)}
        </p>
        <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
          <button type="button" onClick={() => onOpen(item)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-semibold text-ink hover:border-brand-300">
            <Icon d={icons.eye} className="h-4 w-4" /> Xem chi tiết
          </button>
          {(listing.status === 'Active' || listing.status === 'Draft') && (
            <button type="button" disabled={busy} onClick={() => onTakeDown(item)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Icon d={icons.trash} className="h-4 w-4" /> Gỡ tin
            </button>
          )}
          {listing.status === 'Pending' && (
            <>
              <button type="button" disabled={busy} onClick={() => onReject(item)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                Từ chối
              </button>
              <button type="button" disabled={busy} onClick={() => onApprove(item)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                <Icon d={icons.check} className="h-4 w-4" /> Duyệt tin
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function AdminListings() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';
  const [params, setParams] = useSearchParams();
  const status = TABS.includes(params.get('status')) ? params.get('status') : 'Pending';
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: true, items: [], counts: {}, error: '' });
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [detail, setDetail] = useState(null);
  const [confirmReject, setConfirmReject] = useState(null);
  const [confirmTakeDown, setConfirmTakeDown] = useState(null);

  const reload = useCallback(() => {
    if (!isAdmin) return undefined;
    let alive = true;
    setState((value) => ({ ...value, loading: true, error: '' }));
    adminService
      .listings(status, query)
      .then((data) => alive && setState({ loading: false, items: data.items, counts: data.counts, error: '' }))
      .catch((error) => alive && setState({ loading: false, items: [], counts: {}, error: readApiError(error, 'Không tải được danh sách tin.').message }));
    return () => { alive = false; };
  }, [isAdmin, status, query]);

  useEffect(() => reload(), [reload]);

  // Tìm kiếm sau khi ngừng gõ 300ms.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const moderate = async (item, action) => {
    setBusyId(item.listing.id);
    setNotice(null);
    try {
      const updated = action === 'approve'
        ? await adminService.approve(item.listing.id)
        : action === 'takedown'
          ? await adminService.takeDown(item.listing.id)
          : await adminService.reject(item.listing.id);
      const from = item.listing.status;
      setState((value) => ({
        ...value,
        items: value.items.filter((i) => i.listing.id !== updated.id),
        counts: { ...value.counts, [from]: Math.max((value.counts[from] || 1) - 1, 0), [updated.status]: (value.counts[updated.status] || 0) + 1 },
      }));
      setDetail(null);
      const done = { approve: `Đã duyệt "${item.listing.title}" – tin hiển thị công khai 30 ngày.`, reject: `Đã từ chối "${item.listing.title}".`, takedown: `Đã gỡ "${item.listing.title}" khỏi trang công khai.` };
      setNotice({ tone: 'success', text: done[action] });
    } catch (error) {
      setNotice({ tone: 'error', text: readApiError(error, 'Không thực hiện được.').message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminShell title="Duyệt tin đăng" description="Kiểm tra nội dung tin trước khi hiển thị công khai. Tin được duyệt sẽ hiển thị 30 ngày; tin vi phạm có thể gỡ bất cứ lúc nào." pending={state.counts.Pending || 0}>
      <div className="space-y-4">
        <div role="tablist" aria-label="Lọc theo trạng thái" className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={status === key}
              onClick={() => setParams(key === 'Pending' ? {} : { status: key })}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                status === key ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-brand-700 hover:ring-brand-300'
              }`}
            >
              {listingStatusInfo[key].label}
              <span className={`rounded-full px-1.5 text-xs ${status === key ? 'bg-white/25' : key === 'Pending' && state.counts.Pending ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}`}>{state.counts[key] || 0}</span>
            </button>
          ))}
        </div>

        <label className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-slate-400 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-brand-300">
          <Icon d={icons.search} className="h-4 w-4" />
          <span className="sr-only">Tìm tin</span>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tiêu đề, tên/email/SĐT người đăng…" className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate-400" />
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
        ) : state.items.length ? (
          <div className="space-y-4">
            {state.items.map((item) => (
              <ModerationRow key={item.listing.id} item={item} busy={busyId === item.listing.id} onApprove={(i) => moderate(i, 'approve')} onReject={setConfirmReject} onTakeDown={setConfirmTakeDown} onOpen={setDetail} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
            <p className="font-bold text-ink">{status === 'Pending' && !query ? 'Không còn tin nào chờ duyệt 🎉' : 'Không có tin phù hợp'}</p>
          </div>
        )}
      </div>

      <Modal open={Boolean(detail)} title="Nội dung tin đăng" onClose={() => setDetail(null)}>
        {detail && (
          <div className="max-h-[70vh] space-y-3 overflow-y-auto text-sm">
            <p className="text-base font-bold text-ink">{detail.listing.title}</p>
            {getUploadedImages(detail.listing).length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {getUploadedImages(detail.listing).map((image) => (
                  <NewsImage key={image.url} image={image} className="h-24 w-32 shrink-0 rounded-xl" />
                ))}
              </div>
            )}
            <p className="whitespace-pre-line text-slate-700">{detail.listing.description}</p>
            <p className="text-slate-500">{[detail.listing.streetAddress, detail.listing.wardName, detail.listing.districtName, detail.listing.provinceName].filter(Boolean).join(', ')}</p>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
              <Link to={`/listings/${detail.listing.id}`} target="_blank" className="h-10 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink hover:border-brand-300">Mở trang tin</Link>
              {detail.listing.status === 'Pending' && (
                <>
                  <button type="button" onClick={() => { setConfirmReject(detail); setDetail(null); }} className="h-10 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50">Từ chối</button>
                  <button type="button" onClick={() => moderate(detail, 'approve')} className="h-10 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">Duyệt tin</button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(confirmReject)} title="Từ chối tin đăng?" onClose={() => setConfirmReject(null)}>
        <p className="text-sm text-slate-600">
          Tin <strong className="text-ink">{confirmReject?.listing.title}</strong> sẽ chuyển sang "Bị từ chối" và không hiển thị công khai.
          Người đăng có thể sửa nội dung và gửi duyệt lại.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmReject(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600">Huỷ</button>
          <button type="button" onClick={() => { const item = confirmReject; setConfirmReject(null); moderate(item, 'reject'); }} className="h-10 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">Từ chối tin</button>
        </div>
      </Modal>
      <Modal open={Boolean(confirmTakeDown)} title="Gỡ tin đăng?" onClose={() => setConfirmTakeDown(null)}>
        <p className="text-sm text-slate-600">
          Tin <strong className="text-ink">{confirmTakeDown?.listing.title}</strong> sẽ bị gỡ khỏi trang công khai và chuyển sang "Bị từ chối".
          Người đăng có thể sửa nội dung và gửi duyệt lại.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setConfirmTakeDown(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600">Huỷ</button>
          <button type="button" onClick={() => { const item = confirmTakeDown; setConfirmTakeDown(null); moderate(item, 'takedown'); }} className="h-10 rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">Gỡ tin</button>
        </div>
      </Modal>
    </AdminShell>
  );
}
