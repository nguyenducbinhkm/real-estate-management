// Nội dung Wiki BĐS – bài hướng dẫn do BS Realty tự biên soạn, mang tính tham khảo.
// Các con số về thuế, phí, quy định có thể thay đổi; luôn kiểm tra văn bản pháp luật hiện hành.
import { propertyImageSet as img } from './propertyImages';

export const wikiCategories = [
  { slug: 'mua-bds', name: 'Mua BĐS', description: 'Kinh nghiệm chọn nhà, kiểm tra pháp lý và các bước mua bán an toàn.', image: img.apt1 },
  { slug: 'ban-bds', name: 'Bán BĐS', description: 'Định giá, đăng tin hiệu quả và thủ tục sang tên khi bán nhà đất.', image: img.house1 },
  { slug: 'thue-bds', name: 'Thuê BĐS', description: 'Lưu ý khi thuê nhà, hợp đồng thuê và quyền lợi của người thuê, người cho thuê.', image: img.room1 },
  { slug: 'tai-chinh', name: 'Tài chính BĐS', description: 'Vay mua nhà, lập kế hoạch tài chính và các khoản thuế phí cần biết.', image: img.office1 },
  { slug: 'quy-hoach-phap-ly', name: 'Quy hoạch - Pháp lý', description: 'Sổ đỏ, sổ hồng, quy hoạch và các giấy tờ quan trọng trong giao dịch.', image: img.land1 },
  { slug: 'noi-ngoai-that', name: 'Nội - Ngoại thất', description: 'Bố trí không gian, chọn vật liệu và nội thất cho từng loại nhà.', image: img.room2 },
  { slug: 'phong-tuc', name: 'Phong tục', description: 'Phong tục khi xây nhà, nhập trạch và quan niệm phong thủy phổ biến.', image: img.villa1 },
];

export const wikiArticles = [
  /* ------------------------------- Mua BĐS ------------------------------- */
  {
    slug: 'quy-trinh-mua-nha-lan-dau',
    category: 'mua-bds',
    title: 'Quy trình 7 bước mua nhà lần đầu',
    summary: 'Từ xác định nhu cầu, kiểm tra pháp lý đến ký hợp đồng và sang tên – những việc người mua lần đầu cần làm theo thứ tự.',
    readMinutes: 6,
    updatedAt: '2026-11-10',
    image: img.apt2,
    sections: [
      { heading: '1. Xác định nhu cầu và ngân sách', paragraphs: ['Liệt kê rõ mục đích (để ở hay đầu tư), số người ở, khu vực ưu tiên (gần nơi làm việc, trường học) và tổng số tiền có thể chi. Nên dành ra khoảng 3–5% giá trị nhà cho thuế, phí và sửa chữa.'] },
      { heading: '2. Tìm hiểu thị trường', paragraphs: ['So sánh giá rao bán của ít nhất 5–10 căn tương tự trong cùng khu vực để biết mức giá hợp lý. Chú ý giá/m², tầng, hướng, tình trạng pháp lý.'] },
      { heading: '3. Xem nhà thực tế', bullets: ['Đi xem vào cả ban ngày và buổi tối để đánh giá ánh sáng, tiếng ồn, an ninh.', 'Kiểm tra tường, trần có thấm dột, nứt; hệ thống điện nước; áp lực nước.', 'Hỏi hàng xóm về ngập lụt, tranh chấp, quy hoạch khu vực.'] },
      { heading: '4. Kiểm tra pháp lý', paragraphs: ['Yêu cầu xem bản gốc Giấy chứng nhận (sổ đỏ/sổ hồng), đối chiếu tên chủ sở hữu, diện tích, thửa đất. Có thể đề nghị văn phòng đăng ký đất đai cung cấp thông tin tình trạng thế chấp, tranh chấp của thửa đất.'] },
      { heading: '5. Đặt cọc', paragraphs: ['Lập hợp đồng đặt cọc bằng văn bản, ghi rõ số tiền, thời hạn ký hợp đồng mua bán và mức phạt nếu một bên vi phạm. Không nên đặt cọc số tiền lớn khi chưa kiểm tra xong pháp lý.'] },
      { heading: '6. Ký hợp đồng mua bán có công chứng', paragraphs: ['Hợp đồng chuyển nhượng nhà đất giữa cá nhân phải được công chứng hoặc chứng thực. Đọc kỹ điều khoản thanh toán, bàn giao và trách nhiệm nộp thuế phí.'] },
      { heading: '7. Sang tên và nhận bàn giao', paragraphs: ['Nộp hồ sơ đăng ký biến động tại văn phòng đăng ký đất đai, hoàn thành nghĩa vụ thuế, phí và nhận Giấy chứng nhận mang tên mình. Kiểm tra lại hiện trạng nhà khi nhận bàn giao.'] },
    ],
    relatedTool: 'tinh-lai-vay',
    tags: ['Mua nhà', 'Pháp lý', 'Đặt cọc'],
  },
  {
    slug: 'kinh-nghiem-chon-can-ho-chung-cu',
    category: 'mua-bds',
    title: 'Kinh nghiệm chọn mua căn hộ chung cư',
    summary: 'Những tiêu chí quan trọng khi chọn căn hộ: chủ đầu tư, vị trí, thiết kế, phí dịch vụ và tình trạng pháp lý của dự án.',
    readMinutes: 5,
    updatedAt: '2026-11-08',
    image: img.apt3,
    sections: [
      { heading: 'Uy tín chủ đầu tư và tiến độ', paragraphs: ['Tìm hiểu các dự án chủ đầu tư đã bàn giao: chất lượng xây dựng, việc cấp sổ hồng cho cư dân, cách vận hành tòa nhà. Với dự án đang xây, kiểm tra giấy phép xây dựng và văn bản cho phép bán nhà hình thành trong tương lai.'] },
      { heading: 'Vị trí căn hộ trong tòa nhà', bullets: ['Tầng trung thường cân bằng giữa view, tiếng ồn và thời gian chờ thang máy.', 'Căn góc thoáng hơn nhưng giá cao hơn.', 'Tránh căn sát phòng rác, trục kỹ thuật, ngay cửa thang máy.'] },
      { heading: 'Thiết kế và diện tích sử dụng', paragraphs: ['Phân biệt diện tích tim tường và diện tích thông thủy (diện tích sử dụng thực tế, thường được ghi trên sổ hồng). Ưu tiên căn có phòng ngủ, phòng khách đón sáng tự nhiên, ít góc chết.'] },
      { heading: 'Chi phí sau khi nhận nhà', paragraphs: ['Hỏi rõ phí quản lý hằng tháng, phí gửi xe, phí bảo trì (thường 2% giá trị căn hộ, nộp một lần) để tính vào kế hoạch tài chính.'] },
    ],
    tags: ['Chung cư', 'Căn hộ'],
  },

  /* ------------------------------- Bán BĐS ------------------------------- */
  {
    slug: 'dinh-gia-nha-truoc-khi-ban',
    category: 'ban-bds',
    title: 'Cách định giá nhà trước khi rao bán',
    summary: 'Ba cách định giá phổ biến giúp bạn đặt mức giá hợp lý, bán nhanh mà không bị thiệt.',
    readMinutes: 4,
    updatedAt: '2026-11-05',
    image: img.house2,
    sections: [
      { heading: 'So sánh với nhà tương tự', paragraphs: ['Tìm các căn cùng khu vực, cùng loại hình và diện tích đang rao bán hoặc đã giao dịch gần đây. Điều chỉnh theo khác biệt về mặt tiền, hẻm, hướng, số tầng, tình trạng nội thất.'] },
      { heading: 'Tính theo chi phí', paragraphs: ['Giá trị = giá đất + giá trị còn lại của công trình (chi phí xây mới trừ phần hao mòn theo số năm sử dụng). Cách này hữu ích với nhà phố, nhà riêng.'] },
      { heading: 'Tính theo dòng tiền cho thuê', paragraphs: ['Với BĐS cho thuê (văn phòng, shophouse), có thể ước tính giá bằng thu nhập cho thuê ròng hằng năm chia cho tỷ suất lợi nhuận kỳ vọng của thị trường.'] },
      { heading: 'Mẹo đặt giá', bullets: ['Đặt giá cao hơn giá kỳ vọng một chút để có khoảng thương lượng.', 'Nếu sau 1–2 tháng ít người hỏi, nên xem lại giá.', 'Chuẩn bị sẵn giấy tờ để tạo niềm tin với người mua.'] },
    ],
    tags: ['Bán nhà', 'Định giá'],
  },
  {
    slug: 'thu-tuc-sang-ten-so-do',
    category: 'ban-bds',
    title: 'Thủ tục sang tên sổ đỏ khi mua bán nhà đất',
    summary: 'Hồ sơ cần chuẩn bị, nơi nộp và các khoản thuế phí thường gặp khi chuyển nhượng nhà đất giữa cá nhân.',
    readMinutes: 5,
    updatedAt: '2026-11-02',
    image: img.land2,
    sections: [
      { heading: 'Bước 1: Công chứng hợp đồng chuyển nhượng', paragraphs: ['Hai bên mang Giấy chứng nhận bản gốc, giấy tờ tùy thân, giấy tờ về tình trạng hôn nhân đến tổ chức công chứng để ký hợp đồng.'] },
      { heading: 'Bước 2: Kê khai và nộp thuế, lệ phí', bullets: ['Thuế thu nhập cá nhân của bên bán: thường là 2% giá chuyển nhượng.', 'Lệ phí trước bạ của bên mua: thường là 0,5% giá trị nhà đất theo bảng giá.', 'Hai bên có thể thỏa thuận bên nào nộp, nên ghi rõ trong hợp đồng.'] },
      { heading: 'Bước 3: Nộp hồ sơ đăng ký biến động', paragraphs: ['Nộp tại văn phòng/chi nhánh văn phòng đăng ký đất đai hoặc bộ phận một cửa. Hồ sơ gồm đơn đăng ký biến động, hợp đồng đã công chứng, Giấy chứng nhận bản gốc và tờ khai thuế.'] },
      { heading: 'Bước 4: Nhận kết quả', paragraphs: ['Sau khi hoàn thành nghĩa vụ tài chính, bên mua nhận Giấy chứng nhận đã cập nhật tên chủ mới. Thời gian giải quyết tùy địa phương.'] },
    ],
    tags: ['Sang tên', 'Thuế phí', 'Pháp lý'],
  },

  /* ------------------------------- Thuê BĐS ------------------------------- */
  {
    slug: 'luu-y-khi-thue-nha',
    category: 'thue-bds',
    title: '10 điều cần kiểm tra trước khi thuê nhà',
    summary: 'Danh sách kiểm tra giúp người thuê tránh rủi ro mất cọc, phát sinh chi phí và tranh chấp với chủ nhà.',
    readMinutes: 4,
    updatedAt: '2026-10-28',
    image: img.room1,
    sections: [
      { heading: 'Trước khi đặt cọc', bullets: ['Xác minh người cho thuê là chủ nhà hoặc được chủ nhà ủy quyền.', 'Hỏi rõ giá thuê đã gồm phí quản lý, internet, gửi xe chưa.', 'Hỏi giá điện, nước (theo giá nhà nước hay giá chủ nhà).', 'Kiểm tra an ninh, phòng cháy chữa cháy, lối thoát hiểm.'] },
      { heading: 'Khi xem nhà', bullets: ['Chụp ảnh hiện trạng nội thất, tường, sàn trước khi dọn vào.', 'Thử vòi nước, bình nóng lạnh, điều hòa, ổ điện.', 'Hỏi về giờ giấc, quy định nuôi thú cưng, khách đến chơi.'] },
      { heading: 'Khi ký hợp đồng', bullets: ['Ghi rõ thời hạn thuê, kỳ thanh toán, mức tăng giá (nếu có).', 'Điều kiện trả lại tiền cọc và thời gian báo trước khi chấm dứt.', 'Trách nhiệm sửa chữa hư hỏng của mỗi bên.'] },
    ],
    tags: ['Thuê nhà', 'Hợp đồng'],
  },
  {
    slug: 'hop-dong-thue-nha-can-co-gi',
    category: 'thue-bds',
    title: 'Hợp đồng thuê nhà cần có những nội dung gì?',
    summary: 'Các điều khoản nên có trong hợp đồng thuê nhà để bảo vệ quyền lợi của cả người thuê và người cho thuê.',
    readMinutes: 4,
    updatedAt: '2026-10-20',
    image: img.apt1,
    sections: [
      { heading: 'Thông tin cơ bản', bullets: ['Thông tin hai bên, địa chỉ và diện tích nhà cho thuê.', 'Mục đích thuê (để ở, kinh doanh, văn phòng).', 'Danh sách nội thất, thiết bị bàn giao kèm hiện trạng.'] },
      { heading: 'Giá thuê và thanh toán', paragraphs: ['Ghi rõ giá thuê, đồng tiền thanh toán, kỳ thanh toán, hình thức (tiền mặt/chuyển khoản), tiền cọc và điều kiện hoàn cọc.'] },
      { heading: 'Quyền và nghĩa vụ', paragraphs: ['Quy định ai chịu trách nhiệm sửa chữa lớn, nhỏ; có được cho thuê lại hay sửa chữa cải tạo không; việc đăng ký tạm trú cho người thuê.'] },
      { heading: 'Chấm dứt hợp đồng', paragraphs: ['Thời gian báo trước, các trường hợp được đơn phương chấm dứt và mức bồi thường nếu vi phạm. Hợp đồng có thể công chứng để tăng tính chắc chắn khi có tranh chấp.'] },
    ],
    tags: ['Hợp đồng', 'Cho thuê'],
  },

  /* ------------------------------- Tài chính ------------------------------- */
  {
    slug: 'vay-mua-nha-can-biet',
    category: 'tai-chinh',
    title: 'Vay ngân hàng mua nhà: những điều cần biết',
    summary: 'Hạn mức vay, lãi suất ưu đãi và thả nổi, hồ sơ vay và cách tính khả năng trả nợ hằng tháng.',
    readMinutes: 6,
    updatedAt: '2026-11-12',
    image: img.office2,
    sections: [
      { heading: 'Hạn mức và thời hạn vay', paragraphs: ['Ngân hàng thường cho vay một tỷ lệ nhất định trên giá trị tài sản bảo đảm (phổ biến 50–70%, tùy ngân hàng và hồ sơ), thời hạn có thể đến 20–25 năm.'] },
      { heading: 'Lãi suất ưu đãi và thả nổi', paragraphs: ['Nhiều gói vay có lãi suất cố định ưu đãi trong 6–24 tháng đầu, sau đó thả nổi bằng lãi suất cơ sở cộng biên độ. Hãy hỏi rõ biên độ, cách điều chỉnh và phí trả nợ trước hạn.'] },
      { heading: 'Khả năng trả nợ', paragraphs: ['Nguyên tắc an toàn: tổng tiền trả nợ hằng tháng không nên vượt quá 40–50% thu nhập ổn định của gia đình. Dùng công cụ Tính lãi vay để thử các phương án thời hạn và lãi suất.'] },
      { heading: 'Hồ sơ vay thường gồm', bullets: ['Giấy tờ tùy thân, tình trạng hôn nhân, cư trú.', 'Chứng minh thu nhập: hợp đồng lao động, sao kê lương, giấy tờ kinh doanh.', 'Giấy tờ về tài sản mua và tài sản bảo đảm.'] },
    ],
    relatedTool: 'tinh-lai-vay',
    tags: ['Vay mua nhà', 'Lãi suất'],
  },
  {
    slug: 'cac-khoan-thue-phi-khi-mua-ban',
    category: 'tai-chinh',
    title: 'Các khoản thuế, phí khi mua bán nhà đất',
    summary: 'Tổng hợp các khoản chi thường gặp ngoài giá nhà để chủ động chuẩn bị tài chính.',
    readMinutes: 4,
    updatedAt: '2026-11-01',
    image: img.apt2,
    sections: [
      { heading: 'Thuế và lệ phí nhà nước', bullets: ['Thuế thu nhập cá nhân khi chuyển nhượng: thường 2% giá chuyển nhượng (trừ trường hợp được miễn).', 'Lệ phí trước bạ: thường 0,5% giá trị nhà đất.', 'Lệ phí cấp Giấy chứng nhận, phí thẩm định hồ sơ: theo quy định của từng tỉnh.'] },
      { heading: 'Phí dịch vụ', bullets: ['Phí công chứng hợp đồng: tính theo giá trị hợp đồng, có mức trần.', 'Phí môi giới (nếu có): theo thỏa thuận, thường do bên bán trả.', 'Với căn hộ mới: 2% phí bảo trì chung cư.'] },
      { heading: 'Lời khuyên', paragraphs: ['Ghi rõ trong hợp đồng bên nào chịu từng khoản để tránh tranh cãi. Nên dự trù thêm khoảng 3–5% giá trị nhà cho các chi phí này và sửa chữa ban đầu.'] },
    ],
    tags: ['Thuế', 'Phí', 'Chi phí'],
  },

  /* ---------------------------- Quy hoạch - Pháp lý ---------------------------- */
  {
    slug: 'phan-biet-so-do-so-hong',
    category: 'quy-hoach-phap-ly',
    title: 'Phân biệt sổ đỏ, sổ hồng và Giấy chứng nhận',
    summary: 'Hiểu đúng các loại giấy tờ nhà đất thường gặp và những thông tin cần kiểm tra trên Giấy chứng nhận.',
    readMinutes: 4,
    updatedAt: '2026-10-25',
    image: img.land1,
    sections: [
      { heading: 'Tên gọi quen thuộc', paragraphs: ['"Sổ đỏ" thường chỉ Giấy chứng nhận quyền sử dụng đất (bìa màu đỏ) cấp trước đây; "sổ hồng" chỉ giấy chứng nhận quyền sở hữu nhà ở. Hiện nay các loại này được thống nhất thành Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất.'] },
      { heading: 'Thông tin cần kiểm tra', bullets: ['Tên người sử dụng đất, chủ sở hữu tài sản.', 'Số thửa, tờ bản đồ, diện tích, mục đích sử dụng (đất ở, đất nông nghiệp…), thời hạn sử dụng.', 'Trang ghi chú những thay đổi: thế chấp, chuyển nhượng, tách thửa.'] },
      { heading: 'Lưu ý', paragraphs: ['Giấy chứng nhận đã cấp trước đây vẫn có giá trị pháp lý, không bắt buộc đổi sang mẫu mới. Không giao dịch khi chỉ có bản photo hoặc giấy viết tay.'] },
    ],
    tags: ['Sổ đỏ', 'Sổ hồng', 'Giấy chứng nhận'],
  },
  {
    slug: 'kiem-tra-quy-hoach-truoc-khi-mua',
    category: 'quy-hoach-phap-ly',
    title: 'Cách kiểm tra quy hoạch trước khi mua đất',
    summary: 'Những nguồn tra cứu quy hoạch và các dấu hiệu cảnh báo đất nằm trong quy hoạch, giải tỏa.',
    readMinutes: 4,
    updatedAt: '2026-10-18',
    image: img.land2,
    sections: [
      { heading: 'Vì sao phải kiểm tra quy hoạch', paragraphs: ['Thửa đất nằm trong quy hoạch giao thông, công trình công cộng có thể bị hạn chế xây dựng hoặc thu hồi. Đất trong quy hoạch cũng khó vay ngân hàng và khó bán lại.'] },
      { heading: 'Nguồn tra cứu', bullets: ['Cổng thông tin quy hoạch của tỉnh/thành phố (nhiều nơi có bản đồ trực tuyến).', 'Phòng Quản lý đô thị hoặc Phòng Tài nguyên và Môi trường cấp huyện.', 'Văn phòng đăng ký đất đai khi đề nghị cung cấp thông tin thửa đất.'] },
      { heading: 'Dấu hiệu cần cẩn trọng', bullets: ['Giá thấp bất thường so với khu vực.', 'Người bán né tránh cho xem bản gốc giấy tờ.', 'Khu vực có thông báo thu hồi đất, cắm mốc lộ giới mới.'] },
    ],
    tags: ['Quy hoạch', 'Mua đất'],
  },

  /* ---------------------------- Nội - Ngoại thất ---------------------------- */
  {
    slug: 'bo-tri-noi-that-can-ho-nho',
    category: 'noi-ngoai-that',
    title: 'Bố trí nội thất cho căn hộ diện tích nhỏ',
    summary: 'Gợi ý chọn màu sắc, đồ nội thất đa năng và cách tận dụng ánh sáng để căn hộ nhỏ rộng rãi hơn.',
    readMinutes: 4,
    updatedAt: '2026-10-15',
    image: img.room2,
    sections: [
      { heading: 'Màu sắc và ánh sáng', paragraphs: ['Ưu tiên tông màu sáng (trắng, be, xám nhạt) cho tường và trần; dùng rèm mỏng để lấy sáng tự nhiên. Gương lớn giúp không gian có chiều sâu.'] },
      { heading: 'Nội thất đa năng', bullets: ['Giường có ngăn kéo, sofa giường, bàn gấp gắn tường.', 'Tủ kịch trần để tận dụng chiều cao.', 'Hạn chế đồ trang trí rời, chọn đồ có chân cao để sàn thoáng.'] },
      { heading: 'Phân chia không gian', paragraphs: ['Dùng kệ sách, thảm hoặc ánh sáng để phân khu thay vì vách cứng. Khu bếp và phòng khách liên thông giúp căn hộ thoáng hơn.'] },
    ],
    tags: ['Nội thất', 'Căn hộ nhỏ'],
  },
  {
    slug: 'chon-vat-lieu-ngoai-that-nha-pho',
    category: 'noi-ngoai-that',
    title: 'Chọn vật liệu ngoại thất bền cho nhà phố',
    summary: 'Vật liệu mặt tiền, mái và sân phù hợp khí hậu nóng ẩm, mưa nhiều ở Việt Nam.',
    readMinutes: 4,
    updatedAt: '2026-10-10',
    image: img.shop1,
    sections: [
      { heading: 'Mặt tiền', bullets: ['Sơn ngoại thất có khả năng chống thấm, chống bám bẩn.', 'Đá ốp hoặc gạch thẻ cho phần chân tường dễ bám bẩn.', 'Lam chắn nắng giúp giảm nhiệt cho hướng Tây.'] },
      { heading: 'Mái và chống thấm', paragraphs: ['Sân thượng, mái bằng cần lớp chống thấm và lớp cách nhiệt (gạch chống nóng, tấm cách nhiệt). Mái tôn nên chọn loại có lớp cách âm, cách nhiệt.'] },
      { heading: 'Sân và lối đi', paragraphs: ['Chọn gạch có độ nhám để chống trơn khi mưa; bố trí độ dốc và rãnh thoát nước hợp lý.'] },
    ],
    relatedTool: 'chi-phi-lam-nha',
    tags: ['Ngoại thất', 'Vật liệu', 'Nhà phố'],
  },

  /* ------------------------------- Phong tục ------------------------------- */
  {
    slug: 'xem-tuoi-lam-nha',
    category: 'phong-tuc',
    title: 'Xem tuổi làm nhà: Kim Lâu, Hoang Ốc, Tam Tai là gì?',
    summary: 'Giải thích ba hạn dân gian thường được xem khi làm nhà và cách "mượn tuổi" theo phong tục.',
    readMinutes: 5,
    updatedAt: '2026-11-06',
    image: img.villa1,
    sections: [
      { heading: 'Kim Lâu', paragraphs: ['Tính theo tuổi mụ (tuổi âm). Lấy tuổi mụ chia cho 9, nếu dư 1, 3, 6 hoặc 8 thì phạm Kim Lâu (lần lượt ảnh hưởng bản thân, vợ/chồng, con cái, tài sản theo quan niệm dân gian).'] },
      { heading: 'Hoang Ốc', paragraphs: ['Chia tuổi thành 6 cung lặp lại: Nhất Cát, Nhì Nghi, Tam Địa Sát, Tứ Tấn Tài, Ngũ Thọ Tử, Lục Hoang Ốc. Ba cung Tam Địa Sát, Ngũ Thọ Tử, Lục Hoang Ốc được xem là không nên làm nhà.'] },
      { heading: 'Tam Tai', paragraphs: ['Mỗi nhóm tuổi tam hợp gặp Tam Tai trong ba năm liên tiếp, ví dụ tuổi Thân, Tý, Thìn gặp Tam Tai vào các năm Dần, Mão, Thìn.'] },
      { heading: 'Mượn tuổi', paragraphs: ['Khi năm dự định xây không đẹp, gia chủ có thể nhờ người thân hợp tuổi đứng ra làm lễ động thổ. Dùng công cụ Xem tuổi xây nhà để tra nhanh.'] },
    ],
    relatedTool: 'xem-tuoi-xay-nha',
    tags: ['Phong tục', 'Xây nhà'],
  },
  {
    slug: 'nghi-thuc-nhap-trach',
    category: 'phong-tuc',
    title: 'Nghi thức nhập trạch về nhà mới',
    summary: 'Những việc thường làm khi chuyển về nhà mới theo phong tục: chọn ngày, chuẩn bị lễ và các vật dụng mang vào nhà đầu tiên.',
    readMinutes: 3,
    updatedAt: '2026-10-30',
    image: img.villa2,
    sections: [
      { heading: 'Chọn ngày giờ', paragraphs: ['Nhiều gia đình chọn ngày hoàng đạo, hợp tuổi gia chủ để nhập trạch. Nên chọn thời điểm mọi thành viên có mặt đầy đủ.'] },
      { heading: 'Chuẩn bị', bullets: ['Dọn dẹp, lau chùi nhà sạch sẽ trước ngày nhập trạch.', 'Mâm lễ cúng thổ công, gia tiên tùy phong tục từng vùng.', 'Gia chủ mang bát hương, gạo, muối, nước vào nhà đầu tiên.'] },
      { heading: 'Sau nhập trạch', paragraphs: ['Thắp sáng đèn, nấu nồi nước hoặc nồi cơm đầu tiên với ý nghĩa ấm cúng, đủ đầy; mời họ hàng, hàng xóm đến chung vui.'] },
    ],
    relatedTool: 'huong-nha-hop-tuoi',
    tags: ['Nhập trạch', 'Nhà mới'],
  },
];

// Bài do ban biên tập chọn làm "nổi bật" ở cột phải (chưa có thống kê lượt xem thật).
export const featuredWikiSlugs = [
  'quy-trinh-mua-nha-lan-dau',
  'vay-mua-nha-can-biet',
  'thu-tuc-sang-ten-so-do',
  'phan-biet-so-do-so-hong',
  'luu-y-khi-thue-nha',
];

export function getWikiCategory(slug) {
  return wikiCategories.find((category) => category.slug === slug);
}

export function getWikiArticle(categorySlug, articleSlug) {
  return wikiArticles.find((article) => article.category === categorySlug && article.slug === articleSlug);
}

export function articlesInCategory(slug) {
  return wikiArticles.filter((article) => article.category === slug);
}

export function formatWikiDate(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}
