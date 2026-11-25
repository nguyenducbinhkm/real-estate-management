import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { sellerService } from '../../services/sellerService';
import { readApiError } from '../../services/accountService';

/* Form "Liên hệ người đăng": gửi POST /api/contact-requests, người bán xem trong Quản lý khách hàng. */

const fieldMap = { SenderName: 'senderName', SenderPhone: 'senderPhone', SenderEmail: 'senderEmail', Message: 'message' };

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputClass = (error) =>
  `mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:ring-2 ${
    error ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
  }`;

export default function ContactSellerForm({ listing, onClose }) {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    senderName: user?.fullName || '',
    senderPhone: user?.phone || '',
    senderEmail: user?.email || '',
    message: `Tôi quan tâm đến tin "${listing.title}". Vui lòng liên hệ lại cho tôi.`,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ sending: false, done: false, error: '' });

  if (user?.id && user.id === listing.ownerId) {
    return <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Đây là tin của bạn. Khách hàng liên hệ sẽ hiện trong mục Quản lý khách hàng.</p>;
  }

  if (status.done) {
    return (
      <div role="status" className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
        <p className="font-semibold">Đã gửi yêu cầu liên hệ!</p>
        <p className="mt-0.5">Người đăng tin sẽ gọi lại cho bạn qua số {form.senderPhone} trong thời gian sớm nhất.</p>
      </div>
    );
  }

  const set = (key) => (event) => {
    setForm((value) => ({ ...value, [key]: event.target.value }));
    setErrors((value) => ({ ...value, [key]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const local = {};
    if (!form.senderName.trim()) local.senderName = 'Vui lòng nhập họ tên.';
    if (!/^\+?[0-9 .]{8,20}$/.test(form.senderPhone.trim())) local.senderPhone = 'Số điện thoại không hợp lệ.';
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    setStatus({ sending: true, done: false, error: '' });
    try {
      await sellerService.sendContact({
        propertyId: listing.id,
        senderName: form.senderName.trim(),
        senderPhone: form.senderPhone.trim(),
        senderEmail: form.senderEmail.trim() || null,
        message: form.message.trim() || null,
      });
      setStatus({ sending: false, done: true, error: '' });
    } catch (error) {
      const { message, fields } = readApiError(error, 'Không gửi được yêu cầu, vui lòng thử lại.');
      const mapped = {};
      Object.entries(fields || {}).forEach(([key, value]) => {
        mapped[fieldMap[key] || key] = Array.isArray(value) ? value[0] : value;
      });
      setErrors(mapped);
      setStatus({ sending: false, done: false, error: Object.keys(mapped).length ? '' : message });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
      <Field label="Họ và tên *" error={errors.senderName}>
        <input value={form.senderName} onChange={set('senderName')} maxLength={200} autoComplete="name" className={inputClass(errors.senderName)} />
      </Field>
      <Field label="Số điện thoại *" error={errors.senderPhone}>
        <input value={form.senderPhone} onChange={set('senderPhone')} type="tel" maxLength={20} autoComplete="tel" className={inputClass(errors.senderPhone)} />
      </Field>
      <Field label="Email" error={errors.senderEmail}>
        <input value={form.senderEmail} onChange={set('senderEmail')} type="email" maxLength={256} autoComplete="email" className={inputClass(errors.senderEmail)} />
      </Field>
      <Field label="Lời nhắn" error={errors.message}>
        <textarea value={form.message} onChange={set('message')} rows={3} maxLength={2000} className={`${inputClass(errors.message)} resize-none`} />
      </Field>
      {status.error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{status.error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:border-brand-300">Huỷ</button>
        <button type="submit" disabled={status.sending} className="h-11 flex-1 rounded-full bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {status.sending ? 'Đang gửi…' : 'Gửi yêu cầu'}
        </button>
      </div>
    </form>
  );
}
