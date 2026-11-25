import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listingService } from '../services/listingService';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import PropertyCard from '../components/property/PropertyCard';
import PropertyGallery from '../components/property/PropertyGallery';
import ContactSellerForm from '../components/property/ContactSellerForm';
import { AreaIcon, PackageBadge, TransactionIcon } from '../components/property/PropertyIcons';
import { getPropertyGallery, getUploadedImages } from '../data/propertyImages';
import { TYPE_LABELS } from '../utils/searchParser';
import { findKind, FURNITURE_LABELS, legalLabel } from '../data/listingOptions';

const statusLabels = {
  Draft: 'Bản nháp', Pending: 'Chờ duyệt', Active: 'Đang hiển thị', Sold: 'Đã bán', Rented: 'Đã cho thuê', Expired: 'Hết hạn', Rejected: 'Bị từ chối',
};

function formatPrice(value) {
  if (!value) return 'Liên hệ';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')} tỷ`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000).toLocaleString('vi-VN')} triệu`;
  return `${Number(value).toLocaleString('vi-VN')} đ`;
}

/** "Hôm nay", "Hôm qua", "5 ngày trước", "3 tháng trước"… tính từ ngày đăng. */
function timeAgo(iso) {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

const statIcons = {
  price: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  area: <><path d="M3 9V3h6" /><path d="M21 15v6h-6" /><path d="M3 3l7 7" /><path d="m21 21-7-7" /></>,
  date: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
};

/** Ô thông số nổi bật: biểu tượng, nhãn, con số lớn và dòng phụ. `primary` = ô giá (nền màu chủ đạo). */
function StatTile({ icon, label, value, sub, primary = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 md:p-5 ${
        primary ? 'bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/25' : 'bg-brand-50 ring-1 ring-brand-100'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${primary ? 'bg-white/20 text-white' : 'bg-white text-brand-600 shadow-sm'}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {statIcons[icon]}
          </svg>
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${primary ? 'text-white/85' : 'text-brand-700'}`}>{label}</span>
      </div>
      <p className={`mt-3 text-2xl font-extrabold leading-tight md:text-3xl ${primary ? 'text-white' : 'text-ink'}`}>{value}</p>
      {sub && <p className={`mt-1 text-sm ${primary ? 'text-white/80' : 'text-slate-500'}`}>{sub}</p>}
    </div>
  );
}

/**
 * Bản đồ Google Maps nhúng theo địa chỉ của tin (database chưa có toạ độ).
 * Ghim theo phường → quận → tỉnh: tên đường trong dữ liệu mẫu được sinh ngẫu nhiên, có khi trùng tên đường
 * ở quận khác nên Google ghim sai chỗ; phường/quận/tỉnh thì luôn khớp nhau. Địa chỉ đầy đủ vẫn hiện bên trên bản đồ.
 */
function LocationMap({ listing }) {
  const parts = [listing.streetAddress, listing.wardName, listing.districtName, listing.provinceName].filter(Boolean);
  const area = [listing.wardName, listing.districtName, listing.provinceName].filter(Boolean);
  if (parts.length === 0) return null;

  const query = encodeURIComponent([...(area.length ? area : parts), 'Việt Nam'].join(', '));
  const embedUrl = `https://maps.google.com/maps?q=${query}&hl=vi&z=15&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  return (
    <section className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-card md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">Vị trí trên bản đồ</h2>
          <p className="mt-1 flex gap-1.5 text-sm text-slate-500">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" />
            </svg>
            <span>{parts.join(', ')}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            Mở Google Maps
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3 11 18-8-8 18-2-8Z" />
            </svg>
            Chỉ đường
          </a>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
        <iframe
          title={`Bản đồ vị trí: ${parts.join(', ')}`}
          src={embedUrl}
          className="h-72 w-full border-0 md:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">Bản đồ ghim theo phường/quận của tin đăng nên là vị trí gần đúng của khu vực.</p>
    </section>
  );
}

function SimilarListings({ listing }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let alive = true;
    listingService
      .search({ propertyType: listing.propertyType, provinceCode: listing.provinceCode, page: 1, pageSize: 5 })
      .then((data) => alive && setItems((data.items || []).filter((item) => item.id !== listing.id).slice(0, 4)))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [listing.id, listing.propertyType, listing.provinceCode]);

  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-xl font-extrabold text-ink md:text-2xl">Tin đăng tương tự</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => <PropertyCard key={item.id} listing={item} />)}
      </div>
    </section>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setShowContact(false);
    window.scrollTo(0, 0);
    listingService.getById(id)
      .then((data) => active && setListing(data))
      .catch(() => active && setListing(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!listing) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="font-semibold text-ink">Không tìm thấy tin đăng.</p>
        <Link to="/listings" className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white">Xem tin khác</Link>
      </div>
    );
  }

  const gallery = getPropertyGallery(listing);
  const hasRealPhotos = getUploadedImages(listing).length > 0;
  const features = [
    ['Phòng ngủ', listing.bedrooms ? `${listing.bedrooms} phòng` : null],
    ['Phòng tắm, vệ sinh', listing.bathrooms ? `${listing.bathrooms} phòng` : null],
    [findKind(listing.propertyType)?.floorsLabel || 'Số tầng', listing.floors ? `${listing.floors}` : null],
    ['Pháp lý', listing.legalStatus !== 'Unknown' ? legalLabel(listing.legalStatus) : null],
    ['Nội thất', FURNITURE_LABELS[listing.furniture]],
  ].filter(([, value]) => value);
  const location = [listing.streetAddress, listing.wardName, listing.districtName, listing.provinceName].filter(Boolean).join(', ');
  const isRent = listing.transactionType === 'ForRent';
  const listUrl = `/listings?transactionType=${listing.transactionType}&propertyType=${listing.propertyType}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Trang chủ</Link>
        <span aria-hidden="true">›</span>
        <Link to={`/listings?transactionType=${listing.transactionType}`} className="hover:text-brand-600">{isRent ? 'Cho thuê' : 'Mua bán'}</Link>
        <span aria-hidden="true">›</span>
        <Link to={listUrl} className="hover:text-brand-600">{TYPE_LABELS[listing.propertyType] || listing.propertyType}</Link>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          {/* Thư viện ảnh nhiều góc (ảnh minh họa theo loại BĐS – xem src/data/propertyImages.js). */}
          <PropertyGallery key={listing.id} images={gallery} note={hasRealPhotos ? 'Ảnh người đăng cung cấp' : 'Ảnh minh họa'}>
            <PackageBadge packageType={listing.packageType} size="lg" className="pointer-events-none absolute left-4 top-4" />
            <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900/45 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md">
              <TransactionIcon rent={isRent} className="h-4 w-4" />
              {isRent ? 'Cho thuê' : 'Bán'}
            </span>
            <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-ink shadow-sm">
              <AreaIcon className="h-4 w-4 text-brand-600" />
              {listing.area ? `${listing.area} m²` : 'Diện tích liên hệ'}
            </span>
          </PropertyGallery>

          <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-card md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{statusLabels[listing.status] || listing.status}</Badge>
              <Badge>{TYPE_LABELS[listing.propertyType] || listing.propertyType}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-snug text-ink md:text-3xl">{listing.title}</h1>
            <p className="mt-2 flex gap-1.5 text-sm text-slate-500">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" />
              </svg>
              {location || 'Việt Nam'}
            </p>

            {/* 3 thông số chính được làm nổi bật: mức giá, diện tích, ngày đăng. */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <StatTile
                primary
                icon="price"
                label={isRent ? 'Giá thuê' : 'Mức giá'}
                value={formatPrice(listing.price) + (isRent && listing.price ? '/tháng' : '')}
                sub={listing.pricePerSqm > 0 ? `≈ ${formatPrice(listing.pricePerSqm)}/m²` : ''}
              />
              <StatTile
                icon="area"
                label="Diện tích"
                value={listing.area ? `${listing.area} m²` : 'Liên hệ'}
                sub={TYPE_LABELS[listing.propertyType] || ''}
              />
              <StatTile
                icon="date"
                label="Ngày đăng"
                value={listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('vi-VN') : '—'}
                sub={timeAgo(listing.createdAt)}
              />
            </div>

            {features.length > 0 && (
              <>
                <h2 className="mt-7 text-lg font-bold text-ink">Đặc điểm bất động sản</h2>
                <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
                  {features.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            <h2 className="mt-7 text-lg font-bold text-ink">Thông tin mô tả</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{listing.description || listing.summary || 'Chưa có mô tả.'}</p>
          </div>

          <LocationMap listing={listing} />
        </article>

        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <p className="text-sm text-slate-500">{isRent ? 'Giá thuê' : 'Giá bán'}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-700">{formatPrice(listing.price)}</p>
            {listing.pricePerSqm > 0 && <p className="mt-1 text-sm text-slate-500">~ {formatPrice(listing.pricePerSqm)}/m²</p>}

            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700" aria-hidden="true">BS</span>
              <div>
                <p className="font-semibold text-ink">Người đăng tin</p>
                <p className="text-xs text-slate-500">Thành viên BS Realty</p>
              </div>
            </div>
            {listing.status === 'Sold' || listing.status === 'Rented' ? (
              <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                Bất động sản này {listing.status === 'Sold' ? 'đã được bán' : 'đã được cho thuê'}.
              </p>
            ) : showContact ? (
              <ContactSellerForm listing={listing} onClose={() => setShowContact(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setShowContact(true)}
                className="mt-4 h-12 w-full rounded-full bg-brand-600 font-semibold text-white shadow-md shadow-brand-600/30 transition-colors hover:bg-brand-700"
              >
                Liên hệ người đăng
              </button>
            )}
          </div>
          <Link to="/utilities/tinh-lai-vay" className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-lg font-bold text-brand-600" aria-hidden="true">%</span>
            <span>
              <span className="block font-semibold text-ink">Tính lãi vay mua nhà</span>
              <span className="block text-xs text-slate-500">Ước tính số tiền trả góp hằng tháng</span>
            </span>
          </Link>
        </aside>
      </div>

      <SimilarListings listing={listing} />
    </div>
  );
}
