// Logic thuần của form Đăng tin / Sửa tin (tách khỏi SellerPost.jsx để kiểm thử độc lập, không cần giao diện).
import { findKind } from '../data/listingOptions';
import { MAX_IMAGES } from '../components/seller/ImageUploader';

export const EMPTY = {
  transactionType: 'ForSale',
  propertyType: '',
  provinceCode: '', provinceName: '',
  districtCode: '', districtName: '',
  wardCode: '', wardName: '',
  streetAddress: '',
  title: '',
  description: '',
  priceValue: '',
  priceUnit: 'ty',
  area: '',
  landArea: '',
  bedrooms: '',
  bathrooms: '',
  floors: '',
  legalStatus: '',
  furniture: '',
  hasClearance: false,
  ceilingHeight: '',
  rentalPeriodMonths: '12',
  petsAllowed: false,
  contactPhone: '',
  zaloSame: true,
  zaloPhone: '',
};

export const UNITS = { trieu: 1_000_000, ty: 1_000_000_000 };

// Ô lỗi từ backend → bước chứa ô đó (để nhảy về đúng bước).
export const FIELD_STEP = {
  propertyType: 0, transactionType: 0,
  provinceCode: 1, districtCode: 1, wardCode: 1, streetAddress: 1,
  title: 2, description: 2, price: 2, priceValue: 2, area: 2, landArea: 2, bedrooms: 2, bathrooms: 2, floors: 2,
  contactPhone: 2, zaloPhone: 2,
  legalStatus: 2, furniture: 2, hasClearance: 2, ceilingHeight: 2, rentalPeriodMonths: 2,
  images: 3,
};
// Tên trường của API → tên ô trong form.
export const API_FIELD = { bedroomCount: 'bedrooms', bathroomCount: 'bathrooms', floorNumber: 'floors', imageUrls: 'images', price: 'priceValue' };

export const PHONE = /^\+?[0-9 .]{8,20}$/;
export const draftKey = (userId) => `bds_post_draft_${userId}`;
export const toNumber = (value) => {
  const n = Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
const optionalInt = (value) => (value === '' || value === null ? null : Math.round(toNumber(value)));
const optionalNum = (value) => (value === '' || value === null ? null : toNumber(value));

/** Giá theo VND từ ô nhập + đơn vị. Tin cho thuê luôn tính theo triệu/tháng. */
export function priceOf(form) {
  const value = toNumber(form.priceValue);
  if (!form.priceValue || !Number.isFinite(value)) return 0;
  return Math.round(value * (form.transactionType === 'ForRent' ? UNITS.trieu : UNITS[form.priceUnit]));
}

/** Kiểm tra từng bước (giống quy tắc backend) → { tên ô: thông báo }. */
export function validateStep(step, form, images) {
  const errors = {};
  const kind = findKind(form.propertyType);
  const has = (field) => kind?.fields.includes(field);
  if (step === 0 && !kind) errors.propertyType = 'Vui lòng chọn loại bất động sản.';
  if (step === 1) {
    if (!form.provinceCode) errors.provinceCode = 'Vui lòng chọn tỉnh/thành.';
    if (!form.districtCode) errors.districtCode = 'Vui lòng chọn quận/huyện.';
    if (!form.wardCode) errors.wardCode = 'Vui lòng chọn phường/xã.';
    if (!form.streetAddress.trim()) errors.streetAddress = 'Vui lòng nhập số nhà, tên đường.';
  }
  if (step === 2) {
    const title = form.title.trim();
    const description = form.description.trim();
    if (title.length < 20) errors.title = 'Tiêu đề cần ít nhất 20 ký tự.';
    else if (title.length > 250) errors.title = 'Tiêu đề tối đa 250 ký tự.';
    if (description.length < 50) errors.description = 'Mô tả cần ít nhất 50 ký tự.';
    if (!(priceOf(form) > 0)) errors.priceValue = 'Vui lòng nhập giá hợp lệ.';
    if (!(toNumber(form.area) > 0)) errors.area = 'Vui lòng nhập diện tích.';
    if (has('landArea') && !(toNumber(form.landArea) > 0)) errors.landArea = 'Vui lòng nhập diện tích đất.';
    if (has('ceilingHeight') && !(toNumber(form.ceilingHeight) > 0)) errors.ceilingHeight = 'Vui lòng nhập chiều cao trần.';
    if (has('clearance') && !form.hasClearance) errors.hasClearance = 'Chỉ đăng được đất đã giải phóng mặt bằng.';
    ['bedrooms', 'bathrooms', 'floors'].forEach((field) => {
      if (form[field] !== '' && !(toNumber(form[field]) >= 0)) errors[field] = 'Số không hợp lệ.';
    });
    if (has('rentalPeriod') && !(toNumber(form.rentalPeriodMonths) >= 1 && toNumber(form.rentalPeriodMonths) <= 120)) {
      errors.rentalPeriodMonths = 'Từ 1 đến 120 tháng.';
    }
    if (!PHONE.test(form.contactPhone.trim())) errors.contactPhone = 'Vui lòng nhập số điện thoại liên hệ hợp lệ.';
    if (!form.zaloSame && !PHONE.test(form.zaloPhone.trim())) errors.zaloPhone = 'Vui lòng nhập số Zalo hợp lệ.';
  }
  if (step === 3) {
    if (images.some((image) => image.status === 'uploading')) errors.images = 'Đang tải ảnh, vui lòng đợi.';
    else if (images.some((image) => image.status === 'error')) errors.images = 'Có ảnh tải lỗi: hãy thử lại hoặc xoá ảnh đó.';
    else if (images.length > MAX_IMAGES) errors.images = `Tối đa ${MAX_IMAGES} ảnh.`;
  }
  return errors;
}

export function toPayload(form, images) {
  const kind = findKind(form.propertyType);
  const has = (field) => kind?.fields.includes(field);
  return {
    propertyType: form.propertyType,
    transactionType: form.transactionType,
    title: form.title.trim(),
    description: form.description.trim(),
    price: priceOf(form),
    area: toNumber(form.area),
    provinceCode: form.provinceCode, provinceName: form.provinceName,
    districtCode: form.districtCode, districtName: form.districtName,
    wardCode: form.wardCode, wardName: form.wardName,
    streetAddress: form.streetAddress.trim(),
    bedroomCount: has('bedrooms') ? optionalInt(form.bedrooms) : null,
    bathroomCount: has('bathrooms') ? optionalInt(form.bathrooms) : null,
    floorNumber: has('floors') ? optionalInt(form.floors) : null,
    landArea: has('landArea') ? optionalNum(form.landArea) : null,
    legalStatus: has('legal') && form.legalStatus ? form.legalStatus : null,
    furniture: has('furniture') && form.furniture ? form.furniture : null,
    hasClearance: has('clearance') ? form.hasClearance : null,
    ceilingHeight: has('ceilingHeight') ? optionalNum(form.ceilingHeight) : null,
    rentalPeriodMonths: has('rentalPeriod') ? optionalInt(form.rentalPeriodMonths) : null,
    petsAllowed: has('pets') ? form.petsAllowed : null,
    imageUrls: images.filter((image) => image.status === 'done').map((image) => image.url),
    contactPhone: form.contactPhone.trim(),
    zaloPhone: form.zaloSame ? form.contactPhone.trim() : form.zaloPhone.trim(),
  };
}

/** Tin lấy từ API → dữ liệu form (khi sửa tin). */
export function fromListing(listing) {
  const isRent = listing.transactionType === 'ForRent';
  const useTy = !isRent && listing.price >= UNITS.ty;
  const unitValue = isRent || !useTy ? listing.price / UNITS.trieu : listing.price / UNITS.ty;
  return {
    ...EMPTY,
    transactionType: listing.transactionType,
    propertyType: listing.propertyType,
    provinceCode: listing.provinceCode, provinceName: listing.provinceName,
    districtCode: listing.districtCode, districtName: listing.districtName,
    wardCode: listing.wardCode, wardName: listing.wardName,
    streetAddress: listing.streetAddress || '',
    title: listing.title || '',
    description: listing.description || '',
    priceValue: String(Number(unitValue.toFixed(3))),
    priceUnit: useTy ? 'ty' : 'trieu',
    area: String(listing.area ?? ''),
    landArea: String(listing.area ?? ''), // diện tích đất không lưu trong database → mặc định bằng diện tích
    bedrooms: listing.bedrooms ? String(listing.bedrooms) : '',
    bathrooms: listing.bathrooms ? String(listing.bathrooms) : '',
    floors: listing.floors ? String(listing.floors) : '',
    legalStatus: listing.legalStatus === 'PinkBook' ? 'RedBook' : listing.legalStatus && listing.legalStatus !== 'Unknown' ? listing.legalStatus : '',
    furniture: listing.furniture || '',
    hasClearance: listing.propertyType === 'Land',
    ceilingHeight: listing.propertyType === 'Warehouse' ? '6' : '',
  };
}
