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

// Ảnh từng tỉnh/thành cho khối "Bất động sản theo địa điểm".
// Ảnh Wikimedia Commons theo giấy phép Creative Commons – phải ghi tác giả (hiện trên ô và trang /image-credits).
const commonsThumb = (path, width = 1280) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${width}px-${path.split('/').pop()}`;

export const locationImages = {
  '79': {
    url: commonsThumb('c/c4/Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg'),
    alt: 'TP. Hồ Chí Minh nhìn từ trên cao',
    author: 'Lê Minh Phát',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_-_DJI_0124-HDR.jpg',
  },
  // Ảnh banner do chủ dự án cung cấp – không cần ghi nguồn.
  '01': { url: '/images/banner-hanoi.webp', alt: 'Toàn cảnh đô thị Hà Nội lúc hoàng hôn' },
  '48': {
    url: commonsThumb('e/eb/Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg'),
    alt: 'Cầu Rồng và sông Hàn, Đà Nẵng trong lễ hội pháo hoa',
    author: 'Vivu Vietnam',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg',
  },
  '74': {
    url: commonsThumb('2/29/B%C3%ACnh_D%C6%B0%C6%A1ng_new_city.JPG'),
    alt: 'Trung tâm hành chính tỉnh tại thành phố mới Bình Dương',
    author: 'Quannguyen1310',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:B%C3%ACnh_D%C6%B0%C6%A1ng_new_city.JPG',
  },
  '75': {
    url: commonsThumb('4/41/Dong_Nai_River_in_Bien_Hoa_%2815286968737%29.jpg'),
    alt: 'Sông Đồng Nai tại Biên Hòa',
    author: 'Gary Todd',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dong_Nai_River_in_Bien_Hoa_(15286968737).jpg',
  },
};

export const featuredLocations = [
  { code: '79', name: 'TP. Hồ Chí Minh', large: true },
  { code: '01', name: 'Hà Nội' },
  { code: '48', name: 'Đà Nẵng' },
  { code: '74', name: 'Bình Dương' },
  { code: '75', name: 'Đồng Nai' },
].map((location) => ({ ...location, image: locationImages[location.code] }));

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
    title: 'Dự án bất động sản',
    text: 'Thông tin quy mô, tiến độ, giai đoạn mở bán và tin đăng của các dự án nổi bật trên cả nước.',
    to: '/projects',
  },
  {
    title: 'Wiki BĐS',
    text: 'Kiến thức, kinh nghiệm mua bán, cho thuê, vay mua nhà, pháp lý và phong thủy cho người tìm nhà.',
    to: '/wiki',
  },
];
