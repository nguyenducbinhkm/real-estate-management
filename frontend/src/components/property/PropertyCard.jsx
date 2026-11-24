import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import NewsImage from '../news/NewsImage';
import { getPropertyImage } from '../../data/propertyImages';

function formatPrice(value) {
  if (!value) return 'Liên hệ';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2).replace('.00', '')} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} triệu`;
  return `${value.toLocaleString('vi-VN')} đ`;
}

export default function PropertyCard({ listing }) {
  const location = [listing.wardName, listing.districtName, listing.provinceName].filter(Boolean).join(', ');
  const packageLabels = {
    Free: '',
    VipSilver: 'VIP Bạc',
    VipGold: 'VIP Vàng',
    VipDiamond: 'VIP Kim cương',
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/listings/${listing.id}`} className="group block">
        <div className="relative h-48 overflow-hidden">
          {/* Ảnh minh họa theo loại BĐS (không phải ảnh thật của tin) – xem src/data/propertyImages.js */}
          <NewsImage image={getPropertyImage(listing)} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
          {listing.packageType && listing.packageType !== 'Free' && (
            <Badge tone="package" className="absolute left-3 top-3">{packageLabels[listing.packageType] || listing.packageType}</Badge>
          )}
          <span className="absolute bottom-3 left-3 rounded-md bg-slate-900/75 px-2 py-1 text-xs text-white">
            {listing.area ? `${listing.area} m²` : 'Diện tích liên hệ'}
          </span>
          <span className="absolute bottom-3 right-3 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/90">Ảnh minh họa</span>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 min-h-12 text-base font-bold text-slate-900">
            {listing.title}
          </h3>
          <p className="mt-2 text-lg font-bold text-brand-700">{formatPrice(listing.price)}</p>
          {listing.pricePerSqm > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {formatPrice(listing.pricePerSqm)} / m²
            </p>
          )}
          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{location || listing.streetAddress || 'Việt Nam'}</p>
        </div>
      </Link>
    </article>
  );
}
