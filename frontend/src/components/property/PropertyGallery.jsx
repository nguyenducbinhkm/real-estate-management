import { useCallback, useEffect, useState } from 'react';
import NewsImage, { ImageCredit } from '../news/NewsImage';
import { CameraIcon } from './PropertyIcons';

function Chevron({ dir = 'left', className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

function NavButton({ dir, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Ảnh trước' : 'Ảnh sau'}
      className={`grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:scale-105 hover:bg-white ${className}`}
    >
      <Chevron dir={dir} />
    </button>
  );
}

/** Xem ảnh toàn màn hình: ← → để chuyển ảnh, Esc để đóng. */
function Lightbox({ images, index, onChange, onClose }) {
  const image = images[index];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange(index - 1);
      if (event.key === 'ArrowRight') onChange(index + 1);
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, onChange, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Xem ảnh toàn màn hình" className="fixed inset-0 z-[60] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
        <span>
          {index + 1} / {images.length}
          {image.label && <span className="ml-3 font-semibold text-white">{image.label}</span>}
        </span>
        <button type="button" onClick={onClose} aria-label="Đóng" className="grid h-10 w-10 place-items-center rounded-full text-2xl text-white hover:bg-white/10">
          ×
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4" onClick={onClose}>
        <img
          key={image.url}
          src={image.url}
          alt={image.alt || ''}
          onClick={(event) => event.stopPropagation()}
          className="max-h-full max-w-full animate-fade-in rounded-lg object-contain"
        />
        {images.length > 1 && (
          <>
            <NavButton dir="left" className="absolute left-4 top-1/2 -translate-y-1/2" onClick={(event) => { event.stopPropagation(); onChange(index - 1); }} />
            <NavButton dir="right" className="absolute right-4 top-1/2 -translate-y-1/2" onClick={(event) => { event.stopPropagation(); onChange(index + 1); }} />
          </>
        )}
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
        {images.map((item, i) => (
          <button
            key={item.url}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`Xem ảnh ${i + 1}`}
            className={`h-14 w-20 shrink-0 overflow-hidden rounded-md ring-2 transition ${i === index ? 'ring-brand-400' : 'opacity-60 ring-transparent hover:opacity-100'}`}
          >
            <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Thư viện ảnh ở trang chi tiết: ảnh lớn có nút ‹ ›, số thứ tự ảnh, hàng ảnh nhỏ bên dưới;
 * bấm ảnh lớn để xem toàn màn hình. `children` là các nhãn đè lên ảnh lớn (VIP, Bán/Cho thuê, diện tích…).
 */
export default function PropertyGallery({ images, note = 'Ảnh minh họa', children }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const count = images.length;
  const go = useCallback((next) => setIndex(((next % count) + count) % count), [count]);
  const close = useCallback(() => setOpen(false), []);

  // Trang chi tiết truyền key={listing.id} nên chuyển sang tin khác sẽ tự về ảnh đầu tiên.
  if (count === 0) return null;
  const image = images[index];

  return (
    <figure>
      <div className="group relative overflow-hidden rounded-3xl bg-slate-100">
        <button type="button" onClick={() => setOpen(true)} className="block w-full cursor-zoom-in" aria-label="Xem ảnh toàn màn hình">
          <NewsImage key={image.url} image={image} eager={index === 0} className="h-72 w-full animate-fade-in md:h-[440px]" />
        </button>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-ink-900/15" aria-hidden="true" />

        {children}

        <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <CameraIcon className="h-3.5 w-3.5" />
          {index + 1}/{count} · {note}
        </span>

        {count > 1 && (
          <>
            <NavButton dir="left" onClick={() => go(index - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100 focus:opacity-100" />
            <NavButton dir="right" onClick={() => go(index + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100 focus:opacity-100" />
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Xem ảnh ${i + 1}${item.label ? `: ${item.label}` : ''}`}
              aria-current={i === index}
              className={`group/thumb relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition md:h-20 md:w-28 ${
                i === index ? 'ring-brand-500' : 'opacity-70 ring-transparent hover:opacity-100'
              }`}
            >
              <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
              {item.label && (
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-3 text-left text-[10px] font-medium text-white">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <figcaption className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
        {image.label && <span className="font-semibold text-ink">{image.label}.</span>}
        <ImageCredit image={image} />
      </figcaption>

      {open && <Lightbox images={images} index={index} onChange={go} onClose={close} />}
    </figure>
  );
}
