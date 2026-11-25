import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { canManageListings } from '../config/navigation';
import { sellerService } from '../services/sellerService';
import { readApiError } from '../services/accountService';
import Spinner from '../components/ui/Spinner';
import SellerShell, {
  contactStatusInfo,
  daysLeft,
  formatPrice,
  Icon,
  icons,
  listingStatusInfo,
  StatusPill,
  timeAgo,
} from '../components/seller/SellerShell';

/* Trang "Tổng quan" của người bán (/seller/dashboard). Số liệu: GET /api/seller/dashboard. */

function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-3xl border border-slate-100 bg-white p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MoreLink({ to, children = 'Xem tất cả' }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
      {children}
      <Icon d={icons.arrow} className="h-4 w-4" />
    </Link>
  );
}

function Kpi({ icon, label, value, sub, tone = 'bg-brand-50 text-brand-700', to }) {
  const body = (
    <div className="flex h-full items-start gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone}`}>
        <Icon d={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-ink">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to} className="block">{body}</Link> : body;
}

/** Thanh ngang chia theo trạng thái tin + chú thích. */
function StatusBreakdown({ data }) {
  const parts = [
    ['Active', data.activeListings],
    ['Pending', data.pendingListings],
    ['Draft', data.hiddenListings],
    ['Sold', data.closedListings, 'Đã giao dịch'],
    ['Expired', data.expiredListings],
    ['Rejected', data.rejectedListings],
  ];
  const total = Math.max(1, data.totalListings);
  return (
    <>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {parts.filter(([, count]) => count > 0).map(([status, count]) => (
          <span key={status} className={listingStatusInfo[status].dot} style={{ width: `${(count / total) * 100}%` }} title={`${listingStatusInfo[status].label}: ${count}`} />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {parts.map(([status, count, label]) => (
          <li key={status} className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${listingStatusInfo[status].dot}`} />
            <span className="flex-1 text-slate-600">{label || listingStatusInfo[status].label}</span>
            <span className="font-semibold text-ink">{count}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Biểu đồ cột số khách liên hệ 14 ngày gần nhất. */
function ContactsChart({ days }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  return (
    <div>
      <p className="text-sm text-slate-500"><span className="text-xl font-extrabold text-ink">{total}</span> khách liên hệ trong 14 ngày qua</p>
      <div className="mt-4 flex h-36 items-end gap-1.5" role="img" aria-label={`Số khách liên hệ mỗi ngày trong 14 ngày qua, tổng ${total}`}>
        {days.map((d) => {
          const date = new Date(d.date);
          return (
            <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] text-white group-hover:block">
                {date.getDate()}/{date.getMonth() + 1}: {d.count}
              </span>
              <span
                className={`w-full rounded-t-md transition-colors ${d.count ? 'bg-brand-400 group-hover:bg-brand-600' : 'bg-slate-100'}`}
                style={{ height: `${Math.max(d.count ? 12 : 4, (d.count / max) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
        <span>{new Date(days[0].date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
        <span>Hôm nay</span>
      </div>
    </div>
  );
}

function Pipeline({ data }) {
  const steps = [
    ['New', data.newContacts, 'Khách mới cần gọi lại'],
    ['Contacted', data.contactedContacts, 'Đang trao đổi'],
    ['Closed', data.closedContacts, 'Đã xử lý xong'],
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map(([status, count, hint]) => (
        <Link key={status} to={`/seller/customers?status=${status}`} className="rounded-2xl bg-slate-50 p-3 text-center transition hover:bg-brand-50">
          <StatusPill info={contactStatusInfo[status]} />
          <p className="mt-2 text-2xl font-extrabold text-ink">{count}</p>
          <p className="text-[11px] text-slate-500">{hint}</p>
        </Link>
      ))}
    </div>
  );
}

function Empty({ children }) {
  return <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
}

export default function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  const allowed = canManageListings(user);
  const [state, setState] = useState({ loading: allowed, data: null, error: '' });

  useEffect(() => {
    if (!allowed) return undefined;
    let alive = true;
    sellerService
      .dashboard()
      .then((data) => alive && setState({ loading: false, data, error: '' }))
      .catch((error) => alive && setState({ loading: false, data: null, error: readApiError(error, 'Không tải được số liệu tổng quan.').message }));
    return () => {
      alive = false;
    };
  }, [allowed]);

  const { data } = state;
  const firstName = (user?.fullName || '').trim().split(/\s+/).pop();

  return (
    <SellerShell
      title="Tổng quan"
      description={allowed ? `Xin chào${firstName ? `, ${firstName}` : ''}! Đây là tình hình tin đăng và khách hàng của bạn.` : undefined}
      newContacts={data?.newContacts}
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
      ) : data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              icon={icons.listings}
              label="Tin đang hiển thị"
              value={`${data.activeListings}/${data.maxListings}`}
              sub={`Tổng ${data.totalListings} tin · còn ${Math.max(0, data.maxListings - data.activeListings)} lượt đăng`}
              to="/seller/listings"
            />
            <Kpi icon={icons.customers} label="Khách hàng mới" value={data.newContacts} sub="Chưa liên hệ lại" tone="bg-sky-50 text-sky-700" to="/seller/customers?status=New" />
            <Kpi icon={icons.mail} label="Tổng yêu cầu liên hệ" value={data.totalContacts} sub={`${data.closedContacts} đã xử lý xong`} tone="bg-emerald-50 text-emerald-700" to="/seller/customers" />
            <Kpi icon={icons.heart} label="Lượt lưu tin" value={data.totalSaves} sub="Người mua đã lưu tin của bạn" tone="bg-rose-50 text-rose-600" />
          </div>

          {data.expiringSoon > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
              <Icon d={icons.alert} className="h-5 w-5 shrink-0" />
              <span className="flex-1"><strong>{data.expiringSoon} tin</strong> sẽ hết hạn trong 7 ngày tới.</span>
              <Link to="/seller/listings?tab=Active" className="font-semibold underline-offset-4 hover:underline">Xem tin</Link>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Card title="Khách liên hệ theo ngày" action={<MoreLink to="/seller/customers" />}>
              <ContactsChart days={data.contactsLast14Days} />
            </Card>
            <Card title="Tiến độ chăm sóc khách hàng">
              <Pipeline data={data} />
              <p className="mt-4 text-xs text-slate-500">Bấm vào từng nhóm để xem danh sách khách hàng tương ứng.</p>
            </Card>
          </div>

          <Card title="Tình trạng tin đăng" action={<MoreLink to="/seller/listings">Quản lý tin</MoreLink>}>
            {data.totalListings ? <StatusBreakdown data={data} /> : (
              <Empty>Bạn chưa có tin đăng nào. <Link to="/seller/post" className="font-semibold text-brand-700">Đăng tin đầu tiên</Link></Empty>
            )}
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card title="Khách hàng mới nhất" action={<MoreLink to="/seller/customers" />}>
              {data.recentContacts.length ? (
                <ul className="divide-y divide-slate-100">
                  {data.recentContacts.map((c) => (
                    <li key={c.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                        {c.senderName.trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-semibold text-ink">{c.senderName}</span>
                          <StatusPill info={contactStatusInfo[c.status]} />
                        </p>
                        <p className="truncate text-xs text-slate-500">{c.propertyTitle || 'Tin đã xoá'} · {timeAgo(c.createdAt)}</p>
                      </div>
                      <a href={`tel:${c.senderPhone.replace(/\s/g, '')}`} className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-ink hover:border-brand-300 hover:text-brand-700">
                        {c.senderPhone}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : <Empty>Chưa có khách hàng liên hệ.</Empty>}
            </Card>

            <Card title="Tin được quan tâm nhiều nhất" action={<MoreLink to="/seller/listings" />}>
              {data.topListings.length ? (
                <ol className="divide-y divide-slate-100">
                  {data.topListings.map((item, index) => (
                    <li key={item.listing.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <Link to={`/listings/${item.listing.id}`} className="line-clamp-1 text-sm font-semibold text-ink hover:text-brand-700">{item.listing.title}</Link>
                        <p className="text-xs text-slate-500">{formatPrice(item.listing.price)}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1" title="Lượt liên hệ"><Icon d={icons.mail} className="h-4 w-4" />{item.contactCount}</span>
                        <span className="flex items-center gap-1" title="Lượt lưu"><Icon d={icons.heart} className="h-4 w-4" />{item.saveCount}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : <Empty>Chưa có tin nào được lưu hoặc liên hệ.</Empty>}
            </Card>
          </div>

          {data.expiringListings.length > 0 && (
            <Card title="Tin sắp hết hạn">
              <ul className="divide-y divide-slate-100">
                {data.expiringListings.map((item) => (
                  <li key={item.listing.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Link to={`/listings/${item.listing.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-ink hover:text-brand-700">{item.listing.title}</Link>
                    <StatusPill info={listingStatusInfo.Pending}>Còn {daysLeft(item.listing.expiresAt)} ngày</StatusPill>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </SellerShell>
  );
}
