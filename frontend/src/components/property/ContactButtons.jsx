import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { listingService } from '../../services/listingService';
import { readApiError } from '../../services/accountService';

/*
 * Hai nút liên hệ người đăng trên trang chi tiết tin:
 *  - "Chat qua Zalo": cần đăng nhập (chưa đăng nhập → chuyển tới trang Đăng nhập rồi quay lại tin này).
 *    Mở https://zalo.me/<số>: trên điện thoại mở thẳng app Zalo, trên máy tính mở app Zalo PC nếu có, không thì Zalo Web.
 *  - "0335 834 *** · Hiện số": ai cũng bấm được; số đầy đủ chỉ tải về khi bấm (trang chỉ chứa số đã che).
 */

function ZaloMark({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="#0068FF" />
      <path d="M12 5.5c-3.9 0-7 2.6-7 5.9 0 1.9 1 3.6 2.6 4.7l-.5 2.3 2.5-1.3c.8.2 1.6.3 2.4.3 3.9 0 7-2.6 7-5.9S15.9 5.5 12 5.5Z" fill="#fff" />
      <path d="M8.6 9.6h2.6l-2.6 3.2h2.6M12.4 9.6v3.2M14.1 9.6v3.2h1.7" fill="none" stroke="#0068FF" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
      <path d="M15 3.5a6 6 0 0 1 5.5 5.5M15 7a2.5 2.5 0 0 1 2 2" />
    </svg>
  );
}

const formatPhone = (digits) => (digits || '').replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3');

export default function ContactButtons({ listing }) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [contact, setContact] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  if (!listing.contactPhoneMasked && !listing.hasZalo) return null;

  const load = async () => {
    const data = await listingService.contact(listing.id);
    setContact(data);
    return data;
  };

  const revealPhone = async () => {
    setError('');
    setBusy('phone');
    try {
      await load();
    } catch (err) {
      setError(readApiError(err, 'Không lấy được số điện thoại.').message);
    } finally {
      setBusy('');
    }
  };

  const openZalo = async () => {
    setError('');
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { state: { message: 'Đăng nhập để nhắn tin Zalo với người đăng.' } });
      return;
    }
    // Mở cửa sổ ngay trong sự kiện bấm (tránh bị chặn popup), rồi gán địa chỉ khi có số.
    const popup = window.open('', '_blank');
    setBusy('zalo');
    try {
      const data = contact?.zaloLink ? contact : await load();
      if (!data.zaloLink) throw new Error('Tin này chưa có số Zalo.');
      if (popup) {
        popup.opener = null;
        popup.location.href = data.zaloLink;
      } else {
        window.location.href = data.zaloLink;
      }
    } catch (err) {
      popup?.close();
      setError(err.response ? readApiError(err, 'Không mở được Zalo.').message : err.message);
    } finally {
      setBusy('');
    }
  };

  const phone = contact?.phone;

  return (
    <div className="mt-4 space-y-2.5">
      {listing.hasZalo && (
        <button
          type="button"
          onClick={openZalo}
          disabled={busy === 'zalo'}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white font-semibold text-ink shadow-sm transition hover:border-[#0068FF]/40 hover:bg-[#0068FF]/5 disabled:opacity-60"
        >
          <ZaloMark />
          {busy === 'zalo' ? 'Đang mở Zalo…' : 'Chat qua Zalo'}
          {!user && <span className="text-xs font-normal text-slate-400">(cần đăng nhập)</span>}
        </button>
      )}

      {listing.contactPhoneMasked && (phone ? (
        <a
          href={`tel:${phone}`}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-600 font-bold tracking-wide text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700"
        >
          <PhoneIcon />
          {formatPhone(phone)}
        </a>
      ) : (
        <button
          type="button"
          onClick={revealPhone}
          disabled={busy === 'phone'}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-600 font-bold text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-60"
        >
          <PhoneIcon />
          {busy === 'phone' ? 'Đang tải…' : <>{listing.contactPhoneMasked} <span className="font-semibold">· Hiện số</span></>}
        </button>
      ))}

      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
