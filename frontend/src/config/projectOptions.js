// Nhãn, màu và định dạng cho trang Dự án. Giá trị trạng thái khớp enum ProjectStatus ở backend.

export const projectStatuses = {
  // icon: tên biểu tượng trong components/projects/ProjectIcons.jsx
  Upcoming: { label: 'Sắp mở bán', tone: 'bg-amber-600', icon: 'clock' },
  Selling: { label: 'Đang mở bán', tone: 'bg-emerald-600', icon: 'live' },
  HandedOver: { label: 'Đã bàn giao', tone: 'bg-sky-700', icon: 'key' },
  Planning: { label: 'Đang lên kế hoạch', tone: 'bg-slate-600', icon: 'plan' },
  PreSales: { label: 'Sắp mở bán', tone: 'bg-amber-600', icon: 'clock' },
  UnderConstruction: { label: 'Đang xây dựng', tone: 'bg-orange-600', icon: 'build' },
  Completed: { label: 'Đã hoàn thành', tone: 'bg-sky-700', icon: 'check' },
  Suspended: { label: 'Tạm dừng', tone: 'bg-red-700', icon: 'pause' },
};

// Bộ lọc trạng thái chỉ hiện các giá trị có trong database.
export const statusFilterOptions = [
  ['', 'Tất cả trạng thái'],
  ['Upcoming', 'Sắp mở bán'],
  ['Selling', 'Đang mở bán'],
  ['HandedOver', 'Đã bàn giao'],
];

const B = 1_000_000_000;
export const projectPriceRanges = [
  ['', '', 'Tất cả mức giá'],
  ['', 3 * B, 'Dưới 3 tỷ'],
  [3 * B, 5 * B, '3 - 5 tỷ'],
  [5 * B, 10 * B, '5 - 10 tỷ'],
  [10 * B, 20 * B, '10 - 20 tỷ'],
  [20 * B, '', 'Trên 20 tỷ'],
];

export const projectSortOptions = [
  ['default', 'Nổi bật'],
  ['newest', 'Mở bán mới nhất'],
  ['priceAsc', 'Giá thấp đến cao'],
  ['priceDesc', 'Giá cao đến thấp'],
];

export function statusInfo(status) {
  return projectStatuses[status] || { label: status || 'Đang cập nhật', tone: 'bg-slate-600' };
}

function trimNumber(value, digits) {
  return value.toFixed(digits).replace(/\.?0+$/, '').replace('.', ',');
}

export function formatMoney(value) {
  if (!value) return '';
  if (value >= B) return `${trimNumber(value / B, 1)} tỷ`;
  return `${trimNumber(value / 1_000_000, 0)} triệu`;
}

export function formatPriceRange(min, max) {
  if (min && max) return `${formatMoney(min)} - ${formatMoney(max)}`;
  if (min) return `Từ ${formatMoney(min)}`;
  if (max) return `Đến ${formatMoney(max)}`;
  return 'Đang cập nhật';
}

/** Diện tích dự án trong database tính bằng hecta. */
export function formatHectare(value) {
  if (value === null || value === undefined) return 'Đang cập nhật';
  return `${trimNumber(Number(value), 2)} ha`;
}

export function formatDate(iso) {
  if (!iso) return 'Đang cập nhật';
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function projectLocation(project) {
  return [project.districtName, project.provinceName].filter(Boolean).join(', ');
}
