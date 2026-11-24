import { useEffect, useMemo, useState } from 'react';
import Button from '../ui/Button';
import { districtList, provinceList } from '../../data/locations';

const BILLION = 1_000_000_000;

const saleTypes = [
  ['Apartment', 'Căn hộ chung cư'],
  ['House', 'Nhà riêng'],
  ['Villa', 'Biệt thự, liền kề'],
  ['Shophouse', 'Shophouse'],
  ['Land', 'Đất, đất nền'],
];
const rentTypes = [
  ['RentalApartment', 'Căn hộ cho thuê'],
  ['RentalHouse', 'Nhà riêng cho thuê'],
  ['Office', 'Văn phòng'],
  ['Warehouse', 'Kho, nhà xưởng'],
];

// Khoảng giá (tỷ đồng) và diện tích (m²) chọn nhanh – dựa trên phân bố giá/diện tích của tin trong database.
const pricePresets = [
  ['Dưới 3 tỷ', '', 3],
  ['3 – 5 tỷ', 3, 5],
  ['5 – 7 tỷ', 5, 7],
  ['7 – 10 tỷ', 7, 10],
  ['Trên 10 tỷ', 10, ''],
];
const areaPresets = [
  ['Dưới 30 m²', '', 30],
  ['30 – 50 m²', 30, 50],
  ['50 – 80 m²', 50, 80],
  ['80 – 120 m²', 80, 120],
  ['120 – 200 m²', 120, 200],
  ['Trên 200 m²', 200, ''],
];

const shortName = (name) => name.replace(/^(Thành phố|Tỉnh)\s+/, '');
const provinces = [...provinceList].sort(([codeA, a], [codeB, b]) => {
  const top = ['79', '01'];
  const rank = (code) => (top.includes(code) ? top.indexOf(code) : top.length);
  return rank(codeA) - rank(codeB) || shortName(a).localeCompare(shortName(b), 'vi');
});

/** Đổi giá trị trong ô (tỷ / m²) sang số; ô trống hoặc không hợp lệ → ''. */
const toNumber = (value) => {
  const n = Number(String(value).replace(',', '.'));
  return value === '' || !Number.isFinite(n) || n < 0 ? '' : n;
};
const sameRange = (criteriaMin, criteriaMax, min, max) =>
  String(criteriaMin ?? '') === String(min) && String(criteriaMax ?? '') === String(max);

const labelClass = 'text-sm font-semibold text-ink';
const fieldClass = 'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100';

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30' : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-700'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Ô nhập khoảng "Từ – Đến" tự chọn. Người dùng gõ theo đơn vị hiển thị (tỷ hoặc m²),
 * bấm Áp dụng (hoặc Enter) mới lọc; `scale` đổi đơn vị hiển thị sang đơn vị API (tỷ → đồng).
 */
function RangeInputs({ min, max, unit, scale = 1, onApply }) {
  const display = (value) => (value === '' || value === undefined || value === null ? '' : String(Number(value) / scale));
  const [from, setFrom] = useState(display(min));
  const [to, setTo] = useState(display(max));

  useEffect(() => {
    setFrom(display(min));
    setTo(display(max));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, scale]);

  const apply = () => {
    let low = toNumber(from);
    let high = toNumber(to);
    if (low !== '' && high !== '' && low > high) [low, high] = [high, low];
    onApply(low === '' ? '' : Math.round(low * scale), high === '' ? '' : Math.round(high * scale));
  };

  return (
    <form
      className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <div className="relative min-w-0">
        <input type="number" inputMode="decimal" step="any" min="0" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Từ" aria-label={`Từ (${unit})`} className={`${fieldClass} pr-8`} />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
      </div>
      <span className="text-slate-400">–</span>
      <div className="relative min-w-0">
        <input type="number" inputMode="decimal" step="any" min="0" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Đến" aria-label={`Đến (${unit})`} className={`${fieldClass} pr-8`} />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
      </div>
      <button type="submit" className="col-span-3 h-9 rounded-full bg-brand-50 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100">
        Áp dụng
      </button>
    </form>
  );
}

export default function FilterPanel({ criteria, onChange, onReset, compact = false }) {
  const update = (patch) => onChange({ ...patch, page: 1 });

  const typeOptions = criteria.transactionType === 'ForSale' ? saleTypes : criteria.transactionType === 'ForRent' ? rentTypes : [...saleTypes, ...rentTypes];
  const districts = useMemo(
    () => districtList.filter(([, , provinceCode]) => provinceCode === criteria.provinceCode).sort((a, b) => a[1].localeCompare(b[1], 'vi')),
    [criteria.provinceCode],
  );

  const setTransaction = (transactionType) => {
    const allowed = transactionType === 'ForSale' ? saleTypes : transactionType === 'ForRent' ? rentTypes : [...saleTypes, ...rentTypes];
    const keepType = allowed.some(([value]) => value === criteria.propertyType);
    update({ transactionType, propertyType: keepType ? criteria.propertyType : '' });
  };

  const togglePrice = (min, max) => {
    const active = sameRange(criteria.minPrice, criteria.maxPrice, min === '' ? '' : min * BILLION, max === '' ? '' : max * BILLION);
    update(active ? { minPrice: '', maxPrice: '' } : { minPrice: min === '' ? '' : min * BILLION, maxPrice: max === '' ? '' : max * BILLION });
  };
  const toggleArea = (min, max) => {
    const active = sameRange(criteria.minArea, criteria.maxArea, min, max);
    update(active ? { minArea: '', maxArea: '' } : { minArea: min, maxArea: max });
  };

  return (
    <div className={compact ? 'space-y-5' : 'space-y-6'}>
      <fieldset>
        <legend className={labelClass}>Loại giao dịch</legend>
        <div className="mt-2 grid grid-cols-3 rounded-full bg-slate-100 p-1">
          {[['', 'Tất cả'], ['ForSale', 'Bán'], ['ForRent', 'Cho thuê']].map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={criteria.transactionType === value}
              onClick={() => setTransaction(value)}
              className={`h-9 rounded-full text-sm font-semibold transition-all ${criteria.transactionType === value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="propertyType">Loại bất động sản</label>
        <select id="propertyType" value={criteria.propertyType} onChange={(event) => update({ propertyType: event.target.value })} className={`mt-2 ${fieldClass}`}>
          <option value="">Tất cả loại</option>
          {typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <fieldset>
        <legend className={labelClass}>Khoảng giá</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {pricePresets.map(([label, min, max]) => (
            <Chip
              key={label}
              active={sameRange(criteria.minPrice, criteria.maxPrice, min === '' ? '' : min * BILLION, max === '' ? '' : max * BILLION)}
              onClick={() => togglePrice(min, max)}
            >
              {label}
            </Chip>
          ))}
        </div>
        <RangeInputs min={criteria.minPrice} max={criteria.maxPrice} unit="tỷ" scale={BILLION} onApply={(minPrice, maxPrice) => update({ minPrice, maxPrice })} />
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Diện tích</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {areaPresets.map(([label, min, max]) => (
            <Chip key={label} active={sameRange(criteria.minArea, criteria.maxArea, min, max)} onClick={() => toggleArea(min, max)}>
              {label}
            </Chip>
          ))}
        </div>
        <RangeInputs min={criteria.minArea} max={criteria.maxArea} unit="m²" onApply={(minArea, maxArea) => update({ minArea, maxArea })} />
      </fieldset>

      <div className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="provinceCode">Tỉnh / thành phố</label>
          <select id="provinceCode" value={criteria.provinceCode} onChange={(event) => update({ provinceCode: event.target.value, districtCode: '' })} className={`mt-2 ${fieldClass}`}>
            <option value="">Toàn quốc</option>
            {provinces.map(([code, name]) => <option key={code} value={code}>{shortName(name)}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="districtCode">Quận / huyện</label>
          <select
            id="districtCode"
            value={criteria.districtCode}
            disabled={!criteria.provinceCode}
            onChange={(event) => update({ districtCode: event.target.value })}
            className={`mt-2 ${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <option value="">{criteria.provinceCode ? 'Tất cả quận / huyện' : 'Chọn tỉnh / thành trước'}</option>
            {districts.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </div>
      </div>

      <Button type="button" variant="secondary" onClick={onReset} className="w-full rounded-full">Xóa bộ lọc</Button>
    </div>
  );
}
