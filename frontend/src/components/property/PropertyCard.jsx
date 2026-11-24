import { Link } from 'react-router-dom';
import NewsImage from '../news/NewsImage';
import { getPropertyImage } from '../../data/propertyImages';
import { AreaIcon, PackageBadge, TransactionIcon } from './PropertyIcons';
import { HoverCorner, ImageShade, zoomImageClass } from '../ui/CardImageFx';

function formatPrice(value) {
  if (!value) return 'Liên hệ';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace('.00', '')} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} triệu`;
  return `${value.toLocaleString('vi-VN')} đ`;
}

export default function PropertyCard({ listing }) {
  const location = [listing.wardName, listing.districtName, listing.provinceName].filter(Boolean).join(', ');
  const isRent = listing.transactionType === 'ForRent';

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/listings/${listing.id}`} className="block">
        <div className="relative m-2 mb-0 h-48 overflow-hidden rounded-xl">
          {/* Ảnh minh họa theo loại BĐS (không phải ảnh thật của tin) – xem src/data/propertyImages.js */}
          <NewsImage image={getPropertyImage(listing)} className={`h-full w-full ${zoomImageClass}`} />
          <ImageShade />

          <PackageBadge packageType={listing.packageType} className="absolute left-3 top-3" />

          {/* Góc phải trên: loại giao dịch, nền kính mờ. */}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-ink-900/45 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition-colors duration-300 group-hover:bg-brand-600 group-hover:ring-brand-400">
            <TransactionIcon rent={isRent} />
            {isRent ? 'Cho thuê' : 'Bán'}
          </span>

          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm">
            <AreaIcon className="h-3.5 w-3.5 text-brand-600" />
            {listing.area ? `${listing.area} m²` : 'Diện tích liên hệ'}
          </span>

          {/* Góc phải dưới: nhãn "Ảnh minh họa"; khi rê chuột đổi thành nút mũi tên xem chi tiết. */}
          <HoverCorner />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 min-h-12 text-[15px] font-semibold leading-6 text-ink transition-colors group-hover:text-brand-700">
            {listing.title}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-lg font-bold text-brand-700">{formatPrice(listing.price)}</p>
            {listing.pricePerSqm > 0 && (
              <p className="text-xs text-slate-500">· {formatPrice(listing.pricePerSqm)}/m²</p>
            )}
          </div>
          <p className="mt-3 flex gap-1.5 border-t border-slate-100 pt-3 text-sm text-slate-500">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" /><circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="line-clamp-2">{location || listing.streetAddress || 'Việt Nam'}</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
