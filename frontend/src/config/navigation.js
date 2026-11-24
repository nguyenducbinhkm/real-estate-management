// Cấu trúc menu header. propertyType = null nghĩa là backend chưa có loại BĐS tương ứng,
// link sẽ chỉ lọc theo loại giao dịch.

function listingLink(transactionType, propertyType) {
  const params = new URLSearchParams({ transactionType });
  if (propertyType) params.set('propertyType', propertyType);
  return `/listings?${params.toString()}`;
}

const saleItems = [
  ['Bán căn hộ chung cư', 'Apartment'],
  ['Bán chung cư mini, căn hộ dịch vụ', null],
  ['Bán nhà riêng', 'House'],
  ['Bán nhà biệt thự, liền kề', 'Villa'],
  ['Bán nhà mặt phố', null],
  ['Bán shophouse, nhà phố thương mại', 'Shophouse'],
  ['Bán đất nền dự án', 'Land'],
  ['Bán đất', 'Land'],
  ['Bán trang trại, khu nghỉ dưỡng', null],
  ['Bán condotel', null],
  ['Bán kho, nhà xưởng', null],
  ['Bán loại bất động sản khác', null],
];

const rentItems = [
  ['Cho thuê căn hộ chung cư', 'RentalApartment'],
  ['Cho thuê chung cư mini, căn hộ dịch vụ', null],
  ['Cho thuê nhà riêng', 'RentalHouse'],
  ['Cho thuê nhà biệt thự, liền kề', null],
  ['Cho thuê nhà mặt phố', null],
  ['Cho thuê shophouse, nhà phố thương mại', null],
  ['Cho thuê nhà trọ, phòng trọ', null],
  ['Cho thuê văn phòng', 'Office'],
  ['Cho thuê, sang nhượng cửa hàng, ki ốt', null],
  ['Cho thuê kho, nhà xưởng, đất', 'Warehouse'],
  ['Cho thuê loại bất động sản khác', null],
];

const projectItems = [
  ['Căn hộ chung cư', 'can-ho-chung-cu'],
  ['Cao ốc văn phòng', 'cao-oc-van-phong'],
  ['Trung tâm thương mại', 'trung-tam-thuong-mai'],
  ['Khu đô thị mới', 'khu-do-thi-moi'],
  ['Khu phức hợp', 'khu-phuc-hop'],
  ['Nhà ở xã hội', 'nha-o-xa-hoi'],
  ['Khu nghỉ dưỡng, Sinh thái', 'khu-nghi-duong-sinh-thai'],
  ['Khu công nghiệp', 'khu-cong-nghiep'],
  ['Biệt thự, liền kề', 'biet-thu-lien-ke'],
  ['Shophouse', 'shophouse'],
  ['Nhà mặt phố', 'nha-mat-pho'],
  ['Dự án khác', 'khac'],
];

const wikiItems = [
  ['Mua BĐS', 'mua-bds'],
  ['Bán BĐS', 'ban-bds'],
  ['Thuê BĐS', 'thue-bds'],
  ['Tài chính BĐS', 'tai-chinh'],
  ['Quy hoạch - Pháp lý', 'quy-hoach-phap-ly'],
  ['Nội - Ngoại thất', 'noi-ngoai-that'],
  ['Phong tục', 'phong-tuc'],
];

const analysisItems = [
  ['Biểu đồ giá', 'bieu-do-gia'],
  ['Video đánh giá', 'video-danh-gia'],
  ['Báo cáo thị trường', 'bao-cao-thi-truong'],
  ['Góc nhìn chuyên gia', 'goc-nhin-chuyen-gia'],
];

export const mainMenu = [
  {
    label: 'Nhà đất bán',
    to: listingLink('ForSale'),
    children: saleItems.map(([label, type]) => ({ label, to: listingLink('ForSale', type) })),
  },
  {
    label: 'Nhà đất cho thuê',
    to: listingLink('ForRent'),
    children: rentItems.map(([label, type]) => ({ label, to: listingLink('ForRent', type) })),
  },
  {
    label: 'Dự án',
    to: '/projects',
    children: projectItems.map(([label, slug]) => ({ label, to: `/projects?type=${slug}` })),
  },
  { label: 'Tin tức', to: '/news' },
  {
    label: 'Wiki BĐS',
    to: '/wiki',
    children: wikiItems.map(([label, slug]) => ({ label, to: `/wiki/${slug}` })),
  },
  {
    label: 'Phân tích đánh giá',
    to: '/analysis',
    children: analysisItems.map(([label, slug]) => ({ label, to: `/analysis/${slug}` })),
  },
];

export const accountMenu = [
  { label: 'Tổng quan', to: '/seller/dashboard' },
  { label: 'Quản lý tin đăng', to: '/seller/listings' },
  { label: 'Quản lý khách hàng', to: '/seller/customers' },
  { label: 'Gói hội viên', to: '/seller/membership' },
  { label: 'Nạp tiền', to: '/seller/top-up' },
  { label: 'Cài đặt tài khoản', to: '/profile' },
  { label: 'Đổi mật khẩu', to: '/profile/password' },
];
