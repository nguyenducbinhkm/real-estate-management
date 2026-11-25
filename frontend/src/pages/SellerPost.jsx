import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { canManageListings } from '../config/navigation';
import { listingService } from '../services/listingService';
import { postingService } from '../services/postingService';
import { sellerService } from '../services/sellerService';
import { readApiError } from '../services/accountService';
import { FURNITURE_LABELS, LEGAL_LABELS, PROPERTY_KINDS, findKind } from '../data/listingOptions';
import ImageUploader, { MAX_IMAGES, toImageItem } from '../components/seller/ImageUploader';
import Spinner from '../components/ui/Spinner';
import SellerShell, { formatPrice, Icon, icons } from '../components/seller/SellerShell';

/*
 * Đăng tin / sửa tin (/seller/post, /seller/listings/:id/edit) – form 4 bước:
 *   1. Loại tin  2. Vị trí  3. Thông tin  4. Ảnh & xác nhận
 * Tin mới (và tin vừa sửa) ở trạng thái "Chờ duyệt" cho tới khi admin duyệt.
 * Tin mới chưa gửi được lưu nháp trong trình duyệt (localStorage) để không mất khi lỡ tải lại trang.
 */

const STEPS = ['Loại tin', 'Vị trí', 'Thông tin', 'Ảnh & xác nhận'];

const EMPTY = {
  transactionType: 'ForSale',
  propertyType: '',
  provinceCode: '', provinceName: '',
  districtCode: '', districtName: '',
  wardCode: '', wardName: '',
  streetAddress: '',
  title: '',
  description: '',
  priceValue: '',
  priceUnit: 'ty',
  area: '',
  landArea: '',
  bedrooms: '',
  bathrooms: '',
  floors: '',
  legalStatus: '',
  furniture: '',
  hasClearance: false,
  ceilingHeight: '',
  rentalPeriodMonths: '12',
  petsAllowed: false,
};

const UNITS = { trieu: 1_000_000, ty: 1_000_000_000 };

// Ô lỗi từ backend → bước chứa ô đó (để nhảy về đúng bước).
const FIELD_STEP = {
  propertyType: 0, transactionType: 0,
  provinceCode: 1, districtCode: 1, wardCode: 1, streetAddress: 1,
  title: 2, description: 2, price: 2, priceValue: 2, area: 2, landArea: 2, bedrooms: 2, bathrooms: 2, floors: 2,
  legalStatus: 2, furniture: 2, hasClearance: 2, ceilingHeight: 2, rentalPeriodMonths: 2,
  images: 3,
};
// Tên trường của API → tên ô trong form.
const API_FIELD = { bedroomCount: 'bedrooms', bathroomCount: 'bathrooms', floorNumber: 'floors', imageUrls: 'images', price: 'priceValue' };

const draftKey = (userId) => `bds_post_draft_${userId}`;
const toNumber = (value) => {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
const optionalInt = (value) => (value === '' || value === null ? null : Math.round(toNumber(value)));
const optionalNum = (value) => (value === '' || value === null ? null : toNumber(value));

/** Giá theo VND từ ô nhập + đơn vị. Tin cho thuê luôn tính theo triệu/tháng. */
function priceOf(form) {
  const value = toNumber(form.priceValue);
  if (!form.priceValue || !Number.isFinite(value)) return 0;
  return Math.round(value * (form.transactionType === 'ForRent' ? UNITS.trieu : UNITS[form.priceUnit]));
}

/** Kiểm tra từng bước (giống quy tắc backend) → { tên ô: thông báo }. */
function validateStep(step, form, images) {
  const errors = {};
  const kind = findKind(form.propertyType);
  const has = (field) => kind?.fields.includes(field);
  if (step === 0 && !kind) errors.propertyType = 'Vui lòng chọn loại bất động sản.';
  if (step === 1) {
    if (!form.provinceCode) errors.provinceCode = 'Vui lòng chọn tỉnh/thành.';
    if (!form.districtCode) errors.districtCode = 'Vui lòng chọn quận/huyện.';
    if (!form.wardCode) errors.wardCode = 'Vui lòng chọn phường/xã.';
    if (!form.streetAddress.trim()) errors.streetAddress = 'Vui lòng nhập số nhà, tên đường.';
  }
  if (step === 2) {
    const title = form.title.trim();
    const description = form.description.trim();
    if (title.length < 20) errors.title = 'Tiêu đề cần ít nhất 20 ký tự.';
    else if (title.length > 250) errors.title = 'Tiêu đề tối đa 250 ký tự.';
    if (description.length < 50) errors.description = 'Mô tả cần ít nhất 50 ký tự.';
    if (!(priceOf(form) > 0)) errors.priceValue = 'Vui lòng nhập giá hợp lệ.';
    if (!(toNumber(form.area) > 0)) errors.area = 'Vui lòng nhập diện tích.';
    if (has('landArea') && !(toNumber(form.landArea) > 0)) errors.landArea = 'Vui lòng nhập diện tích đất.';
    if (has('ceilingHeight') && !(toNumber(form.ceilingHeight) > 0)) errors.ceilingHeight = 'Vui lòng nhập chiều cao trần.';
    if (has('clearance') && !form.hasClearance) errors.hasClearance = 'Chỉ đăng được đất đã giải phóng mặt bằng.';
    ['bedrooms', 'bathrooms', 'floors'].forEach((field) => {
      if (form[field] !== '' && !(toNumber(form[field]) >= 0)) errors[field] = 'Số không hợp lệ.';
    });
    if (has('rentalPeriod') && !(toNumber(form.rentalPeriodMonths) >= 1 && toNumber(form.rentalPeriodMonths) <= 120)) {
      errors.rentalPeriodMonths = 'Từ 1 đến 120 tháng.';
    }
  }
  if (step === 3) {
    if (images.some((image) => image.status === 'uploading')) errors.images = 'Đang tải ảnh, vui lòng đợi.';
    else if (images.some((image) => image.status === 'error')) errors.images = 'Có ảnh tải lỗi: hãy thử lại hoặc xoá ảnh đó.';
    else if (images.length > MAX_IMAGES) errors.images = `Tối đa ${MAX_IMAGES} ảnh.`;
  }
  return errors;
}

function toPayload(form, images) {
  const kind = findKind(form.propertyType);
  const has = (field) => kind?.fields.includes(field);
  return {
    propertyType: form.propertyType,
    transactionType: form.transactionType,
    title: form.title.trim(),
    description: form.description.trim(),
    price: priceOf(form),
    area: toNumber(form.area),
    provinceCode: form.provinceCode, provinceName: form.provinceName,
    districtCode: form.districtCode, districtName: form.districtName,
    wardCode: form.wardCode, wardName: form.wardName,
    streetAddress: form.streetAddress.trim(),
    bedroomCount: has('bedrooms') ? optionalInt(form.bedrooms) : null,
    bathroomCount: has('bathrooms') ? optionalInt(form.bathrooms) : null,
    floorNumber: has('floors') ? optionalInt(form.floors) : null,
    landArea: has('landArea') ? optionalNum(form.landArea) : null,
    legalStatus: has('legal') && form.legalStatus ? form.legalStatus : null,
    furniture: has('furniture') && form.furniture ? form.furniture : null,
    hasClearance: has('clearance') ? form.hasClearance : null,
    ceilingHeight: has('ceilingHeight') ? optionalNum(form.ceilingHeight) : null,
    rentalPeriodMonths: has('rentalPeriod') ? optionalInt(form.rentalPeriodMonths) : null,
    petsAllowed: has('pets') ? form.petsAllowed : null,
    imageUrls: images.filter((image) => image.status === 'done').map((image) => image.url),
  };
}

/** Tin lấy từ API → dữ liệu form (khi sửa tin). */
function fromListing(listing) {
  const isRent = listing.transactionType === 'ForRent';
  const useTy = !isRent && listing.price >= UNITS.ty;
  const unitValue = isRent || !useTy ? listing.price / UNITS.trieu : listing.price / UNITS.ty;
  return {
    ...EMPTY,
    transactionType: listing.transactionType,
    propertyType: listing.propertyType,
    provinceCode: listing.provinceCode, provinceName: listing.provinceName,
    districtCode: listing.districtCode, districtName: listing.districtName,
    wardCode: listing.wardCode, wardName: listing.wardName,
    streetAddress: listing.streetAddress || '',
    title: listing.title || '',
    description: listing.description || '',
    priceValue: String(Number(unitValue.toFixed(3))),
    priceUnit: useTy ? 'ty' : 'trieu',
    area: String(listing.area ?? ''),
    landArea: String(listing.area ?? ''), // diện tích đất không lưu trong database → mặc định bằng diện tích
    bedrooms: listing.bedrooms ? String(listing.bedrooms) : '',
    bathrooms: listing.bathrooms ? String(listing.bathrooms) : '',
    floors: listing.floors ? String(listing.floors) : '',
    legalStatus: listing.legalStatus === 'PinkBook' ? 'RedBook' : listing.legalStatus && listing.legalStatus !== 'Unknown' ? listing.legalStatus : '',
    furniture: listing.furniture || '',
    hasClearance: listing.propertyType === 'Land',
    ceilingHeight: listing.propertyType === 'Warehouse' ? '6' : '',
  };
}

/* ------------------------------- Ô nhập ------------------------------- */

const inputClass = (error) =>
  `h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    error ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
  }`;

function Field({ label, required, error, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function Select({ value, onChange, options, placeholder, error, disabled }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={`${inputClass(error)} disabled:bg-slate-50 disabled:text-slate-400`}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function Counter({ value, onChange, error }) {
  const n = value === '' ? 0 : Number(value) || 0;
  return (
    <div className={`flex h-11 items-center justify-between rounded-xl border bg-white px-1 ${error ? 'border-red-300' : 'border-slate-200'}`}>
      <button type="button" onClick={() => onChange(n > 0 ? String(n - 1) : '')} className="grid h-9 w-9 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100" aria-label="Giảm">−</button>
      <input value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" placeholder="0" className="w-12 bg-transparent text-center text-sm font-semibold text-ink outline-none" />
      <button type="button" onClick={() => onChange(String(n + 1))} className="grid h-9 w-9 place-items-center rounded-lg text-lg text-slate-500 hover:bg-slate-100" aria-label="Tăng">+</button>
    </div>
  );
}

/* ------------------------------- Các bước ------------------------------- */

function StepType({ form, set, errors, editing }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-slate-700">Nhu cầu <span className="text-red-500">*</span></p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {[['ForSale', 'Bán', 'Bán nhà đất, căn hộ'], ['ForRent', 'Cho thuê', 'Cho thuê nhà, văn phòng, kho']].map(([value, label, sub]) => (
            <button
              key={value}
              type="button"
              disabled={editing}
              onClick={() => set({ transactionType: value, propertyType: '', priceUnit: value === 'ForRent' ? 'trieu' : 'ty' })}
              className={`rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed ${
                form.transactionType === value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300 disabled:opacity-50'
              }`}
            >
              <span className="block text-lg font-extrabold text-ink">{label}</span>
              <span className="text-sm text-slate-500">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">Loại bất động sản <span className="text-red-500">*</span></p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_KINDS[form.transactionType].map((kind) => (
            <button
              key={kind.value}
              type="button"
              disabled={editing && form.propertyType !== kind.value}
              onClick={() => set({ propertyType: kind.value })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                form.propertyType === kind.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{kind.icon}</span>
              <span className="font-semibold text-ink">{kind.label}</span>
            </button>
          ))}
        </div>
        {errors.propertyType && <p className="mt-2 text-sm text-red-600">{errors.propertyType}</p>}
        {editing && <p className="mt-2 text-xs text-slate-500">Không đổi được loại tin khi sửa. Nếu cần, hãy xoá và đăng tin mới.</p>}
      </div>
    </div>
  );
}

function useOptions(loader, key) {
  const [state, setState] = useState({ items: [], loading: false, error: '' });
  useEffect(() => {
    if (key === null) {
      setState({ items: [], loading: false, error: '' });
      return undefined;
    }
    let alive = true;
    setState((value) => ({ ...value, loading: true, error: '' }));
    loader(key)
      .then((items) => alive && setState({ items, loading: false, error: '' }))
      .catch(() => alive && setState({ items: [], loading: false, error: 'Không tải được danh sách.' }));
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}

function StepLocation({ form, set, errors }) {
  const provinces = useOptions(() => postingService.provinces(), 'all');
  const districts = useOptions((code) => postingService.districts(code), form.provinceCode || null);
  const wards = useOptions((code) => postingService.wards(code), form.districtCode || null);
  const toOptions = (items) => items.map((item) => ({ value: item.code, label: item.name }));
  const nameOf = (items, code) => items.find((item) => item.code === code)?.name || '';

  const area = [form.wardName, form.districtName, form.provinceName].filter(Boolean);
  const query = encodeURIComponent([form.streetAddress, ...area, 'Việt Nam'].filter(Boolean).join(', '));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Tỉnh/Thành phố" required error={errors.provinceCode || provinces.error}>
          <Select
            value={form.provinceCode}
            placeholder={provinces.loading ? 'Đang tải…' : 'Chọn tỉnh/thành'}
            options={toOptions(provinces.items)}
            error={errors.provinceCode}
            onChange={(code) => set({ provinceCode: code, provinceName: nameOf(provinces.items, code), districtCode: '', districtName: '', wardCode: '', wardName: '' })}
          />
        </Field>
        <Field label="Quận/Huyện" required error={errors.districtCode || districts.error}>
          <Select
            value={form.districtCode}
            disabled={!form.provinceCode}
            placeholder={districts.loading ? 'Đang tải…' : 'Chọn quận/huyện'}
            options={toOptions(districts.items)}
            error={errors.districtCode}
            onChange={(code) => set({ districtCode: code, districtName: nameOf(districts.items, code), wardCode: '', wardName: '' })}
          />
        </Field>
        <Field label="Phường/Xã" required error={errors.wardCode || wards.error}>
          <Select
            value={form.wardCode}
            disabled={!form.districtCode}
            placeholder={wards.loading ? 'Đang tải…' : 'Chọn phường/xã'}
            options={toOptions(wards.items)}
            error={errors.wardCode}
            onChange={(code) => set({ wardCode: code, wardName: nameOf(wards.items, code) })}
          />
        </Field>
      </div>
      <Field label="Số nhà, tên đường" required error={errors.streetAddress}>
        <input value={form.streetAddress} onChange={(event) => set({ streetAddress: event.target.value })} maxLength={250} placeholder="VD: 12 Nguyễn Lương Bằng" className={inputClass(errors.streetAddress)} />
      </Field>
      {area.length === 3 && (
        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <iframe title="Xem trước vị trí" src={`https://maps.google.com/maps?q=${query}&hl=vi&z=15&output=embed`} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
    </div>
  );
}

function StepInfo({ form, set, errors }) {
  const kind = findKind(form.propertyType);
  const has = (field) => kind?.fields.includes(field);
  const isRent = form.transactionType === 'ForRent';
  const price = priceOf(form);
  const area = toNumber(form.area);

  return (
    <div className="space-y-5">
      <Field label="Tiêu đề" required error={errors.title} hint={`${form.title.trim().length}/250 ký tự · nên có loại nhà, diện tích, vị trí nổi bật`}>
        <input value={form.title} onChange={(event) => set({ title: event.target.value })} maxLength={250} placeholder="VD: Bán căn hộ 2PN 72m² view sông, Quận 7" className={inputClass(errors.title)} />
      </Field>
      <Field label="Mô tả" required error={errors.description} hint={`${form.description.trim().length}/8000 ký tự · tối thiểu 50`}>
        <textarea
          value={form.description}
          onChange={(event) => set({ description: event.target.value })}
          maxLength={8000}
          rows={7}
          placeholder="Mô tả vị trí, tiện ích xung quanh, hiện trạng, nội thất, pháp lý…"
          className={`${inputClass(errors.description)} h-auto resize-y py-2.5`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isRent ? 'Giá thuê (triệu/tháng)' : 'Mức giá'} required error={errors.priceValue}
          hint={price > 0 ? `= ${formatPrice(price)}${isRent ? '/tháng' : ''}${area > 0 && !isRent ? ` · ≈ ${formatPrice(price / area)}/m²` : ''}` : ''}>
          <div className="flex gap-2">
            <input value={form.priceValue} onChange={(event) => set({ priceValue: event.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder={isRent ? 'VD: 12' : 'VD: 3,5'} className={inputClass(errors.priceValue)} />
            {!isRent && (
              <select value={form.priceUnit} onChange={(event) => set({ priceUnit: event.target.value })} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink outline-none">
                <option value="ty">tỷ</option>
                <option value="trieu">triệu</option>
              </select>
            )}
          </div>
        </Field>
        <Field label={has('landArea') ? 'Diện tích sử dụng (m²)' : 'Diện tích (m²)'} required error={errors.area}>
          <input value={form.area} onChange={(event) => set({ area: event.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder="VD: 72" className={inputClass(errors.area)} />
        </Field>
        {has('landArea') && (
          <Field label="Diện tích đất (m²)" required error={errors.landArea}>
            <input value={form.landArea} onChange={(event) => set({ landArea: event.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder="VD: 60" className={inputClass(errors.landArea)} />
          </Field>
        )}
        {has('ceilingHeight') && (
          <Field label="Chiều cao trần (m)" required error={errors.ceilingHeight}>
            <input value={form.ceilingHeight} onChange={(event) => set({ ceilingHeight: event.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder="VD: 8" className={inputClass(errors.ceilingHeight)} />
          </Field>
        )}
        {has('rentalPeriod') && (
          <Field label="Thời hạn thuê tối thiểu (tháng)" error={errors.rentalPeriodMonths}>
            <input value={form.rentalPeriodMonths} onChange={(event) => set({ rentalPeriodMonths: event.target.value.replace(/[^\d]/g, '') })} inputMode="numeric" className={inputClass(errors.rentalPeriodMonths)} />
          </Field>
        )}
      </div>

      {(has('bedrooms') || has('bathrooms') || has('floors')) && (
        <div className="grid gap-4 sm:grid-cols-3">
          {has('bedrooms') && <Field label="Phòng ngủ" error={errors.bedrooms}><Counter value={form.bedrooms} onChange={(v) => set({ bedrooms: v })} error={errors.bedrooms} /></Field>}
          {has('bathrooms') && <Field label="Phòng tắm, vệ sinh" error={errors.bathrooms}><Counter value={form.bathrooms} onChange={(v) => set({ bathrooms: v })} error={errors.bathrooms} /></Field>}
          {has('floors') && <Field label={kind.floorsLabel || 'Số tầng'} error={errors.floors}><Counter value={form.floors} onChange={(v) => set({ floors: v })} error={errors.floors} /></Field>}
        </div>
      )}

      {(has('legal') || has('furniture')) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {has('legal') && (
            <Field label="Giấy tờ pháp lý">
              <Select value={form.legalStatus} onChange={(v) => set({ legalStatus: v })} placeholder="Chọn pháp lý"
                options={Object.entries(LEGAL_LABELS).filter(([v]) => v !== 'Unknown').map(([value, label]) => ({ value, label }))} />
            </Field>
          )}
          {has('furniture') && (
            <Field label="Nội thất">
              <Select value={form.furniture} onChange={(v) => set({ furniture: v })} placeholder="Chọn tình trạng nội thất"
                options={Object.entries(FURNITURE_LABELS).map(([value, label]) => ({ value, label }))} />
            </Field>
          )}
        </div>
      )}

      {has('clearance') && (
        <label className={`flex items-start gap-3 rounded-2xl border p-4 ${errors.hasClearance ? 'border-red-300 bg-red-50/50' : 'border-slate-200'}`}>
          <input type="checkbox" checked={form.hasClearance} onChange={(event) => set({ hasClearance: event.target.checked })} className="mt-0.5 h-4 w-4 accent-brand-600" />
          <span className="text-sm">
            <span className="font-semibold text-ink">Đất đã giải phóng mặt bằng</span>
            <span className="block text-slate-500">Hệ thống chỉ nhận tin đất đã giải phóng mặt bằng, sẵn sàng giao dịch.</span>
            {errors.hasClearance && <span className="mt-1 block text-xs text-red-600">{errors.hasClearance}</span>}
          </span>
        </label>
      )}
      {has('pets') && (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.petsAllowed} onChange={(event) => set({ petsAllowed: event.target.checked })} className="h-4 w-4 accent-brand-600" />
          <span className="font-semibold text-ink">Cho phép nuôi thú cưng</span>
        </label>
      )}
    </div>
  );
}

function StepReview({ form, images, setImages, errors, goTo }) {
  const kind = findKind(form.propertyType);
  const rows = [
    ['Loại tin', `${form.transactionType === 'ForRent' ? 'Cho thuê' : 'Bán'} · ${kind?.label || ''}`, 0],
    ['Vị trí', [form.streetAddress, form.wardName, form.districtName, form.provinceName].filter(Boolean).join(', '), 1],
    ['Tiêu đề', form.title, 2],
    ['Giá · Diện tích', `${formatPrice(priceOf(form))}${form.transactionType === 'ForRent' ? '/tháng' : ''} · ${form.area} m²`, 2],
  ];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-ink">Hình ảnh</h3>
        <p className="mb-3 mt-1 text-sm text-slate-500">Tin có ảnh thật được xem nhiều hơn. Ảnh đầu tiên là ảnh đại diện. Không bắt buộc – tin không có ảnh sẽ dùng ảnh minh họa.</p>
        <ImageUploader images={images} onChange={setImages} error={errors.images} />
      </div>
      <div>
        <h3 className="font-bold text-ink">Kiểm tra lại thông tin</h3>
        <dl className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {rows.map(([label, value, step]) => (
            <div key={label} className="flex items-start gap-4 px-4 py-3 text-sm">
              <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
              <dd className="min-w-0 flex-1 font-medium text-ink">{value || '—'}</dd>
              <button type="button" onClick={() => goTo(step)} className="shrink-0 text-xs font-semibold text-brand-700 hover:underline">Sửa</button>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Preview({ form, images }) {
  const cover = images.find((image) => image.status === 'done') || images[0];
  const kind = findKind(form.propertyType);
  const location = [form.districtName, form.provinceName].filter(Boolean).join(', ');
  const price = priceOf(form);
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-card">
      <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Xem trước tin</p>
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        {cover ? <img src={cover.preview} alt="" className="h-full w-full object-cover" /> : (
          <div className="grid h-full place-items-center text-sm text-slate-400">{kind ? `${kind.icon} Ảnh minh họa` : 'Chưa có ảnh'}</div>
        )}
      </div>
      <div className="space-y-1 p-2">
        <p className="line-clamp-2 font-bold text-ink">{form.title.trim() || 'Tiêu đề tin đăng'}</p>
        <p className="text-sm">
          <span className="font-extrabold text-brand-700">{price > 0 ? formatPrice(price) : 'Giá'}{form.transactionType === 'ForRent' && price > 0 ? '/tháng' : ''}</span>
          <span className="text-slate-400"> · </span>
          <span className="font-semibold text-ink">{form.area || '—'} m²</span>
        </p>
        <p className="truncate text-xs text-slate-500">{location || 'Vị trí'}</p>
      </div>
    </div>
  );
}

/* ------------------------------- Trang ------------------------------- */

export default function SellerPost() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const allowed = canManageListings(user);

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [load, setLoad] = useState({ loading: editing, error: '' });
  const [quota, setQuota] = useState(null);
  const [submit, setSubmit] = useState({ sending: false, error: '', done: null });
  const [restored, setRestored] = useState(false);

  // Sửa tin: nạp tin và kiểm tra quyền. Đăng mới: khôi phục bản nháp + lấy số suất đăng còn lại.
  useEffect(() => {
    if (!allowed) return undefined;
    let alive = true;
    if (editing) {
      listingService.getById(id)
        .then((listing) => {
          if (!alive) return;
          if (listing.ownerId !== user.id && user.role !== 'Admin') {
            setLoad({ loading: false, error: 'Bạn chỉ sửa được tin của mình.' });
            return;
          }
          if (listing.status === 'Sold' || listing.status === 'Rented') {
            setLoad({ loading: false, error: 'Tin đã giao dịch nên không sửa được nội dung.' });
            return;
          }
          setForm(fromListing(listing));
          setImages((listing.images || []).filter((image) => image.url?.startsWith('/uploads/')).map((image) => toImageItem(image.url)));
          setStep(2);
          setLoad({ loading: false, error: '' });
        })
        .catch((error) => alive && setLoad({ loading: false, error: readApiError(error, 'Không tải được tin đăng.').message }));
    } else {
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey(user.id)) || 'null');
        if (draft?.form) {
          setForm({ ...EMPTY, ...draft.form });
          setImages((draft.images || []).map(toImageItem));
          setStep(Math.min(draft.step || 0, 3));
          setRestored(true);
        }
      } catch { /* bỏ qua bản nháp hỏng */ }
      sellerService.dashboard()
        .then((d) => alive && setQuota({ max: d.maxListings, used: d.usedListingSlots }))
        .catch(() => {});
    }
    return () => { alive = false; };
  }, [allowed, editing, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lưu nháp (chỉ khi đăng mới, chưa gửi).
  useEffect(() => {
    if (editing || !allowed || submit.done || !user) return;
    const doneUrls = images.filter((image) => image.status === 'done').map((image) => image.url);
    const empty = !form.propertyType && !form.title && !doneUrls.length;
    if (empty) localStorage.removeItem(draftKey(user.id));
    else localStorage.setItem(draftKey(user.id), JSON.stringify({ form, images: doneUrls, step }));
  }, [form, images, step, editing, allowed, submit.done, user]);

  const set = (patch) => {
    setForm((value) => ({ ...value, ...patch }));
    setErrors((value) => {
      const next = { ...value };
      Object.keys(patch).forEach((key) => delete next[key]);
      return next;
    });
  };

  const goTo = (target) => {
    // Đi tới bước sau phải qua kiểm tra các bước trước đó.
    for (let s = 0; s < target; s += 1) {
      const found = validateStep(s, form, images);
      if (Object.keys(found).length) {
        setErrors(found);
        setStep(s);
        return;
      }
    }
    setErrors({});
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const send = async () => {
    for (let s = 0; s <= 3; s += 1) {
      const found = validateStep(s, form, images);
      if (Object.keys(found).length) {
        setErrors(found);
        setStep(s);
        return;
      }
    }
    setSubmit({ sending: true, error: '', done: null });
    try {
      const payload = toPayload(form, images);
      const saved = editing ? await listingService.update(id, payload) : await listingService.create(payload);
      if (!editing) localStorage.removeItem(draftKey(user.id));
      setSubmit({ sending: false, error: '', done: saved });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const { message, fields } = readApiError(error, 'Không gửi được tin. Vui lòng thử lại.');
      const mapped = {};
      Object.entries(fields).forEach(([key, value]) => {
        const name = API_FIELD[key.replace(/\[\d+\]$/, '')] || key.replace(/\[\d+\]$/, '');
        mapped[name] = value;
      });
      const firstStep = Math.min(...Object.keys(mapped).map((key) => FIELD_STEP[key] ?? 3), 3);
      setErrors(mapped);
      if (Object.keys(mapped).length) setStep(firstStep);
      setSubmit({ sending: false, error: message, done: null });
    }
  };

  const reset = () => {
    localStorage.removeItem(draftKey(user.id));
    setForm(EMPTY);
    setImages([]);
    setStep(0);
    setErrors({});
    setRestored(false);
    setSubmit({ sending: false, error: '', done: null });
  };

  const full = !editing && quota && quota.used >= quota.max;
  const title = editing ? 'Sửa tin đăng' : 'Đăng tin mới';
  const kind = findKind(form.propertyType);
  const uploading = images.some((image) => image.status === 'uploading');

  if (submit.done) {
    return (
      <SellerShell title={title}>
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon d={icons.check} className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-ink">{editing ? 'Đã lưu thay đổi!' : 'Đã gửi tin đăng!'}</h2>
          <p className="mt-2 text-slate-600">
            Tin <strong className="text-ink">{submit.done.title}</strong> đang <strong className="text-amber-700">chờ duyệt</strong>.
            Sau khi được duyệt, tin sẽ hiển thị công khai trong 30 ngày.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/seller/listings?tab=Pending" className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Quản lý tin đăng</Link>
            <Link to={`/listings/${submit.done.id}`} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink hover:border-brand-300">Xem tin</Link>
            {!editing && <button type="button" onClick={reset} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-ink hover:border-brand-300">Đăng tin khác</button>}
          </div>
        </div>
      </SellerShell>
    );
  }

  return (
    <SellerShell
      title={title}
      description={editing ? 'Sau khi lưu, tin sẽ được duyệt lại trước khi hiển thị.' : 'Điền đủ 4 bước, tin sẽ được duyệt trước khi hiển thị công khai.'}
      actions={quota && (
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${full ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-white text-slate-600 ring-slate-200'}`}>
          Đã dùng {quota.used}/{quota.max >= 999 ? '∞' : quota.max} suất đăng
        </span>
      )}
    >
      {load.loading ? (
        <div className="py-20"><Spinner /></div>
      ) : load.error ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white px-6 py-14 text-center">
          <p className="font-bold text-ink">{load.error}</p>
          <Link to="/seller/listings" className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Về Quản lý tin đăng</Link>
        </div>
      ) : full ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white px-6 py-14 text-center">
          <p className="text-lg font-bold text-ink">Bạn đã dùng hết {quota.max} suất đăng tin</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Hãy xoá bớt tin, hoặc đánh dấu tin đã bán/đã cho thuê để giải phóng suất đăng. Tài khoản Môi giới được đăng nhiều tin hơn.</p>
          <Link to="/seller/listings" className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Quản lý tin đăng</Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-4">
            {restored && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gold-50 px-4 py-3 text-sm text-gold-800 ring-1 ring-gold-200">
                <span>Đã khôi phục bản nháp bạn đang soạn dở.</span>
                <button type="button" onClick={reset} className="font-semibold underline">Bắt đầu lại</button>
              </div>
            )}

            <ol className="grid grid-cols-4 gap-2" aria-label="Các bước đăng tin">
              {STEPS.map((label, index) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => (index <= step ? setStep(index) : goTo(index))}
                    aria-current={index === step ? 'step' : undefined}
                    className="flex w-full flex-col items-start gap-1.5 text-left"
                  >
                    <span className={`h-1.5 w-full rounded-full ${index <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
                    <span className={`text-xs font-semibold sm:text-sm ${index === step ? 'text-brand-700' : index < step ? 'text-ink' : 'text-slate-400'}`}>
                      <span className="hidden sm:inline">{index + 1}. </span>{label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card md:p-7">
              <h2 className="mb-5 text-lg font-bold text-ink">
                {STEPS[step]}
                {step > 0 && kind && <span className="ml-2 text-sm font-medium text-slate-400">· {form.transactionType === 'ForRent' ? 'Cho thuê' : 'Bán'} {kind.label.toLowerCase()}</span>}
              </h2>
              {step === 0 && <StepType form={form} set={set} errors={errors} editing={editing} />}
              {step === 1 && <StepLocation form={form} set={set} errors={errors} />}
              {step === 2 && <StepInfo form={form} set={set} errors={errors} />}
              {step === 3 && <StepReview form={form} images={images} setImages={setImages} errors={errors} goTo={setStep} />}
            </section>

            {submit.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{submit.error}</p>}

            <div className="flex items-center justify-between gap-3">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-ink hover:border-brand-300">← Quay lại</button>
              ) : (
                <button type="button" onClick={() => navigate(-1)} className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:border-brand-300">Huỷ</button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => goTo(step + 1)} className="h-11 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700">Tiếp tục →</button>
              ) : (
                <button type="button" onClick={send} disabled={submit.sending || uploading} className="h-11 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-60">
                  {submit.sending ? 'Đang gửi…' : uploading ? 'Đang tải ảnh…' : editing ? 'Lưu & gửi duyệt lại' : 'Đăng tin'}
                </button>
              )}
            </div>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-3">
              <Preview form={form} images={images} />
              <div className="rounded-3xl bg-brand-50 p-4 text-xs leading-relaxed text-brand-900">
                <p className="font-bold">Mẹo để tin được duyệt nhanh</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  <li>Tiêu đề rõ loại nhà, diện tích, vị trí.</li>
                  <li>Giá và diện tích đúng thực tế.</li>
                  <li>Ảnh thật, rõ nét, không chèn số điện thoại.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      )}
    </SellerShell>
  );
}
