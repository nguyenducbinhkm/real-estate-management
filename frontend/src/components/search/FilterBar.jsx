import { areaLabel, priceLabel } from '../../utils/searchParser';

// Thanh lọc nằm ngang phía trên danh sách tin. Mọi mục đều là danh sách lựa chọn có sẵn (không phải tự gõ).

const BILLION = 1_000_000_000;

const transactionOptions = [
  ['', 'Tất cả'],
  ['ForSale', 'Mua bán'],
  ['ForRent', 'Cho thuê'],
];

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

// Khoảng giá (đồng) và diện tích (m²): [nhãn, min, max] – dựa trên phân bố giá/diện tích của tin trong database.
const priceOptions = [
  ['Dưới 2 tỷ', '', 2 * BILLION],
  ['2 – 3 tỷ', 2 * BILLION, 3 * BILLION],
  ['3 – 5 tỷ', 3 * BILLION, 5 * BILLION],
  ['5 – 7 tỷ', 5 * BILLION, 7 * BILLION],
  ['7 – 10 tỷ', 7 * BILLION, 10 * BILLION],
  ['Trên 10 tỷ', 10 * BILLION, ''],
];
const areaOptions = [
  ['Dưới 30 m²', '', 30],
  ['30 – 50 m²', 30, 50],
  ['50 – 80 m²', 50, 80],
  ['80 – 120 m²', 80, 120],
  ['120 – 200 m²', 120, 200],
  ['Trên 200 m²', 200, ''],
];

const rangeKey = (min, max) => `${min ?? ''}-${max ?? ''}`;

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pointer-events-none h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Một ô lọc: nhãn nhỏ ở trên, danh sách lựa chọn ở dưới; ô đang có giá trị được tô xanh nhạt. */
function SelectBox({ id, label, value, onChange, children, disabled = false }) {
  const active = value !== '';
  return (
    <label
      htmlFor={id}
      className={`group flex min-w-0 cursor-pointer flex-col rounded-2xl px-3.5 py-2 ring-1 transition-colors ${
        disabled ? 'cursor-not-allowed bg-slate-50 opacity-60 ring-slate-200' : active ? 'bg-brand-50 ring-brand-300' : 'bg-slate-50 ring-slate-200 hover:bg-white hover:ring-brand-300'
      }`}
    >
      <span className={`text-[11px] font-medium ${active ? 'text-brand-700' : 'text-slate-500'}`}>{label}</span>
      <span className="flex items-center gap-1">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent py-0.5 text-sm font-semibold text-ink outline-none disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <ChevronIcon />
      </span>
    </label>
  );
}

export default function FilterBar({ criteria, onChange, onReset }) {
  const update = (patch) => onChange({ ...patch, page: 1 });

  const typeOptions = criteria.transactionType === 'ForSale' ? saleTypes : criteria.transactionType === 'ForRent' ? rentTypes : [...saleTypes, ...rentTypes];

  // Khoảng giá / diện tích hiện tại (có thể đến từ câu tìm kiếm như "dưới 5 tỷ") – nếu không trùng lựa chọn có sẵn thì thêm 1 dòng riêng.
  const priceValue = criteria.minPrice || criteria.maxPrice ? rangeKey(criteria.minPrice, criteria.maxPrice) : '';
  const areaValue = criteria.minArea || criteria.maxArea ? rangeKey(criteria.minArea, criteria.maxArea) : '';
  const customPrice = priceValue && !priceOptions.some(([, min, max]) => rangeKey(min, max) === priceValue);
  const customArea = areaValue && !areaOptions.some(([, min, max]) => rangeKey(min, max) === areaValue);

  const setTransaction = (transactionType) => {
    const allowed = transactionType === 'ForSale' ? saleTypes : transactionType === 'ForRent' ? rentTypes : [...saleTypes, ...rentTypes];
    update({ transactionType, propertyType: allowed.some(([value]) => value === criteria.propertyType) ? criteria.propertyType : '' });
  };
  const setRange = (minKey, maxKey) => (value) => {
    const [min, max] = value ? value.split('-') : ['', ''];
    update({ [minKey]: min === '' ? '' : Number(min), [maxKey]: max === '' ? '' : Number(max) });
  };

  const hasFilter = [criteria.transactionType, criteria.propertyType, priceValue, areaValue, criteria.provinceCode].some(Boolean);

  return (
    <div className="grid grid-cols-2 gap-2 rounded-3xl border border-slate-100 bg-white p-2 shadow-card lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
      <SelectBox id="filter-transaction" label="Loại giao dịch" value={criteria.transactionType} onChange={setTransaction}>
        {transactionOptions.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
      </SelectBox>

      <SelectBox id="filter-type" label="Loại bất động sản" value={criteria.propertyType} onChange={(value) => update({ propertyType: value })}>
        <option value="">Tất cả loại</option>
        {typeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </SelectBox>

      <SelectBox id="filter-price" label="Khoảng giá" value={priceValue} onChange={setRange('minPrice', 'maxPrice')}>
        <option value="">Tất cả mức giá</option>
        {priceOptions.map(([label, min, max]) => <option key={label} value={rangeKey(min, max)}>{label}</option>)}
        {customPrice && <option value={priceValue}>{priceLabel(criteria.minPrice, criteria.maxPrice)}</option>}
      </SelectBox>

      <SelectBox id="filter-area" label="Diện tích" value={areaValue} onChange={setRange('minArea', 'maxArea')}>
        <option value="">Tất cả diện tích</option>
        {areaOptions.map(([label, min, max]) => <option key={label} value={rangeKey(min, max)}>{label}</option>)}
        {customArea && <option value={areaValue}>{areaLabel(criteria.minArea, criteria.maxArea)}</option>}
      </SelectBox>

      <button
        type="button"
        onClick={onReset}
        disabled={!hasFilter && !criteria.districtCode && !criteria.keyword}
        className="col-span-2 flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-600 disabled:hover:ring-slate-200 lg:col-span-1"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
        </svg>
        Xóa lọc
      </button>
    </div>
  );
}
