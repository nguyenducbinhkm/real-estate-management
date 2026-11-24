// Danh sách công cụ hỗ trợ tiện ích (trang /utilities).
export const utilityTools = [
  {
    slug: 'tinh-lai-vay',
    title: 'Tính lãi vay mua nhà',
    short: 'Ước tính số tiền trả góp hằng tháng',
    description: 'Tính tiền gốc và lãi phải trả mỗi tháng theo hai cách: dư nợ giảm dần hoặc trả góp đều.',
    icon: '%',
  },
  {
    slug: 'chi-phi-lam-nha',
    title: 'Dự toán chi phí xây nhà',
    short: 'Ước tính chi phí xây dựng theo diện tích',
    description: 'Ước tính diện tích xây dựng quy đổi và chi phí phần thô, hoàn thiện theo số tầng, móng, mái.',
    icon: '₫',
  },
  {
    slug: 'xem-tuoi-xay-nha',
    title: 'Xem tuổi xây nhà',
    short: 'Kiểm tra Kim Lâu, Hoang Ốc, Tam Tai',
    description: 'Xem năm dự định xây nhà có phạm Kim Lâu, Hoang Ốc, Tam Tai với tuổi gia chủ hay không.',
    icon: '☯',
  },
  {
    slug: 'huong-nha-hop-tuoi',
    title: 'Xem hướng nhà hợp tuổi',
    short: 'Hướng tốt, hướng xấu theo Bát trạch',
    description: 'Xác định cung mệnh theo năm sinh, giới tính và 4 hướng tốt, 4 hướng xấu theo Bát trạch.',
    icon: '🧭',
  },
];

export function getUtility(slug) {
  return utilityTools.find((tool) => tool.slug === slug);
}
