// Dữ liệu MẪU cho trang Tin tức, lấy cảm hứng từ 4 bài trên chuyên trang tin tức của Batdongsan.com.vn.
// Nội dung dưới đây là phần tóm tắt do BS Realty tự viết lại (không chép nguyên văn);
// mỗi bài có link về bài gốc để người đọc xem đầy đủ. Thay bằng dữ liệu từ API khi backend có.

export const newsCategories = ['Thị trường', 'Dự án', 'Sự kiện'];

// Ảnh minh họa lấy từ Wikimedia Commons (giấy phép Creative Commons, phải ghi tác giả và giấy phép).
// Ảnh không phải ảnh gốc của bài viết; chỉ minh họa chủ đề.
const commons = (file, width = 1280) =>
  `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}/${width}px-${file.split('/').pop()}`;

const newsImages = {
  'nhan-dien-co-hoi-trong-thi-truong-bat-dong-san-phan-hoa': {
    url: commons('1/1a/Trung_t%C3%A2m_h%C3%A0nh_ch%C3%ADnh_m%E1%BB%9Bi_B%C3%ACnh_D%C6%B0%C6%A1ng.JPG'),
    alt: 'Trung tâm hành chính mới tỉnh Bình Dương',
    author: 'Eternal Dragon',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Trung_t%C3%A2m_h%C3%A0nh_ch%C3%ADnh_m%E1%BB%9Bi_B%C3%ACnh_D%C6%B0%C6%A1ng.JPG',
  },
  'nha-o-xa-hoi-phuoc-an-gateway-co-hoi-an-cu-cho-gia-dinh-tre': {
    url: commons('a/a4/Hoang_Mai_apartment_complexes_in_2016.jpg'),
    alt: 'Các khu chung cư tại quận Hoàng Mai, Hà Nội',
    author: 'Vuong Tri Binh',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hoang_Mai_apartment_complexes_in_2016.jpg',
  },
  'bat-dong-san-wellness-len-ngoi-an-phuoc-riverside': {
    url: commons('7/7a/Saigon_at_Blue_Hour.jpg'),
    alt: 'Sài Gòn ven sông lúc hoàng hôn',
    author: 'Radek Kucharski',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Saigon_at_Blue_Hour.jpg',
  },
  'devco-x-propertyguru-diem-den-khong-phai-chieu-cao-tao-nen-gia-tri-toa-thap': {
    url: commons('d/dc/Vincom_Landmark_81_%2849012084043%29.jpg'),
    alt: 'Tòa tháp Landmark 81, TP. Hồ Chí Minh',
    author: 'Nick',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vincom_Landmark_81_(49012084043).jpg',
  },
};

const rawArticles = [
  {
    slug: 'nhan-dien-co-hoi-trong-thi-truong-bat-dong-san-phan-hoa',
    title: 'Nhận diện cơ hội trong thị trường bất động sản phân hóa',
    category: 'Thị trường',
    author: 'Lan Chi',
    publishedAt: '2026-10-29T17:00:00+07:00',
    readMinutes: 9,
    views: 15840,
    sourceName: 'Batdongsan.com.vn',
    sourceUrl: 'https://wiki.batdongsan.com.vn/tin-tuc/nhan-dien-co-hoi-trong-thi-truong-bat-dong-san-phan-hoa-858117',
    summary:
      'Tại buổi VIP Coffee Talk ở Bình Dương, các chuyên gia và môi giới cùng nhìn lại thị trường TP.HCM – Bình Dương: sức mua giảm vì lãi suất, nhưng căn hộ vừa túi tiền và khu vực gần hạ tầng vẫn có thanh khoản.',
    sections: [
      {
        heading: 'Sức mua giảm, áp lực lãi suất lan rộng',
        paragraphs: [
          'Theo khảo sát quý 3 được chia sẻ tại chương trình, gần một nửa môi giới phân khúc chung cư cho biết giao dịch giảm hơn 50% so với quý trước. Tỷ lệ hấp thụ ở một số dự án chỉ còn khoảng 50–60%, thấp hơn nhiều so với mức khoảng 80% khi thị trường thuận lợi.',
          'Ở mảng nhà thổ cư, môi giới địa phương ghi nhận số giao dịch thành công trong năm giảm mạnh; người bán nhiều hơn người mua vì chi phí vay cao khiến cả người mua ở thực lẫn nhà đầu tư đều thận trọng.',
        ],
      },
      {
        heading: 'Phân hóa theo dòng sản phẩm',
        paragraphs: [
          'Căn hộ có giá 65–70 triệu đồng/m² khiến nhiều người mua ở thực e ngại, trong khi các căn diện tích tối ưu, tổng giá dưới 2 tỷ đồng vẫn bán được đều. Chính sách thanh toán giãn tiến độ được đánh giá là điểm cộng giúp khách hàng chủ động dòng tiền.',
        ],
      },
      {
        heading: 'Hạ tầng giao thông và nhu cầu thuê quanh khu công nghiệp',
        paragraphs: [
          'Các dự án gần tuyến metro hoặc nút giao lớn được xem là có lợi thế nhờ đầu tư công được đẩy mạnh. Nhu cầu thuê nhà của chuyên gia và người lao động quanh các khu công nghiệp tiếp tục tạo dòng tiền cho nhà đầu tư.',
        ],
      },
      {
        heading: 'Hướng đi cho chủ đầu tư và môi giới',
        paragraphs: [
          'Chủ đầu tư được khuyến nghị chuyển trọng tâm sang người mua ở thực với các ưu đãi như ân hạn nợ gốc, hỗ trợ lãi vay, giảm khoản thanh toán ban đầu. Với môi giới, khả năng tư vấn tài chính, đầu tư marketing bài bản và thông tin đăng tải đáng tin cậy là yếu tố quyết định.',
        ],
      },
    ],
    tags: ['Thị trường', 'Bình Dương', 'Hồ Chí Minh', 'Căn hộ'],
  },
  {
    slug: 'nha-o-xa-hoi-phuoc-an-gateway-co-hoi-an-cu-cho-gia-dinh-tre',
    title: 'Nhà ở xã hội Phước An Gateway – cơ hội an cư cho gia đình trẻ tại Nhơn Trạch, Đồng Nai',
    category: 'Dự án',
    author: 'Lan Chi',
    publishedAt: '2026-11-12T11:00:00+07:00',
    readMinutes: 5,
    views: 9320,
    sourceName: 'Batdongsan.com.vn',
    sourceUrl:
      'https://wiki.batdongsan.com.vn/tin-tuc/nha-o-xa-hoi-phuoc-an-gateway-%E2%80%93-co-hoi-an-cu-cho-gia-dinh-tre-tai-nhon-trach-tp.-dong-nai.-858271',
    summary:
      'Dự án nhà ở xã hội tại xã Phước An (Đồng Nai) có giá từ khoảng 568 triệu đồng/căn, người mua chỉ cần chuẩn bị 20% vốn tự có, phần còn lại có thể vay ưu đãi dài hạn.',
    sections: [
      {
        heading: 'Bài toán an cư của người trẻ',
        paragraphs: [
          'Giá căn hộ sơ cấp tại TP.HCM và Hà Nội tăng nhanh hơn thu nhập trong nhiều năm, khiến người trẻ dưới 35 tuổi khó sở hữu nhà ở khu vực trung tâm.',
          'Phước An Gateway hướng tới gia đình trẻ và người lao động thu nhập thấp với mức giá từ khoảng 568 triệu đồng mỗi căn. Người mua chuẩn bị khoảng 20% vốn tự có; 80% còn lại có thể vay theo gói mua/thuê mua nhà ở xã hội với lãi suất khoảng 5,4%/năm, thời hạn tới 25 năm.',
        ],
      },
      {
        heading: 'Tiện ích nội khu',
        paragraphs: [
          'Theo quy hoạch, dự án có công viên cây xanh, đường dạo bộ, khu thể thao ngoài trời, nhà trẻ, siêu thị mini, nhà sinh hoạt cộng đồng và hệ thống an ninh, camera giám sát.',
        ],
      },
      {
        heading: 'Kết nối hạ tầng khu vực',
        paragraphs: [
          'Từ dự án mất khoảng 20–30 phút để tới TP.HCM và sân bay Long Thành. Khu vực được quy hoạch kết nối với nhiều công trình trọng điểm như cao tốc Biên Hòa – Vũng Tàu, Bến Lức – Long Thành, Vành đai 3, Vành đai 4 và cảng Cái Mép – Thị Vải.',
        ],
      },
    ],
    tags: ['Nhà ở xã hội', 'Đồng Nai', 'Dự án'],
  },
  {
    slug: 'bat-dong-san-wellness-len-ngoi-an-phuoc-riverside',
    title: 'Bất động sản Wellness lên ngôi: An Phước Riverside phát triển đô thị sống khỏe bên sông',
    category: 'Thị trường',
    author: 'Lan Chi',
    publishedAt: '2026-11-04T07:45:00+07:00',
    readMinutes: 6,
    views: 7410,
    sourceName: 'Batdongsan.com.vn',
    sourceUrl:
      'https://wiki.batdongsan.com.vn/tin-tuc/bat-dong-san-wellness-len-ngoi-an-phuoc-riverside-phat-trien-do-thi-song-khoe-ben-song-858206',
    summary:
      'Người mua nhà ngày càng quan tâm đến môi trường sống tác động tới sức khỏe. Xu hướng Wellness Living đang lan tới khu Nam TP.HCM, với ví dụ là khu đô thị ven sông An Phước Riverside tại Cần Giuộc.',
    sections: [
      {
        heading: 'Khi sức khỏe trở thành giá trị của bất động sản',
        paragraphs: [
          'Theo Global Wellness Institute, thị trường bất động sản Wellness toàn cầu đạt khoảng 876 tỷ USD năm 2025 và có thể lên khoảng 1.800 tỷ USD vào năm 2030. Việt Nam nằm trong nhóm thị trường tăng trưởng đáng chú ý của lĩnh vực này.',
          'Wellness không chỉ là thêm phòng tập hay công viên, mà là quy hoạch đồng bộ thiên nhiên, vận động, nghỉ ngơi và kết nối cộng đồng để thói quen lành mạnh trở thành một phần đời sống hằng ngày.',
        ],
      },
      {
        heading: 'Cần Giuộc và xu hướng dịch chuyển không gian sống',
        paragraphs: [
          'Hạ tầng kết nối như ĐT826C, Nguyễn Văn Tạo, Nguyễn Hữu Thọ, Nguyễn Văn Linh giúp Cần Giuộc gắn kết hơn với TP.HCM. Cùng với các đại dự án lân cận, khu vực có thêm dư địa cho mô hình đô thị gắn với thiên nhiên.',
        ],
      },
      {
        heading: 'An Phước Riverside: mô hình sống khỏe bên sông',
        paragraphs: [
          'Dự án rộng 31,1 ha với khoảng 1.197 sản phẩm, có khoảng 1,4 km bờ kè và đường dạo bộ ven sông. Hệ thống tiện ích theo quy hoạch gồm câu lạc bộ sức khỏe, trung tâm chăm sóc sức khỏe, vườn cảnh quan, khu vui chơi trẻ em, clubhouse và quảng trường cộng đồng.',
        ],
      },
    ],
    tags: ['Wellness', 'Long An', 'Đô thị ven sông'],
  },
  {
    slug: 'devco-x-propertyguru-diem-den-khong-phai-chieu-cao-tao-nen-gia-tri-toa-thap',
    title: 'DevCO x PropertyGuru: Điểm đến, không phải chiều cao, tạo nên giá trị tòa tháp',
    category: 'Sự kiện',
    author: 'Lan Chi',
    publishedAt: '2026-11-10T12:30:00+07:00',
    readMinutes: 5,
    views: 6180,
    sourceName: 'Batdongsan.com.vn',
    sourceUrl: 'https://wiki.batdongsan.com.vn/tin-tuc/devco-x-propertyguru-diem-den-khong-phai-chieu-cao-tao-nen-gia-tri-toa-thap-858232',
    summary:
      'Hội nghị The Tall Building Summit tại Landmark 81 bàn về câu hỏi: điều gì khiến một tòa nhà cao tầng tại Việt Nam xứng đáng với chi phí đầu tư? Trọng tâm đang chuyển từ kỷ lục chiều cao sang hiệu quả vận hành.',
    sections: [
      {
        heading: 'Từ cuộc đua chiều cao đến bài toán hiệu quả',
        paragraphs: [
          'Sự kiện ngày 30/10/2026 quy tụ 56 khách mời từ khoảng 40 tổ chức, có diễn giả đến từ các hãng kiến trúc quốc tế. Theo số liệu được trình bày, thế giới hiện có hơn 2.500 tòa tháp cao từ 200 m trở lên, và xu hướng mới tập trung vào phát thải ròng bằng 0 cùng tái sử dụng kết cấu.',
        ],
      },
      {
        heading: 'Một số con số đáng chú ý',
        paragraphs: [
          'Ở khu trung tâm, diện tích sàn có thể gấp 12–25 lần diện tích đất, giúp giảm chi phí đất trên mỗi m² sàn. Với tòa văn phòng 20–50 tầng, mỗi tầng tăng thêm làm chi phí xây dựng/m² tăng khoảng 0,5–1,3%, trong khi giá thuê cũng có xu hướng cao hơn theo độ cao.',
        ],
      },
      {
        heading: 'Các phiên thảo luận',
        paragraphs: [
          'Hai phiên thảo luận xoay quanh yêu cầu ESG của bên cho vay, tỷ lệ căn hộ – văn phòng trong tòa cao tầng, giá trị kết nối trực tiếp với metro, vật liệu ít carbon và kiểm soát nhiệt cho tòa tháp ở khí hậu Đông Nam Á.',
        ],
      },
    ],
    tags: ['Sự kiện', 'Nhà cao tầng', 'Hồ Chí Minh'],
  },
];

export const newsArticles = rawArticles.map((article) => ({ ...article, image: newsImages[article.slug] || null }));

export function formatNewsDate(iso) {
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
