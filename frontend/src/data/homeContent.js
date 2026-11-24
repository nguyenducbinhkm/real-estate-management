// Dữ liệu MẪU cho các khối trang chủ chưa có API (dự án, doanh nghiệp).
// Tin tức dùng chung với trang Tin tức: xem src/data/newsArticles.js và src/services/newsService.js.
// Thay bằng dữ liệu từ backend khi có endpoint tương ứng.

export const heroSlides = [
  {
    eyebrow: 'BS Realty',
    // Ảnh banner do chủ dự án cung cấp (frontend/public/images/banner-hanoi.webp).
    image: '/images/banner-hanoi.webp',
    imageAlt: 'Toàn cảnh đô thị Hà Nội lúc hoàng hôn',
    title: 'Tìm ngôi nhà phù hợp với bạn',
    text: 'Hàng nghìn tin mua bán, cho thuê nhà đất được cập nhật mỗi ngày.',
    cta: ['Xem nhà đất bán', '/listings?transactionType=ForSale'],
  },
  {
    eyebrow: 'Đăng tin miễn phí',
    // Ảnh Wikimedia Commons – giấy phép CC BY 2.0, phải ghi tác giả (hiện ở góc banner và trang /image-credits).
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg/1920px-Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg',
    imageAlt: 'TP. Hồ Chí Minh nhìn từ trên cao',
    imageCredit: {
      author: 'Lê Minh Phát',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg',
    },
    title: 'Tiếp cận người mua nhanh hơn',
    text: 'Đăng tin chỉ trong vài phút, quản lý tin và khách hàng ở một nơi.',
    cta: ['Đăng tin ngay', '/seller/post'],
  },
  {
    eyebrow: 'Dự án nổi bật',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Saigon_at_Blue_Hour.jpg/1920px-Saigon_at_Blue_Hour.jpg',
    imageAlt: 'Sài Gòn ven sông lúc hoàng hôn',
    imageCredit: {
      author: 'Radek Kucharski',
      license: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saigon_at_Blue_Hour.jpg',
    },
    title: 'Khám phá dự án mới khắp cả nước',
    text: 'Thông tin quy mô, tiến độ, mặt bằng và chủ đầu tư.',
    cta: ['Xem dự án', '/projects'],
  },
];

export const provinces = [
  ['', 'Toàn quốc'],
  ['79', 'Hồ Chí Minh'],
  ['01', 'Hà Nội'],
  ['48', 'Đà Nẵng'],
  ['74', 'Bình Dương'],
  ['75', 'Đồng Nai'],
  ['92', 'Cần Thơ'],
  ['31', 'Hải Phòng'],
  ['56', 'Khánh Hòa'],
];

export const featuredLocations = [
  { code: '79', name: 'TP. Hồ Chí Minh', large: true },
  { code: '01', name: 'Hà Nội' },
  { code: '48', name: 'Đà Nẵng' },
  { code: '74', name: 'Bình Dương' },
  { code: '75', name: 'Đồng Nai' },
];

export const utilities = [
  { title: 'Xem tuổi xây nhà', text: 'Chọn năm phù hợp với tuổi gia chủ', to: '/utilities/xem-tuoi-xay-nha' },
  { title: 'Tư vấn phong thủy', text: 'Hướng nhà, màu sắc hợp mệnh', to: '/utilities/phong-thuy' },
  { title: 'Tính lãi vay', text: 'Ước tính số tiền trả góp hằng tháng', to: '/utilities/tinh-lai-vay' },
  { title: 'Chi phí làm nhà', text: 'Dự toán chi phí xây dựng', to: '/utilities/chi-phi-lam-nha' },
];

export const samplePartners = ['Đối tác A', 'Đối tác B', 'Đối tác C', 'Đối tác D', 'Đối tác E', 'Đối tác F'];

export const introBlocks = [
  {
    title: 'Bất động sản bán',
    text: 'Tìm ngôi nhà mơ ước hoặc cơ hội đầu tư qua lượng tin rao lớn: căn hộ, nhà riêng, biệt thự, đất nền, shophouse…',
    to: '/listings?transactionType=ForSale',
  },
  {
    title: 'Bất động sản cho thuê',
    text: 'Cập nhật thường xuyên căn hộ, nhà nguyên căn, văn phòng, kho xưởng cho thuê giúp bạn nhanh chóng tìm được chỗ ưng ý.',
    to: '/listings?transactionType=ForRent',
  },
  {
    title: 'Đánh giá dự án',
    text: 'Góc nhìn tổng quan về các dự án nổi bật, giúp bạn ra quyết định đúng cho nơi an cư hoặc đầu tư.',
    to: '/analysis',
  },
  {
    title: 'Wiki BĐS',
    text: 'Kiến thức, kinh nghiệm mua bán, cho thuê, vay mua nhà, pháp lý và phong thủy cho người tìm nhà.',
    to: '/wiki',
  },
];

export const quickLinks = [
  {
    title: 'Bất động sản bán',
    links: [
      ['Bán căn hộ chung cư', '/listings?transactionType=ForSale&propertyType=Apartment'],
      ['Bán nhà riêng', '/listings?transactionType=ForSale&propertyType=House'],
      ['Bán biệt thự, liền kề', '/listings?transactionType=ForSale&propertyType=Villa'],
      ['Bán shophouse', '/listings?transactionType=ForSale&propertyType=Shophouse'],
      ['Bán đất', '/listings?transactionType=ForSale&propertyType=Land'],
    ],
  },
  {
    title: 'Bất động sản thuê',
    links: [
      ['Thuê căn hộ chung cư', '/listings?transactionType=ForRent&propertyType=RentalApartment'],
      ['Thuê nhà riêng', '/listings?transactionType=ForRent&propertyType=RentalHouse'],
      ['Thuê văn phòng', '/listings?transactionType=ForRent&propertyType=Office'],
      ['Thuê kho, nhà xưởng', '/listings?transactionType=ForRent&propertyType=Warehouse'],
    ],
  },
  {
    title: 'Bất động sản toàn quốc',
    links: [
      ['Mua bán BĐS Hà Nội', '/listings?transactionType=ForSale&provinceCode=01'],
      ['Cho thuê BĐS Hà Nội', '/listings?transactionType=ForRent&provinceCode=01'],
      ['Mua bán BĐS Hồ Chí Minh', '/listings?transactionType=ForSale&provinceCode=79'],
      ['Cho thuê BĐS Hồ Chí Minh', '/listings?transactionType=ForRent&provinceCode=79'],
    ],
  },
  {
    title: 'Chủ đề nổi bật',
    links: [
      ['Tin tức bất động sản', '/news'],
      ['Quy hoạch - Pháp lý', '/wiki/quy-hoach-phap-ly'],
      ['Tài chính BĐS', '/wiki/tai-chinh'],
      ['Biểu đồ giá', '/analysis/bieu-do-gia'],
    ],
  },
];
