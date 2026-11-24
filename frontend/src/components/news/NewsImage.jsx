import { useState } from 'react';

/** Ảnh bài viết; nếu không tải được thì hiện nền tối kèm logo. */
export default function NewsImage({ image, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);

  if (!image?.url || failed) {
    return (
      <div className={`relative overflow-hidden bg-ink bg-grid ${className}`}>
        <img src="/images/logo-mark.png" alt="" aria-hidden="true" className="absolute inset-0 m-auto w-1/4 opacity-25" />
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={image.alt || ''}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/** Dòng ghi nguồn ảnh theo yêu cầu giấy phép Creative Commons. */
export function ImageCredit({ image, className = '' }) {
  if (!image?.author) return null;
  return (
    <p className={`text-xs text-slate-500 ${className}`}>
      {image.alt && <span>{image.alt}. </span>}
      Ảnh:{' '}
      <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-600">
        {image.author}
      </a>
      {' / '}
      <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-600">
        {image.license}
      </a>
      {' – Wikimedia Commons'}
    </p>
  );
}
