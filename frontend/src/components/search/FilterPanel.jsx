import Button from '../ui/Button';

const propertyTypes = [
  ['Apartment', 'Căn hộ chung cư'],
  ['House', 'Nhà riêng'],
  ['Villa', 'Biệt thự'],
  ['Shophouse', 'Shophouse'],
  ['Land', 'Đất nền'],
  ['RentalApartment', 'Căn hộ cho thuê'],
  ['RentalHouse', 'Nhà cho thuê'],
  ['Office', 'Văn phòng'],
  ['Warehouse', 'Kho xưởng'],
];

export default function FilterPanel({ criteria, onChange, onReset, compact = false }) {
  const setNumber = (name, value) => onChange({ [name]: value === '' ? '' : Number(value) });

  return (
    <div className={compact ? 'space-y-4' : 'space-y-5'}>
      <div>
        <label className="text-sm font-bold text-slate-800" htmlFor="transactionType">Loại giao dịch</label>
        <select
          id="transactionType"
          value={criteria.transactionType}
          onChange={(event) => onChange({ transactionType: event.target.value, page: 1 })}
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Tất cả</option>
          <option value="ForSale">Nhà đất bán</option>
          <option value="ForRent">Nhà đất cho thuê</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-800" htmlFor="propertyType">Loại bất động sản</label>
        <select
          id="propertyType"
          value={criteria.propertyType}
          onChange={(event) => onChange({ propertyType: event.target.value, page: 1 })}
          className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Tất cả loại</option>
          {propertyTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-bold text-slate-800">Khoảng giá (VNĐ)</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            value={criteria.minPrice}
            onChange={(event) => setNumber('minPrice', event.target.value)}
            onBlur={() => {
              if (criteria.minPrice && criteria.maxPrice && Number(criteria.minPrice) > Number(criteria.maxPrice)) {
                onChange({ maxPrice: criteria.minPrice });
              }
            }}
            placeholder="Tối thiểu"
            className="h-11 min-w-0 rounded-lg border border-slate-300 px-3 text-sm"
          />
          <input
            type="number"
            min="0"
            value={criteria.maxPrice}
            onChange={(event) => setNumber('maxPrice', event.target.value)}
            onBlur={() => {
              if (criteria.minPrice && criteria.maxPrice && Number(criteria.maxPrice) < Number(criteria.minPrice)) {
                onChange({ minPrice: criteria.maxPrice });
              }
            }}
            placeholder="Tối đa"
            className="h-11 min-w-0 rounded-lg border border-slate-300 px-3 text-sm"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-bold text-slate-800">Diện tích (m²)</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input type="number" min="0" value={criteria.minArea} onChange={(event) => setNumber('minArea', event.target.value)} placeholder="Từ" className="h-11 min-w-0 rounded-lg border border-slate-300 px-3 text-sm" />
          <input type="number" min="0" value={criteria.maxArea} onChange={(event) => setNumber('maxArea', event.target.value)} placeholder="Đến" className="h-11 min-w-0 rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-bold text-slate-800" htmlFor="provinceCode">Mã tỉnh</label>
          <input id="provinceCode" value={criteria.provinceCode} onChange={(event) => onChange({ provinceCode: event.target.value, page: 1 })} placeholder="VD: 79" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-800" htmlFor="districtCode">Mã quận/huyện</label>
          <input id="districtCode" value={criteria.districtCode} onChange={(event) => onChange({ districtCode: event.target.value, page: 1 })} placeholder="VD: 749" className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm" />
        </div>
      </div>

      <Button type="button" variant="ghost" onClick={onReset} className="w-full">Xóa bộ lọc</Button>
    </div>
  );
}
