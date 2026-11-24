import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listingService } from '../services/listingService';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import NewsImage, { ImageCredit } from '../components/news/NewsImage';
import { getPropertyImage } from '../data/propertyImages';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listingService.getById(id)
      .then((data) => active && setListing(data))
      .catch(() => active && setListing(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!listing) return <div className="py-20 text-center text-slate-500">Không tìm thấy tin đăng.</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article>
          <figure>
            <div className="relative overflow-hidden rounded-xl">
              <NewsImage image={getPropertyImage(listing)} eager className="h-72 w-full md:h-96" />
              <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-xs text-white">Ảnh minh họa</span>
            </div>
            <figcaption className="mt-2"><ImageCredit image={getPropertyImage(listing)} /></figcaption>
          </figure>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="success">{listing.status}</Badge>
              {listing.packageType !== 'Free' && <Badge tone="package">{listing.packageType}</Badge>}
            </div>
            <h1 className="mt-3 text-2xl font-black text-slate-900">{listing.title}</h1>
            <p className="mt-2 text-2xl font-bold text-brand-700">{listing.price ? `${listing.price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}</p>
            <p className="mt-4 text-slate-700">{listing.description}</p>
          </div>
        </article>
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-sm text-slate-500">Thông tin chủ tin</p>
          <button type="button" className="mt-4 h-11 w-full rounded-lg bg-accent font-bold text-white">Liên hệ xem tin</button>
        </aside>
      </div>
    </div>
  );
}
