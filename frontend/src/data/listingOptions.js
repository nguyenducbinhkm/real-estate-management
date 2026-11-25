// Lựa chọn dùng chung cho form đăng tin và trang chi tiết (khớp các enum ở backend).

// Database lưu chung "Sổ đỏ/Sổ hồng" nên chỉ có 1 lựa chọn (RedBook); PinkBook vẫn hiển thị cùng nhãn.
export const LEGAL_LABELS = { RedBook: 'Sổ đỏ/Sổ hồng', SaleContract: 'Hợp đồng mua bán', LongTermLease: 'Thuê dài hạn', Unknown: 'Đang cập nhật' };
export const legalLabel = (value) => (value === 'PinkBook' ? LEGAL_LABELS.RedBook : LEGAL_LABELS[value]);
export const FURNITURE_LABELS = { None: 'Không nội thất', Basic: 'Nội thất cơ bản', Full: 'Nội thất đầy đủ', Luxury: 'Nội thất cao cấp' };

// Icon loại BĐS (frontend/public/icons). Văn phòng, kho xưởng chưa có file icon nên tạm dùng emoji.
const icon = (file) => `/icons/${encodeURIComponent(file)}`;
const ICONS = {
  apartment: icon('chung cư.jpg'),
  house: icon('nhà riêng.jpg'),
  villa: icon('biệt thự.jpg'),
  shophouse: icon('shophouse.jpg'),
  land: icon('đất nền.jpg'),
};

/**
 * Các loại BĐS theo hình thức giao dịch, kèm những ô thông tin riêng của từng loại.
 * fields: bedrooms, bathrooms, floors (số tầng/tầng số), legal, furniture, landArea*, ceilingHeight*, clearance*, rentalPeriod, pets.
 * Dấu * = bắt buộc theo quy tắc của backend.
 */
export const PROPERTY_KINDS = {
  ForSale: [
    { value: 'Apartment', label: 'Căn hộ chung cư', image: ICONS.apartment, fields: ['bedrooms', 'bathrooms', 'floors', 'legal', 'furniture'], floorsLabel: 'Tầng số' },
    { value: 'House', label: 'Nhà riêng', image: ICONS.house, fields: ['landArea', 'legal', 'furniture'] },
    { value: 'Villa', label: 'Biệt thự, liền kề', image: ICONS.villa, fields: ['landArea', 'bedrooms', 'bathrooms', 'legal', 'furniture'] },
    { value: 'Shophouse', label: 'Shophouse, nhà phố TM', image: ICONS.shophouse, fields: ['landArea', 'floors', 'legal', 'furniture'], floorsLabel: 'Số tầng kinh doanh' },
    { value: 'Land', label: 'Đất, đất nền', image: ICONS.land, fields: ['clearance', 'legal'] },
  ],
  ForRent: [
    { value: 'RentalApartment', label: 'Căn hộ chung cư', image: ICONS.apartment, fields: ['bedrooms', 'bathrooms', 'floors', 'furniture', 'rentalPeriod', 'pets'], floorsLabel: 'Tầng số' },
    { value: 'RentalHouse', label: 'Nhà riêng', image: ICONS.house, fields: ['landArea', 'bedrooms', 'bathrooms', 'furniture', 'rentalPeriod'] },
    { value: 'Office', label: 'Văn phòng', icon: '💼', fields: ['floors', 'furniture', 'rentalPeriod'], floorsLabel: 'Tầng số' },
    { value: 'Warehouse', label: 'Kho, nhà xưởng', icon: '🏭', fields: ['ceilingHeight', 'rentalPeriod'] },
  ],
};

export const findKind = (propertyType) =>
  [...PROPERTY_KINDS.ForSale, ...PROPERTY_KINDS.ForRent].find((kind) => kind.value === propertyType);
