// Cấu trúc menu header.
// Mục con của "Nhà đất bán" / "Nhà đất cho thuê" chỉ gồm các loại BĐS có trong database (enum PropertyType).
import { wikiCategories } from '../data/wikiArticles';
import { utilityTools } from './utilities';

function listingLink(transactionType, propertyType) {
  const params = new URLSearchParams({ transactionType });
  if (propertyType) params.set('propertyType', propertyType);
  return `/listings?${params.toString()}`;
}

const saleItems = [
  ['Bán căn hộ chung cư', 'Apartment'],
  ['Bán nhà riêng', 'House'],
  ['Bán nhà biệt thự, liền kề', 'Villa'],
  ['Bán shophouse, nhà phố thương mại', 'Shophouse'],
  ['Bán đất, đất nền', 'Land'],
];

const rentItems = [
  ['Cho thuê căn hộ chung cư', 'RentalApartment'],
  ['Cho thuê nhà riêng', 'RentalHouse'],
  ['Cho thuê văn phòng', 'Office'],
  ['Cho thuê kho, nhà xưởng', 'Warehouse'],
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
    children: wikiCategories.map((category) => ({ label: category.name, to: `/wiki/${category.slug}` })),
  },
  {
    label: 'Tiện ích',
    to: '/utilities',
    children: utilityTools.map((tool) => ({ label: tool.title, to: `/utilities/${tool.slug}` })),
  },
];

// seller: true = chỉ hiện với tài khoản được đăng tin (Người bán, Môi giới, Quản trị).
export const accountMenu = [
  { label: "Tổng quan", to: "/seller/dashboard", seller: true },
  { label: "Quản lý tin đăng", to: "/seller/listings", seller: true },
  { label: "Quản lý khách hàng", to: "/seller/customers", seller: true },
  { label: "Quản trị hệ thống", to: "/admin", admin: true },
  { label: "Cài đặt tài khoản", to: "/profile" },
  { label: "Đổi mật khẩu", to: "/profile/password" },
];

export const SELLER_ROLES = ["Seller", "Agent", "Admin"];

/** Tài khoản có được đăng tin (vào khu vực quản lý của người bán) hay không. */
export const canManageListings = (user) => SELLER_ROLES.includes(user?.role);

/** Menu tài khoản theo vai trò: người mua chỉ thấy các mục cài đặt tài khoản. */
export const accountMenuFor = (user) =>
  accountMenu.filter((item) => (!item.seller || canManageListings(user)) && (!item.admin || user?.role === 'Admin'));
